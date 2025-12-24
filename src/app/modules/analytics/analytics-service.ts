import { useObjectId } from "../../utils/use-object-id";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver-interface";
import Driver from "../driver/driver-model";
import Review from "../review/review-model";
import { RideStatusEnum } from "../ride/ride-interface";
import Ride from "../ride/ride-model";
import User from "../user/user-model";
import type {
	IAdminDriversResponse,
	IAdminOverviewResponse,
	IAdminRevenueTrendQuery,
	IAdminRevenueTrendResponse,
	IAdminRidesResponse,
	IAnalyticsQuery,
	IAnalyticsResponse,
	IDriverAnalyticsQuery,
	IDriverAnalyticsResponse,
	IRiderAnalyticsQuery,
	IRiderAnalyticsResponse,
} from "./analytics-interface";

const getAnalytics = async (
	query: IAnalyticsQuery,
): Promise<IAnalyticsResponse> => {
	const { startDate, endDate, period = "monthly" } = query;

	// Build date filter
	const dateFilter: any = {};
	if (startDate) dateFilter.$gte = new Date(startDate);
	if (endDate) dateFilter.$lte = new Date(endDate);

	const matchFilter = dateFilter.length ? { createdAt: dateFilter } : {};

	// Status distribution
	const statusDistribution = await Ride.aggregate([
		{ $match: matchFilter },
		{ $group: { _id: "$status", count: { $sum: 1 } } },
	]);

	// Revenue analytics
	const revenueAnalytics = await Ride.aggregate([
		{ $match: { ...matchFilter, status: RideStatusEnum.Completed } },
		{
			$group: {
				_id: null,
				totalRevenue: { $sum: "$price" },
				totalRides: { $sum: 1 },
				averageRidePrice: { $avg: "$price" },
			},
		},
	]);

	// Trend data based on period
	let groupBy: any = {};
	switch (period) {
		case "daily":
			groupBy = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				day: { $dayOfMonth: "$createdAt" },
			};
			break;
		case "weekly":
			groupBy = {
				year: { $year: "$createdAt" },
				week: { $week: "$createdAt" },
			};
			break;
		case "monthly":
			groupBy = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
			};
			break;
		case "yearly":
			groupBy = {
				year: { $year: "$createdAt" },
			};
			break;
	}

	const trendData = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$group: {
				_id: groupBy,
				totalRides: { $sum: 1 },
				completedRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Completed] }, 1, 0],
					},
				},
				cancelledRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Cancelled] }, 1, 0],
					},
				},
				totalRevenue: {
					$sum: {
						$cond: [
							{ $eq: ["$status", RideStatusEnum.Completed] },
							"$price",
							0,
						],
					},
				},
			},
		},
		{ $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
	]);

	// Driver performance
	const driverPerformance = await Ride.aggregate([
		{ $match: { ...matchFilter, driver: { $ne: null } } },
		{
			$group: {
				_id: "$driver",
				totalRides: { $sum: 1 },
				completedRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Completed] }, 1, 0],
					},
				},
				totalEarnings: {
					$sum: {
						$cond: [
							{ $eq: ["$status", RideStatusEnum.Completed] },
							"$price",
							0,
						],
					},
				},
			},
		},
		{
			$lookup: {
				from: "drivers",
				localField: "_id",
				foreignField: "_id",
				as: "driverInfo",
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "driverInfo.user",
				foreignField: "_id",
				as: "userInfo",
			},
		},
		{
			$project: {
				totalRides: 1,
				completedRides: 1,
				totalEarnings: 1,
				completionRate: {
					$multiply: [{ $divide: ["$completedRides", "$totalRides"] }, 100],
				},
				driverName: { $arrayElemAt: ["$userInfo.name", 0] },
				driverEmail: { $arrayElemAt: ["$userInfo.email", 0] },
			},
		},
		{ $sort: { completionRate: -1 } },
		{ $limit: 10 },
	]);

	return {
		statusDistribution,
		revenueAnalytics: revenueAnalytics[0] || {
			totalRevenue: 0,
			totalRides: 0,
			averageRidePrice: 0,
		},
		trendData,
		topDrivers: driverPerformance,
	};
};

