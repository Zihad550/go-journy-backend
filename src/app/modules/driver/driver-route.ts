import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validate-request";
import { RoleEnum } from "../user/user-interface";
import { DriverControllers } from "./driver-controller";
import { DriverValidation } from "./driver-validation";

const router = Router();

router.get(
	"/",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	DriverControllers.get_drivers,
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
	DriverControllers.get_profile,
);

router.patch(
	"/profile",
	auth(RoleEnum.DRIVER),
	validateRequest(DriverValidation.updateDriverZodSchema),
	DriverControllers.update_profile,
);

router.patch(
	"/manage-registration/:id",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(DriverValidation.manageDriverRegistrationZodSchema),
	DriverControllers.manage_driver_register,
);

router.get(
	"/earnings",
	auth(RoleEnum.DRIVER),
	DriverControllers.get_driver_earnings,
);

router.patch(
	"/availability",
	auth(RoleEnum.DRIVER),
	validateRequest(DriverValidation.updateAvailabilityZodSchema),
	DriverControllers.update_availability,
);

router.delete(
	"/:id",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	DriverControllers.delete_driver_by_id,
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
	DriverControllers.get_profile,
);

router.patch(
	"/profile",
	auth(RoleEnum.DRIVER),
	validateRequest(DriverValidation.updateDriverZodSchema),
	DriverControllers.update_profile,
);

router.patch(
	"/manage-registration/:id",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(DriverValidation.manageDriverRegistrationZodSchema),
	DriverControllers.manage_driver_register,
);

router.get(
	"/earnings",
	auth(RoleEnum.DRIVER),
	DriverControllers.get_driver_earnings,
);

router.patch(
	"/availability",
	auth(RoleEnum.DRIVER),
	validateRequest(DriverValidation.updateAvailabilityZodSchema),
	DriverControllers.update_availability,
);

router.delete(
	"/:id",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	DriverControllers.delete_driver_by_id,
);

export const DriverRoutes = router;
