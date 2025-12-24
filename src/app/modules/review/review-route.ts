import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validate-request";
import { RoleEnum } from "../user/user-interface";
import { ReviewControllers } from "./review-controller";
import { ReviewValidations } from "./review-validation";

const router = Router();

// Get featured 5-star reviews for homepage (Public access)
router.get("/featured", ReviewControllers.getFeaturedReviews);

// Get reviews created by the authenticated rider
router.get(
	"/my-reviews",
	auth(RoleEnum.RIDER),
	validateRequest(ReviewValidations.getDriverReviewsValidationSchema),
	ReviewControllers.getRiderReviews,
);

// Get review statistics for a specific driver (Public access)
router.get("/driver/:driverId/stats", ReviewControllers.getDriverReviewStats);

// Get all reviews for a specific driver (Public access)
router.get(
	"/driver/:driverId",
	validateRequest(ReviewValidations.getDriverReviewsValidationSchema),
	ReviewControllers.getDriverReviews,
);

// Create a review (Riders only)
router.post(
	"/",
	auth(RoleEnum.RIDER),
	validateRequest(ReviewValidations.createReviewValidationSchema),
	ReviewControllers.createReview,
);

// Get a specific review by ID (Authenticated users)
router.get(
	"/:id",
	auth(RoleEnum.RIDER, RoleEnum.DRIVER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	ReviewControllers.getReviewById,
);

// Update a review (Riders only - their own reviews)
router.patch(
	"/:id",
	auth(RoleEnum.RIDER),
	validateRequest(ReviewValidations.updateReviewValidationSchema),
	ReviewControllers.updateReview,
);

// Delete a review (Riders for their own reviews, Admins for any review)
router.delete(
	"/:id",
	auth(RoleEnum.RIDER, RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
	ReviewControllers.deleteReview,
);

export const ReviewRoutes = router;
