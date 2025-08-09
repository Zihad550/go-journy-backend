import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import IDriver, {
  AvailabilityEnum,
  DriverStatusEnum,
} from "../driver/driver.interface";
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

const requestToBeDriver = async (user: IJwtPayload, payload: IDriver) => {
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

const updateDriverRequest = async (
  payload: Pick<IDriver, "driverStatus" | "_id">,
) => {
  if (payload.driverStatus === DriverStatusEnum.REJECTED) {
    return await Driver.findOneAndUpdate(
      {
        _id: payload._id,
      },
      {
        driverStatus: DriverStatusEnum.REJECTED,
        availability: AvailabilityEnum.OFFLINE,
      },
      { new: true },
    );
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { _id: payload._id },
    {
      driverStatus: DriverStatusEnum.APPROVED,
      availability: AvailabilityEnum.ONLINE,
    },
    { new: true },
  );

  if (!updatedDriver) throw new AppError(status.NOT_FOUND, "Driver not found!");
  await User.findOneAndUpdate(
    {
      driver: updatedDriver._id,
    },
    {
      role: RoleEnum.DRIVER,
    },
  );
};

const getMe = async (user: IJwtPayload) => {
  const retrievedUser = await User.findById(user.id).populate("driver");
  if (!retrievedUser) throw new AppError(status.NOT_FOUND, "User not found!");
  return retrievedUser;
};

const updateMe = async (user: IJwtPayload, payload: IUser) => {
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

export const UserServices = {
  blockUser,
  requestToBeDriver,
  updateDriverRequest,
  getMe,
  updateUserById,
  updateMe,
  getUsers,
};
