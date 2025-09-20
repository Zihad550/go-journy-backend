import env from "../../env";
import IUser, {
  IsActive,
  RoleEnum,
} from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: env.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) return;

    const payload: Partial<IUser> = {
      name: "Super admin",
      role: RoleEnum.SUPER_ADMIN,
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD,
      isActive: IsActive.ACTIVE,
      isVerified: true,
      phone: "+1234567890",
      address: "System Admin",
      auths: [{ provider: "credentials", providerId: env.SUPER_ADMIN_EMAIL }],
    };

    await User.create(payload);
  } catch (error) {
    console.log(error);
  }
};
