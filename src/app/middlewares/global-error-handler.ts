import type { ErrorRequestHandler } from "express";
import status from "http-status";
import { JsonWebTokenError } from "jsonwebtoken";
import { ZodError } from "zod";
import env from "../../env";
import AppError from "../errors/app.error";
import handleCastError from "../errors/handle-cast.error";
import handleDuplicateError from "../errors/handle-duplicate.error";
import handleValidationError from "../errors/handle-validation.error";
import handleZodError from "../errors/handle-zod.error";
import type { IErrorSource } from "../interfaces/error.interface";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = async (
	err,
	_req,
	res,
	_next,
) => {
	if (env.NODE_ENV === "development") console.log(err);

	// setting default values
	let statusCode = 500;
	let message = "Something went wrong!";

	let errorSources: IErrorSource[] = [
		{
			path: "",
			message: "Something went wrong!",
		},
	];

	if (err instanceof ZodError) {
		const similifiedError = handleZodError(err);
		statusCode = similifiedError.statusCode;
		message = similifiedError.message;
		errorSources = similifiedError.errorSources;
	} else if (err?.name === "ValidationError") {
		const simplifiedError = handleValidationError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorSources = simplifiedError.errorSources;
	} else if (err?.name === "CastError") {
		const simplifiedError = handleCastError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorSources = simplifiedError.errorSources;
	} else if (err?.code === 11000) {
		const simplifiedError = handleDuplicateError(err);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorSources = simplifiedError.errorSources;
	} else if (err instanceof JsonWebTokenError) {
		statusCode = status.UNAUTHORIZED;
		message = err.message;
		errorSources = [
			{
				path: "",
				message: err.message,
			},
		];
	} else if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errorSources = [
			{
				path: "",
				message: err.message,
			},
		];
	} else if (err instanceof Error) {
		message = err.message;
		errorSources = [
			{
				path: "",
				message: err.message,
			},
		];
	}

	res.status(statusCode).json({
		success: false,
		message,
		errorSources,
		stack: env.NODE_ENV === "development" ? err?.stack : null,
		err: env.NODE_ENV === "development" ? err : null,
	});
};

export default globalErrorHandler;
