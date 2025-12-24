import env from "../../env";
import type IUser from "../modules/user/user-interface";
import { IsActive, RoleEnum } from "../modules/user/user-interface";
import User from "../modules/user/user-model";

export const seed_driver = async () => {
	try {
		const is_driver_exists = await User.findOne({
			email: env.DRIVER_EMAIL,
		});

		if (is_driver_exists) return;

		const payload: Partial<IUser> = {
			name: "Driver",
			role: RoleEnum.DRIVER,
			email: env.DRIVER_EMAIL,
			password: env.DRIVER_PASSWORD,
			isActive: IsActive.ACTIVE,
			isVerified: true,
			phone: "+2959184",
			address: "System Driver",
			auths: [{ provider: "credentials", providerId: env.DRIVER_EMAIL }],
		};

		await User.create(payload);
	} catch (error) {
		console.log(error);
	}
};
