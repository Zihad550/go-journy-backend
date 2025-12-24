import status from "http-status";
import type { Types } from "mongoose";
import AppError from "../../errors/app-error";
import type IJwtPayload from "../../interfaces/jwt-interface";
import { useObjectId } from "../../utils/use-object-id";
import { RideStatusEnum } from "../ride/ride-interface";
import Ride from "../ride/ride-model";
import { RoleEnum } from "../user/user-interface";
import User from "../user/user-model";
import type IDriver from "./driver-interface";
import { AvailabilityEnum, DriverStatusEnum } from "./driver-interface";
import Driver from "./driver-model";

async function register(user: IJwtPayload, payload: IDriver) {
	const isPending = await Driver.findOne({ user: user.id });
	if (isPending)
		throw new AppError(
			status.BAD_REQUEST,
			"You already have a pending request",
		);

	const driverPayload = {
		...payload,
		availability: AvailabilityEnum.OFFLINE,
		driverStatus: DriverStatusEnum.PENDING,
		user: user.id,
	};
	const driver = await Driver.create(driverPayload);
	if (!driver)
		throw new AppError(status.BAD_REQUEST, "Failed to create driver");

	await User.findOneAndUpdate(
		{ _id: user.id },
		{
			driver: driver._id,
		},
	);

	return await Driver.findOne({ _id: driver._id }).populate("user");
}

async function updateProfile(
	user: IJwtPayload,
	payload: Pick<IDriver, "vehicle" | "experience">,
) {
	// Find the user to get their driver ID
	const userExists = await User.findOne({ _id: user.id });
	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");

	if (!userExists.driver) {
		throw new AppError(
			status.BAD_REQUEST,
			"User is not registered as a driver",
		);
	}

	const updateDoc: Record<string, any> = {};
	if (payload.vehicle) {
		Object.entries(payload.vehicle).forEach(([key, value]) => {
			updateDoc[`vehicle.${key}`] = value;
		});
	}
	if (payload.experience !== undefined)
		updateDoc.experience = payload.experience;

	return await Driver.findOneAndUpdate({ _id: userExists.driver }, updateDoc, {
		new: true,
	}).populate("user", "name email isActive");
}

async function getDrivers() {
	return await Driver.find({}).populate("user");
}

async function manageDriverRegister(
	id: string,
	payload: Pick<IDriver, "driverStatus">,
) {
	if (payload.driverStatus === DriverStatusEnum.REJECTED) {
		return await Driver.findOneAndUpdate(
			{
				_id: useObjectId(id),
			},
			{
				driverStatus: DriverStatusEnum.REJECTED,
				availability: AvailabilityEnum.OFFLINE,
			},
			{ new: true },
		);
	}

	const updatedDriver = await Driver.findOneAndUpdate(
		{ _id: useObjectId(id) },
		{
			driverStatus: DriverStatusEnum.APPROVED,
			availability: AvailabilityEnum.ONLINE,
		},
		{ new: true },
	).populate("user", "_id name email");

	if (!updatedDriver) throw new AppError(status.NOT_FOUND, "Driver not found!");

	await User.findOneAndUpdate(
		{
			driver: useObjectId(id),
		},
		{
			role: RoleEnum.DRIVER,
		},
	);

	return updatedDriver;
}

async function getDriverEarnings(user: IJwtPayload) {
	const userExists = await User.findOne({ _id: user.id });
	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");
	else if (!userExists.driver)
		throw new AppError(status.NOT_FOUND, "User is not driver");

	return await Ride.aggregate([
		{
			$match: {
				driver: useObjectId(userExists.driver as Types.ObjectId),
				status: RideStatusEnum.Completed,
			},
		},
		{
			$project: {
				price: 1,
			},
		},
		{
			$group: {
				_id: null,
				earnings: {
					$sum: "$price",
				},
			},
		},
	]);
}

async function deleteDriverById(id: string) {
	return await Driver.findOneAndDelete({ _id: id });
}

async function getProfile(user: IJwtPayload) {
	// Find the user to get their driver ID
	const userExists = await User.findOne({ _id: user.id });
	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");

	if (!userExists.driver) {
		throw new AppError(
			status.BAD_REQUEST,
			"User is not registered as a driver",
		);
	}

	// Get driver profile with populated user data
	const driver = await Driver.findOne({ _id: userExists.driver }).populate(
		"user",
		"name email phone isActive",
	);

	if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found");

	return driver;
}

async function updateAvailability(
	user: IJwtPayload,
	payload: Pick<IDriver, "availability">,
) {
	// Find the user to get their driver ID
	const userExists = await User.findOne({ _id: user.id });
	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");

	if (!userExists.driver) {
		throw new AppError(
			status.BAD_REQUEST,
			"User is not registered as a driver",
		);
	}

	// Check if driver is approved
	const driver = await Driver.findOne({ _id: userExists.driver });
	if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found");

	if (driver.driverStatus !== DriverStatusEnum.APPROVED) {
		throw new AppError(
			status.BAD_REQUEST,
			"Driver must be approved to update availability",
		);
	}

	// Update driver availability
	const updatedDriver = await Driver.findOneAndUpdate(
		{ _id: userExists.driver },
		{ availability: payload.availability },
		{ new: true },
	).populate("user", "name email");

	return updatedDriver;
}

export const DriverServices = {
	register,
	updateProfile,
	getDrivers,
	getProfile,
	manageDriverRegister,
	getDriverEarnings,
	deleteDriverById,
	updateAvailability,
};
