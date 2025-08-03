import { model, Schema } from "mongoose";
import IRide, { IRideLocation, RideStatusEnum } from "./ride.interface";

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

const rideSchema = new Schema<IRide>({
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
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Ride = model<IRide>("Ride", rideSchema);
export default Ride;
