import axios from "axios";
import type IJwtPayload from "../../interfaces/jwt-interface";
import { use_object_id } from "../../utils/use-object-id";
import Driver from "../driver/driver-model";
import Ride from "../ride/ride-model";
import { RoleEnum } from "../user/user-interface";
import { LocationError } from "./location-errors";
import type {
	IETACalculationRequest,
	IGeocodingResult,
	ILocation,
	ILocationUpdateRequest,
	IReverseGeocodingResult,
	IRouteCalculationRequest,
} from "./location-interface";
import { DriverLocation, LocationHistory, Route } from "./location-model";
import SocketService from "./socket-service";

// Environment variables for Mapbox
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_DIRECTIONS_API_URL =
	process.env.MAPBOX_DIRECTIONS_API_URL ||
	"https://api.mapbox.com/directions/v5";
const MAPBOX_GEOCODING_API_URL =
	process.env.MAPBOX_GEOCODING_API_URL || "https://api.mapbox.com/geocoding/v5";

async function updateDriverLocation(
	user: IJwtPayload,
	locationData: ILocationUpdateRequest,
) {
	// Verify user is a driver
	if (user.role !== RoleEnum.DRIVER) {
		throw LocationError.driverOnlyAccess();
	}

	// Find driver
	const driver = await Driver.findOne({
		user: user.id,
		driverStatus: "approved",
	});

	if (!driver) {
		throw LocationError.driverNotApproved();
	}

	// Create location object
	const location: ILocation = {
		lat: locationData.lat,
		lng: locationData.lng,
		accuracy: locationData.accuracy,
		heading: locationData.heading,
		speed: locationData.speed,
		timestamp: new Date(),
	};

	// Update or create driver location
	const driverLocation = await DriverLocation.findOneAndUpdate(
		{ driverId: driver._id },
		{
			location,
			isOnline: true,
			rideId: undefined, // Will be set if driver has active ride
		},
		{ upsert: true, new: true },
	);

	// If driver has an active ride, store location in history
	const activeRide = await Ride.findOne({
		driver: driver._id,
		status: { $in: ["accepted", "in_transit"] },
	});

	if (activeRide) {
		await LocationHistory.create({
			rideId: activeRide._id,
			driverId: driver._id,
			location,
		});

		// Update driver location with ride ID
		driverLocation.rideId = activeRide._id;
		await driverLocation.save();

		// Broadcast location update via WebSocket
		try {
			const socketService = SocketService.getInstance();
			socketService.broadcastDriverLocation(
				activeRide._id.toString(),
				driver._id.toString(),
				location,
			);
		} catch (error) {
			// WebSocket broadcasting failed, but don't fail the location update
			console.error("WebSocket broadcast failed:", error);
		}
	}

	return {
		driverId: driver._id,
		location,
		broadcasted: true,
	};
}

async function getDriverLocation(
	user: IJwtPayload,
	driverId: string,
	rideId?: string,
) {
	const driverObjectId = use_object_id(driverId);

	// Authorization checks
	if (user.role === RoleEnum.DRIVER && user.id !== driverId) {
		throw LocationError.accessDenied("driver location");
	}

	if (user.role === RoleEnum.RIDER) {
		// Check if user is rider of the specified ride
		if (rideId) {
			const ride = await Ride.findOne({
				_id: use_object_id(rideId),
				rider: user.id,
				driver: driverObjectId,
			});
			if (!ride) {
				throw LocationError.accessDenied("driver location");
			}
		} else {
			throw LocationError.invalidCoordinates("rideId");
		}
	}

	const driverLocation = await DriverLocation.findOne({
		driverId: driverObjectId,
	});

	if (!driverLocation) {
		throw LocationError.driverNotFound(driverId);
	}

	return {
		driverId: driverLocation.driverId,
		location: driverLocation.location,
		isOnline: driverLocation.isOnline,
		lastUpdated: driverLocation.lastUpdated,
	};
}

