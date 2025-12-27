import env from "../../env";
import type IUser from "../modules/user/user.interface";
import { IsActive, RoleEnum } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seed_rider = async () => {
	try {
		const is_rider_exists = await User.findOne({
			email: env.RIDER_EMAIL,
		});

		if (is_rider_exists) return;

		const payload: Partial<IUser> = {
			name: "Super admin",
			role: RoleEnum.RIDER,
			email: env.RIDER_EMAIL,
			password: env.RIDER_PASSWORD,
			isActive: IsActive.ACTIVE,
			isVerified: true,
			phone: "+9285138923",
			address: "System rider",
			auths: [{ provider: "credentials", providerId: env.RIDER_EMAIL }],
		};

		await User.create(payload);
	} catch (error) {
		if (env.NODE_ENV === "development")
			console.log("failed to seed rider", error);
	}
};
