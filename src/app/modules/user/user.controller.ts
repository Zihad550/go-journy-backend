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

const requestToBeDriver = catchAsync(async (req, res) => {
  const data = await UserServices.requestToBeDriver(req.user, req.body);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Driver request sent successfully",
  });
});

const updateDriverRequest = catchAsync(async (req, res) => {
  const data = await UserServices.updateDriverRequest(req.body);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Driver request updated successfully",
  });
});

const getMe = catchAsync(async (req, res) => {
  const data = await UserServices.getMe(req.user);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "User data retrieved successfully",
  });
});

export const UserControllers = {
  blockUser,
  requestToBeDriver,
  updateDriverRequest,
  getMe,
};
