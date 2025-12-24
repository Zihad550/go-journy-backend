import { model, Schema } from "mongoose";
import type {
	IDriverLocation,
	ILocation,
	ILocationHistory,
	IRoute,
} from "./location-interface";

// Enhanced location schema with geospatial support
const locationSchema = new Schema<ILocation>({
	lat: {
		type: Number,
		required: true,
		min: -90,
		max: 90,
	},
	lng: {
		type: Number,
		required: true,
		min: -180,
		max: 180,
	},
	accuracy: {
		type: Number,
		min: 0,
	},
	heading: {
		type: Number,
		min: 0,
		max: 360,
	},
	speed: {
		type: Number,
		min: 0,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	address: {
		type: String,
	},
	geohash: {
		type: String,
	},
});

// Add geospatial index for location queries
locationSchema.index({ lat: 1, lng: 1 });
locationSchema.index({ geohash: 1 });

// Location history schema for tracking ride progress
const locationHistorySchema = new Schema<ILocationHistory>(
	{
		rideId: {
			type: Schema.Types.ObjectId,
			ref: "Ride",
			required: true,
		},
		driverId: {
			type: Schema.Types.ObjectId,
			ref: "Driver",
			required: true,
		},
		location: {
			type: locationSchema,
			required: true,
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	},
);

// Compound indexes for efficient queries
locationHistorySchema.index({ rideId: 1, createdAt: -1 });
locationHistorySchema.index({ driverId: 1, createdAt: -1 });

// Auto-expire location history after 24 hours
locationHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Route data schema for storing calculated routes
const routeSchema = new Schema<IRoute>(
	{
		rideId: {
			type: Schema.Types.ObjectId,
			ref: "Ride",
			required: true,
			unique: true,
		},
		geometry: {
			type: {
				type: String,
				enum: ["LineString"],
				default: "LineString",
			},
			coordinates: [[Number]], // GeoJSON LineString coordinates
		},
		duration: {
			type: Number,
			required: true,
		},
		distance: {
			type: Number,
			required: true,
		},
		instructions: [
			{
				text: {
					type: String,
					required: true,
				},
				distance: {
					type: Number,
					required: true,
				},
				duration: {
					type: Number,
					required: true,
				},
				type: {
					type: String,
					enum: ["turn", "straight", "arrive"],
					required: true,
				},
			},
		],
		waypoints: [locationSchema],
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Geospatial index for route geometry
routeSchema.index({ geometry: "2dsphere" });

// Driver location schema for current driver positions
const driverLocationSchema = new Schema<IDriverLocation>(
	{
		driverId: {
			type: Schema.Types.ObjectId,
			ref: "Driver",
			required: true,
		},
		location: {
			type: locationSchema,
			required: true,
		},
		isOnline: {
			type: Boolean,
			default: true,
		},
		rideId: {
			type: Schema.Types.ObjectId,
			ref: "Ride",
		},
	},
	{
		timestamps: { createdAt: false, updatedAt: true },
		versionKey: false,
	},
);

// Indexes for real-time queries
driverLocationSchema.index({ driverId: 1 }, { unique: true });
driverLocationSchema.index({ isOnline: 1, lastUpdated: -1 });
driverLocationSchema.index({ location: "2dsphere" });

// Virtual for lastUpdated field
driverLocationSchema.virtual("lastUpdated").get(function (this: any) {
	return this.updatedAt;
});

// Ensure virtual fields are serialized
driverLocationSchema.set("toJSON", { virtuals: true });
driverLocationSchema.set("toObject", { virtuals: true });

// Models
export const LocationHistory = model<ILocationHistory>(
	"LocationHistory",
	locationHistorySchema,
);
export const Route = model<IRoute>("Route", routeSchema);
export const DriverLocation = model<IDriverLocation>(
	"DriverLocation",
	driverLocationSchema,
);

// Export schemas for reuse
export { locationSchema };
