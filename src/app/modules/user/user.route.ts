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

router.get(
  "/profile",
  auth(...Object.values(RoleEnum)),
  UserControllers.getProfile,
);

router.patch(
  "/profile",
  auth(...Object.values(RoleEnum)),
  validateRequest(UserValidation.updateMeZodSchema),
  UserControllers.updateProfile,
);

router.patch(
  "/block/:id",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(UserValidation.blockUnblockUserZodSchema),
  UserControllers.blockUser,
);

router.patch(
  "/:id",
  auth(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN),
  validateRequest(UserValidation.updateUserByIdZodSchema),
  UserControllers.updateUserById,
);

router.delete(
  "/:id",
  auth(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN),
  UserControllers.deleteUserById,
);

export const UserRoutes = router;
