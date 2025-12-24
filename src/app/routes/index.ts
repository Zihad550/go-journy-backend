import { Router } from "express";
import { AnalyticsRoutes } from "../modules/analytics/analytics-route";
import { AuthRoutes } from "../modules/auth/auth-route";
import { DriverRoutes } from "../modules/driver/driver-route";
import { LocationRoutes } from "../modules/location/location-route";
import { PaymentRoutes } from "../modules/payment/payment-route";
import { ReviewRoutes } from "../modules/review/review-route";
import { AdminRideRoutes } from "../modules/ride/admin-ride-route";
import { RideRoutes } from "../modules/ride/ride-route";
import { UserRoutes } from "../modules/user/user-route";
export const router = Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: AuthRoutes,
	},
	{
		path: "/users",
		route: UserRoutes,
	},
	{
		path: "/rides",
		route: RideRoutes,
	},
	{
		path: "/rides/admin",
		route: AdminRideRoutes,
	},
	{
		path: "/analytics",
		route: AnalyticsRoutes,
	},
	{
		path: "/drivers",
		route: DriverRoutes,
	},
	{
		path: "/location",
		route: LocationRoutes,
	},
	{
		path: "/reviews",
		route: ReviewRoutes,
	},
	{
		path: "/payment",
		route: PaymentRoutes,
	},
];

moduleRoutes.forEach((route) => {
	router.use(route.path, route.route);
});
