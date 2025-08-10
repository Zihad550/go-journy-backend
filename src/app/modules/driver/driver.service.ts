import status from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { useObjectId } from "../../utils/useObjectId";
import { RideStatusEnum } from "../ride/ride.interface";
import Ride from "../ride/ride.model";
import { RoleEnum } from "../user/user.interface";
import User from "../user/user.model";
import IDriver, {
  AvailabilityEnum,
  DriverStatusEnum,
} from "./driver.interface";
import Driver from "./driver.model";

const register = async (user: IJwtPayload, payload: IDriver) => {
  const isPending = await Driver.findOne({ user: user.id });
  if (isPending)
    throw new AppError(
      status.BAD_REQUEST,
      "You already have a pending request",
    );

  const driverPayload = {
    ...payload,
    availability: AvailabilityEnum.OFFLINE,
    driverStatus: DriverStatusEnum.PENDING,
    user: user.id,
  };
  const driver = await Driver.create(driverPayload);
  if (!driver)
    throw new AppError(status.BAD_REQUEST, "Failed to create driver");
  const updatedUser = await User.findOneAndUpdate(
    { _id: user.id },
    {
      driver: driver._id,
    },
  );
  return updatedUser;
};

const updateProfile = async (
  user: IJwtPayload,
  payload: Pick<IDriver, "vehicle" | "experience">,
) => {
  const doc: Record<string, string | number> = {};
  if (payload.vehicle) {
    Object.entries(payload.vehicle).forEach(([key, value]) => {
      doc[key] = value;
    });
  }
  if (payload.experience) doc["experience"] = payload.experience;
  return await User.findOneAndUpdate(
    { user: useObjectId(user.id) },
    { doc },
    { new: true },
  ).populate("user", "name email accountStatus");
};

const getDrivers = async () => {
  return await Driver.find({}).populate("user");
};

const manageDriverRegister = async (
  id: string,
  payload: Pick<IDriver, "driverStatus">,
) => {
  if (payload.driverStatus === DriverStatusEnum.REJECTED) {
    return await Driver.findOneAndUpdate(
      {
        _id: id,
      },
      {
        driverStatus: DriverStatusEnum.REJECTED,
        availability: AvailabilityEnum.OFFLINE,
      },
      { new: true },
    );
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { _id: id },
    {
      driverStatus: DriverStatusEnum.APPROVED,
      availability: AvailabilityEnum.ONLINE,
    },
    { new: true },
  );

  if (!updatedDriver) throw new AppError(status.NOT_FOUND, "Driver not found!");
  await User.findOneAndUpdate(
    {
      driver: useObjectId(id),
    },
    {
      role: RoleEnum.DRIVER,
    },
  );
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

const deleteDriverById = async (id: string) => {
  return await Driver.findOneAndDelete({ _id: id });
};

export const DriverServices = {
  register,
  updateProfile,
  getDrivers,
  manageDriverRegister,
  getDriverEarnings,
  deleteDriverById,
};
