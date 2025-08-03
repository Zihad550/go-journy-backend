import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RoleEnum } from "../user/user.interface";
import { UserValidation } from "../user/user.validation";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post("/login", AuthControllers.login);

router.post(
  "/register",
  validateRequest(UserValidation.createUserZodSchema),
  AuthControllers.register,
);

router.post("/logout", AuthControllers.logout);
router.post(
  "/change-password",
  auth(...Object.values(RoleEnum)),
  AuthControllers.changePassword,
);
router.post(
  "/reset-password",
  auth(...Object.values(RoleEnum)),
  AuthControllers.resetPassword,
);

router.post("/forgot-password", AuthControllers.forgotPassword);

export const AuthRoutes = router;
