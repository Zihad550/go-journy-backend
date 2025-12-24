import status from "http-status";
import type IJwtPayload from "../../interfaces/jwt-interface";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { IsActive } from "./user-interface";
import { UserServices } from "./user-service";

const blockUser = catchAsync(async (req, res) => {
	const { status: userStatus } = req.query;
	const targetStatus =
		userStatus === "blocked"
			? IsActive.BLOCKED
			: userStatus === "active"
				? IsActive.ACTIVE
				: IsActive.BLOCKED;

	const data = await UserServices.updateUserStatus(req.params.id, targetStatus);
	const action = targetStatus === IsActive.BLOCKED ? "blocked" : "unblocked";

	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: `User ${action} successfully`,
	});
});

const getProfile = catchAsync(async (req, res) => {
	const data = await UserServices.getProfile(req.user as IJwtPayload);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "User data retrieved successfully",
	});
});

const updateProfile = catchAsync(async (req, res) => {
	const data = await UserServices.updateProfile(
		req.user as IJwtPayload,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "User updated successfully",
	});
});

const updateUserById = catchAsync(async (req, res) => {
	const data = await UserServices.updateUserById(
		req.user as IJwtPayload,
		req.params.id,
		req.body,
	);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "User updated successfully",
	});
});

const getUsers = catchAsync(async (req, res) => {
	const data = await UserServices.getUsers(req.query);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "Users retrieved successfully",
	});
});

const deleteUserById = catchAsync(async (req, res) => {
	const data = await UserServices.deleteUserById(req.params.id);
	sendResponse(res, {
		data,
		statusCode: status.OK,
		success: true,
		message: "User deleted successfully",
	});
});

export const UserControllers = {
	blockUser,
	getProfile,
	updateProfile,
	updateUserById,
	getUsers,
	deleteUserById,
};
