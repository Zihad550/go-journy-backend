import env from "../../env";
import type IUser from "../modules/user/user.interface";
import { IsActive, RoleEnum } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seed_super_admin = async () => {
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
			phone: "+892859832",
			address: "System Super admin",
			auths: [{ provider: "credentials", providerId: env.SUPER_ADMIN_EMAIL }],
		};

		await User.create(payload);
	} catch (error) {
		console.log(error);
	}
};
