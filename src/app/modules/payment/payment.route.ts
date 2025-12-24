import express from "express";
import auth from "../../middlewares/auth";
import { RoleEnum } from "../user/user.interface";
import { PaymentController } from "./payment.controller";

const router = express.Router();

// Initialize payment (Rider only)
router.post(
	"/init-payment/:rideId",
	auth(RoleEnum.RIDER),
	PaymentController.init_payment,
);

// Payment callbacks (Public - called by SSLCommerz)
router.post("/success", PaymentController.success_payment);
router.post("/fail", PaymentController.fail_payment);
router.post("/cancel", PaymentController.cancel_payment);

// IPN validation (Public - called by SSLCommerz)
router.post("/validate-payment", PaymentController.validate_payment);

// Invoice download (Authenticated users)
router.get(
	"/invoice/:paymentId",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	PaymentController.get_invoice_download_url,
);

// Payment hold/release (Admin only)
router.post(
	"/hold/:paymentId",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	PaymentController.hold_payment,
);
router.post(
	"/release/:paymentId",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	PaymentController.release_payment,
);

export const PaymentRoutes = router;
