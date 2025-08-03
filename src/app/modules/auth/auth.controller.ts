import status from "http-status";
import env from "../../../env";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthServices } from "./auth.service";

const login = catchAsync(async (req, res, next) => {
  const { accessToken, refreshToken } = await AuthServices.login(req.body);

  setAuthCookie(res, { accessToken, refreshToken });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User Logged In Successfully",
    data: {
      accessToken,
    },
  });
});

const register = catchAsync(async (req, res) => {
  const { accessToken, refreshToken } = await AuthServices.register(req.body);

  setAuthCookie(res, { accessToken, refreshToken });

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "User Created Successfully",
    data: { accessToken },
  });
});

const getNewAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(
      status.BAD_REQUEST,
      "No refresh token recieved from cookies",
    );
  }
  const { accessToken } = await AuthServices.getNewAccessToken(
    refreshToken as string,
  );

  setAuthCookie(res, { accessToken });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "New Access Token Retrived Successfully",
    data: {
      accessToken,
    },
  });
});
const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});
const resetPassword = catchAsync(async (req, res) => {
  const decodedToken = req.user as IJwtPayload;

  await AuthServices.resetPassword(req.body, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Password Changed Successfully",
    data: null,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const decodedToken = req.user;

  await AuthServices.changePassword(
    oldPassword,
    newPassword,
    decodedToken as IJwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Password Changed Successfully",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  await AuthServices.forgotPassword(email);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Email Sent Successfully",
    data: null,
  });
});

export const AuthControllers = {
  login,
  register,
  getNewAccessToken,
  logout,
  resetPassword,
  changePassword,
  forgotPassword,
};