const getRiderAnalytics = async (
	riderId: string,
	query: IRiderAnalyticsQuery,
): Promise<IRiderAnalyticsResponse> => {
	const { startDate, endDate, period = "monthly" } = query;

	// Build date filter
	const dateFilter: any = {};
	if (startDate) dateFilter.$gte = new Date(startDate);
	if (endDate) dateFilter.$lte = new Date(endDate);

	const matchFilter = dateFilter.length
		? { createdAt: dateFilter, rider: useObjectId(riderId) }
		: { rider: useObjectId(riderId) };

	// Overview statistics
	const overviewStats = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$group: {
				_id: null,
				totalRides: { $sum: 1 },
				completedRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Completed] }, 1, 0],
					},
				},
				cancelledRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Cancelled] }, 1, 0],
					},
				},
				totalSpent: {
					$sum: {
						$cond: [
							{ $eq: ["$status", RideStatusEnum.Completed] },
							"$price",
							0,
						],
					},
				},
			},
		},
		{
			$project: {
				totalRides: 1,
				completedRides: 1,
				cancelledRides: 1,
				totalSpent: 1,
				averageRideCost: {
					$cond: [
						{ $gt: ["$completedRides", 0] },
						{ $divide: ["$totalSpent", "$completedRides"] },
						0,
					],
				},
				completionRate: {
					$cond: [
						{ $gt: ["$totalRides", 0] },
						{
							$multiply: [{ $divide: ["$completedRides", "$totalRides"] }, 100],
						},
						0,
					],
				},
			},
		},
	]);

	// Spending trends
	let groupBy: any = {};
	switch (period) {
		case "daily":
			groupBy = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				day: { $dayOfMonth: "$createdAt" },
			};
			break;
		case "weekly":
			groupBy = {
				year: { $year: "$createdAt" },
				week: { $week: "$createdAt" },
			};
			break;
		case "monthly":
			groupBy = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
			};
			break;
		case "yearly":
			groupBy = {
				year: { $year: "$createdAt" },
			};
			break;
	}

	const spendingTrends = await Ride.aggregate([
		{ $match: { ...matchFilter, status: RideStatusEnum.Completed } },
		{
			$group: {
				_id: groupBy,
				totalSpent: { $sum: "$price" },
				rideCount: { $sum: 1 },
			},
		},
		{
			$project: {
				totalSpent: 1,
				rideCount: 1,
				averageCost: { $divide: ["$totalSpent", "$rideCount"] },
			},
		},
		{ $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
	]);

	// Favorite locations
	const pickupLocations = await Ride.aggregate([
		{ $match: { ...matchFilter, status: RideStatusEnum.Completed } },
		{
			$group: {
				_id: {
					lat: "$pickupLocation.lat",
					lng: "$pickupLocation.lng",
				},
				count: { $sum: 1 },
			},
		},
		{ $sort: { count: -1 } },
		{ $limit: 5 },
	]);

	const destinationLocations = await Ride.aggregate([
		{ $match: { ...matchFilter, status: RideStatusEnum.Completed } },
		{
			$group: {
				_id: {
					lat: "$destination.lat",
					lng: "$destination.lng",
				},
				count: { $sum: 1 },
			},
		},
		{ $sort: { count: -1 } },
		{ $limit: 5 },
	]);

	// Driver ratings
	const ratingStats = await Review.aggregate([
		{ $match: { rider: useObjectId(riderId) } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalReviews: { $sum: 1 },
				rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
				rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
				rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
				rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
				rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
			},
		},
		{
			$project: {
				averageRating: 1,
				totalReviews: 1,
				ratingDistribution: {
					1: "$rating1",
					2: "$rating2",
					3: "$rating3",
					4: "$rating4",
					5: "$rating5",
				},
			},
		},
	]);

	const recentReviews = await Review.aggregate([
		{ $match: { rider: useObjectId(riderId) } },
		{
			$lookup: {
				from: "drivers",
				localField: "driver",
				foreignField: "_id",
				as: "driverInfo",
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "driverInfo.user",
				foreignField: "_id",
				as: "userInfo",
			},
		},
		{
			$project: {
				driverName: { $arrayElemAt: ["$userInfo.name", 0] },
				rating: 1,
				comment: 1,
				createdAt: 1,
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $limit: 10 },
	]);

	// Recent ride history
	const rideHistory = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$lookup: {
				from: "drivers",
				localField: "driver",
				foreignField: "_id",
				as: "driverInfo",
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "driverInfo.user",
				foreignField: "_id",
				as: "userInfo",
			},
		},
		{
			$project: {
				_id: 1,
				status: 1,
				price: 1,
				pickupLocation: 1,
				destination: 1,
				driverName: { $arrayElemAt: ["$userInfo.name", 0] },
				createdAt: 1,
				dropoffTime: 1,
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $limit: 20 },
	]);

	const overview = overviewStats[0] || {
		totalRides: 0,
		completedRides: 0,
		cancelledRides: 0,
		totalSpent: 0,
		averageRideCost: 0,
		completionRate: 0,
	};

	const ratingData = ratingStats[0] || {
		averageRating: 0,
		totalReviews: 0,
		ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
	};

	return {
		overview,
		spendingTrends,
		favoriteLocations: {
			pickupLocations: pickupLocations.map((item) => ({
				location: item._id,
				count: item.count,
			})),
			destinationLocations: destinationLocations.map((item) => ({
				location: item._id,
				count: item.count,
			})),
		},
		driverRatings: {
			...ratingData,
			recentReviews,
		},
		rideHistory,
	};
};

