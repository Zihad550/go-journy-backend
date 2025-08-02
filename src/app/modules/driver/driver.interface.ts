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
  createdAt: Date;
  updatedAt: Date;
}
