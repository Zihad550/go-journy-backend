import jwt, { type SignOptions } from "jsonwebtoken";
import type IJwtPayload from "../interfaces/jwt-interface";

export function generateToken(
	payload: IJwtPayload,
	secret: string,
	expiresIn: string,
) {
	const token = jwt.sign(payload, secret, {
		expiresIn,
	} as SignOptions);

	return token;
}

export function verifyToken(token: string, secret: string) {
	const verifiedToken = jwt.verify(token, secret) as IJwtPayload;

	return verifiedToken;
}
