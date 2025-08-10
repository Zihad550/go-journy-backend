import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import IUser, { AccountStatusEnum, RoleEnum } from "./user.interface";
import User from "./user.model";

const blockUser = async (userId: string) => {
  const isExists = await User.findOne({ _id: userId });
  if (!isExists) throw new AppError(status.NOT_FOUND, "User not found");
  else if (isExists.role === RoleEnum.SUPER_ADMIN)
    throw new AppError(status.FORBIDDEN, "Super admin cannot be blocked");

  const blockedUser = await User.findOneAndUpdate(
    { _id: userId },
    { accountStatus: AccountStatusEnum.BLOCKED },
  );
  if (blockedUser?.driver) {
    await Driver.findOneAndUpdate(
      { _id: blockedUser.driver },
      {
        driverStatus: DriverStatusEnum.REJECTED,
        availability: AvailabilityEnum.OFFLINE,
      },
    );
  }
};

const getProfile = async (user: IJwtPayload) => {
  const retrievedUser = await User.findById(user.id).populate("driver");
  if (!retrievedUser) throw new AppError(status.NOT_FOUND, "User not found!");
  return retrievedUser;
};

const updateProfile = async (user: IJwtPayload, payload: IUser) => {
  return await User.findOneAndUpdate({ _id: user.id }, payload, { new: true });
};

const updateUserById = async (
  user: IJwtPayload,
  id: string,
  payload: IUser,
) => {
  const userExists = await User.findOne({ _id: id });

  if (!userExists) throw new AppError(status.NOT_FOUND, "User not found!");

  if (user.role === RoleEnum.ADMIN && userExists.role === RoleEnum.SUPER_ADMIN)
    throw new AppError(status.FORBIDDEN, "Forbidden");

  return await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
};

const getUsers = async (query: Record<string, unknown>) => {
  const filter: any = {};
  if ("role" in query) filter.role = query.role;
  return await User.find(filter).populate("driver");
};

const deleteUserById = async (id: string) => {
  const userExists = await User.findOne({ _id: id });

  if (!userExists) throw new AppError(status.NOT_FOUND, "User not found!");

  if (userExists.role === RoleEnum.SUPER_ADMIN)
    throw new AppError(status.FORBIDDEN, "Super admin cannot be deleted");

  const deletedUser = await User.findOneAndDelete({ _id: id });
  if (deletedUser?.driver) {
    await Driver.findOneAndDelete({ _id: deletedUser.driver });
  }
  return deletedUser;
};

export const UserServices = {
  blockUser,
  getProfile,
  updateUserById,
  updateProfile,
  getUsers,
  deleteUserById,
};
