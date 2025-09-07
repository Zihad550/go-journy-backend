import status from "http-status";
import env from "../../env";
import AppError from "../errors/AppError";
import { AccountStatusEnum, RoleEnum } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../utils/jwt";

const auth = (...requiredRoles: RoleEnum[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers?.authorization || req.cookies.accessToken;

    // checking if the token is missing
    if (!token)
      throw new AppError(status.UNAUTHORIZED, "You are not authorized!");

    // checking if the given token is valid
    const decoded = verifyToken(token, env.JWT_ACCESS_SECRET);

    const { role, id } = decoded;

    if (requiredRoles && !requiredRoles.includes(role))
      throw new AppError(status.UNAUTHORIZED, "You are not authorized!");

    // checking if the user is exist
    const user = await User.findById(id);

    if (!user) throw new AppError(status.NOT_FOUND, "This user is not found !");

    // checking if the user is blocked/deleted
    if (user.accountStatus === AccountStatusEnum.BLOCKED)
      throw new AppError(status.FORBIDDEN, "This user is blocked ! !");

    req.user = decoded;
    next();
  });
};

export default auth;
