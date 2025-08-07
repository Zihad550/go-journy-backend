import status from "http-status";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import IDriver, {
  AvailabilityEnum,
  DriverStatusEnum,
} from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import { AccountStatusEnum } from "./user.interface";
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

export const UserServices = {
  blockUser,
  requestToBeDriver,
};
