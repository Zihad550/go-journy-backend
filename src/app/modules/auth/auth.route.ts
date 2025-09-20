import { Router } from "express";
import passport from "passport";
import env from "../../../env";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
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
  AuthControllers.changePassword,
);

router.patch(
  "/reset-password",
  auth(...Object.values(RoleEnum)),
  validateRequest(AuthValidation.resetPasswordZodSchema),
  AuthControllers.resetPassword,
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordZodSchema),
  AuthControllers.forgotPassword,
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthControllers.getNewAccessToken,
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
  AuthControllers.googleCallbackController,
);

// OTP routes
router.post(
  "/otp/send",
  validateRequest(AuthValidation.sendOTPZodSchema),
  AuthControllers.sendOTP,
);
router.post(
  "/otp/verify",
  validateRequest(AuthValidation.verifyOTPZodSchema),
  AuthControllers.verifyOTP,
);

export const AuthRoutes = router;
