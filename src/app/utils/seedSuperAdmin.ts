import env from "../../env";
import IUser, {
  AccountStatusEnum,
  RoleEnum,
} from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: env.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) return;

    const payload: IUser = {
      name: "Super admin",
      role: RoleEnum.SUPER_ADMIN,
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD,
      accountStatus: AccountStatusEnum.ACTIVE,
    };

    await User.create(payload);
  } catch (error) {
    console.log(error);
  }
};
