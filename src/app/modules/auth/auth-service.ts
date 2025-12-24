import * as crypto from "node:crypto";
import status from "http-status";
import * as jwt from "jsonwebtoken";
import env from "../../../env";
import { redisClient } from "../../config/redis-config";
import AppError from "../../errors/app-error";
import type IJwtPayload from "../../interfaces/jwt-interface";
import { generate_token, verify_token } from "../../utils/jwt";
import { sendEmail } from "../../utils/send-email";
import type IUser from "../user/user-interface";
import { IsActive } from "../user/user-interface";
import User from "../user/user-model";

async function login(payload: Pick<IUser, "email" | "password">) {
	const { email, password } = payload;

	const user = await User.findOne({ email });

	if (!user) throw new AppError(status.NOT_FOUND, "User not found");

	if (!user.isVerified)
		throw new AppError(status.UNAUTHORIZED, "User is not verified");
	if (user.isActive !== IsActive.ACTIVE)
		throw new AppError(status.FORBIDDEN, `User is ${user.isActive}`);
	if (user.isDeleted) throw new AppError(status.BAD_REQUEST, "User is deleted");

	const isPasswordMatch = await User.isPasswordMatched(password, user.password);

	if (!isPasswordMatch)
		throw new AppError(status.UNAUTHORIZED, "Invalid password");

	const jwtPayload = {
		id: String(user._id),
		role: user.role,
	};
	const accessToken = generate_token(
		jwtPayload,
		env.JWT_ACCESS_SECRET,
		env.JWT_ACCESS_EXPIRES_IN,
	);

	const refreshToken = generate_token(
		jwtPayload,
		env.JWT_REFRESH_SECRET,
		env.JWT_REFRESH_EXPIRES_IN,
	);

	return { accessToken, refreshToken };
}

async function register(payload: Partial<IUser>) {
	const { email, ...rest } = payload;

	const isUserExist = await User.findOne({ email });

	if (isUserExist?.auths.some((item) => item.provider === "credentials"))
		throw new AppError(status.BAD_REQUEST, "User Already Exist");
	let user;
	if (isUserExist) {
		user = await User.findOneAndUpdate(
			{ _id: isUserExist._id },
			{
				// $set: {
				isVerified: true,
				...rest,
				// },
				$addToSet: { auths: { provider: "credentials", providerId: email } },
			},
			{ new: true },
		);
	} else
		user = await User.create({
			email,
			isVerified: false,
			auths: [{ provider: "credentials", providerId: email }],
			...rest,
		});

	if (!user)
		throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");

	const jwtPayload = {
		id: String(user._id),
		role: user.role,
	};
	const accessToken = generate_token(
		jwtPayload,
		env.JWT_ACCESS_SECRET,
		env.JWT_ACCESS_EXPIRES_IN,
	);

	const refreshToken = generate_token(
		jwtPayload,
		env.JWT_REFRESH_SECRET,
		env.JWT_REFRESH_EXPIRES_IN,
	);

	return {
		accessToken,
		refreshToken,
		isVerified: user.isVerified,
	};
}

async function get_new_access_token(refreshToken: string) {
	const jwtPayload = verify_token(refreshToken, env.JWT_REFRESH_SECRET);

	const userExists = await User.findById(jwtPayload.id);
	if (!userExists) throw new AppError(status.NOT_FOUND, "User not found");
	const accessToken = generate_token(
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
}

async function reset_password(
	decodedToken: IJwtPayload,
	payload: { newPassword: string },
) {
	const isUserExist = await User.findById(decodedToken.id);
	if (!isUserExist) throw new AppError(401, "User does not exist");

	isUserExist.password = payload.newPassword;

	await isUserExist.save();
}

async function change_password(
	oldPassword: string,
	newPassword: string,
	decodedToken: IJwtPayload,
) {
	const user = await User.findById(decodedToken.id);
	if (!user) throw new AppError(status.NOT_FOUND, "User not found");

	if (!user.password) {
		throw new AppError(status.UNAUTHORIZED, "No password set for this user");
	}

	const isOldPasswordMatch = await User.isPasswordMatched(
		oldPassword,
		user.password,
	);

	if (!isOldPasswordMatch)
		throw new AppError(status.UNAUTHORIZED, "Old Password does not match");
	user.password = newPassword;

	await user.save();
}

function generate_otp(length = 6) {
	return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}

async function send_otp(email: string, name: string) {
	const user = await User.findOne({ email });
	if (!user) throw new AppError(404, "User not found");
	if (user.isVerified) throw new AppError(401, "You are already verified");

	const otp = generate_otp();
	const redisKey = `otp:${email}`;

	await redisClient.set(redisKey, otp, {
		EX: 120, // 2 minutes
	});

	await sendEmail({
		to: email,
		subject: "Your OTP Code",
		templateName: "otp",
		templateData: { name, otp },
	});
}

async function verify_otp(email: string, otp: string) {
	const user = await User.findOne({ email });
	if (!user || user.isVerified) throw new AppError(401, "Invalid request");

	const redisKey = `otp:${email}`;
	const savedOtp = await redisClient.get(redisKey);

	if (!savedOtp || savedOtp !== otp) throw new AppError(401, "Invalid OTP");

	await Promise.all([
		User.updateOne({ email }, { isVerified: true }),
		redisClient.del([redisKey]),
	]);
}

async function forgot_password(email: string) {
	const isUserExist = await User.findOne({ email });

	if (!isUserExist)
		throw new AppError(status.BAD_REQUEST, "User does not exist");

	if (isUserExist.isActive === IsActive.BLOCKED)
		throw new AppError(status.BAD_REQUEST, "User is blocked");

	const jwtPayload = {
		id: isUserExist._id,
		role: isUserExist.role,
	};

	const resetToken = jwt.sign(jwtPayload, env.JWT_ACCESS_SECRET, {
		expiresIn: "10m",
	});

	const resetUILink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

	sendEmail({
		to: isUserExist.email,
		subject: "Password Reset",
		templateName: "forgetPassword",
		templateData: {
			name: isUserExist.name,
			resetUILink,
		},
	});
}

async function google_callback(user?: IUser) {
	if (!user) throw new AppError(status.NOT_FOUND, "User not found");
	const refreshToken = generate_token(
		{
			id: String(user._id),
			role: user.role,
		},
		env.JWT_REFRESH_SECRET,
		env.JWT_REFRESH_EXPIRES_IN,
	);
	const accessToken = generate_token(
		{
			id: String(user._id),
			role: user.role,
		},
		env.JWT_ACCESS_SECRET,
		env.JWT_ACCESS_EXPIRES_IN,
	);
	return {
		refreshToken,
		accessToken,
	};
}

export const AuthServices = {
	register,
	get_new_access_token,
	reset_password,
	change_password,
	forgot_password,
	login,
	send_otp,
	verify_otp,
	google_callback,
};
