import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt-interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { RideServices } from "./ride-service";

const requestRide = catchAsync(async (req, res) => {
	const data = await RideServices.requestRide(
		req.body,
		req.user as IJwtPayload,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride requested successfully",
		success: true,
	});
});

const cancelRide = catchAsync(async (req, res) => {
	const data = await RideServices.cancelRide(
		req.user as IJwtPayload,
		req.params.id,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride cancelled successfully",
		success: true,
	});
});

const getRideInfo = catchAsync(async (req, res) => {
	const data = await RideServices.getRideInfo(
		req.user as IJwtPayload,
		req.params.id,
	);

	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride info retrieved successfully",
		success: true,
	});
});

const manageRideStatus = catchAsync(async (req, res) => {
	const data = await RideServices.manageRideStatus(
		req.user as IJwtPayload,
		req.params.id,
		req.body.status,
	);

	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride status updated successfully",
		success: true,
	});
});

const getRides = catchAsync(async (req, res) => {
	const data = await RideServices.getRides(req.user as IJwtPayload);

	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride info retrieved successfully",
		success: true,
	});
});

const showInterest = catchAsync(async (req, res) => {
	const data = await RideServices.showInterest(
		req.user as IJwtPayload,
		req.params.id,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Interest shown successfully",
	});
});

const acceptDriver = catchAsync(async (req, res) => {
	const data = await RideServices.acceptDriver(
		req.user as IJwtPayload,
		req.params.id,
		req.body.driverId,
		req.body.paymentId,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver accepted successfully",
	});
});

const deleteRideById = catchAsync(async (req, res) => {
	const data = await RideServices.deleteRideById(req.params.id);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Ride deleted successfully",
	});
});

export const RideControllers = {
	requestRide,
	cancelRide,
	getRideInfo,
	manageRideStatus,
	getRides,
	showInterest,
	acceptDriver,
	deleteRideById,
};
