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

const updateProfile = catchAsync(async (req, res) => {
	const data = await DriverServices.updateProfile(
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

const getDrivers = catchAsync(async (_req, res) => {
	const data = await DriverServices.getDrivers();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Drivers retrieved successfully",
	});
});

const manageDriverRegister = catchAsync(async (req, res) => {
	const id = req.params.id;
	const data = await DriverServices.manageDriverRegister(id, req.body);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver request updated successfully",
	});
});

const getDriverEarnings = catchAsync(async (req, res) => {
	const data = await DriverServices.getDriverEarnings(req.user as IJwtPayload);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride info retrieved successfully",
		success: true,
	});
});

const deleteDriverById = catchAsync(async (req, res) => {
	const data = await DriverServices.deleteDriverById(req.params.id);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Driver deleted successfully",
		success: true,
	});
});

const getProfile = catchAsync(async (req, res) => {
	const data = await DriverServices.getProfile(req.user as IJwtPayload);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver profile retrieved successfully",
	});
});

const updateAvailability = catchAsync(async (req, res) => {
	const data = await DriverServices.updateAvailability(
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
	updateProfile,
	getDrivers,
	getProfile,
	manageDriverRegister,
	getDriverEarnings,
	deleteDriverById,
	updateAvailability,
};