async function getRideLocationHistory(
	user: IJwtPayload,
	rideId: string,
	startTime?: Date,
	endTime?: Date,
	limit: number = 100,
) {
	const rideObjectId = use_object_id(rideId);

	// Authorization checks
	const ride = await Ride.findOne({ _id: rideObjectId });

	if (!ride) {
		throw LocationError.rideNotFound(rideId);
	}

	if (user.role === RoleEnum.RIDER && ride.rider.toString() !== user.id) {
		throw LocationError.accessDenied("ride history");
	}

	if (user.role === RoleEnum.DRIVER && ride.driver?.toString() !== user.id) {
		throw LocationError.accessDenied("ride history");
	}

	// Build query
	const query: any = { rideId: rideObjectId };

	if (startTime) query.createdAt = { $gte: startTime };
	if (endTime) {
		query.createdAt = query.createdAt || {};
		query.createdAt.$lte = endTime;
	}

	const locations = await LocationHistory.find(query)
		.sort({ createdAt: -1 })
		.limit(limit)
		.populate("driverId", "user")
		.populate("driverId.user", "name");

	const total = await LocationHistory.countDocuments(query);

	return {
		rideId: ride._id,
		driverId: ride.driver,
		locations: locations.map((loc) => ({
			lat: loc.location.lat,
			lng: loc.location.lng,
			timestamp: loc.location.timestamp,
			speed: loc.location.speed,
			heading: loc.location.heading,
		})),
		total,
		timeRange: {
			start: startTime || new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
			end: endTime || new Date(),
		},
	};
}

async function calculateRoute(
	user: IJwtPayload,
	rideId: string,
	options: IRouteCalculationRequest = {},
) {
	const rideObjectId = use_object_id(rideId);

	// Authorization checks
	const ride = await Ride.findOne({ _id: rideObjectId });

	if (!ride) {
		throw LocationError.rideNotFound(rideId);
	}

	if (user.role === RoleEnum.RIDER && ride.rider.toString() !== user.id) {
		throw LocationError.accessDenied("ride");
	}

	if (user.role === RoleEnum.DRIVER && ride.driver?.toString() !== user.id) {
		throw LocationError.accessDenied("ride");
	}

	// Get coordinates
	const pickup = ride.pickupLocation;
	const destination = ride.destination;

	// Call Mapbox Directions API
	const profile = options.profile || "driving-traffic";
	const url = `${MAPBOX_DIRECTIONS_API_URL}/mapbox/${profile}/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}`;

	const params = {
		access_token: MAPBOX_ACCESS_TOKEN,
		alternatives: options.alternatives || false,
		steps: options.steps || true,
		geometries: "geojson",
		overview: "full",
	};

	try {
		const response = await axios.get(url, { params });

		if (response.data.code !== "Ok") {
			throw LocationError.mapboxError("route calculation");
		}

		const routeData = response.data.routes[0];

		// Store route in database
		const routeDoc = {
			rideId: ride._id,
			geometry: routeData.geometry,
			duration: routeData.duration,
			distance: routeData.distance,
			instructions: routeData.legs[0].steps.map((step: any) => ({
				text: step.maneuver.instruction,
				distance: step.distance,
				duration: step.duration,
				type: step.maneuver.type,
			})),
			waypoints: [
				{ lat: pickup.lat, lng: pickup.lng, timestamp: new Date() },
				{ lat: destination.lat, lng: destination.lng, timestamp: new Date() },
			],
		};

		await Route.findOneAndUpdate({ rideId: ride._id }, routeDoc, {
			upsert: true,
			new: true,
		});

		return {
			rideId: ride._id,
			route: routeDoc,
			waypoints: routeDoc.waypoints,
		};
	} catch (_error) {
		throw LocationError.mapboxError("route calculation");
	}
}

async function getStoredRoute(user: IJwtPayload, rideId: string) {
	const rideObjectId = use_object_id(rideId);

	// Authorization checks
	const ride = await Ride.findOne({ _id: rideObjectId });

	if (!ride) {
		throw LocationError.rideNotFound(rideId);
	}

	if (user.role === RoleEnum.RIDER && ride.rider.toString() !== user.id) {
		throw LocationError.accessDenied("ride");
	}

	if (user.role === RoleEnum.DRIVER && ride.driver?.toString() !== user.id) {
		throw LocationError.accessDenied("ride");
	}

	const route = await Route.findOne({ rideId: ride._id });

	if (!route) {
		throw LocationError.routeNotFound(rideId);
	}

	return {
		rideId: route.rideId,
		route: {
			geometry: route.geometry,
			duration: route.duration,
			distance: route.distance,
			instructions: route.instructions,
		},
		waypoints: route.waypoints,
	};
}

