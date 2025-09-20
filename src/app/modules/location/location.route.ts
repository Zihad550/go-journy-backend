import { Router, RequestHandler } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RoleEnum } from '../user/user.interface';
import { LocationControllers } from './location.controller';
import { LocationValidation } from './location.validation';
import {
  authenticateLocationUpdate,
  authorizeDriverAccess,
  authorizeRideAccess,
  geocodingLimiter,
  locationUpdateLimiter,
  validateLocationData,
} from './location.middleware';
import { handleLocationError } from './location.errors';

const router = Router();

// Driver location tracking
router.post(
  '/drivers/location',
  authenticateLocationUpdate as RequestHandler,
  locationUpdateLimiter,
  validateLocationData as RequestHandler,
  LocationControllers.updateDriverLocation
);

router.get(
  '/drivers/location/:driverId',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  authorizeDriverAccess as RequestHandler,
  validateRequest(LocationValidation.driverLocationZodSchema),
  LocationControllers.getDriverLocation
);

// Ride location history
router.get(
  '/rides/:rideId/location-history',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  authorizeRideAccess as RequestHandler,
  validateRequest(LocationValidation.rideLocationHistoryZodSchema),
  LocationControllers.getRideLocationHistory
);

// Route optimization
router.post(
  '/rides/:rideId/route',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  authorizeRideAccess as RequestHandler,
  validateRequest(LocationValidation.rideRouteZodSchema),
  validateRequest(LocationValidation.routeCalculationZodSchema),
  LocationControllers.calculateRoute
);

router.get(
  '/rides/:rideId/route',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  authorizeRideAccess as RequestHandler,
  validateRequest(LocationValidation.rideRouteZodSchema),
  LocationControllers.getStoredRoute
);

// ETA calculation
router.post(
  '/rides/:rideId/eta',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  authorizeRideAccess as RequestHandler,
  validateRequest(LocationValidation.rideRouteZodSchema),
  validateRequest(LocationValidation.etaCalculationZodSchema),
  LocationControllers.calculateETA
);

// Enhanced location services
router.get(
  '/geocode',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  geocodingLimiter,
  validateRequest(LocationValidation.geocodingZodSchema),
  LocationControllers.geocodeAddress
);

router.get(
  '/reverse-geocode',
  auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  geocodingLimiter,
  validateRequest(LocationValidation.reverseGeocodingZodSchema),
  LocationControllers.reverseGeocode
);



// Error handling middleware
router.use(handleLocationError);

export const LocationRoutes = router;