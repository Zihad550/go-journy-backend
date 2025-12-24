import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validate-request";
import { RoleEnum } from "../user/user.interface";
import { AdminRideControllers } from "./admin-ride.controller";
import { AdminRideValidationSchemas } from "./admin-ride.validation";

const router = Router();

// Get comprehensive rides overview with filtering, sorting, and pagination
router.get(
	"/overview",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.getOverviewSchema),
	AdminRideControllers.getOverview,
);

// Get all currently active rides (requested, accepted, in_transit)
router.get(
	"/active",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	AdminRideControllers.getActiveRides,
);

// Get rides with issues (cancelled, long duration, no drivers, disputed)
router.get(
	"/issues",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.getIssuesSchema),
	AdminRideControllers.getIssues,
);

// Get comprehensive ride history for a specific driver
router.get(
	"/driver/:driverId/history",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.getDriverHistorySchema),
	AdminRideControllers.getDriverHistory,
);

// Override ride status (admin intervention)
router.patch(
	"/:id/status",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.overrideStatusSchema),
	AdminRideControllers.overrideStatus,
);

// Manually assign driver to ride
router.patch(
	"/:id/assign-driver",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.assignDriverSchema),
	AdminRideControllers.assignDriver,
);

// Add internal admin note to ride
router.patch(
	"/:id/note",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.addNoteSchema),
	AdminRideControllers.addNote,
);

// Force delete ride (permanent deletion with audit log)
router.delete(
	"/:id/force-delete",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AdminRideValidationSchemas.forceDeleteSchema),
	AdminRideControllers.forceDelete,
);

export const AdminRideRoutes = router;