async function calculateETA(
	user: IJwtPayload,
	rideId: string,
	etaRequest: IETACalculationRequest,
) {
	const rideObjectId = use_object_id(rideId);

	// Authorization checks
	const ride = await Ride.findOne({ _id: rideObjectId });

	if (!ride) {
		throw LocationError.rideNotFound(rideId);
	}

	if (user.role === RoleEnum.RIDER && ride.rider.toString() !== user.id) {
		throw LocationError.accessDenied("ride");
	}

	if (user.role === RoleEnum.DRIVER && ride.driver?.toString() !== user.id) {
		throw LocationError.accessDenied("ride");
	}

	// Get destination coordinates
	const destination = ride.destination;
	const currentLocation = etaRequest.currentLocation;

	// Call Mapbox Directions API for ETA
	const url = `${MAPBOX_DIRECTIONS_API_URL}/mapbox/driving-traffic/${currentLocation.lng},${currentLocation.lat};${destination.lng},${destination.lat}`;

	const params = {
		access_token: MAPBOX_ACCESS_TOKEN,
		steps: false,
		geometries: "geojson",
		overview: "simplified",
	};

	try {
		const response = await axios.get(url, { params });

		if (response.data.code !== "Ok") {
			throw LocationError.mapboxError("ETA calculation");
		}

		const routeData = response.data.routes[0];
		const eta = new Date(Date.now() + routeData.duration * 1000);

		return {
			rideId: ride._id,
			eta,
			duration: routeData.duration,
			distance: routeData.distance,
			trafficDelay: 0, // Could be calculated by comparing with free-flow duration
			route: {
				geometry: routeData.geometry,
				duration: routeData.duration,
				distance: routeData.distance,
			},
		};
	} catch (_error) {
		throw LocationError.mapboxError("ETA calculation");
	}
}

async function geocodeAddress(
	query: string,
	limit: number = 5,
	country?: string,
	bbox?: string,
): Promise<IGeocodingResult[]> {
	const url = `${MAPBOX_GEOCODING_API_URL}/mapbox.places/${encodeURIComponent(query)}.json`;

	const params: any = {
		access_token: MAPBOX_ACCESS_TOKEN,
		limit,
		types: "address,poi",
	};

	if (country) params.country = country;
	if (bbox) params.bbox = bbox;

	try {
		const response = await axios.get(url, { params });

		return response.data.features.map((feature: any) => ({
			placeName: feature.place_name,
			coordinates: {
				lat: feature.center[1],
				lng: feature.center[0],
			},
			address: {
				street: feature.properties?.address,
				city: feature.context?.find((c: any) => c.id.includes("place"))?.text,
				country: feature.context?.find((c: any) => c.id.includes("country"))
					?.text,
				postcode: feature.properties?.postcode,
			},
			relevance: feature.relevance,
		}));
	} catch (_error) {
		throw LocationError.geocodingFailed(query);
	}
}

async function reverseGeocode(
	lat: number,
	lng: number,
): Promise<IReverseGeocodingResult> {
	const url = `${MAPBOX_GEOCODING_API_URL}/mapbox.places/${lng},${lat}.json`;

	const params = {
		access_token: MAPBOX_ACCESS_TOKEN,
		types: "address",
	};

	try {
		const response = await axios.get(url, { params });
		const feature = response.data.features[0];

		return {
			coordinates: { lat, lng },
			address: {
				placeName: feature.place_name,
				street: feature.properties?.address,
				city: feature.context?.find((c: any) => c.id.includes("place"))?.text,
				district: feature.context?.find((c: any) => c.id.includes("region"))
					?.text,
				country: feature.context?.find((c: any) => c.id.includes("country"))
					?.text,
				postcode: feature.properties?.postcode,
			},
		};
	} catch (_error) {
		throw LocationError.reverseGeocodingFailed(lat, lng);
	}
}

export const LocationServices = {
	updateDriverLocation,
	getDriverLocation,
	getRideLocationHistory,
	calculateRoute,
	getStoredRoute,
	calculateETA,
	geocodeAddress,
	reverseGeocode,
};
