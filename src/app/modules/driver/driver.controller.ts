import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DriverServices } from "./driver.service";

const register = catchAsync(async (req, res) => {
  const data = await DriverServices.register(req.user, req.body);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Driver request sent successfully",
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const data = await DriverServices.updateProfile(req.user, req.body);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Driver information updated successfully",
  });
});

const getDrivers = catchAsync(async (req, res) => {
  const data = await DriverServices.getDrivers();
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Driver retrieved successfully",
  });
});

const manageDriverRegister = catchAsync(async (req, res) => {
  const id = req.params.id;
  const data = await DriverServices.manageDriverRegister(id, req.body);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Driver request updated successfully",
  });
});

const getDriverEarnings = catchAsync(async (req, res) => {
  const data = await DriverServices.getDriverEarnings(req.user);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride info retrieved successfully",
    success: true,
  });
});

export const DriverControllers = {
  register,
  updateProfile,
  getDrivers,
  manageDriverRegister,
  getDriverEarnings,
};
