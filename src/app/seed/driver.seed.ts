import status from "http-status";
import env from "../../env";
import AppError from "../errors/app.error";
import {
	AvailabilityEnum,
	DriverStatusEnum,
} from "../modules/driver/driver.interface";
import Driver from "../modules/driver/driver.model";
import type IUser from "../modules/user/user.interface";
import { IsActive, RoleEnum } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

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

		const user = await User.create(payload);

		const vehicle = {
			name: "Toyota",
			model: "Camry",
		};

		const driverPayload = {
			availability: AvailabilityEnum.OFFLINE,
			driverStatus: DriverStatusEnum.PENDING,
			user: user.id,
			vehicle,
			experience: 3,
		};

		const driver = await Driver.create(driverPayload);
		if (!driver)
			throw new AppError(status.BAD_REQUEST, "Failed to create driver");

		await User.findOneAndUpdate(
			{ _id: user.id },
			{
				driver: driver._id,
			},
		);
	} catch (error) {
		console.log(error);
	}
};
