import z from "zod";
import { RideStatusEnum } from "./ride-interface";

const rideLocationSchema = z.object({
	lat: z.string(),
	lng: z.string(),
});

const createRideSchema = z.object({
	body: z.object({
		pickupLocation: rideLocationSchema,
		destination: rideLocationSchema,
		price: z.number(),
	}),
});

const updateRideStatusSchema = z.object({
	body: z.object({
		status: z.enum(RideStatusEnum),
	}),
});

const acceptDriverSchema = z.object({
	body: z.object({
		driverId: z.string(),
		paymentId: z.string().optional(),
	}),
});

export const RideValidationSchemas = {
	createRideSchema,
	updateRideStatusSchema,
	acceptDriverSchema,
};
