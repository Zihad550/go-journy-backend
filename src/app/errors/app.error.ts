export default class AppError extends Error {
	public statusCode: number;
	constructor(statusCode: number, message: string, stack = "") {
		super(message);
		this.statusCode = statusCode;

		if (stack) this.stack = stack;
		// this.constructor -> makes the stack trace specific, only error that comes fromt he error constructor
		else Error.captureStackTrace(this, this.constructor);
	}
}
