import z from "zod";
import { DriverStatusEnum } from "./driver.interface";

const vehicleZodSchema = z.object({
  name: z.string(),
  model: z.string(),
});

const becomeDriverZodSchema = z.object({
  body: z.object({
    vehicle: vehicleZodSchema,
    experience: z.number(),
  }),
});

const updateDriverZodSchema = z.object({
  body: z.object({
    vehicle: vehicleZodSchema.partial(),
    experience: z.number().min(0).optional(),
  }),
});

const manageDriverRegistrationZodSchema = z.object({
  body: z.object({
    driverStatus: z.enum(DriverStatusEnum),
  }),
});

export const DriverValidation = {
  vehicleZodSchema,
  becomeDriverZodSchema,
  updateDriverZodSchema,
  manageDriverRegistrationZodSchema,
};
