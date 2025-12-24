import env from "../../env";
import type IUser from "../modules/user/user.interface";
import { IsActive, RoleEnum } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seed_admin = async () => {
	try {
		const is_admin_exists = await User.findOne({
			email: env.ADMIN_EMAIL,
		});

		if (is_admin_exists) return;

		const payload: Partial<IUser> = {
			name: "Admin",
			role: RoleEnum.ADMIN,
			email: env.ADMIN_EMAIL,
			password: env.ADMIN_PASSWORD,
			isActive: IsActive.ACTIVE,
			isVerified: true,
			phone: "+125189323",
			address: "System Admin",
			auths: [{ provider: "credentials", providerId: env.ADMIN_EMAIL }],
		};

		await User.create(payload);
	} catch (error) {
		console.log(error);
	}
};
