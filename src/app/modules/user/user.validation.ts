import z from "zod";
import { DriverStatusEnum } from "../driver/driver.interface";
import { AccountStatusEnum, RoleEnum } from "./user.interface";

const createUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "Name must be string";
        }
        return issue.message;
      },
    })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z.email({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return "Email must be string";
      }
      return issue.message;
    },
  }),
  password: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "Password must be string";
        }
        return issue.message;
      },
    })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
});
const updateUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "Name must be string";
        }
        return issue.message;
      },
    })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  role: z.enum(Object.values(RoleEnum)).optional(),
  accountStatus: z.enum(Object.values(AccountStatusEnum)).optional(),
});

const vehicleZodSchema = z.object({
  name: z.string(),
  model: z.string(),
});

const becomeDriverZodSchema = z.object({
  vehicle: vehicleZodSchema,
  experience: z.number(),
});

const updateDriverRequestZodSchema = z.object({
  driverStatus: z.enum(Object.values(DriverStatusEnum)),
  _id: z.string(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  becomeDriverZodSchema,
  updateDriverRequestZodSchema,
};
