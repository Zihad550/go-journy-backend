import z from "zod";

const changePasswordZodSchema = z.object({
	body: z.object({
		newPassword: z.string(),
		oldPassword: z.string(),
	}),
});

const resetPasswordZodSchema = z.object({
	body: z.object({
		newPassword: z.string(),
	}),
});

const forgotPasswordZodSchema = z.object({
	body: z.object({
		email: z.string(),
	}),
});

const refreshTokenZodSchema = z.object({
	cookies: z.object({
		refreshToken: z.string(),
	}),
});

const sendOTPZodSchema = z.object({
	body: z.object({
		email: z.email(),
		name: z.string(),
	}),
});

const verifyOTPZodSchema = z.object({
	body: z.object({
		email: z.email(),
		otp: z.string().length(6),
	}),
});

export const AuthValidation = {
	changePasswordZodSchema,
	resetPasswordZodSchema,
	forgotPasswordZodSchema,
	refreshTokenZodSchema,
	sendOTPZodSchema,
	verifyOTPZodSchema,
};
