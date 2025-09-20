import { Types } from 'mongoose';
import IDriver from '../driver/driver.interface';
import IRide from '../ride/ride.interface';
import IUser from '../user/user.interface';

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
