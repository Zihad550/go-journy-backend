import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RideServices } from "./ride.service";

const requestRide = catchAsync(async (req, res) => {
  const data = await RideServices.requestRide(req.body, req.user);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride requested successfully",
    success: true,
  });
});

const cancelRide = catchAsync(async (req, res) => {
  const data = await RideServices.cancelRide(req.user, req.params.id);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride cancelled successfully",
    success: true,
  });
});

const getRideInfo = catchAsync(async (req, res) => {
  const data = await RideServices.getRideInfo(req.user, req.params.id);

  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride info retrieved successfully",
    success: true,
  });
});

const manageRideStatus = catchAsync(async (req, res) => {
  const data = await RideServices.manageRideStatus(
    req.user,
    req.params.id,
    req.body.status,
  );

  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride status updated successfully",
    success: true,
  });
});

const getRides = catchAsync(async (req, res) => {
  const data = await RideServices.getRides(req.user);

  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride info retrieved successfully",
    success: true,
  });
});

const acceptRide = catchAsync(async (req, res) => {
  const data = await RideServices.acceptRide(req.user, req.params.id);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    success: true,
    message: "Ride approved successfully",
  });
});

export const RideControllers = {
  requestRide,
  cancelRide,
  getRideInfo,
  manageRideStatus,
  getRides,
  acceptRide,
};
