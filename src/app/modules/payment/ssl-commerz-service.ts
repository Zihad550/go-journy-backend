import axios from "axios";
import env from "../../../env";
import Payment from "./payment-model";
import type { ISSLCommerz } from "./ssl-commerz-interface";

async function ssl_payment_init(payload: ISSLCommerz) {
	const data = {
		store_id: env.SSL_CONFIG.STORE_ID,
		store_passwd: env.SSL_CONFIG.STORE_PASS,
		total_amount: payload.amount,
		currency: "BDT",
		tran_id: payload.transactionId,
		success_url: `${env.BACKEND_URL}${env.SSL_CONFIG.SUCCESS_BACKEND_PATH}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
		fail_url: `${env.BACKEND_URL}${env.SSL_CONFIG.FAIL_BACKEND_PATH}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
		cancel_url: `${env.BACKEND_URL}${env.SSL_CONFIG.CANCEL_BACKEND_PATH}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
		ipn_url: `${env.BACKEND_URL}${env.SSL_CONFIG.BACKEND_IPN_PATH}`,
		shipping_method: "N/A",
		product_name: "Ride Service",
		product_category: "Service",
		product_profile: "general",
		cus_name: payload.name,
		cus_email: payload.email,
		cus_add1: payload.address,
		cus_add2: "N/A",
		cus_city: "Dhaka",
		cus_state: "Dhaka",
		cus_postcode: "1000",
		cus_country: "Bangladesh",
		cus_phone: payload.phoneNumber,
		cus_fax: "01711111111",
		ship_name: "N/A",
		ship_add1: "N/A",
		ship_add2: "N/A",
		ship_city: "N/A",
		ship_state: "N/A",
		ship_postcode: 1000,
		ship_country: "N/A",
	};

	const response = await axios({
		method: "POST",
		url: env.SSL_CONFIG.PAYMENT_API,
		data: data,
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	return response.data;
}

async function validate_payment(payload: any) {
	const response = await axios({
		method: "GET",
		url: `${env.SSL_CONFIG.VALIDATION_API}?val_id=${payload.val_id}&store_id=${env.SSL_CONFIG.STORE_ID}&store_passwd=${env.SSL_CONFIG.STORE_PASS}`,
	});

	// Update payment with gateway response
	await Payment.updateOne(
		{ transactionId: payload.tran_id },
		{ paymentGatewayData: response.data },
		{ runValidators: true },
	);

	return response.data;
}

async function hold_payment(transactionId: string) {
	// SSLCommerz doesn't have a direct "hold" API, but we can validate the payment
	// and mark it as held in our system. In a real implementation, you might need
	// to use SSLCommerz's capture API or similar functionality.
	const payment = await Payment.findOne({ transactionId });
	if (!payment) {
		throw new Error("Payment not found");
	}

	// For now, we'll just return success. In production, implement actual hold logic
	// based on SSLCommerz documentation for holding/capturing payments
	return { success: true, message: "Payment held successfully" };
}

async function release_payment(transactionId: string) {
	// SSLCommerz release functionality - in production, this would call
	// SSLCommerz's release/capture API to transfer funds to the merchant/driver account
	const payment = await Payment.findOne({ transactionId });
	if (!payment) {
		throw new Error("Payment not found");
	}

	// For now, we'll just return success. In production, implement actual release logic
	// This would typically involve calling SSLCommerz's settlement or transfer API
	return { success: true, message: "Payment released successfully" };
}

export const SSLServices = {
	ssl_payment_init,
	validate_payment,
	hold_payment,
	release_payment,
};
