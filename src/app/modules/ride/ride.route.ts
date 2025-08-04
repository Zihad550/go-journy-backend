import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RoleEnum } from "../user/user.interface";
import { RideControllers } from "./ride.controller";
import { RideValidationSchemas } from "./ride.validation";

const router = Router();

router.get("/", auth(RoleEnum.ADMIN), RideControllers.getRides);

router.get(
  "/:id",
  auth(RoleEnum.DRIVER, RoleEnum.RIDER),
  RideControllers.getRideInfo,
);

router.post(
  "/request",
  auth(RoleEnum.RIDER),
  validateRequest(RideValidationSchemas.createRideSchema),
  RideControllers.requestRide,
);

router.patch("/cancel/:id", auth(RoleEnum.RIDER), RideControllers.cancelRide);
router.patch(
  "/:id/status",
  auth(RoleEnum.DRIVER, RoleEnum.RIDER),
  validateRequest(RideValidationSchemas.updateRideStatusSchema),
  RideControllers.manageRideStatus,
);

export const RideRoutes = router;
