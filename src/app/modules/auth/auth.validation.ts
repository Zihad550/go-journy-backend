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

export const AuthValidation = {
  changePasswordZodSchema,
  resetPasswordZodSchema,
  forgotPasswordZodSchema,
  refreshTokenZodSchema,
};
