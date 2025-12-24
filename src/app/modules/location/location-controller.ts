import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt-interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { LocationServices } from "./location-service";

const update_driver_location = catchAsync(async (req, res) => {
	const data = await LocationServices.update_driver_location(
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

const get_driver_location = catchAsync(async (req, res) => {
	const { driverId } = req.params;
	const { rideId } = req.query;
	const data = await LocationServices.get_driver_location(
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

const get_ride_location_history = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const { startTime, endTime, limit } = req.query;

	const data = await LocationServices.get_ride_location_history(
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

const calculate_route = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const data = await LocationServices.calculate_route(
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

const get_stored_route = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const data = await LocationServices.get_stored_route(
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

const calculate_eta = catchAsync(async (req, res) => {
	const { rideId } = req.params;
	const data = await LocationServices.calculate_eta(
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

const geocode_address = catchAsync(async (req, res) => {
	const { query, limit, country, bbox } = req.query;
	const data = await LocationServices.geocode_address(
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

const reverse_geocode = catchAsync(async (req, res) => {
	const { lat, lng } = req.query;
	const data = await LocationServices.reverse_geocode(
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
	update_driver_location,
	get_driver_location,
	get_ride_location_history,
	calculate_route,
	get_stored_route,
	calculate_eta,
	geocode_address,
	reverse_geocode,
};
