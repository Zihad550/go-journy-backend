import { type RequestHandler, Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validate-request";
import { RoleEnum } from "../user/user-interface";
import { LocationControllers } from "./location-controller";
import { handle_location_error } from "./location-errors";
import {
	authenticate_location_update,
	authorize_driver_access,
	authorize_ride_access,
	geocoding_limiter,
	location_update_limiter,
	validate_location_data,
} from "./location-middleware";
import { LocationValidation } from "./location-validation";

const router = Router();

// Driver location tracking
router.post(
	"/drivers/location",
	authenticate_location_update as RequestHandler,
	location_update_limiter,
	validate_location_data as RequestHandler,
	LocationControllers.update_driver_location,
);

router.get(
	"/drivers/location/:driverId",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	authorize_driver_access as RequestHandler,
	validateRequest(LocationValidation.driverLocationZodSchema),
	LocationControllers.get_driver_location,
);

// Ride location history
router.get(
	"/rides/:rideId/location-history",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	authorize_ride_access as RequestHandler,
	validateRequest(LocationValidation.rideLocationHistoryZodSchema),
	LocationControllers.get_ride_location_history,
);

// Route optimization
router.post(
	"/rides/:rideId/route",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	authorize_ride_access as RequestHandler,
	validateRequest(LocationValidation.rideRouteZodSchema),
	validateRequest(LocationValidation.routeCalculationZodSchema),
	LocationControllers.calculate_route,
);

router.get(
	"/rides/:rideId/route",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	authorize_ride_access as RequestHandler,
	validateRequest(LocationValidation.rideRouteZodSchema),
	LocationControllers.get_stored_route,
);

// ETA calculation
router.post(
	"/rides/:rideId/eta",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	authorize_ride_access as RequestHandler,
	validateRequest(LocationValidation.rideRouteZodSchema),
	validateRequest(LocationValidation.etaCalculationZodSchema),
	LocationControllers.calculate_eta,
);

// Enhanced location services
router.get(
	"/geocode",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	geocoding_limiter,
	validateRequest(LocationValidation.geocodingZodSchema),
	LocationControllers.geocode_address,
);

router.get(
	"/reverse-geocode",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	geocoding_limiter,
	validateRequest(LocationValidation.reverseGeocodingZodSchema),
	LocationControllers.reverse_geocode,
);

// Error handling middleware
router.use(handle_location_error);

export const LocationRoutes = router;
