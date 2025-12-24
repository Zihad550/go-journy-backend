import status from "http-status";
import env from "../../env";
import AppError from "../errors/app-error";
import { IsActive, type RoleEnum } from "../modules/user/user-interface";
import User from "../modules/user/user-model";
import catchAsync from "../utils/catch-async";
import { verify_token } from "../utils/jwt";

function auth(...requiredRoles: RoleEnum[]) {
	return catchAsync(async (req, _res, next) => {
		const token = req.headers?.authorization || req.cookies.accessToken;

		// checking if the token is missing
		if (!token)
			throw new AppError(status.UNAUTHORIZED, "You are not authorized!");

		// checking if the given token is valid
		const decoded = verify_token(token, env.JWT_ACCESS_SECRET);

		const { role, id } = decoded;

		if (requiredRoles && !requiredRoles.includes(role))
			throw new AppError(status.UNAUTHORIZED, "You are not authorized!");

		// checking if the user is exist
		const user = await User.findById(id);

		if (!user) throw new AppError(status.NOT_FOUND, "This user is not found !");

		// checking if the user is verified
		if (!user.isVerified)
			throw new AppError(status.BAD_REQUEST, "User is not verified");

		// checking if the user is blocked/deleted
		if (user.isActive !== IsActive.ACTIVE)
			throw new AppError(status.FORBIDDEN, `This user is ${user.isActive} ! !`);

		if (user.isDeleted)
			throw new AppError(status.BAD_REQUEST, "User is deleted");

		req.user = decoded;
		next();
	});
}

export default auth;