const getDriverAnalytics = async (
	userId: string,
	query: IDriverAnalyticsQuery,
): Promise<IDriverAnalyticsResponse> => {
	const { startDate, endDate, period = "monthly" } = query;

	// Build date filter
	const dateFilter: any = {};
	if (startDate) dateFilter.$gte = new Date(startDate);
	if (endDate) dateFilter.$lte = new Date(endDate);

	// get driver
	const driver = await Driver.findOne(
		{
			user: useObjectId(userId),
		},
		{ _id: 1 },
	);

	if (!driver) throw new Error("Driver not found");
	const { _id: driverId } = driver;

	const matchFilter = dateFilter.length
		? { createdAt: dateFilter, driver: useObjectId(driverId) }
		: { driver: useObjectId(driverId) };

	// Overview statistics
	const overviewStats = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$group: {
				_id: null,
				totalRides: { $sum: 1 },
				completedRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Completed] }, 1, 0],
					},
				},
				cancelledRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Cancelled] }, 1, 0],
					},
				},
				totalEarnings: {
					$sum: {
						$cond: [
							{ $eq: ["$status", RideStatusEnum.Completed] },
							"$price",
							0,
						],
					},
				},
			},
		},
		{
			$project: {
				totalRides: 1,
				completedRides: 1,
				cancelledRides: 1,
				totalEarnings: 1,
				averageRideEarnings: {
					$cond: [
						{ $gt: ["$completedRides", 0] },
						{ $divide: ["$totalEarnings", "$completedRides"] },
						0,
					],
				},
				completionRate: {
					$cond: [
						{ $gt: ["$totalRides", 0] },
						{
							$multiply: [{ $divide: ["$completedRides", "$totalRides"] }, 100],
						},
						0,
					],
				},
			},
		},
	]);

	// Earnings trends
	let groupBy: any = {};
	switch (period) {
		case "daily":
			groupBy = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				day: { $dayOfMonth: "$createdAt" },
			};
			break;
		case "weekly":
			groupBy = {
				year: { $year: "$createdAt" },
				week: { $week: "$createdAt" },
			};
			break;
		case "monthly":
			groupBy = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
			};
			break;
		case "yearly":
			groupBy = {
				year: { $year: "$createdAt" },
			};
			break;
	}

	const earningsTrends = await Ride.aggregate([
		{ $match: { ...matchFilter, status: RideStatusEnum.Completed } },
		{
			$group: {
				_id: groupBy,
				totalEarnings: { $sum: "$price" },
				rideCount: { $sum: 1 },
			},
		},
		{
			$project: {
				totalEarnings: 1,
				rideCount: 1,
				averageEarnings: { $divide: ["$totalEarnings", "$rideCount"] },
			},
		},
		{ $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
	]);

	// Rider ratings
	const ratingStats = await Review.aggregate([
		{ $match: { driver: useObjectId(driverId) } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalReviews: { $sum: 1 },
				rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
				rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
				rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
				rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
				rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
			},
		},
		{
			$project: {
				averageRating: 1,
				totalReviews: 1,
				ratingDistribution: {
					1: "$rating1",
					2: "$rating2",
					3: "$rating3",
					4: "$rating4",
					5: "$rating5",
				},
			},
		},
	]);

	const recentReviews = await Review.aggregate([
		{ $match: { driver: driverId } },
		{
			$lookup: {
				from: "users",
				localField: "rider",
				foreignField: "_id",
				as: "riderInfo",
			},
		},
		{
			$project: {
				riderName: { $arrayElemAt: ["$riderInfo.name", 0] },
				rating: 1,
				comment: 1,
				createdAt: 1,
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $limit: 10 },
	]);

	// Recent ride history
	const rideHistory = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$lookup: {
				from: "users",
				localField: "rider",
				foreignField: "_id",
				as: "riderInfo",
			},
		},
		{
			$project: {
				_id: 1,
				status: 1,
				price: 1,
				pickupLocation: 1,
				destination: 1,
				riderName: { $arrayElemAt: ["$riderInfo.name", 0] },
				createdAt: 1,
				dropoffTime: 1,
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $limit: 20 },
	]);

	const overview = overviewStats[0] || {
		totalRides: 0,
		completedRides: 0,
		cancelledRides: 0,
		totalEarnings: 0,
		averageRideEarnings: 0,
		completionRate: 0,
	};

	const ratingData = ratingStats[0] || {
		averageRating: 0,
		totalReviews: 0,
		ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
	};

	return {
		overview,
		earningsTrends,
		riderRatings: {
			...ratingData,
			recentReviews,
		},
		rideHistory,
	};
};

