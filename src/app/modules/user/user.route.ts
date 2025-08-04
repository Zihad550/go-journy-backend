import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./user.controller";
import { RoleEnum } from "./user.interface";

const router = Router();

router.patch("/block/:id", auth(RoleEnum.ADMIN), UserControllers.blockUser);

export const UserRoutes = router;
