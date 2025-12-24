import type { Types } from "mongoose";
import type IDriver from "../driver/driver-interface";
import type IReview from "../review/review-interface";
import type IUser from "../user/user-interface";

export enum RideStatusEnum {
	Requested = "requested",
	Cancelled = "cancelled", // cancelled
	Accepted = "accepted",
	InTransit = "in_transit",
	Completed = "completed",
}

export interface IAdminNote {
	note: string;
	createdBy: Types.ObjectId | IUser;
	createdAt: Date;
}

export interface IStatusHistory {
	status: RideStatusEnum;
	changedBy: Types.ObjectId | IUser;
	changedAt: Date;
	reason?: string;
}

export default interface IRide {
	id: Types.ObjectId;
	driver: Types.ObjectId | IDriver;
	rider: Types.ObjectId | IUser;
	status: RideStatusEnum;
	pickupLocation: IRideLocation;
	destination: IRideLocation;
	pickupTime: Date;
	dropoffTime: Date;
	price: number;
	interestedDrivers: Types.ObjectId[];
	review?: Types.ObjectId | IReview;
	payment?: Types.ObjectId;
	paymentHeld?: boolean;
	paymentReleased?: boolean;
	adminNotes?: IAdminNote[];
	statusHistory?: IStatusHistory[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IRideLocation {
	lat: string;
	lng: string;
}
