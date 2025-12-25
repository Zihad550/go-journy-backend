import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validate-request";
import { RoleEnum } from "../user/user.interface";
import { AnalyticsControllers } from "./analytics.controller";
import { AnalyticsValidationSchemas } from "./analytics.validation";

const router = Router();

// Get comprehensive analytics and insights (Admin only)
router.get(
	"/admin-analytics",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AnalyticsValidationSchemas.getAnalyticsSchema),
	AnalyticsControllers.get_analytics,
);

// Get rider analytics (Rider only)
router.get(
	"/rider-analytics",
	auth(RoleEnum.RIDER),
	validateRequest(AnalyticsValidationSchemas.getRiderAnalyticsSchema),
	AnalyticsControllers.get_rider_analytics,
);

// Get driver analytics (Driver only)
router.get(
	"/driver-analytics",
	auth(RoleEnum.DRIVER),
	validateRequest(AnalyticsValidationSchemas.getDriverAnalyticsSchema),
	AnalyticsControllers.get_driver_analytics,
);

// Admin Analytics Routes
router.get(
	"/admin/overview",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AnalyticsValidationSchemas.getAdminOverviewSchema),
	AnalyticsControllers.get_admin_overview,
);

router.get(
	"/admin/drivers",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AnalyticsValidationSchemas.getAdminDriversSchema),
	AnalyticsControllers.get_admin_drivers,
);

router.get(
	"/admin/rides",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AnalyticsValidationSchemas.getAdminRidesSchema),
	AnalyticsControllers.get_admin_rides,
);

router.get(
	"/admin/revenue-trend",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	validateRequest(AnalyticsValidationSchemas.getAdminRevenueTrendSchema),
	AnalyticsControllers.get_admin_revenue_trend,
);

// Public stats route (no auth required)
router.get("/public/stats", AnalyticsControllers.get_public_stats);

export const AnalyticsRoutes = router;
