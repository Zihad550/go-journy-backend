import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { RoleEnum } from "./user.interface";
import { UserValidation } from "./user.validation";

const router = Router();

router.get("/me", auth(...Object.values(RoleEnum)), UserControllers.getMe);
router.patch("/block/:id", auth(RoleEnum.ADMIN), UserControllers.blockUser);

router.patch(
  "/request-become-driver",
  auth(RoleEnum.RIDER),
  validateRequest(UserValidation.becomeDriverZodSchema),
  UserControllers.requestToBeDriver,
);

router.patch(
  "/update-driver-request",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(UserValidation.updateDriverRequestZodSchema),
);

router.patch(
  "/",
  auth(...Object.values(RoleEnum)),
  validateRequest(UserValidation.updateUserZodSchema),
);

export const UserRoutes = router;
