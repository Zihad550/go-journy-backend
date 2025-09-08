import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RoleEnum } from "../user/user.interface";
import { DriverControllers } from "./driver.controller";
import { DriverValidation } from "./driver.validation";

const router = Router();

router.get(
  "/",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  DriverControllers.getDrivers,
);

router.patch(
  "/register",
  auth(RoleEnum.RIDER),
  validateRequest(DriverValidation.becomeDriverZodSchema),
  DriverControllers.register,
);

router.get(
  "/profile",
  auth(RoleEnum.DRIVER, RoleEnum.RIDER),
  DriverControllers.getProfile,
);

router.patch(
  "/profile",
  auth(RoleEnum.DRIVER),
  validateRequest(DriverValidation.updateDriverZodSchema),
  DriverControllers.updateProfile,
);

router.patch(
  "/manage-registration/:id",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(DriverValidation.manageDriverRegistrationZodSchema),
  DriverControllers.manageDriverRegister,
);

router.get(
  "/earnings",
  auth(RoleEnum.DRIVER),
  DriverControllers.getDriverEarnings,
);

router.patch(
  "/availability",
  auth(RoleEnum.DRIVER),
  validateRequest(DriverValidation.updateAvailabilityZodSchema),
  DriverControllers.updateAvailability,
);

router.delete(
  "/:id",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  DriverControllers.deleteDriverById,
);

export const DriverRoutes = router;
