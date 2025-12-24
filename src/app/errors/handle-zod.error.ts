import type { ZodError } from "zod";
import type {
	IErrorSource,
	IGenericErrorResponse,
} from "../interfaces/error.interface";

function handleZodError(err: ZodError): IGenericErrorResponse {
	const statusCode = 400;
	const errorSources: IErrorSource[] = err.issues.map((issue) => ({
		path: issue?.path[issue.path.length - 1],
		message: issue.message,
	}));
	return {
		statusCode,
		message: "Zod Validation Error",
		errorSources,
	};
}
export default handleZodError;
