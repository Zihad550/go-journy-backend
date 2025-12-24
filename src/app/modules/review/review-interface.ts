import type { Types } from "mongoose";
import type IDriver from "../driver/driver-interface";
import type IRide from "../ride/ride-interface";
import type IUser from "../user/user-interface";

export default interface IReview {
	id: Types.ObjectId;
	rider: Types.ObjectId | IUser;
	driver: Types.ObjectId | IDriver;
	ride: Types.ObjectId | IRide;
	rating: number; // 1-5 stars
	comment?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IReviewStats {
	averageRating: number;
	totalReviews: number;
	ratingDistribution: {
		5: number;
		4: number;
		3: number;
		2: number;
		1: number;
	};
}
