import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DriverServices } from "./driver.service";

const approveRide = catchAsync(async (req, res) => {
  const data = await DriverServices.approveRide(req.user, req.params.id);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Ride approved successfully",
  });
});

export const DriverControllers = {
  approveRide,
};
