import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RoleEnum } from "../user/user.interface";
import { AnalyticsControllers } from "./analytics.controller";
import { AnalyticsValidationSchemas } from "./analytics.validation";

const router = Router();

// Get comprehensive analytics and insights (Admin only)
router.get(
  "/admin-analytics",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(AnalyticsValidationSchemas.getAnalyticsSchema),
  AnalyticsControllers.getAnalytics,
);

// Get rider analytics (Rider only)
router.get(
  "/rider-analytics",
  auth(RoleEnum.RIDER),
  validateRequest(AnalyticsValidationSchemas.getRiderAnalyticsSchema),
  AnalyticsControllers.getRiderAnalytics,
);

// Get driver analytics (Driver only)
router.get(
  "/driver-analytics",
  auth(RoleEnum.DRIVER),
  validateRequest(AnalyticsValidationSchemas.getDriverAnalyticsSchema),
  AnalyticsControllers.getDriverAnalytics,
);

// Admin Analytics Routes
router.get(
  "/admin/overview",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(AnalyticsValidationSchemas.getAdminOverviewSchema),
  AnalyticsControllers.getAdminOverview,
);

router.get(
  "/admin/drivers",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(AnalyticsValidationSchemas.getAdminDriversSchema),
  AnalyticsControllers.getAdminDrivers,
);

router.get(
  "/admin/rides",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(AnalyticsValidationSchemas.getAdminRidesSchema),
  AnalyticsControllers.getAdminRides,
);

router.get(
  "/admin/revenue-trend",
  auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validateRequest(AnalyticsValidationSchemas.getAdminRevenueTrendSchema),
  AnalyticsControllers.getAdminRevenueTrend,
);

export const AnalyticsRoutes = router;
