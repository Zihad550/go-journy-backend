import status from "http-status";
import AppError from "../../errors/app-error";
import type IJwtPayload from "../../interfaces/jwt-interface";
import { get_transaction_id } from "../../utils/transaction-id";
import { use_object_id } from "../../utils/use-object-id";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver-interface";
import Driver from "../driver/driver-model";
import Payment, { PAYMENT_STATUS } from "../payment/payment-model";
import { PaymentServices } from "../payment/payment-service";
import type IUser from "../user/user-interface";
import { IsActive, RoleEnum } from "../user/user-interface";
import type IRide from "./ride-interface";
import { RideStatusEnum } from "./ride-interface";
import Ride from "./ride-model";

async function requestRide(payload: Partial<IRide>, user: IJwtPayload) {
	const drivers = await Driver.find({
		driverStatus: DriverStatusEnum.APPROVED,
		availability: AvailabilityEnum.ONLINE,
	});
	if (!drivers) throw new AppError(status.NOT_FOUND, "No drivers available");

	const isAlreadyOnRide = await Ride.find({
		rider: use_object_id(user.id),
		status: {
			$in: [
				RideStatusEnum.Requested,
				RideStatusEnum.Accepted,
				RideStatusEnum.InTransit,
			],
		},
	});

	if (isAlreadyOnRide.length > 0)
		throw new AppError(status.BAD_REQUEST, "User is already on a ride");

	const transactionId = get_transaction_id();

	// Create payment record
	const payment = await Payment.create({
		ride: null, // Will be set after ride creation
		transactionId,
		amount: payload.price,
		status: PAYMENT_STATUS.UNPAID,
	});

	const doc = {
		...payload,
		rider: user.id,
		status: RideStatusEnum.Requested,
		payment: payment._id,
	};

	const ride = await Ride.create(doc);

	// Update payment with ride reference
	await Payment.findByIdAndUpdate(payment._id, { ride: ride._id });

	return ride;
}

async function cancelRide(user: IJwtPayload, id: string) {
	const ride = await Ride.findOne({
		_id: id,
		rider: use_object_id(user.id),
	});
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
	else if (ride.status !== RideStatusEnum.Requested)
		throw new AppError(status.BAD_REQUEST, "Ride cannot be cancelled");

	// const date = new Date(new Date(ride.createdAt).getTime() - 30 * 60 * 1000);
	// if (date < new Date())
	//   throw new AppError(status.BAD_REQUEST, 'Ride cannot be cancelled');

	if (ride?.driver)
		throw new AppError(status.BAD_REQUEST, "Ride cannot be cancelled");

	return await Ride.findOneAndUpdate(
		{ _id: id },
		{ $set: { status: RideStatusEnum.Cancelled } },
		{ new: true },
	);
}

async function getRideInfo(user: IJwtPayload, id: string) {
	if (user.role === RoleEnum.RIDER)
		return await Ride.findOne({ _id: id, rider: use_object_id(user.id) })
			.populate({
				path: "driver",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			})
			.populate({
				path: "interestedDrivers",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			})
			.populate("rider", "name email");
	else if (user.role === RoleEnum.DRIVER)
		return await Ride.findOne({ _id: id, driver: use_object_id(user.id) })
			.populate({
				path: "driver",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			})
			.populate("rider", "name email");
}

async function manageRideStatus(
	user: IJwtPayload,
	id: string,
	newStatus: RideStatusEnum,
) {
	const filter = { _id: id };
	const options = { new: true };
	const ride = await Ride.findOne(filter, { _id: 1, status: 1 });
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
	else if (ride.status === RideStatusEnum.Completed)
		throw new AppError(
			status.BAD_REQUEST,
			"Cannot change a completed ride status",
		);
	else if (ride.status === RideStatusEnum.Requested)
		throw new AppError(
			status.BAD_REQUEST,
			"Cannot change a requested ride status",
		);

	if (user.role === RoleEnum.DRIVER) {
		// accept
		if (
			newStatus === RideStatusEnum.Accepted &&
			ride.status !== RideStatusEnum.Accepted
		)
			return await Ride.findOneAndUpdate(
				filter,
				{ status: newStatus, driver: user.id },
				options,
			);
		// in transit
		else if (
			newStatus === RideStatusEnum.InTransit &&
			ride.status === RideStatusEnum.Accepted
		)
			return await Ride.findOneAndUpdate(
				filter,
				{ $set: { status: newStatus } },
				options,
			);
	} else if (user.role === RoleEnum.RIDER) {
		// completed
		if (newStatus === RideStatusEnum.Completed) {
			const completedRide = await Ride.findOneAndUpdate(
				filter,
				{ status: newStatus, dropoffTime: new Date() },
				options,
			);

			// Auto-release payment if it exists and is held
			if (completedRide?.payment) {
				try {
					const payment = await Payment.findById(completedRide.payment);
					if (payment && payment.status === PAYMENT_STATUS.HELD) {
						await PaymentServices.releasePayment(
							completedRide.payment.toString(),
							completedRide._id.toString(),
						);
					}
				} catch (error) {
					// Log error but don't fail the ride completion
					console.error("Failed to auto-release payment:", error);
				}
			}

			return completedRide;
		}
	}
	throw new AppError(status.FORBIDDEN, "Forbidden");
}

async function getRides(user: IJwtPayload) {
	if (user.role === RoleEnum.DRIVER) {
		const driver = await Driver.findOne({
			user: use_object_id(user.id),
		});
		if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found");
		return await Ride.find({
			$or: [
				{
					driver: use_object_id(driver._id),
				},
				{
					status: RideStatusEnum.Requested,
				},
			],
		}).populate("rider", "name email");
	} else if (user.role === RoleEnum.RIDER)
		return await Ride.find({ rider: use_object_id(user.id) })
			.populate({
				path: "interestedDrivers",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			})
			.populate({
				path: "driver",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			});
	else if (user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN)
		return await Ride.find({})
			.populate("driver")
			.populate("rider")
			.populate({
				path: "interestedDrivers",
				populate: {
					path: "user",
					select: "name email",
				},
				select: "user vehicle experience",
			});
}

