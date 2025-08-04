import { Router } from "express";
import auth from "../../middlewares/auth";
import { RoleEnum } from "../user/user.interface";
import { DriverControllers } from "./driver.controller";

const router = Router();

router.patch(
  "/approve/:id",
  auth(RoleEnum.DRIVER),
  DriverControllers.approveRide,
);

export const DriverRoutes = router;
