import jwt, { type SignOptions } from "jsonwebtoken";
import type IJwtPayload from "../interfaces/jwt-interface";

export function generate_token(
	payload: IJwtPayload,
	secret: string,
	expiresIn: string,
) {
	const token = jwt.sign(payload, secret, {
		expiresIn,
	} as SignOptions);

	return token;
}

export function verify_token(token: string, secret: string) {
	const verifiedToken = jwt.verify(token, secret) as IJwtPayload;

	return verifiedToken;
}
