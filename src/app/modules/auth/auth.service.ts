import status from "http-status";
import jwt from "jsonwebtoken";
import env from "../../../env";
import AppError from "../../errors/AppError";
import IJwtPayload from "../../interfaces/jwt.interface";
import { generateToken, verifyToken } from "../../utils/jwt";
import { sendEmail } from "../../utils/sendEmail";
import IUser, { AccountStatusEnum } from "../user/user.interface";
import User from "../user/user.model";

const login = async (payload: Pick<IUser, "email" | "password">) => {
  const { email, password } = payload;

  const user = await User.findOne({ email });

  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  const isPasswordMatch = await User.isPasswordMatched(password, user.password);

  if (!isPasswordMatch)
    throw new AppError(status.UNAUTHORIZED, "Invalid password");

  const jwtPayload = {
    id: String(user._id),
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    jwtPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  return { accessToken, refreshToken };
};

const register = async (payload: Partial<IUser>) => {
  const { email, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) throw new AppError(status.BAD_REQUEST, "User Already Exist");

  const user = await User.create({
    email,
    ...rest,
  });

  const jwtPayload = {
    id: String(user._id),
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    jwtPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const jwtPayload = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);

  const userExists = await User.findById(jwtPayload.id);
  if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");
  const accessToken = generateToken(
    {
      role: userExists.role,
      id: String(userExists._id),
    },
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  return {
    accessToken,
  };
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: IJwtPayload,
) => {
  if (payload.id != decodedToken.id)
    throw new AppError(401, "You can not reset your password");

  const isUserExist = await User.findById(decodedToken.userId);
  if (!isUserExist) throw new AppError(401, "User does not exist");

  isUserExist.password = payload.newPassword;

  await isUserExist.save();
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: IJwtPayload,
) => {
  const user = await User.findById(decodedToken.id);
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  const isOldPasswordMatch = await User.isPasswordMatched(
    oldPassword,
    user.password as string,
  );

  if (!isOldPasswordMatch)
    throw new AppError(status.UNAUTHORIZED, "Old Password does not match");
  user.password = newPassword;

  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist)
    throw new AppError(status.BAD_REQUEST, "User does not exist");

  if (isUserExist.accountStatus === AccountStatusEnum.BLOCKED)
    throw new AppError(status.BAD_REQUEST, "User is blocked");

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${env.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};

export const AuthServices = {
  register,
  getNewAccessToken,
  resetPassword,
  changePassword,
  forgotPassword,
  login,
};
