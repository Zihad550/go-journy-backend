import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt-interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { LocationServices } from "./location-service";

const updateDriverLocation = catchAsync(async (req, res) => {
	const data = await LocationServices.updateDriverLocation(
		req.user as IJwtPayload as IJwtPayload,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Location updated successfully",
	});
});

const getDriverLocation = catchAsync(async (req, res) => {
	const { driverId } = req.params;
	const { rideId } = req.query;
	const data = await LocationServices.getDriverLocation(
		req.user as IJwtPayload,
		driverId,
		rideId as string,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Driver location retrieved successfully",
	});
});

const getRideLocationHistory = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const { startTime, endTime, limit } = req.query;

	const data = await LocationServices.getRideLocationHistory(
		req.user as IJwtPayload,
		rideId,
		startTime ? new Date(startTime as string) : undefined,
		endTime ? new Date(endTime as string) : undefined,
		limit ? parseInt(limit as string, 10) : undefined,
	);

	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Location history retrieved successfully",
	});
});

const calculateRoute = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const data = await LocationServices.calculateRoute(
		req.user as IJwtPayload,
		rideId,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Route calculated successfully",
	});
});

const getStoredRoute = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const data = await LocationServices.getStoredRoute(
		req.user as IJwtPayload,
		rideId,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Route retrieved successfully",
	});
});

const calculateETA = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const data = await LocationServices.calculateETA(
		req.user as IJwtPayload,
		rideId,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "ETA calculated successfully",
	});
});

const geocodeAddress = catchAsync(async (req, res) => {
	const { query, limit, country, bbox } = req.query;
	const data = await LocationServices.geocodeAddress(
		query as string,
		limit ? parseInt(limit as string, 10) : undefined,
		country as string,
		bbox as string,
	);
	sendResponse(res, {
		data: {
			query,
			results: data,
		},
		statusCode: status.OK,
		success: true,
		message: "Geocoding results retrieved successfully",
	});
});

const reverseGeocode = catchAsync(async (req, res) => {
	const { lat, lng } = req.query;
	const data = await LocationServices.reverseGeocode(
		parseFloat(lat as string),
		parseFloat(lng as string),
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Address retrieved successfully",
	});
});

export const LocationControllers = {
	updateDriverLocation,
	getDriverLocation,
	getRideLocationHistory,
	calculateRoute,
	getStoredRoute,
	calculateETA,
	geocodeAddress,
	reverseGeocode,
};
