import status from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { useObjectId } from "../../utils/useObjectId";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import { RoleEnum } from "../user/user.interface";
import User from "../user/user.model";
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
  const ride = await Ride.findOne({
    _id: id,
    rider: useObjectId(user.id),
  });
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
  else if (ride.status !== RideStatusEnum.Requested)
    throw new AppError(status.BAD_REQUEST, "Ride cannot be cancelled");

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
  newStatus: RideStatusEnum,
) => {
  const filter = { _id: id };
  const options = { new: true };
  const ride = await Ride.findOne(filter, { _id: 1, status: 1 });
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
  else if (ride.status === RideStatusEnum.Completed)
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot change a completed ride status",
    );

  if (user.role === RoleEnum.DRIVER) {
    // accept
    if (
      newStatus === RideStatusEnum.Accepted &&
      ride.status !== RideStatusEnum.Accepted
    )
      return await Ride.findOneAndUpdate(
        filter,
        { status: newStatus, driver: user.id },
        options,
      );
    // picked up
    if (
      newStatus === RideStatusEnum.PickedUp &&
      ride.status !== RideStatusEnum.PickedUp
    )
      return await Ride.findOneAndUpdate(
        filter,
        { $set: { status: newStatus } },
        options,
      );
    // in transit
    if (
      newStatus === RideStatusEnum.InTransit &&
      ride.status !== RideStatusEnum.InTransit
    )
      return await Ride.findOneAndUpdate(
        filter,
        { $set: { status: newStatus } },
        options,
      );
  } else if (user.role === RoleEnum.RIDER) {
    // completed
    if (newStatus === RideStatusEnum.Completed)
      return await Ride.findOneAndUpdate(
        filter,
        { status: newStatus },
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
  else if (user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN)
    return await Ride.find({}).populate("driver").populate("rider");
};

const getDriverEarnings = async (user: IJwtPayload) => {
  const userExists = await User.findOne({ _id: user.id });
  if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");
  else if (!userExists.driver)
    throw new AppError(status.NOT_FOUND, "User is not driver");

  return await Ride.aggregate([
    {
      $match: {
        driver: useObjectId(userExists.driver as Types.ObjectId),
        status: RideStatusEnum.Completed,
      },
    },
    {
      $project: {
        price: 1,
      },
    },
    {
      $group: {
        _id: null,
        earnings: {
          $sum: "$price",
        },
      },
    },
  ]);
};

export const RideServices = {
  requestRide,
  cancelRide,
  getRideInfo,
  manageRideStatus,
  getRides,
  getDriverEarnings,
};
