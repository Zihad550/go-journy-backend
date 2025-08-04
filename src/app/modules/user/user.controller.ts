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

export const UserControllers = {
  blockUser,
};
