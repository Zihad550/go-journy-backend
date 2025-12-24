import { z } from "zod";
import { RideStatusEnum } from "./ride.interface";

const objectIdSchema = z
	.string()
	.regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const AdminRideValidationSchemas = {
	// Query parameters for rides overview with filtering
	getOverviewSchema: z.object({
		query: z
			.object({
				status: z.enum(RideStatusEnum).optional(),
				driverId: objectIdSchema.optional(),
				riderId: objectIdSchema.optional(),
				startDate: z.iso.datetime().optional(),
				endDate: z.iso.datetime().optional(),
				page: z.string().regex(/^\d+$/).transform(Number).optional(),
				limit: z.string().regex(/^\d+$/).transform(Number).optional(),
				sortBy: z
					.enum(["createdAt", "updatedAt", "status", "price"])
					.optional(),
				sortOrder: z.enum(["asc", "desc"]).optional(),
			})
			.optional(),
	}),

	// Admin status override with reason
	overrideStatusSchema: z.object({
		body: z.object({
			status: z.enum(RideStatusEnum),
			reason: z
				.string()
				.min(1, "Reason is required")
				.max(500, "Reason too long"),
		}),
		params: z.object({
			id: objectIdSchema,
		}),
	}),

	// Manually assign driver to ride
	assignDriverSchema: z.object({
		body: z.object({
			driverId: objectIdSchema,
			reason: z
				.string()
				.min(1, "Reason is required")
				.max(500, "Reason too long"),
		}),
		params: z.object({
			id: objectIdSchema,
		}),
	}),

	// Add internal admin note
	addNoteSchema: z.object({
		body: z.object({
			note: z.string().min(1, "Note is required").max(1000, "Note too long"),
		}),
		params: z.object({
			id: objectIdSchema,
		}),
	}),

	// Get rides with issues (filtering)
	getIssuesSchema: z.object({
		query: z
			.object({
				issueType: z
					.enum(["cancelled", "long_duration", "no_driver", "disputed"])
					.optional(),
				page: z.string().regex(/^\d+$/).transform(Number).optional(),
				limit: z.string().regex(/^\d+$/).transform(Number).optional(),
			})
			.optional(),
	}),

	// Get driver ride history
	getDriverHistorySchema: z.object({
		params: z.object({
			driverId: objectIdSchema,
		}),
		query: z
			.object({
				page: z.string().regex(/^\d+$/).transform(Number).optional(),
				limit: z.string().regex(/^\d+$/).transform(Number).optional(),
				status: z.enum(RideStatusEnum).optional(),
			})
			.optional(),
	}),

	// Force delete ride (admin only)
	forceDeleteSchema: z.object({
		params: z.object({
			id: z.string(),
		}),
		body: z.object({
			reason: z
				.string()
				.min(1, "Deletion reason is required")
				.max(500, "Reason too long"),
		}),
	}),

	// Basic param validation for single ride operations
	rideParamSchema: z.object({
		params: z.object({
			id: objectIdSchema,
		}),
	}),
};
