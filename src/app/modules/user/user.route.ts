import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { RoleEnum } from "./user.interface";
import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/me",
  auth(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RIDER, RoleEnum.DRIVER),
  UserControllers.getMe,
);
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

export const UserRoutes = router;
