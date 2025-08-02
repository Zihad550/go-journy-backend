import { model, Schema } from "mongoose";
import IRide, { RideStatusEnum } from "./ride.interface";

const rideSchema = new Schema<IRide>({
  driver: {
    type: Schema.Types.ObjectId,
    required: true,
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
    default: RideStatusEnum.Pending,
  },
  destination: {
    type: String,
    required: true,
  },
  pickupLocation: {
    type: String,
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
