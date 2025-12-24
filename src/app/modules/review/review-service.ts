import status from "http-status";
import AppError from "../../errors/app-error";
import type IJwtPayload from "../../interfaces/jwt-interface";
import { useObjectId } from "../../utils/use-object-id";
import Driver from "../driver/driver-model";
import { RideStatusEnum } from "../ride/ride-interface";
import Ride from "../ride/ride-model";
import { RoleEnum } from "../user/user-interface";
import type IReview from "./review-interface";
import type { IReviewStats } from "./review-interface";
import Review from "./review-model";

async function createReview(payload: Partial<IReview>, user: IJwtPayload) {
	// Verify the ride exists and belongs to the rider
	const ride = await Ride.findOne({
		_id: payload.ride,
		rider: useObjectId(user.id),
	}).populate("driver");

	if (!ride) {
		throw new AppError(
			status.NOT_FOUND,
			"Ride not found or does not belong to you",
		);
	}

	// Verify the ride is completed
	if (ride.status !== RideStatusEnum.Completed) {
		throw new AppError(status.BAD_REQUEST, "Can only review completed rides");
	}

	// Verify the ride has a driver assigned
	if (!ride.driver) {
		throw new AppError(
			status.BAD_REQUEST,
			"Cannot review a ride without an assigned driver",
		);
	}

	// Check if review already exists for this ride
	if (ride.review) {
		throw new AppError(
			status.BAD_REQUEST,
			"Review already exists for this ride",
		);
	}

	// Create the review
	const reviewData = {
		...payload,
		rider: user.id,
		driver: (ride.driver as any)._id,
	};

	const review = await Review.create(reviewData);

	// Set the review reference in the ride
	await Ride.findByIdAndUpdate(payload.ride, { review: review._id });

	return await Review.findById(review._id)
		.populate("rider", "name email")
		.populate("driver", "user vehicle")
		.populate({
			path: "driver",
			populate: {
				path: "user",
				select: "name email",
			},
		})
		.populate("ride");
}

async function getReviewById(reviewId: string, user: IJwtPayload) {
	const review = await Review.findById(reviewId)
		.populate("rider", "name email")
		.populate("driver", "user vehicle")
		.populate({
			path: "driver",
			populate: {
				path: "user",
				select: "name email",
			},
		})
		.populate("ride");

	if (!review) {
		throw new AppError(status.NOT_FOUND, "Review not found");
	}

	// Check if user has permission to view this review
	const isRider = (review.rider as any)._id.toString() === user.id;
	const isDriver = (review.driver as any).user._id.toString() === user.id;
	const isAdmin =
		user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN;

	if (!isRider && !isDriver && !isAdmin) {
		throw new AppError(
			status.FORBIDDEN,
			"You do not have permission to view this review",
		);
	}

	return review;
}

async function updateReview(
	reviewId: string,
	payload: Partial<IReview>,
	user: IJwtPayload,
) {
	// Only riders can update their own reviews
	if (user.role !== RoleEnum.RIDER) {
		throw new AppError(status.FORBIDDEN, "Only riders can update reviews");
	}

	const review = await Review.findOne({
		_id: reviewId,
		rider: useObjectId(user.id),
	});

	if (!review) {
		throw new AppError(
			status.NOT_FOUND,
			"Review not found or does not belong to you",
		);
	}

	const updatedReview = await Review.findByIdAndUpdate(reviewId, payload, {
		new: true,
	})
		.populate("rider", "name email")
		.populate("driver", "user vehicle")
		.populate({
			path: "driver",
			populate: {
				path: "user",
				select: "name email",
			},
		})
		.populate("ride");

	return updatedReview;
}

async function getDriverReviews(driverId: string, page = 1, limit = 10) {
	// Verify driver exists
	const driver = await Driver.findById(driverId);
	if (!driver) {
		throw new AppError(status.NOT_FOUND, "Driver not found");
	}

	const skip = (page - 1) * limit;

	// Get reviews with pagination
	const reviews = await Review.find({ driver: driverId })
		.populate("rider", "name email")
		.populate("ride", "createdAt pickupLocation destination")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	// Get total count for pagination
	const total = await Review.countDocuments({ driver: driverId });
	const totalPages = Math.ceil(total / limit);

	return {
		reviews,
		pagination: {
			page,
			limit,
			total,
			totalPage: totalPages,
		},
	};
}

async function getDriverReviewStats(driverId: string): Promise<IReviewStats> {
	// Verify driver exists
	const driver = await Driver.findById(driverId);
	if (!driver) {
		throw new AppError(status.NOT_FOUND, "Driver not found");
	}

	const stats = await Review.aggregate([
		{ $match: { driver: useObjectId(driverId) } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalReviews: { $sum: 1 },
				ratings: { $push: "$rating" },
			},
		},
	]);

	if (stats.length === 0) {
		return {
			averageRating: 0,
			totalReviews: 0,
			ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
		};
	}

	const { averageRating, totalReviews, ratings } = stats[0];

	// Calculate rating distribution
	const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
	ratings.forEach((rating: number) => {
		ratingDistribution[rating as keyof typeof ratingDistribution]++;
	});

	return {
		averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
		totalReviews,
		ratingDistribution,
	};
}

async function getRiderReviews(user: IJwtPayload, page = 1, limit = 10) {
	const skip = (page - 1) * limit;

	const reviews = await Review.find({ rider: useObjectId(user.id) })
		.populate("driver", "user vehicle")
		.populate({
			path: "driver",
			populate: {
				path: "user",
				select: "name email",
			},
		})
		.populate("ride", "createdAt pickupLocation destination")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

	const total = await Review.countDocuments({ rider: useObjectId(user.id) });
	const totalPages = Math.ceil(total / limit);

	return {
		reviews,
		pagination: {
			page,
			limit,
			total,
			totalPage: totalPages,
		},
	};
}

async function deleteReview(reviewId: string, user: IJwtPayload) {
	// Only riders can delete their own reviews, or admins can delete any review
	const isAdmin =
		user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN;

	const filter: any = { _id: reviewId };
	if (!isAdmin) {
		if (user.role !== RoleEnum.RIDER) {
			throw new AppError(
				status.FORBIDDEN,
				"Only riders can delete their reviews",
			);
		}
		filter.rider = useObjectId(user.id);
	}

	const review = await Review.findOne(filter);
	if (!review) {
		throw new AppError(
			status.NOT_FOUND,
			"Review not found or does not belong to you",
		);
	}

	await Review.findByIdAndDelete(reviewId);
	return review;
}

async function getFeaturedReviews() {
	// Get the most recent 10 five-star reviews for homepage display
	const featuredReviews = await Review.find({ rating: 5 })
		.populate("rider", "name")
		.populate("driver", "user vehicle")
		.populate({
			path: "driver",
			populate: {
				path: "user",
				select: "name",
			},
		})
		.sort({ createdAt: -1 })
		.limit(10)
		.select("rating comment createdAt");

	return featuredReviews;
}

export const ReviewServices = {
	createReview,
	getReviewById,
	updateReview,
	getDriverReviews,
	getDriverReviewStats,
	getRiderReviews,
	deleteReview,
	getFeaturedReviews,
};
