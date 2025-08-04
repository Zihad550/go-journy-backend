import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
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

export const UserServices = {
  blockUser,
};
