import z from "zod";
import { RideStatusEnum } from "./ride.interface";

const rideLocationSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

const createRideSchema = z.object({
  pickupLocation: z.object(rideLocationSchema),
  destination: z.object(rideLocationSchema),
  price: z.number(),
});

const updateRideStatusSchema = z.object({
  status: z.enum(Object.values(RideStatusEnum),
});

export const RideValidationSchemas = {
  createRideSchema,
  updateRideStatusSchema,
};
