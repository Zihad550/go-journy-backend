import type { Request, Response } from "express";
import { status } from "http-status";

function notFound(_req: Request, res: Response) {
	res.status(status.NOT_FOUND).json({
		success: false,
		message: "API not found !!",
		error: "",
	});
}

export default notFound;
