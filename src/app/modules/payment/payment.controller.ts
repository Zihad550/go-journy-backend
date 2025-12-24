import type { Request, Response } from "express";
import env from "../../../env";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { PaymentServices } from "./payment.service";
import { SSLServices } from "./ssl-commerz.service";

const init_payment = catchAsync(async (req: Request, res: Response) => {
	const rideId = req.params.rideId;
	const result = await PaymentServices.init_payment(rideId);
	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Payment initiated successfully",
		data: result,
	});
});

const success_payment = catchAsync(async (req: Request, res: Response) => {
	const query = req.query;
	const result = await PaymentServices.success_payment(
		query as Record<string, string>,
	);

	if (result.success) {
		res.redirect(
			`${env.FRONTEND_URL}${env.SSL_CONFIG.SUCCESS_FRONTEND_PATH}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
		);
	}
});

const fail_payment = catchAsync(async (req: Request, res: Response) => {
	const query = req.query;
	const result = await PaymentServices.fail_payment(
		query as Record<string, string>,
	);

	if (!result.success) {
		res.redirect(
			`${env.FRONTEND_URL}${env.SSL_CONFIG.FAIL_FRONTEND_PATH}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
		);
	}
});

const cancel_payment = catchAsync(async (req: Request, res: Response) => {
	const query = req.query;
	const result = await PaymentServices.cancel_payment(
		query as Record<string, string>,
	);

	if (!result.success) {
		res.redirect(
			`${env.FRONTEND_URL}${env.SSL_CONFIG.CANCEL_FRONTEND_PATH}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`,
		);
	}
});

const validate_payment = catchAsync(async (req: Request, res: Response) => {
	await SSLServices.validate_payment(req.body);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payment Validated Successfully",
		data: null,
	});
});

const get_invoice_download_url = catchAsync(
	async (req: Request, res: Response) => {
		const { paymentId } = req.params;
		const result = await PaymentServices.get_invoice_download_url(paymentId);
		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Invoice download URL retrieved successfully",
			data: result,
		});
	},
);

const hold_payment = catchAsync(async (req: Request, res: Response) => {
	const { paymentId } = req.params;
	const { rideId, driverId } = req.body;
	const result = await PaymentServices.hold_payment(
		paymentId,
		rideId,
		driverId,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payment held successfully",
		data: result,
	});
});

const release_payment = catchAsync(async (req: Request, res: Response) => {
	const { paymentId } = req.params;
	const { rideId } = req.body;
	const result = await PaymentServices.release_payment(paymentId, rideId);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payment released to driver successfully",
		data: result,
	});
});

export const PaymentController = {
	init_payment,
	success_payment,
	fail_payment,
	cancel_payment,
	validate_payment,
	get_invoice_download_url,
	hold_payment,
	release_payment,
};
