import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const blockUser = catchAsync(async (req, res) => {
  const data = await UserServices.blockUser(req.params.id);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "User blocked successfully",
  });
});

const getProfile = catchAsync(async (req, res) => {
  const data = await UserServices.getProfile(req.user);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "User data retrieved successfully",
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const data = await UserServices.updateProfile(req.user, req.body);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "User updated successfully",
  });
});

const updateUserById = catchAsync(async (req, res) => {
  const data = await UserServices.updateUserById(
    req.user,
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
