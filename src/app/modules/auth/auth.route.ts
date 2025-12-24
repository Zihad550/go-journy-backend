import { Router } from "express";
import passport from "passport";
import env from "../../../env";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validate-request";
import { RoleEnum } from "../user/user.interface";
import { UserValidation } from "../user/user.validation";
import { AuthControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);

router.post(
	"/register",
	validateRequest(UserValidation.createUserZodSchema),
	AuthControllers.register,
);

router.post("/logout", AuthControllers.logout);

router.patch(
	"/change-password",
	auth(...Object.values(RoleEnum)),
	validateRequest(AuthValidation.changePasswordZodSchema),
	AuthControllers.change_password,
);

router.patch(
	"/reset-password",
	auth(...Object.values(RoleEnum)),
	validateRequest(AuthValidation.resetPasswordZodSchema),
	AuthControllers.reset_password,
);

router.post(
	"/forgot-password",
	validateRequest(AuthValidation.forgotPasswordZodSchema),
	AuthControllers.forgot_password,
);

router.post(
	"/refresh-token",
	validateRequest(AuthValidation.refreshTokenZodSchema),
	AuthControllers.get_new_access_token,
);

// Google OAuth
router.get("/google", (req, res, next) => {
	const redirect = (req.query.redirect as string) || "/";
	passport.authenticate("google", {
		scope: ["profile", "email"],
		state: redirect,
	})(req, res, next);
});

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${env.FRONTEND_URL}/login?error='There is some issues with your account. Please contact with out support team!'`,
	}),
	AuthControllers.google_callback_controller,
);

// OTP routes
router.post(
	"/otp/send",
	validateRequest(AuthValidation.sendOTPZodSchema),
	AuthControllers.send_otp,
);
router.post(
	"/otp/verify",
	validateRequest(AuthValidation.verifyOTPZodSchema),
	AuthControllers.verify_otp,
);

export const AuthRoutes = router;
