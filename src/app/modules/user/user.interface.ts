import type { Model, Types } from "mongoose";
import type IDriver from "../driver/driver.interface";

export enum RoleEnum {
	SUPER_ADMIN = "SUPER_ADMIN",
	ADMIN = "ADMIN",
	DRIVER = "DRIVER",
	RIDER = "RIDER",
}

export enum IsActive {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
	provider: "google" | "credentials";
	providerId: string;
}

export default interface IUser {
	_id?: Types.ObjectId;
	name: string;
	email: string;
	password: string;
	phone: string;
	picture?: string;
	address: string;
	isDeleted?: boolean;
	isActive?: IsActive;
	isVerified?: boolean;
	role: RoleEnum;
	auths: IAuthProvider[];
	bookings?: Types.ObjectId[];
	guides?: Types.ObjectId[];
	driver?: Types.ObjectId | IDriver;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IUserModelType extends Model<IUser> {
	isPasswordMatched(
		plainTextPassword: string,
		hashedPassword: string | undefined,
	): Promise<boolean>;
}
