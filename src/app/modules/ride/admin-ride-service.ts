import status from "http-status";
import AppError from "../../errors/app-error";
import type IJwtPayload from "../../interfaces/jwt-interface";
import { use_object_id } from "../../utils/use-object-id";
import { DriverStatusEnum } from "../driver/driver-interface";
import Driver from "../driver/driver-model";
import { IsActive } from "../user/user-interface";
import { RideStatusEnum } from "./ride-interface";
import Ride from "./ride-model";

interface IOverviewQuery {
	status?: RideStatusEnum;
	driverId?: string;
	riderId?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
	sortBy?: "createdAt" | "updatedAt" | "status" | "price";
	sortOrder?: "asc" | "desc";
}

interface IIssuesQuery {
	issueType?: "cancelled" | "long_duration" | "no_driver" | "disputed";
	page?: number;
	limit?: number;
}

interface IDriverHistoryQuery {
	page?: number;
	limit?: number;
	status?: RideStatusEnum;
}

async function getOverview(query: IOverviewQuery) {
	const {
		status: rideStatus,
		driverId,
		riderId,
		startDate,
		endDate,
		page = 1,
		limit = 10,
		sortBy = "createdAt",
		sortOrder = "desc",
	} = query;

	// Build filter object
	const filter: any = {};

	if (rideStatus) filter.status = rideStatus;
	if (driverId) filter.driver = use_object_id(driverId);
	if (riderId) filter.rider = use_object_id(riderId);

	if (startDate || endDate) {
		filter.createdAt = {};
		if (startDate) filter.createdAt.$gte = new Date(startDate);
		if (endDate) filter.createdAt.$lte = new Date(endDate);
	}

	// Build sort object
	const sort: any = {};
	sort[sortBy] = sortOrder === "asc" ? 1 : -1;

	const skip = (page - 1) * limit;

	const [rides, total] = await Promise.all([
		Ride.find(filter)
			.populate({
				path: "rider",
				select: "name email phone isActive",
			})
			.populate({
				path: "driver",
				populate: {
					path: "user",
					select: "name email phone isActive",
				},
				select: "user vehicle experience availability driverStatus",
			})
			.populate({
				path: "interestedDrivers",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			})
			.populate({
				path: "adminNotes.createdBy",
				select: "name email",
			})
			.populate({
				path: "statusHistory.changedBy",
				select: "name email",
			})
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.lean(),
		Ride.countDocuments(filter),
	]);

	return {
		rides,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

async function overrideStatus(
	rideId: string,
	newStatus: RideStatusEnum,
	reason: string,
	adminUser: IJwtPayload | undefined,
) {
	const ride = await Ride.findById(rideId);
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found");
	if (!adminUser)
		throw new AppError(status.UNAUTHORIZED, "Admin user not found");

	const oldStatus = ride.status;

	// Update the ride status and add to status history
	const updatedRide = await Ride.findByIdAndUpdate(
		rideId,
		{
			$set: { status: newStatus },
			$push: {
				statusHistory: {
					status: newStatus,
					changedBy: use_object_id(adminUser.id),
					changedAt: new Date(),
					reason,
				},
				adminNotes: {
					note: `Status changed from ${oldStatus} to ${newStatus}. Reason: ${reason}`,
					createdBy: use_object_id(adminUser.id),
					createdAt: new Date(),
				},
			},
		},
		{ new: true },
	).populate([
		{ path: "rider", select: "name email" },
		{
			path: "driver",
			populate: { path: "user", select: "name email" },
			select: "user vehicle experience",
		},
	]);

	return updatedRide;
}

async function assignDriver(
	rideId: string,
	driverId: string,
	reason: string,
	adminUser: IJwtPayload | undefined,
) {
	const [ride, driver] = await Promise.all([
		Ride.findById(rideId),
		Driver.findOne({
			_id: driverId,
			driverStatus: DriverStatusEnum.APPROVED,
		}).populate("user", "isActive"),
	]);

	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found");
	if (!driver)
		throw new AppError(status.NOT_FOUND, "Driver not found or not approved");
	if (!adminUser)
		throw new AppError(status.UNAUTHORIZED, "Admin user not found");

	// Check if driver is available
	if (driver.user && (driver.user as any).isActive !== IsActive.ACTIVE) {
		throw new AppError(status.BAD_REQUEST, "Driver account is not active");
	}

	// Check if driver is already on another ride
	const driverOnRide = await Ride.findOne({
		driver: use_object_id(driverId),
		status: { $in: [RideStatusEnum.Accepted, RideStatusEnum.InTransit] },
	});

	if (driverOnRide) {
		throw new AppError(
			status.CONFLICT,
			"Driver is already assigned to another ride",
		);
	}

	// Update ride with assigned driver
	const updatedRide = await Ride.findByIdAndUpdate(
		rideId,
		{
			$set: {
				driver: use_object_id(driverId),
				status: RideStatusEnum.Accepted,
				pickupTime: new Date(),
			},
			$push: {
				statusHistory: {
					status: RideStatusEnum.Accepted,
					changedBy: use_object_id(adminUser.id),
					changedAt: new Date(),
					reason: `Admin assigned driver: ${reason}`,
				},
				adminNotes: {
					note: `Driver manually assigned by admin. Reason: ${reason}`,
					createdBy: use_object_id(adminUser.id),
					createdAt: new Date(),
				},
			},
		},
		{ new: true },
	).populate([
		{ path: "rider", select: "name email" },
		{
			path: "driver",
			populate: { path: "user", select: "name email" },
			select: "user vehicle experience",
		},
	]);

	return updatedRide;
}

async function getActiveRides() {
	return await Ride.find({
		status: {
			$in: [
				RideStatusEnum.Requested,
				RideStatusEnum.Accepted,
				RideStatusEnum.InTransit,
			],
		},
	})
		.populate("rider", "name email phone")
		.populate({
			path: "driver",
			populate: { path: "user", select: "name email phone" },
			select: "user vehicle experience availability",
		})
		.populate({
			path: "interestedDrivers",
			populate: { path: "user", select: "name email" },
			select: "user vehicle experience",
		})
		.sort({ createdAt: -1 });
}

async function getIssues(query: IIssuesQuery) {
	const { issueType, page = 1, limit = 10 } = query;

	let filter: any = {};

	switch (issueType) {
		case "cancelled":
			filter.status = RideStatusEnum.Cancelled;
			break;
		case "long_duration":
			// Rides that have been in requested status for more than 30 minutes
			filter = {
				status: RideStatusEnum.Requested,
				createdAt: { $lte: new Date(Date.now() - 30 * 60 * 1000) },
			};
			break;
		case "no_driver":
			// Rides requested more than 15 minutes ago with no interested drivers
			filter = {
				status: RideStatusEnum.Requested,
				createdAt: { $lte: new Date(Date.now() - 15 * 60 * 1000) },
				interestedDrivers: { $size: 0 },
			};
			break;
		case "disputed":
			// This would typically require a separate disputes collection
			// For now, we'll look for rides with many admin notes
			filter = {
				"adminNotes.2": { $exists: true },
			};
			break;
	}

	const skip = (page - 1) * limit;

	const [rides, total] = await Promise.all([
		Ride.find(filter)
			.populate("rider", "name email phone")
			.populate({
				path: "driver",
				populate: { path: "user", select: "name email phone" },
				select: "user vehicle experience",
			})
			.populate({
				path: "adminNotes.createdBy",
				select: "name email",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		Ride.countDocuments(filter),
	]);

	return {
		issues: rides,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

async function addNote(
	rideId: string,
	note: string,
	adminUser: IJwtPayload | undefined,
) {
	const ride = await Ride.findById(rideId);
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found");
	if (!adminUser) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

	const updatedRide = await Ride.findByIdAndUpdate(
		rideId,
		{
			$push: {
				adminNotes: {
					note,
					createdBy: use_object_id(adminUser.id),
					createdAt: new Date(),
				},
			},
		},
		{ new: true },
	).populate([
		{ path: "rider", select: "name email" },
		{
			path: "driver",
			populate: { path: "user", select: "name email" },
			select: "user vehicle experience",
		},
		{
			path: "adminNotes.createdBy",
			select: "name email",
		},
	]);

	return updatedRide;
}

async function getDriverHistory(driverId: string, query: IDriverHistoryQuery) {
	const { page = 1, limit = 10, status: rideStatus } = query;

	// Verify driver exists
	const driver = await Driver.findById(driverId);
	if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found");

	const filter: any = { driver: use_object_id(driverId) };
	if (rideStatus) filter.status = rideStatus;

	const skip = (page - 1) * limit;

	const [rides, total] = await Promise.all([
		Ride.find(filter)
			.populate("rider", "name email phone")
			.populate({
				path: "driver",
				populate: { path: "user", select: "name email phone" },
				select: "user vehicle experience",
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		Ride.countDocuments(filter),
	]);

	// Get driver stats
	const stats = await Ride.aggregate([
		{ $match: { driver: use_object_id(driverId) } },
		{
			$group: {
				_id: null,
				totalRides: { $sum: 1 },
				completedRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Completed] }, 1, 0],
					},
				},
				cancelledRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Cancelled] }, 1, 0],
					},
				},
				totalEarnings: {
					$sum: {
						$cond: [
							{ $eq: ["$status", RideStatusEnum.Completed] },
							"$price",
							0,
						],
					},
				},
			},
		},
	]);

	return {
		rides,
		stats: stats[0] || {
			totalRides: 0,
			completedRides: 0,
			cancelledRides: 0,
			totalEarnings: 0,
		},
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

async function forceDelete(
	rideId: string,
	reason: string,
	adminUser: IJwtPayload | undefined,
) {
	const ride = await Ride.findById(rideId);
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found");

	// Log the deletion for audit purposes
	console.log(
		`Ride ${rideId} force deleted by admin ${adminUser?.email}. Reason: ${reason}`,
	);

	await Ride.findByIdAndDelete(rideId);

	return {
		message: "Ride permanently deleted",
		deletedRide: {
			id: ride._id,
			status: ride.status,
			rider: ride.rider,
			driver: ride.driver,
			deletedBy: adminUser?.id,
			deletedAt: new Date(),
			reason,
		},
	};
}

export const AdminRideServices = {
	getOverview,
	overrideStatus,
	assignDriver,
	getActiveRides,
	getIssues,
	addNote,
	getDriverHistory,
	forceDelete,
};
