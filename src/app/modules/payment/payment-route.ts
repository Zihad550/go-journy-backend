import express from "express";
import auth from "../../middlewares/auth";
import { RoleEnum } from "../user/user-interface";
import { PaymentController } from "./payment-controller";

const router = express.Router();

// Initialize payment (Rider only)
router.post(
	"/init-payment/:rideId",
	auth(RoleEnum.RIDER),
	PaymentController.initPayment,
);

// Payment callbacks (Public - called by SSLCommerz)
router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);

// IPN validation (Public - called by SSLCommerz)
router.post("/validate-payment", PaymentController.validatePayment);

// Invoice download (Authenticated users)
router.get(
	"/invoice/:paymentId",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	PaymentController.getInvoiceDownloadUrl,
);

// Payment hold/release (Admin only)
router.post(
	"/hold/:paymentId",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	PaymentController.holdPayment,
);
router.post(
	"/release/:paymentId",
	auth(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	PaymentController.releasePayment,
);

export const PaymentRoutes = router;