async function showInterest(user: IJwtPayload, id: string) {
	const driver = await Driver.findOne(
		{
			user: user.id,
			driverStatus: DriverStatusEnum.APPROVED,
		},
		{ driverStatus: 1, availability: 1 },
	).populate("user", "isActive");

	if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found!");
	if ((driver.user as IUser).isActive !== IsActive.ACTIVE)
		throw new AppError(status.BAD_REQUEST, "Driver is not available");
	if (driver.availability !== AvailabilityEnum.ONLINE)
		throw new AppError(
			status.BAD_REQUEST,
			"Update your availability to online",
		);

	const ride = await Ride.findOne({ _id: id });
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
	if (ride.status !== RideStatusEnum.Requested)
		throw new AppError(status.BAD_REQUEST, "Cannot show interest in this ride");

	// Check if driver already showed interest
	if (ride.interestedDrivers.includes(use_object_id(driver._id)))
		throw new AppError(
			status.BAD_REQUEST,
			"Already showed interest in this ride",
		);

	// Check if driver is already on another ride
	const alreadyOnRide = await Ride.findOne({
		driver: use_object_id(driver._id),
		status: {
			$in: [RideStatusEnum.Accepted, RideStatusEnum.InTransit],
		},
	});
	if (alreadyOnRide)
		throw new AppError(
			status.BAD_REQUEST,
			"Cannot show interest, already on a ride!",
		);

	return await Ride.findOneAndUpdate(
		{ _id: id },
		{ $addToSet: { interestedDrivers: driver._id } },
		{ new: true },
	);
}

async function acceptDriver(
	user: IJwtPayload,
	rideId: string,
	driverId: string,
	paymentId?: string,
) {
	const ride = await Ride.findOne({
		_id: rideId,
		rider: use_object_id(user.id),
	}).populate("payment");

	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
	if (ride.status !== RideStatusEnum.Requested)
		throw new AppError(status.BAD_REQUEST, "Ride cannot be accepted");

	// Validate payment status - payment must be paid and held before accepting driver
	if (!ride.payment) {
		throw new AppError(status.BAD_REQUEST, "No payment found for this ride");
	}

	const payment = await Payment.findById(ride.payment);
	if (!payment) {
		throw new AppError(status.BAD_REQUEST, "Payment not found");
	}

	// Allow both HELD status or PAID status with ride.paymentHeld = true
	const isPaymentValid =
		payment.status === PAYMENT_STATUS.HELD ||
		(payment.status === PAYMENT_STATUS.PAID && ride.paymentHeld === true);

	if (!isPaymentValid) {
		throw new AppError(
			status.BAD_REQUEST,
			"Payment must be paid and held before driver can be accepted",
		);
	}

	// If paymentId is provided, verify it matches the ride's payment
	if (paymentId && paymentId !== payment._id.toString()) {
		throw new AppError(
			status.BAD_REQUEST,
			"Payment ID does not match ride payment",
		);
	}

	// If payment is PAID but not HELD, hold it now with the selected driver
	if (payment.status === PAYMENT_STATUS.PAID && ride.paymentHeld === true) {
		await Payment.findByIdAndUpdate(
			payment._id,
			{
				status: PAYMENT_STATUS.HELD,
				driver: use_object_id(driverId),
				heldAt: new Date(),
			},
			{ new: true, runValidators: true },
		);
	}

	// Check if the driver showed interest
	if (!ride.interestedDrivers.includes(use_object_id(driverId)))
		throw new AppError(
			status.BAD_REQUEST,
			"Driver did not show interest in this ride",
		);

	const driver = await Driver.findOne({
		_id: driverId,
		driverStatus: DriverStatusEnum.APPROVED,
		availability: AvailabilityEnum.ONLINE,
	}).populate("user", "isActive");

	if (!driver)
		throw new AppError(status.NOT_FOUND, "Driver not found or not available!");
	if ((driver.user as IUser).isActive !== IsActive.ACTIVE)
		throw new AppError(status.BAD_REQUEST, "Driver is not available");

	// Check if driver is already on another ride
	const alreadyOnRide = await Ride.findOne({
		driver: use_object_id(driverId),
		status: {
			$in: [RideStatusEnum.Accepted, RideStatusEnum.InTransit],
		},
	});
	if (alreadyOnRide)
		throw new AppError(
			status.BAD_REQUEST,
			"Driver is already on another ride!",
		);

	// Accept the driver and update ride status
	const updatedRide = await Ride.findOneAndUpdate(
		{ _id: use_object_id(rideId) },
		{
			$set: {
				status: RideStatusEnum.Accepted,
				driver: use_object_id(driverId),
				pickupTime: new Date(),
			},
		},
		{ new: true },
	);

	// Remove the driver from all other rides they showed interest in
	await Ride.updateMany(
		{
			_id: { $ne: rideId },
			interestedDrivers: use_object_id(driverId),
		},
		{
			$pull: { interestedDrivers: use_object_id(driverId) },
		},
	);

	return updatedRide;
}

async function deleteRideById(id: string) {
	const ride = await Ride.findById(id);
	if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");

	await ride.deleteOne();
}

export const RideServices = {
	requestRide,
	cancelRide,
	getRideInfo,
	manageRideStatus,
	getRides,
	showInterest,
	acceptDriver,
	deleteRideById,
};
