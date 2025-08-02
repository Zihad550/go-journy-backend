import { Types } from "mongoose";
import IDriver from "../driver/driver.interface";
import IUser from "../user/user.interface";

export enum RideStatusEnum {
  Requested = "requested",
  Accepted = "accepted",
  PickedUp = "picked_up",
  InTransit = "in_transit",
  Completed = "completed",
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
  isCancelled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
