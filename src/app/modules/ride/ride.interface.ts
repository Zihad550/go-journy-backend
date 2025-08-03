import { Types } from "mongoose";
import IDriver from "../driver/driver.interface";
import IUser from "../user/user.interface";

export enum RideStatusEnum {
  Requested = "requested",
  Cancelled = "cancelled", // cancelled
  Accepted = "accepted",
  PickedUp = "picked_up",
  InTransit = "in_transit",
  Completed = "completed",
}

export default interface IRide {
  id: Types.ObjectId;
  driver?: Types.ObjectId | IDriver;
  rider: Types.ObjectId | IUser;
  status: RideStatusEnum;
  pickupLocation: IRideLocation;
  destination: IRideLocation;
  pickupTime: Date;
  dropoffTime: Date;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRideLocation {
  lat: string;
  lng: string;
}
