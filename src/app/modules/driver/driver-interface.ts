import type { Types } from "mongoose";
import type IUser from "../user/user-interface";

export enum AvailabilityEnum {
	ONLINE = "online",
	OFFLINE = "offline",
}
export enum DriverStatusEnum {
	APPROVED = "approved",
	PENDING = "pending",
	REJECTED = "rejected",
}

export default interface IDriver {
	_id: Types.ObjectId;
	user: Types.ObjectId | IUser;
	availability: AvailabilityEnum;
	driverStatus: DriverStatusEnum;
	vehicle: IVehicle;
	experience: number; // in year
	createdAt: Date;
	updatedAt: Date;
}

export interface IVehicle {
	name: string;
	model: string;
	// seatCount: number;
}
