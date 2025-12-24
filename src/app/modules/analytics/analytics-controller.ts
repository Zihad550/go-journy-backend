import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt-interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import type { IAdminRevenueTrendQuery } from "./analytics-interface";
import { AnalyticsServices } from "./analytics-service";

const getAnalytics = catchAsync(async (req, res) => {
	const data = await AnalyticsServices.getAnalytics(req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Analytics retrieved successfully",
		success: true,
	});
});

const getRiderAnalytics = catchAsync(async (req, res) => {
	const user = req.user as IJwtPayload;
	const riderId = user.id;
	const data = await AnalyticsServices.getRiderAnalytics(riderId, req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Rider analytics retrieved successfully",
		success: true,
	});
});

const getDriverAnalytics = catchAsync(async (req, res) => {
	const user = req.user as IJwtPayload;
	const userId = user.id;

	const data = await AnalyticsServices.getDriverAnalytics(userId, req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Driver analytics retrieved successfully",
		success: true,
	});
});

const getAdminOverview = catchAsync(async (_req, res) => {
	const data = await AnalyticsServices.getAdminOverview();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Overview stats retrieved successfully",
		success: true,
	});
});

const getAdminDrivers = catchAsync(async (_req, res) => {
	const data = await AnalyticsServices.getAdminDrivers();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Driver analytics retrieved successfully",
		success: true,
	});
});

const getAdminRides = catchAsync(async (_req, res) => {
	const data = await AnalyticsServices.getAdminRides();
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Ride analytics retrieved successfully",
		success: true,
	});
});

const getAdminRevenueTrend = catchAsync(async (req, res) => {
	const query: IAdminRevenueTrendQuery = req.query;
	const data = await AnalyticsServices.getAdminRevenueTrend(query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		message: "Revenue trend retrieved successfully",
		success: true,
	});
});

export const AnalyticsControllers = {
	getAnalytics,
	getRiderAnalytics,
	getDriverAnalytics,
	getAdminOverview,
	getAdminDrivers,
	getAdminRides,
	getAdminRevenueTrend,
};
