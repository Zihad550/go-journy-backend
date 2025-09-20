import status from "http-status";
import AppError from "../../errors/AppError";
import { useObjectId } from "../../utils/useObjectId";
import IJwtPayload from "../../interfaces/jwt.interface";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import IUser, { IsActive, RoleEnum } from "./user.interface";
import User from "./user.model";

const updateUserStatus = async (userId: string, userStatus: IsActive) => {
  const isExists = await User.findOne({ _id: useObjectId(userId) });
  if (!isExists) throw new AppError(status.NOT_FOUND, "User not found");
  else if (isExists.role === RoleEnum.SUPER_ADMIN)
    throw new AppError(status.FORBIDDEN, "Super admin status cannot be changed");

  const updatedUser = await User.findOneAndUpdate(
    { _id: useObjectId(userId) },
    { isActive: userStatus },
    { new: true }
  );

  // Handle driver status based on user status
  if (updatedUser?.driver) {
    if (userStatus === IsActive.BLOCKED) {
      // Block user: set driver to rejected and offline
      await Driver.findOneAndUpdate(
        { _id: updatedUser.driver },
        {
          driverStatus: DriverStatusEnum.REJECTED,
          availability: AvailabilityEnum.OFFLINE,
        },
      );
    } else if (userStatus === IsActive.ACTIVE) {
      // Unblock user: set driver to approved and online (if they were previously approved)
      const driver = await Driver.findById(updatedUser.driver);
      if (driver && driver.driverStatus === DriverStatusEnum.APPROVED) {
        await Driver.findOneAndUpdate(
          { _id: updatedUser.driver },
          { availability: AvailabilityEnum.ONLINE },
        );
      }
    }
  }

  return updatedUser;
};

// Keep the old method for backward compatibility
const blockUser = async (userId: string) => {
  return await updateUserStatus(userId, IsActive.BLOCKED);
};

const getProfile = async (user: IJwtPayload) => {
  const retrievedUser = await User.findById(user.id).populate("driver");
  if (!retrievedUser) throw new AppError(status.NOT_FOUND, "User not found!");
  return retrievedUser;
};

const updateProfile = async (user: IJwtPayload, payload: IUser) => {
  return await User.findOneAndUpdate({ _id: useObjectId(user.id) }, payload, { new: true });
};

const updateUserById = async (
  user: IJwtPayload,
  id: string,
  payload: IUser,
) => {
  const userExists = await User.findOne({ _id: useObjectId(id) });

  if (!userExists) throw new AppError(status.NOT_FOUND, "User not found!");

  if (user.role === RoleEnum.ADMIN && userExists.role === RoleEnum.SUPER_ADMIN)
    throw new AppError(status.FORBIDDEN, "Forbidden");

  return await User.findOneAndUpdate({ _id: useObjectId(id) }, payload, {
    new: true,
  });
};

const getUsers = async (query: Record<string, unknown>) => {
  const filter: any = {};
  if ("role" in query) filter.role = query.role;
  return await User.find(filter).populate("driver");
};

const deleteUserById = async (id: string) => {
  const userExists = await User.findOne({ _id: useObjectId(id) });

  if (!userExists) throw new AppError(status.NOT_FOUND, "User not found!");

  if (userExists.role === RoleEnum.SUPER_ADMIN)
    throw new AppError(status.FORBIDDEN, "Super admin cannot be deleted");

  const deletedUser = await User.findOneAndDelete({ _id: useObjectId(id) });
  if (deletedUser?.driver) {
    await Driver.findOneAndDelete({ _id: deletedUser.driver });
  }
  return deletedUser;
};

export const UserServices = {
  blockUser,
  updateUserStatus,
  getProfile,
  updateUserById,
  updateProfile,
  getUsers,
  deleteUserById,
};
