import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RoleEnum } from "../user/user.interface";
import { UserValidation } from "../user/user.validation";
import { AuthControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post("/login", AuthControllers.login);

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

export const AuthRoutes = router;
