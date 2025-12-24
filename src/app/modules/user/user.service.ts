import status from "http-status";
import AppError from "../../errors/app.error";
import type IJwtPayload from "../../interfaces/jwt.interface";
import { use_object_id } from "../../utils/use-object-id";
import { AvailabilityEnum, DriverStatusEnum } from "../driver/driver.interface";
import Driver from "../driver/driver.model";
import type IUser from "./user.interface";
import { IsActive, RoleEnum } from "./user.interface";
import User from "./user.model";

async function update_user_status(userId: string, userStatus: IsActive) {
	const isExists = await User.findOne({ _id: use_object_id(userId) });
	if (!isExists) throw new AppError(status.NOT_FOUND, "User not found");
	else if (isExists.role === RoleEnum.SUPER_ADMIN)
		throw new AppError(
			status.FORBIDDEN,
			"Super admin status cannot be changed",
		);

	const updatedUser = await User.findOneAndUpdate(
		{ _id: use_object_id(userId) },
		{ isActive: userStatus },
		{ new: true },
	);

	// Handle driver status based on user status
	if (updatedUser?.driver) {
		if (userStatus === IsActive.BLOCKED) {
			// Block user: set driver to rejected and offline
			await Driver.findOneAndUpdate(
				{ _id: updatedUser.driver },
				{
					driverStatus: DriverStatusEnum.REJECTED,
					availability: AvailabilityEnum.OFFLINE,
				},
			);
		} else if (userStatus === IsActive.ACTIVE) {
			// Unblock user: set driver to approved and online (if they were previously approved)
			const driver = await Driver.findById(updatedUser.driver);
			if (driver && driver.driverStatus === DriverStatusEnum.APPROVED) {
				await Driver.findOneAndUpdate(
					{ _id: updatedUser.driver },
					{ availability: AvailabilityEnum.ONLINE },
				);
			}
		}
	}

	return updatedUser;
}

// Keep the old method for backward compatibility
async function block_user(userId: string) {
	return await update_user_status(userId, IsActive.BLOCKED);
}

async function get_profile(user: IJwtPayload) {
	const retrievedUser = await User.findById(user.id).populate("driver");
	if (!retrievedUser) throw new AppError(status.NOT_FOUND, "User not found!");
	return retrievedUser;
}

async function update_profile(user: IJwtPayload, payload: IUser) {
	return await User.findOneAndUpdate({ _id: use_object_id(user.id) }, payload, {
		new: true,
	});
}

async function update_user_by_id(
	user: IJwtPayload,
	id: string,
	payload: IUser,
) {
	const userExists = await User.findOne({ _id: use_object_id(id) });

	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found!");

	if (user.role === RoleEnum.ADMIN && userExists.role === RoleEnum.SUPER_ADMIN)
		throw new AppError(status.FORBIDDEN, "Forbidden");

	return await User.findOneAndUpdate({ _id: use_object_id(id) }, payload, {
		new: true,
	});
}

async function get_users(query: Record<string, unknown>) {
	const filter: any = {};
	if ("role" in query) filter.role = query.role;
	return await User.find(filter).populate("driver");
}

async function delete_user_by_id(id: string) {
	const userExists = await User.findOne({ _id: use_object_id(id) });

	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found!");

	if (userExists.role === RoleEnum.SUPER_ADMIN)
		throw new AppError(status.FORBIDDEN, "Super admin cannot be deleted");

	const deletedUser = await User.findOneAndDelete({ _id: use_object_id(id) });
	if (deletedUser?.driver) {
		await Driver.findOneAndDelete({ _id: deletedUser.driver });
	}
	return deletedUser;
}

export const UserServices = {
	block_user,
	update_user_status,
	get_profile,
	update_user_by_id,
	update_profile,
	get_users,
	delete_user_by_id,
};
