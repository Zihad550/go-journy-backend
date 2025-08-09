import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { RoleEnum } from "./user.interface";
import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/",
  auth(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN),
  UserControllers.getUsers,
);

router.get("/me", auth(...Object.values(RoleEnum)), UserControllers.getMe);

router.patch(
  "/me",
  auth(...Object.values(RoleEnum)),
  validateRequest(UserValidation.updateMeZodSchema),
  UserControllers.updateMe,
);

router.patch(
  "/block/:id",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  UserControllers.blockUser,
);

router.patch(
  "/request-to-become-driver",
  auth(RoleEnum.RIDER),
  validateRequest(UserValidation.becomeDriverZodSchema),
  UserControllers.requestToBeDriver,
);

router.patch(
  "/update-driver-request",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(UserValidation.updateDriverRequestZodSchema),
  UserControllers.updateDriverRequest,
);

router.patch(
  "/:id",
  auth(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN),
  validateRequest(UserValidation.updateUserByIdZodSchema),
  UserControllers.updateUserById,
);

export const UserRoutes = router;
