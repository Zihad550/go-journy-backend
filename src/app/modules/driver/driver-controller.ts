import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt-interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { DriverServices } from "./driver-service";

const register = catchAsync(async (req, res) => {
	const data = await DriverServices.register(req.user as IJwtPayload, req.body);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver request sent successfully",
	});
});

const update_profile = catchAsync(async (req, res) => {
	const data = await DriverServices.update_profile(
		req.user as IJwtPayload,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver information updated successfully",
	});
});

const get_drivers = catchAsync(async (_req, res) => {
	const data = await DriverServices.get_drivers();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Drivers retrieved successfully",
	});
});

const manage_driver_register = catchAsync(async (req, res) => {
	const id = req.params.id;
	const data = await DriverServices.manage_driver_register(id, req.body);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver request updated successfully",
	});
});

const get_driver_earnings = catchAsync(async (req, res) => {
	const data = await DriverServices.get_driver_earnings(
		req.user as IJwtPayload,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride info retrieved successfully",
		success: true,
	});
});

const delete_driver_by_id = catchAsync(async (req, res) => {
	const data = await DriverServices.delete_driver_by_id(req.params.id);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Driver deleted successfully",
		success: true,
	});
});

const get_profile = catchAsync(async (req, res) => {
	const data = await DriverServices.get_profile(req.user as IJwtPayload);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver profile retrieved successfully",
	});
});

const update_availability = catchAsync(async (req, res) => {
	const data = await DriverServices.update_availability(
		req.user as IJwtPayload,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver availability updated successfully",
	});
});

export const DriverControllers = {
	register,
	update_profile,
	get_drivers,
	get_profile,
	manage_driver_register,
	get_driver_earnings,
	delete_driver_by_id,
	update_availability,
};
