import { z } from "zod";

export const AnalyticsValidationSchemas = {
	// Query parameters for analytics
	getAnalyticsSchema: z.object({
		query: z
			.object({
				startDate: z.iso.datetime().optional(),
				endDate: z.iso.datetime().optional(),
				period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
			})
			.optional(),
	}),

	// Query parameters for rider analytics
	getRiderAnalyticsSchema: z.object({
		query: z
			.object({
				startDate: z.iso.datetime().optional(),
				endDate: z.iso.datetime().optional(),
				period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
			})
			.optional(),
	}),

	// Query parameters for driver analytics
	getDriverAnalyticsSchema: z.object({
		query: z
			.object({
				startDate: z.iso.datetime().optional(),
				endDate: z.iso.datetime().optional(),
				period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
			})
			.optional(),
	}),

	// Query parameters for admin overview
	getAdminOverviewSchema: z.object({
		query: z.object({}).optional(),
	}),

	// Query parameters for admin drivers
	getAdminDriversSchema: z.object({
		query: z.object({}).optional(),
	}),

	// Query parameters for admin rides
	getAdminRidesSchema: z.object({
		query: z.object({}).optional(),
	}),

	// Query parameters for admin revenue trend
	getAdminRevenueTrendSchema: z.object({
		query: z
			.object({
				period: z.enum(["daily", "weekly", "monthly"]).optional(),
				days: z.number().int().min(1).max(365).optional(),
			})
			.optional(),
	}),
};
