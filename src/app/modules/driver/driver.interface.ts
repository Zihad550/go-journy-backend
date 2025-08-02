import { Types } from "mongoose";
import IUser from "../user/user.interface";

export enum AvailabilityEnum {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}
export enum DriverStatusEnum {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
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
