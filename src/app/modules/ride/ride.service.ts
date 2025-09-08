import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { useObjectId } from "../../utils/useObjectId";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import IUser, { AccountStatusEnum, RoleEnum } from "../user/user.interface";
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

  // const date = new Date(new Date(ride.createdAt).getTime() - 30 * 60 * 1000);
  // if (date < new Date())
  //   throw new AppError(status.BAD_REQUEST, 'Ride cannot be cancelled');

  if (ride?.driver)
    throw new AppError(status.BAD_REQUEST, "Ride cannot be cancelled");

  return await Ride.findOneAndUpdate(
    { _id: id },
    { $set: { status: RideStatusEnum.Cancelled } },
    { new: true },
  );
};

const getRideInfo = async (user: IJwtPayload, id: string) => {
  if (user.role === RoleEnum.RIDER)
    return await Ride.findOne({ _id: id, rider: useObjectId(user.id) })
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "name email",
        },
        select: "user vehicle experience",
      })
      .populate({
        path: "interestedDrivers",
        populate: {
          path: "user",
          select: "name email",
        },
        select: "user vehicle experience",
      })
      .populate("rider", "name email");
  else if (user.role === RoleEnum.DRIVER)
    return await Ride.findOne({ _id: id, driver: useObjectId(user.id) })
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
  else if (ride.status === RideStatusEnum.Requested)
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot change a requested ride status",
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
    // in transit
    else if (
      newStatus === RideStatusEnum.InTransit &&
      ride.status === RideStatusEnum.Accepted
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
    }).populate("rider", "name email");
  else if (user.role === RoleEnum.RIDER)
    return await Ride.find({ rider: user.id })
      .populate({
        path: "interestedDrivers",
        populate: {
          path: "user",
          select: "name email",
        },
        select: "user vehicle experience",
      })
      .populate({
        path: "driver",
        populate: {
          path: "user",
          select: "name email",
        },
        select: "user vehicle experience",
      });
  else if (user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN)
    return await Ride.find({})
      .populate("driver")
      .populate("rider")
      .populate({
        path: "interestedDrivers",
        populate: {
          path: "user",
          select: "name email",
        },
        select: "user vehicle experience",
      });
};

const showInterest = async (user: IJwtPayload, id: string) => {
  const driver = await Driver.findOne(
    {
      user: user.id,
      driverStatus: DriverStatusEnum.APPROVED,
      availability: AvailabilityEnum.ONLINE,
    },
    { driverStatus: 1 },
  ).populate("user", "accountStatus");

  if (!driver) throw new AppError(status.NOT_FOUND, "Driver not found!");
  if ((driver.user as IUser).accountStatus !== AccountStatusEnum.ACTIVE)
    throw new AppError(status.BAD_REQUEST, "Driver is not available");

  const ride = await Ride.findOne({ _id: id });
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
  if (ride.status !== RideStatusEnum.Requested)
    throw new AppError(status.BAD_REQUEST, "Cannot show interest in this ride");

  // Check if driver already showed interest
  if (ride.interestedDrivers.includes(useObjectId(user.id)))
    throw new AppError(
      status.BAD_REQUEST,
      "Already showed interest in this ride",
    );

  // Check if driver is already on another ride
  const alreadyOnRide = await Ride.findOne({
    driver: useObjectId(user.id),
    status: {
      $in: [RideStatusEnum.Accepted, RideStatusEnum.InTransit],
    },
  });
  if (alreadyOnRide)
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot show interest, already on a ride!",
    );

  return await Ride.findOneAndUpdate(
    { _id: id },
    { $addToSet: { interestedDrivers: user.id } },
    { new: true },
  );
};

const acceptDriver = async (
  user: IJwtPayload,
  rideId: string,
  driverId: string,
) => {
  const ride = await Ride.findOne({
    _id: rideId,
    rider: useObjectId(user.id),
  });

  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");
  if (ride.status !== RideStatusEnum.Requested)
    throw new AppError(status.BAD_REQUEST, "Ride cannot be accepted");

  // Check if the driver showed interest
  if (!ride.interestedDrivers.includes(useObjectId(driverId)))
    throw new AppError(
      status.BAD_REQUEST,
      "Driver did not show interest in this ride",
    );

  const driver = await Driver.findOne({
    user: driverId,
    driverStatus: DriverStatusEnum.APPROVED,
    availability: AvailabilityEnum.ONLINE,
  }).populate("user", "accountStatus");

  if (!driver)
    throw new AppError(status.NOT_FOUND, "Driver not found or not available!");
  if ((driver.user as IUser).accountStatus !== AccountStatusEnum.ACTIVE)
    throw new AppError(status.BAD_REQUEST, "Driver is not available");

  // Check if driver is already on another ride
  const alreadyOnRide = await Ride.findOne({
    driver: useObjectId(driverId),
    status: {
      $in: [RideStatusEnum.Accepted, RideStatusEnum.InTransit],
    },
  });
  if (alreadyOnRide)
    throw new AppError(
      status.BAD_REQUEST,
      "Driver is already on another ride!",
    );

  // Accept the driver and update ride status
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: rideId },
    {
      $set: {
        status: RideStatusEnum.Accepted,
        driver: driverId,
        pickupTime: new Date(),
      },
    },
    { new: true },
  );

  // Remove the driver from all other rides they showed interest in
  await Ride.updateMany(
    {
      _id: { $ne: rideId },
      interestedDrivers: useObjectId(driverId),
    },
    {
      $pull: { interestedDrivers: useObjectId(driverId) },
    },
  );

  return updatedRide;
};

const deleteRideById = async (id: string) => {
  const ride = await Ride.findById(id);
  if (!ride) throw new AppError(status.NOT_FOUND, "Ride not found!");

  await ride.deleteOne();
};

export const RideServices = {
  requestRide,
  cancelRide,
  getRideInfo,
  manageRideStatus,
  getRides,
  showInterest,
  acceptDriver,
  deleteRideById,
};
