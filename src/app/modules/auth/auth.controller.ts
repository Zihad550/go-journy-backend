import status from "http-status";
import passport from "passport";
import env from "../../../env";
import AppError from "../../errors/app.error";
import type IJwtPayload from "../../interfaces/jwt.interface";
import catchAsync from "../../utils/catch-async";
import { generate_token } from "../../utils/jwt";
import sendResponse from "../../utils/send-response";
import { set_auth_cookie } from "../../utils/set-cookie";
import type IUser from "../user/user.interface";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req, res, next) => {
	passport.authenticate("local", async (err: any, user: any, info: any) => {
		if (err) return next(new AppError(status.BAD_REQUEST, err));

		if (!user) return next(new AppError(status.NOT_FOUND, info.message));

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

		// delete user.toObject().password

		set_auth_cookie(res, { accessToken, refreshToken });

		sendResponse(res, {
			success: true,
			statusCode: status.OK,
			message: "User Logged In Successfully",
			data: {
				accessToken,
			},
		});
	})(req, res, next);
});

const register = catchAsync(async (req, res) => {
	const { accessToken, refreshToken, isVerified } = await AuthServices.register(
		req.body,
	);

	set_auth_cookie(res, { accessToken, refreshToken });

	sendResponse(res, {
		success: true,
		statusCode: status.CREATED,
		message: "User Created Successfully",
		data: { accessToken, isVerified },
	});
});

const get_new_access_token = catchAsync(async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) {
		throw new AppError(
			status.BAD_REQUEST,
			"No refresh token recieved from cookies",
		);
	}
	const { accessToken } = await AuthServices.get_new_access_token(
		refreshToken as string,
	);

	set_auth_cookie(res, { accessToken });

	sendResponse(res, {
		success: true,
		statusCode: status.OK,
		message: "New Access Token Retrived Successfully",
		data: {
			accessToken,
		},
	});
});
const logout = catchAsync(async (_req, res) => {
	res.clearCookie("accessToken", {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});
	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	});

	sendResponse(res, {
		success: true,
		statusCode: status.OK,
		message: "User Logged Out Successfully",
		data: null,
	});
});
const reset_password = catchAsync(async (req, res) => {
	const decodedToken = req.user as IJwtPayload;

	await AuthServices.reset_password(decodedToken, req.body);

	sendResponse(res, {
		success: true,
		statusCode: status.OK,
		message: "Password Changed Successfully",
		data: null,
	});
});

const change_password = catchAsync(async (req, res) => {
	const newPassword = req.body.newPassword;
	const oldPassword = req.body.oldPassword;
	const decodedToken = req.user;

	await AuthServices.change_password(
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

const forgot_password = catchAsync(async (req, res) => {
	const { email } = req.body;

	await AuthServices.forgot_password(email);

	sendResponse(res, {
		success: true,
		statusCode: status.OK,
		message: "Email Sent Successfully",
		data: null,
	});
});

const google_callback_controller = catchAsync(async (req, res) => {
	let redirectTo = req.query.state ? (req.query.state as string) : "";

	if (redirectTo.startsWith("/")) redirectTo = redirectTo.slice(1);

	const user = req.user;

	const data = await AuthServices.google_callback(user as unknown as IUser);

	set_auth_cookie(res, data);

	res.redirect(`${env.FRONTEND_URL}/${redirectTo}`);
});

const send_otp = catchAsync(async (req, res) => {
	const { email, name } = req.body;

	await AuthServices.send_otp(email, name);

	sendResponse(res, {
		success: true,
		statusCode: status.OK,
		message: "OTP sent successfully",
		data: null,
	});
});

const verify_otp = catchAsync(async (req, res) => {
	const { email, otp } = req.body;

	await AuthServices.verify_otp(email, otp);

	sendResponse(res, {
		success: true,
		statusCode: status.OK,
		message: "OTP verified successfully",
		data: null,
	});
});

export const AuthControllers = {
	credentialsLogin,
	register,
	get_new_access_token,
	logout,
	reset_password,
	change_password,
	forgot_password,
	google_callback_controller,
	send_otp,
	verify_otp,
};