const getAdminOverview = async (): Promise<IAdminOverviewResponse> => {
	// Get total users
	const totalUsers = await User.countDocuments({ isDeleted: false });

	// Get total drivers
	const totalDrivers = await Driver.countDocuments();

	// Get ride statistics
	const rideStats = await Ride.aggregate([
		{
			$group: {
				_id: null,
				totalRides: { $sum: 1 },
				totalRevenue: {
					$sum: {
						$cond: [
							{ $eq: ["$status", RideStatusEnum.Completed] },
							"$price",
							0,
						],
					},
				},
				completedRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Completed] }, 1, 0],
					},
				},
				pendingRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Requested] }, 1, 0],
					},
				},
				cancelledRides: {
					$sum: {
						$cond: [{ $eq: ["$status", RideStatusEnum.Cancelled] }, 1, 0],
					},
				},
			},
		},
	]);

	// Get active drivers (online and approved)
	const activeDrivers = await Driver.countDocuments({
		availability: AvailabilityEnum.ONLINE,
		driverStatus: DriverStatusEnum.APPROVED,
	});

	const stats = rideStats[0] || {
		totalRides: 0,
		totalRevenue: 0,
		completedRides: 0,
		pendingRides: 0,
		cancelledRides: 0,
	};

	return {
		totalUsers,
		totalDrivers,
		totalRides: stats.totalRides,
		totalRevenue: stats.totalRevenue,
		activeDrivers,
		completedRides: stats.completedRides,
		pendingRides: stats.pendingRides,
		cancelledRides: stats.cancelledRides,
	};
};

const getAdminDrivers = async (): Promise<IAdminDriversResponse> => {
	// Drivers by status
	const driversByStatus = await Driver.aggregate([
		{
			$group: {
				_id: "$driverStatus",
				count: { $sum: 1 },
			},
		},
	]);

	const statusMap = {
		pending: 0,
		approved: 0,
		rejected: 0,
	};

	driversByStatus.forEach((item) => {
		if (item._id === DriverStatusEnum.PENDING) statusMap.pending = item.count;
		if (item._id === DriverStatusEnum.APPROVED) statusMap.approved = item.count;
		if (item._id === DriverStatusEnum.REJECTED) statusMap.rejected = item.count;
	});

	// Drivers by availability (only approved drivers)
	const driversByAvailability = await Driver.aggregate([
		{ $match: { driverStatus: DriverStatusEnum.APPROVED } },
		{
			$group: {
				_id: "$availability",
				count: { $sum: 1 },
			},
		},
	]);

	const availabilityMap = {
		online: 0,
		offline: 0,
	};

	driversByAvailability.forEach((item) => {
		if (item._id === AvailabilityEnum.ONLINE)
			availabilityMap.online = item.count;
		if (item._id === AvailabilityEnum.OFFLINE)
			availabilityMap.offline = item.count;
	});

	// Top drivers by rides
	const topDriversByRides = await Ride.aggregate([
		{
			$match: {
				driver: { $ne: null },
				status: RideStatusEnum.Completed,
			},
		},
		{
			$group: {
				_id: "$driver",
				totalRides: { $sum: 1 },
				earnings: { $sum: "$price" },
			},
		},
		{ $sort: { totalRides: -1 } },
		{ $limit: 10 },
		{
			$lookup: {
				from: "drivers",
				localField: "_id",
				foreignField: "_id",
				as: "driverInfo",
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "driverInfo.user",
				foreignField: "_id",
				as: "userInfo",
			},
		},
		{
			$project: {
				driverId: "$_id",
				driverName: { $arrayElemAt: ["$userInfo.name", 0] },
				totalRides: 1,
				earnings: 1,
			},
		},
	]);

	return {
		driversByStatus: statusMap,
		driversByAvailability: availabilityMap,
		topDriversByRides,
	};
};

