import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt.interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import type { IAdminRevenueTrendQuery } from "./analytics.interface";
import { AnalyticsServices } from "./analytics.service";

const get_analytics = catchAsync(async (req, res) => {
	const data = await AnalyticsServices.get_analytics(req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Analytics retrieved successfully",
		success: true,
	});
});

const get_rider_analytics = catchAsync(async (req, res) => {
	const user = req.user as IJwtPayload;
	const riderId = user.id;
	const data = await AnalyticsServices.get_rider_analytics(riderId, req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Rider analytics retrieved successfully",
		success: true,
	});
});

const get_driver_analytics = catchAsync(async (req, res) => {
	const user = req.user as IJwtPayload;
	const userId = user.id;

	const data = await AnalyticsServices.get_driver_analytics(userId, req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Driver analytics retrieved successfully",
		success: true,
	});
});

const get_admin_overview = catchAsync(async (_req, res) => {
	const data = await AnalyticsServices.get_admin_overview();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Overview stats retrieved successfully",
		success: true,
	});
});

const get_admin_drivers = catchAsync(async (_req, res) => {
	const data = await AnalyticsServices.get_admin_drivers();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Driver analytics retrieved successfully",
		success: true,
	});
});

const get_admin_rides = catchAsync(async (_req, res) => {
	const data = await AnalyticsServices.get_admin_rides();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride analytics retrieved successfully",
		success: true,
	});
});

const get_admin_revenue_trend = catchAsync(async (req, res) => {
	const query: IAdminRevenueTrendQuery = req.query;
	const data = await AnalyticsServices.get_admin_revenue_trend(query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Revenue trend retrieved successfully",
		success: true,
	});
});

export const AnalyticsControllers = {
	get_analytics,
	get_rider_analytics,
	get_driver_analytics,
	get_admin_overview,
	get_admin_drivers,
	get_admin_rides,
	get_admin_revenue_trend,
};
