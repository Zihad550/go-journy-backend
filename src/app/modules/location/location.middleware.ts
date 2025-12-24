import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import status from "http-status";
import jwt from "jsonwebtoken";
import env from "../../../env";
import AppError from "../../errors/app.error";
import type IJwtPayload from "../../interfaces/jwt.interface";
import { use_object_id } from "../../utils/use-object-id";
import Driver from "../driver/driver.model";
import Ride from "../ride/ride.model";
import { RoleEnum } from "../user/user.interface";

// Type for authenticated requests
type AuthenticatedRequest = Request & {
	user?: IJwtPayload;
	driver?: any;
};

// Authentication middleware for location updates
export const authenticate_location_update = async (
	req: AuthenticatedRequest,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.cookies.accessToken;

		if (!token) {
			throw new AppError(status.UNAUTHORIZED, "Access token required");
		}

		const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as IJwtPayload;

		// Verify user is a driver
		if (decoded.role !== RoleEnum.DRIVER) {
			throw new AppError(status.FORBIDDEN, "Only drivers can update location");
		}

		// Verify driver is approved
		const driver = await Driver.findOne({
			user: use_object_id(decoded.id),
			driverStatus: "approved",
		});

		if (!driver) {
			throw new AppError(
				status.FORBIDDEN,
				"Driver not approved for location updates",
			);
		}

		req.user = decoded;
		req.driver = driver;
		next();
	} catch (error) {
		next(error);
	}
};

// Rate limiting for location updates
export const location_update_limiter = rateLimit({
	windowMs: env.LOCATION_UPDATE_WINDOW_MS,
	max: env.LOCATION_UPDATE_RATE_LIMIT,
	message: {
		success: false,
		message: "Too many location updates. Please slow down.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Input validation middleware for location data
export function validate_location_data(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const { lat, lng, accuracy, heading, speed } = req.body;

	// Validate coordinates
	if (typeof lat !== "number" || lat < -90 || lat > 90) {
		throw new AppError(
			status.BAD_REQUEST,
			"Invalid latitude. Must be between -90 and 90.",
		);
	}

	if (typeof lng !== "number" || lng < -180 || lng > 180) {
		throw new AppError(
			status.BAD_REQUEST,
			"Invalid longitude. Must be between -180 and 180.",
		);
	}

	// Validate optional fields
	if (
		accuracy !== undefined &&
		(typeof accuracy !== "number" || accuracy < 0)
	) {
		throw new AppError(
			status.BAD_REQUEST,
			"Invalid accuracy value. Must be a positive number.",
		);
	}

	if (
		heading !== undefined &&
		(typeof heading !== "number" || heading < 0 || heading > 360)
	) {
		throw new AppError(
			status.BAD_REQUEST,
			"Invalid heading value. Must be between 0 and 360 degrees.",
		);
	}

	if (speed !== undefined && (typeof speed !== "number" || speed < 0)) {
		throw new AppError(
			status.BAD_REQUEST,
			"Invalid speed value. Must be a non-negative number.",
		);
	}

	next();
}

// Authorization middleware for ride-specific location access
export const authorize_ride_access = async (
	req: AuthenticatedRequest,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const { rideId } = req.params;
		const user = req.user;

		if (!user) {
			throw new AppError(status.UNAUTHORIZED, "Authentication required");
		}

		const ride = await Ride.findOne({ _id: use_object_id(rideId) });

		if (!ride) {
			throw new AppError(status.NOT_FOUND, "Ride not found");
		}

		// Check authorization
		const hasAccess =
			(user.role === RoleEnum.RIDER && ride.rider.toString() === user.id) ||
			(user.role === RoleEnum.DRIVER && ride.driver?.toString() === user.id) ||
			user.role === RoleEnum.ADMIN ||
			user.role === RoleEnum.SUPER_ADMIN;

		if (!hasAccess) {
			throw new AppError(status.FORBIDDEN, "Access denied to this ride");
		}

		next();
	} catch (error) {
		next(error);
	}
};

// Authorization middleware for driver location access
export const authorize_driver_access = async (
	req: AuthenticatedRequest,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const { driverId } = req.params;
		const { rideId } = req.query;
		const user = req.user;

		if (!user) {
			throw new AppError(status.UNAUTHORIZED, "Authentication required");
		}

		// Drivers can only access their own location
		if (user.role === RoleEnum.DRIVER && user.id !== driverId) {
			throw new AppError(
				status.FORBIDDEN,
				"Drivers can only access their own location",
			);
		}

		// Riders need to have an active ride with the driver
		if (user.role === RoleEnum.RIDER) {
			if (!rideId) {
				throw new AppError(
					status.BAD_REQUEST,
					"Ride ID required for rider access",
				);
			}

			const ride = await Ride.findOne({
				_id: use_object_id(rideId as string),
				rider: use_object_id(user.id),
				driver: use_object_id(driverId),
			});

			if (!ride) {
				throw new AppError(
					status.FORBIDDEN,
					"Access denied to this driver location",
				);
			}
		}

		next();
	} catch (error) {
		next(error);
	}
};

// Rate limiting for geocoding requests
export const geocoding_limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: env.GEOCODING_RATE_LIMIT,
	message: {
		success: false,
		message: "Too many geocoding requests. Please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
