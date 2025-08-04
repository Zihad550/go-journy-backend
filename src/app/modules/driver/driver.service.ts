import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { useObjectId } from "../../utils/useObjectId";
import { RideStatusEnum } from "../ride/ride.interface";
import Ride from "../ride/ride.model";
import IUser, { AccountStatusEnum } from "../user/user.interface";
import { AvailabilityEnum, DriverStatusEnum } from "./driver.interface";
import Driver from "./driver.model";

const approveRide = async (user: IJwtPayload, id: string) => {
  const alreadyOnRide = await Ride.findOne(
    { filterrider: useObjectId(user.id) },
    { _id: 1 },
  );
  if (alreadyOnRide)
    throw new AppError(status.BAD_REQUEST, "Cannot accept more ride!");
  const ride = await Ride.findOne({ _id: id });
  const driver = await Driver.findOne(
    {
      user: user.id,
      driverStatus: DriverStatusEnum.APPROVED,
      availability: AvailabilityEnum.ONLINE,
    },
    { driverStatus: 1 },
  ).populate("user", "accountStatus");
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
  if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found!");

  if ((driver.user as IUser).accountStatus !== AccountStatusEnum.ACTIVE)
    throw new AppError(status.BAD_REQUEST, "Driver is not available");
  if (ride.status !== RideStatusEnum.Requested)
    throw new AppError(status.BAD_REQUEST, "Ride cannot be accepted");

  return await Ride.findOneAndUpdate(
    { _id: id },
    { $set: { status: RideStatusEnum.Accepted, driver: user.id } },
    { new: true },
  );
};

export const DriverServices = {
  approveRide,
};
