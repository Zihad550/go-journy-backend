import { Types } from "mongoose";
import IDriver from "../driver/driver.interface";
import IUser from "../user/user.interface";

export enum RideStatusEnum {
  Accepted = "accepted",
  Pending = "pending",
  Completed = "completed",
  Cancelled = "cancelled",
}

export default interface IRide {
  id: Types.ObjectId;
  driver: Types.ObjectId | IDriver;
  rider: Types.ObjectId | IUser;
  status: RideStatusEnum;
  pickupLocation: string;
  destination: string;
  pickupTime: Date;
  dropoffTime: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
