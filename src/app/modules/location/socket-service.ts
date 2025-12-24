import type { Server as HTTPServer } from "node:http";
import jwt from "jsonwebtoken";
import { type Socket, Server as SocketIOServer } from "socket.io";
import env from "../../../env";
import { useObjectId } from "../../utils/use-object-id";
import Ride from "../ride/ride-model";
import { RoleEnum } from "../user/user-interface";

interface AuthenticatedSocket extends Socket {
	userId?: string;
	userRole?: RoleEnum;
}

class SocketService {
	private io: SocketIOServer;
	private static instance: SocketService;

	constructor(server: HTTPServer) {
		this.io = new SocketIOServer(server, {
			cors: {
				origin: env.FRONTEND_URL,
				methods: ["GET", "POST"],
				credentials: true,
			},
			transports: ["websocket", "polling"],
		});

		this.initializeSocket();
		SocketService.instance = this;
	}

	public static getInstance(): SocketService {
		if (!SocketService.instance) {
			throw new Error("SocketService not initialized");
		}
		return SocketService.instance;
	}

	private initializeSocket() {
		// Authentication middleware
		this.io.use(async (socket: AuthenticatedSocket, next) => {
			try {
				const token = socket.handshake.auth.token;

				if (!token) {
					return next(new Error("Authentication token required"));
				}

				const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
				socket.userId = decoded.userId;
				socket.userRole = decoded.role;
				next();
			} catch (_error) {
				next(new Error("Authentication failed"));
			}
		});

		this.io.on("connection", (socket: AuthenticatedSocket) => {
			// Handle ride room joining
			socket.on("join-ride", async (data: { rideId: string }) => {
				try {
					const { rideId } = data;

					// Verify user has access to this ride
					const ride = await Ride.findOne({ _id: rideId });

					if (!ride) {
						socket.emit("error", {
							type: "RIDE_NOT_FOUND",
							message: "Ride not found",
						});
						return;
					}

					// Check authorization
					const hasAccess =
						(socket.userRole === RoleEnum.RIDER &&
							ride.rider.toString() === socket.userId) ||
						(socket.userRole === RoleEnum.DRIVER &&
							ride.driver?.toString() === socket.userId) ||
						socket.userRole === RoleEnum.ADMIN ||
						socket.userRole === RoleEnum.SUPER_ADMIN;

					if (!hasAccess) {
						socket.emit("error", {
							type: "UNAUTHORIZED",
							message: "Access denied to this ride",
						});
						return;
					}

					socket.join(`ride-${rideId}`);
					socket.emit("joined-ride", { rideId });
				} catch (_error) {
					socket.emit("error", {
						type: "JOIN_RIDE_FAILED",
						message: "Failed to join ride room",
					});
				}
			});

			// Handle driver tracking room joining
			socket.on("track-driver", async (data: { driverId: string }) => {
				try {
					const { driverId } = data;

					// Verify user can track this driver
					if (
						socket.userRole === RoleEnum.DRIVER &&
						socket.userId !== driverId
					) {
						socket.emit("error", {
							type: "UNAUTHORIZED",
							message: "Drivers can only track themselves",
						});
						return;
					}

					if (socket.userRole === RoleEnum.RIDER) {
						if (!socket.userId) {
							socket.emit("error", {
								type: "UNAUTHORIZED",
								message: "User not authenticated",
							});
							return;
						}
						// Check if rider has an active ride with this driver
						const activeRide = await Ride.findOne({
							rider: useObjectId(socket.userId),
							driver: useObjectId(driverId),
							status: { $in: ["accepted", "in_transit"] },
						});

						if (!activeRide) {
							socket.emit("error", {
								type: "UNAUTHORIZED",
								message: "No active ride with this driver",
							});
							return;
						}
					}

					socket.join(`driver-${driverId}`);
					socket.emit("tracking-driver", { driverId });
				} catch (_error) {
					socket.emit("error", {
						type: "TRACK_DRIVER_FAILED",
						message: "Failed to track driver",
					});
				}
			});

			// Handle disconnection
			socket.on("disconnect", () => {
				console.log(`User disconnected: ${socket.userId}`);
			});
		});
	}

	// Broadcast driver location update to relevant rooms
	public broadcastDriverLocation(
		rideId: string,
		driverId: string,
		location: any,
	) {
		this.io.to(`ride-${rideId}`).emit("driver-location-update", {
			driverId,
			location: {
				lat: location.lat,
				lng: location.lng,
				timestamp: location.timestamp,
				speed: location.speed,
				heading: location.heading,
			},
		});
	}

	// Broadcast ride status update
	public broadcastRideStatusUpdate(
		rideId: string,
		status: string,
		location?: any,
	) {
		const updateData: any = {
			rideId,
			status,
			timestamp: new Date(),
		};

		if (location) {
			updateData.location = {
				lat: location.lat,
				lng: location.lng,
			};
		}

		this.io.to(`ride-${rideId}`).emit("ride-status-update", updateData);
	}

	// Broadcast ETA update
	public broadcastETAUpdate(
		rideId: string,
		eta: Date,
		delay: number,
		distance: number,
	) {
		this.io.to(`ride-${rideId}`).emit("eta-update", {
			rideId,
			eta,
			delay,
			distance,
		});
	}

	// Get IO instance for external use
	public getIO(): SocketIOServer {
		return this.io;
	}
}

export default SocketService;
