import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { useObjectId } from "../../utils/useObjectId";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import { RoleEnum } from "../user/user.interface";
import IRide, { RideStatusEnum } from "./ride.interface";
import Ride from "./ride.model";

const requestRide = async (payload: Partial<IRide>, user: IJwtPayload) => {
  const drivers = await Driver.find({
    driverStatus: DriverStatusEnum.APPROVED,
    availability: AvailabilityEnum.ONLINE,
  });
  if (!drivers) throw new AppError(status.NOT_FOUND, "No drivers available");

  const isAlreadyOnRide = await Ride.find({
    rider: useObjectId(user.id),
    status: {
      $in: [
        RideStatusEnum.Requested,
        RideStatusEnum.Accepted,
        RideStatusEnum.InTransit,
        RideStatusEnum.PickedUp,
      ],
    },
  });

  if (isAlreadyOnRide.length > 0)
    throw new AppError(status.BAD_REQUEST, "User is already on a ride");

  const doc = {
    ...payload,
    rider: user.id,
    status: RideStatusEnum.Requested,
  };

  return await Ride.create(doc);
};

const cancelRide = async (user: IJwtPayload, id: string) => {
  const ride = await Ride.findOne({ _id: id, rider: useObjectId(user.id) });
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
  if (ride.status === RideStatusEnum.Cancelled)
    throw new AppError(status.BAD_REQUEST, "Ride already cancelled!");

  const date = new Date(new Date(ride.createdAt).getTime() - 30 * 60 * 1000);
  if (date < new Date())
    throw new AppError(status.BAD_REQUEST, "Ride cannot be cancelled");

  if (ride?.driver)
    throw new AppError(status.BAD_REQUEST, "Ride cannot be cancelled");

  return await Ride.findOneAndUpdate(
    { _id: id },
    { $set: { status: RideStatusEnum.Cancelled } },
    { new: true },
  );
};

const getRideInfo = async (user: IJwtPayload, id: string) => {
  return await Ride.findOne({ _id: id, rider: useObjectId(user.id) })
    .populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email",
      },
      select: "user vehicle experience",
    })
    .populate("rider", "name email");
};

const manageRideStatus = async (
  user: IJwtPayload,
  id: string,
  rideStatus: RideStatusEnum,
) => {
  const filter = { _id: id };
  const options = { new: true };
  const ride = await Ride.findOne(filter, { _id: 1, status: 1 });
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");

  if (user.role === RoleEnum.DRIVER) {
    // accept
    if (
      rideStatus === RideStatusEnum.Accepted &&
      ride.status !== RideStatusEnum.Accepted
    )
      return await Ride.findOneAndUpdate(
        filter,
        { status: rideStatus, driver: user.id },
        options,
      );
    // picked up
    if (
      rideStatus === RideStatusEnum.PickedUp &&
      ride.status !== RideStatusEnum.PickedUp
    )
      return await Ride.findOneAndUpdate(
        filter,
        { $set: { status: rideStatus } },
        options,
      );
    // in transit
    if (
      rideStatus === RideStatusEnum.InTransit &&
      ride.status !== RideStatusEnum.InTransit
    )
      return await Ride.findOneAndUpdate(
        filter,
        { $set: { status: rideStatus } },
        options,
      );
  } else if (user.role === RoleEnum.RIDER) {
    // completed
    if (
      rideStatus === RideStatusEnum.Completed &&
      ride.status !== RideStatusEnum.Completed
    )
      return await Ride.findOneAndUpdate(
        filter,
        { status: rideStatus },
        options,
      );
  }
  throw new AppError(status.FORBIDDEN, "Forbidden");
};

const getRides = async (user: IJwtPayload) => {
  if (user.role === RoleEnum.DRIVER)
    return await Ride.find({
      $or: [
        {
          driver: user.id,
        },
        {
          status: RideStatusEnum.Requested,
        },
      ],
    });
  else if (user.role === RoleEnum.RIDER)
    return await Ride.find({ rider: user.id });
  else if (user.role === RoleEnum.ADMIN)
    return await Ride.find({}).populate("driver").populate("rider");
};

export const RideServices = {
  requestRide,
  cancelRide,
  getRideInfo,
  manageRideStatus,
  getRides,
};
