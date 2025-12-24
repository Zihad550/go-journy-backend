import { model, Schema } from "mongoose";
import type IDriver from "./driver-interface";
import {
	AvailabilityEnum,
	DriverStatusEnum,
	type IVehicle,
} from "./driver-interface";

const vehicleSchema = new Schema<IVehicle>({
	model: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
});

const driverSchema = new Schema<IDriver>(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		availability: {
			type: String,
			enum: Object.values(AvailabilityEnum),
			default: AvailabilityEnum.OFFLINE,
		},
		driverStatus: {
			type: String,
			enum: Object.values(DriverStatusEnum),
			default: DriverStatusEnum.PENDING,
		},
		vehicle: {
			type: vehicleSchema,
			required: true,
		},
		experience: {
			type: Number,
			min: 0,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

const Driver = model<IDriver>("Driver", driverSchema);
export default Driver;
