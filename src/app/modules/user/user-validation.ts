import z from "zod";
import { IsActive, RoleEnum } from "./user-interface";

const createUserZodSchema = z.object({
	body: z.object({
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
		phone: z.string({
			error: (issue) => {
				if (issue.code === "invalid_type") return "Phone must be string";
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
	}),
});

const updateUserByIdZodSchema = z.object({
	body: z.object({
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
		isActive: z.enum(IsActive).optional(),
		role: z.enum(RoleEnum).optional(),
	}),
});

const updateMeZodSchema = z.object({
	body: z.object({
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
	}),
});

const blockUnblockUserZodSchema = z.object({
	query: z
		.object({
			status: z
				.enum(["blocked", "active"], {
					message: "Status must be either 'blocked' or 'active'",
				})
				.optional(),
		})
		.optional(),
});

export const UserValidation = {
	createUserZodSchema,
	updateUserByIdZodSchema,
	updateMeZodSchema,
	blockUnblockUserZodSchema,
};
