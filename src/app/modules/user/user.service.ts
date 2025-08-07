import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import IDriver, {
  AvailabilityEnum,
  DriverStatusEnum,
} from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import { AccountStatusEnum, RoleEnum } from "./user.interface";
import User from "./user.model";

const blockUser = async (userId: string) => {
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
  const driverPayload = {
    ...payload,
    availability: AvailabilityEnum.OFFLINE,
    driverStatus: DriverStatusEnum.PENDING,
    user: user._id,
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

export const UserServices = {
  blockUser,
  requestToBeDriver,
  updateDriverRequest,
};
