import status from "http-status";
import IJwtPayload from "../../interfaces/jwt.interface";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminRideServices } from "./admin-ride.service";

const getOverview = catchAsync(async (req, res) => {
  const data = await AdminRideServices.getOverview(req.query);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Rides overview retrieved successfully",
    success: true,
  });
});

const overrideStatus = catchAsync(async (req, res) => {
  const { status: newStatus, reason } = req.body;
  const data = await AdminRideServices.overrideStatus(
    req.params.id,
    newStatus,
    reason,
    req.user as IJwtPayload,
  );
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride status updated successfully",
    success: true,
  });
});

const assignDriver = catchAsync(async (req, res) => {
  const { driverId, reason } = req.body;
  const data = await AdminRideServices.assignDriver(
    req.params.id,
    driverId,
    reason,
    req.user as IJwtPayload,
  );
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Driver assigned successfully",
    success: true,
  });
});

const getActiveRides = catchAsync(async (req, res) => {
  const data = await AdminRideServices.getActiveRides();
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Active rides retrieved successfully",
    success: true,
  });
});

const getIssues = catchAsync(async (req, res) => {
  const data = await AdminRideServices.getIssues(req.query);
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride issues retrieved successfully",
    success: true,
  });
});

const addNote = catchAsync(async (req, res) => {
  const { note } = req.body;
  const data = await AdminRideServices.addNote(
    req.params.id,
    note,
    req.user as IJwtPayload,
  );
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Admin note added successfully",
    success: true,
  });
});

const getDriverHistory = catchAsync(async (req, res) => {
  const data = await AdminRideServices.getDriverHistory(
    req.params.driverId,
    req.query,
  );
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Driver ride history retrieved successfully",
    success: true,
  });
});

const forceDelete = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const data = await AdminRideServices.forceDelete(
    req.params.id,
    reason,
    req.user as IJwtPayload,
  );
  sendResponse(res, {
    data,
    statusCode: status.OK,
    message: "Ride permanently deleted",
    success: true,
  });
});

export const AdminRideControllers = {
  getOverview,
  overrideStatus,
  assignDriver,
  getActiveRides,
  getIssues,
  addNote,
  getDriverHistory,
  forceDelete,
};