const getAdminRides = async (): Promise<IAdminRidesResponse> => {
	// Rides by status
	const ridesByStatus = await Ride.aggregate([
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
	]);

	const statusMap = {
		requested: 0,
		accepted: 0,
		in_transit: 0,
		completed: 0,
		cancelled: 0,
	};

	ridesByStatus.forEach((item) => {
		if (item._id === RideStatusEnum.Requested) statusMap.requested = item.count;
		if (item._id === RideStatusEnum.Accepted) statusMap.accepted = item.count;
		if (item._id === RideStatusEnum.InTransit)
			statusMap.in_transit = item.count;
		if (item._id === RideStatusEnum.Completed) statusMap.completed = item.count;
		if (item._id === RideStatusEnum.Cancelled) statusMap.cancelled = item.count;
	});

	// Rides by time of day
	const ridesByTimeOfDay = await Ride.aggregate([
		{
			$group: {
				_id: { $hour: "$createdAt" },
				count: { $sum: 1 },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	const timeOfDayMap: Array<{ hour: number; count: number }> = [];
	for (let hour = 0; hour < 24; hour++) {
		const found = ridesByTimeOfDay.find((item) => item._id === hour);
		timeOfDayMap.push({
			hour,
			count: found ? found.count : 0,
		});
	}

	// Average ride price and total distance for completed rides
	const rideMetrics = await Ride.aggregate([
		{ $match: { status: RideStatusEnum.Completed } },
		{
			$group: {
				_id: null,
				averageRidePrice: { $avg: "$price" },
				totalDistance: { $sum: { $ifNull: ["$distance", 0] } },
				count: { $sum: 1 },
			},
		},
	]);

	const metrics = rideMetrics[0] || {
		averageRidePrice: 0,
		totalDistance: 0,
	};

	return {
		ridesByStatus: statusMap,
		ridesByTimeOfDay: timeOfDayMap,
		averageRidePrice: metrics.averageRidePrice,
		totalDistance: metrics.totalDistance,
	};
};

const getAdminRevenueTrend = async (
	query: IAdminRevenueTrendQuery,
): Promise<IAdminRevenueTrendResponse> => {
	const { period = "daily", days = 30 } = query;

	// Calculate date range
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(endDate.getDate() - days);

	const matchFilter = {
		status: RideStatusEnum.Completed,
		createdAt: { $gte: startDate, $lte: endDate },
	};

	// Daily revenue
	const dailyRevenue = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
					day: { $dayOfMonth: "$createdAt" },
				},
				value: { $sum: "$price" },
			},
		},
		{
			$project: {
				date: {
					$dateToString: {
						format: "%Y-%m-%d",
						date: {
							$dateFromParts: {
								year: "$_id.year",
								month: "$_id.month",
								day: "$_id.day",
							},
						},
					},
				},
				value: 1,
			},
		},
		{ $sort: { date: 1 } },
	]);

	// Weekly revenue
	const weeklyRevenue = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					week: { $week: "$createdAt" },
				},
				value: { $sum: "$price" },
			},
		},
		{
			$project: {
				date: {
					$dateToString: {
						format: "%Y-%m-%d",
						date: {
							$dateFromParts: {
								year: "$_id.year",
								month: 1,
								day: 1,
							},
						},
					},
				},
				value: 1,
			},
		},
		{ $sort: { date: 1 } },
	]);

	// Monthly revenue
	const monthlyRevenue = await Ride.aggregate([
		{ $match: matchFilter },
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
				},
				value: { $sum: "$price" },
			},
		},
		{
			$project: {
				date: {
					$dateToString: {
						format: "%Y-%m-%d",
						date: {
							$dateFromParts: {
								year: "$_id.year",
								month: "$_id.month",
								day: 1,
							},
						},
					},
				},
				value: 1,
			},
		},
		{ $sort: { date: 1 } },
	]);

	return {
		daily: dailyRevenue,
		weekly: weeklyRevenue,
		monthly: monthlyRevenue,
	};
};

export const AnalyticsServices = {
	getAnalytics,
	getRiderAnalytics,
	getDriverAnalytics,
	getAdminOverview,
	getAdminDrivers,
	getAdminRides,
	getAdminRevenueTrend,
};
