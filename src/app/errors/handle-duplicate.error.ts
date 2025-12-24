import type {
	IErrorSource,
	IGenericErrorResponse,
} from "../interfaces/error.interface";

function handleDuplicateError(err: any): IGenericErrorResponse {
	const match = err?.message.match(/"([^"]*)"/);
	const extractedMsg = match?.[1];
	const errorSources: IErrorSource[] = [
		{
			path: "",
			message: `${extractedMsg} is already exists`,
		},
	];
	const statusCode = 400;

	return {
		statusCode,
		errorSources,
		message: "Duplicate entry found",
	};
}

export default handleDuplicateError;
