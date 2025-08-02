import { model, Schema } from "mongoose";
import IDriver, {
  AvailabilityEnum,
  DriverStatusEnum,
  IVehicle,
} from "./driver.interface";

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
      default: AvailabilityEnum.ONLINE,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Driver = model<IDriver>("Driver", driverSchema);
export default Driver;
