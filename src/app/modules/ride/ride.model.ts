import { model, Schema } from "mongoose";
import type IRide from "./ride.interface";
import {
	type IAdminNote,
	type IRideLocation,
	type IStatusHistory,
	RideStatusEnum,
} from "./ride.interface";

const locationSchema = new Schema<IRideLocation>({
	lat: {
		type: String,
		required: true,
	},
	lng: {
		type: String,
		required: true,
	},
});

const adminNoteSchema = new Schema<IAdminNote>({
	note: {
		type: String,
		required: true,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const statusHistorySchema = new Schema<IStatusHistory>({
	status: {
		type: String,
		enum: Object.values(RideStatusEnum),
		required: true,
	},
	changedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	changedAt: {
		type: Date,
		default: Date.now,
	},
	reason: {
		type: String,
	},
});

const rideSchema = new Schema<IRide>(
	{
		driver: {
			type: Schema.Types.ObjectId,
			ref: "Driver",
		},
		rider: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		status: {
			type: String,
			enum: Object.values(RideStatusEnum),
			default: RideStatusEnum.Requested,
		},
		destination: {
			type: locationSchema,
			required: true,
		},
		pickupLocation: {
			type: locationSchema,
			required: true,
		},
		dropoffTime: {
			type: Date,
		},
		pickupTime: {
			type: Date,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		interestedDrivers: [
			{
				type: Schema.Types.ObjectId,
				ref: "Driver",
			},
		],
		review: {
			type: Schema.Types.ObjectId,
			ref: "Review",
		},
		payment: {
			type: Schema.Types.ObjectId,
			ref: "Payment",
		},
		paymentHeld: {
			type: Boolean,
			default: false,
		},
		paymentReleased: {
			type: Boolean,
			default: false,
		},
		adminNotes: [adminNoteSchema],
		statusHistory: [statusHistorySchema],
	},
	{
		timestamps: true,
	},
);

const Ride = model<IRide>("Ride", rideSchema);

export default Ride;
