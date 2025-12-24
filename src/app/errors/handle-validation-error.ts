import type mongoose from "mongoose";
import type {
	IErrorSource,
	IGenericErrorResponse,
} from "../interfaces/error-interface";

const handleValidationError = (
	error: mongoose.Error.ValidationError,
): IGenericErrorResponse => {
	const errorSources: IErrorSource[] = Object.values(error.errors).map(
		(val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
			path: val?.path,
			message: val?.message,
		}),
	);
	const statusCode = 400;
	return {
		statusCode,
		message: "Validation Error",
		errorSources,
	};
};

export default handleValidationError;
