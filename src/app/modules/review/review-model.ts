import { model, Schema } from "mongoose";
import type IReview from "./review-interface";

const reviewSchema = new Schema<IReview>(
	{
		rider: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		driver: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Driver",
		},
		ride: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Ride",
			unique: true, // Ensure one review per ride
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
			validate: {
				validator: (value: number) =>
					Number.isInteger(value) && value >= 1 && value <= 5,
				message: "Rating must be an integer between 1 and 5",
			},
		},
		comment: {
			type: String,
			maxlength: 500,
			trim: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Create compound index to ensure one review per rider-ride combination
reviewSchema.index({ rider: 1, ride: 1 }, { unique: true });

// Create index for efficient driver review queries
reviewSchema.index({ driver: 1 });

const Review = model<IReview>("Review", reviewSchema);
export default Review;
