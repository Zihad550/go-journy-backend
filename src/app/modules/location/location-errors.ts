import { StatusCodes } from "http-status-codes";

export enum LocationErrorType {
	VALIDATION_ERROR = "VALIDATION_ERROR",
	AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
	AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
	LOCATION_SERVICE_ERROR = "LOCATION_SERVICE_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
	RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
	WEBSOCKET_ERROR = "WEBSOCKET_ERROR",
	EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
}

export class LocationError extends Error {
	public readonly type: LocationErrorType;
	public readonly statusCode: StatusCodes;
	public readonly field?: string;
	public readonly details?: any;

	constructor(
		type: LocationErrorType,
		message: string,
		statusCode: StatusCodes = StatusCodes.BAD_REQUEST,
		field?: string,
		details?: any,
	) {
		super(message);
		this.name = "LocationError";
		this.type = type;
		this.statusCode = statusCode;
		this.field = field;
		this.details = details;
	}

	// Validation errors
	static invalidCoordinates(field: string = "coordinates") {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Invalid coordinates provided",
			StatusCodes.BAD_REQUEST,
			field,
			{ minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 },
		);
	}

	static invalidAccuracy() {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Invalid accuracy value",
			StatusCodes.BAD_REQUEST,
			"accuracy",
			{ min: 0 },
		);
	}

	static invalidHeading() {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Invalid heading value",
			StatusCodes.BAD_REQUEST,
			"heading",
			{ min: 0, max: 360 },
		);
	}

	static invalidSpeed() {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Invalid speed value",
			StatusCodes.BAD_REQUEST,
			"speed",
			{ min: 0 },
		);
	}

	// Authentication/Authorization errors
	static driverNotApproved() {
		return new LocationError(
			LocationErrorType.AUTHORIZATION_ERROR,
			"Driver not approved for location updates",
			StatusCodes.FORBIDDEN,
		);
	}

	static accessDenied(resource: string = "resource") {
		return new LocationError(
			LocationErrorType.AUTHORIZATION_ERROR,
			`Access denied to this ${resource}`,
			StatusCodes.FORBIDDEN,
		);
	}

	static driverOnlyAccess() {
		return new LocationError(
			LocationErrorType.AUTHORIZATION_ERROR,
			"Only drivers can perform this action",
			StatusCodes.FORBIDDEN,
		);
	}

	// Resource not found errors
	static rideNotFound(rideId: string) {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Ride not found",
			StatusCodes.NOT_FOUND,
			"rideId",
			{ rideId },
		);
	}

	static driverNotFound(driverId: string) {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Driver not found",
			StatusCodes.NOT_FOUND,
			"driverId",
			{ driverId },
		);
	}

	static routeNotFound(rideId: string) {
		return new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Route not found for this ride",
			StatusCodes.NOT_FOUND,
			"rideId",
			{ rideId },
		);
	}

	// External service errors
	static mapboxError(operation: string, details?: any) {
		return new LocationError(
			LocationErrorType.EXTERNAL_API_ERROR,
			`Mapbox ${operation} failed`,
			StatusCodes.BAD_GATEWAY,
			"externalService",
			{ service: "mapbox", operation, details },
		);
	}

	static geocodingFailed(query: string) {
		return new LocationError(
			LocationErrorType.EXTERNAL_API_ERROR,
			"Geocoding service failed",
			StatusCodes.BAD_GATEWAY,
			"query",
			{ query },
		);
	}

	static reverseGeocodingFailed(lat: number, lng: number) {
		return new LocationError(
			LocationErrorType.EXTERNAL_API_ERROR,
			"Reverse geocoding service failed",
			StatusCodes.BAD_GATEWAY,
			"coordinates",
			{ lat, lng },
		);
	}

	// Database errors
	static databaseError(operation: string, details?: any) {
		return new LocationError(
			LocationErrorType.DATABASE_ERROR,
			`Database ${operation} failed`,
			StatusCodes.INTERNAL_SERVER_ERROR,
			"database",
			{ operation, details },
		);
	}

	// WebSocket errors
	static websocketError(event: string, details?: any) {
		return new LocationError(
			LocationErrorType.WEBSOCKET_ERROR,
			"WebSocket operation failed",
			StatusCodes.INTERNAL_SERVER_ERROR,
			"websocket",
			{ event, details },
		);
	}

	// Rate limiting errors
	static rateLimitExceeded(resource: string) {
		return new LocationError(
			LocationErrorType.RATE_LIMIT_ERROR,
			`Too many ${resource} requests`,
			StatusCodes.TOO_MANY_REQUESTS,
			"rateLimit",
			{ resource },
		);
	}

	// Convert to response format
	toResponse() {
		return {
			success: false,
			statusCode: this.statusCode,
			message: this.message,
			error: {
				type: this.type,
				field: this.field,
				details: this.details,
			},
		};
	}
}

// Error handler middleware for location routes
export function handleLocationError(
	error: any,
	_req: any,
	res: any,
	_next: any,
) {
	if (error instanceof LocationError) {
		return res.status(error.statusCode).json(error.toResponse());
	}

	// Handle other types of errors
	if (error.name === "ValidationError") {
		const locationError = new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Validation failed",
			StatusCodes.BAD_REQUEST,
			Object.keys(error.errors)[0],
			error.errors,
		);
		return res
			.status(locationError.statusCode)
			.json(locationError.toResponse());
	}

	if (error.name === "CastError") {
		const locationError = new LocationError(
			LocationErrorType.VALIDATION_ERROR,
			"Invalid ID format",
			StatusCodes.BAD_REQUEST,
			"id",
			{ value: error.value, expected: "ObjectId" },
		);
		return res
			.status(locationError.statusCode)
			.json(locationError.toResponse());
	}

	// Default error response
	const defaultError = new LocationError(
		LocationErrorType.DATABASE_ERROR,
		"An unexpected error occurred",
		StatusCodes.INTERNAL_SERVER_ERROR,
		undefined,
		{ originalError: error.message },
	);

	return res.status(defaultError.statusCode).json(defaultError.toResponse());
}
