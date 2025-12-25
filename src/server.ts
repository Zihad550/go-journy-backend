import type { Server } from "node:http";
import mongoose from "mongoose";
import app from "./app";
import { connectRedis } from "./app/config/redis.config";
import SocketService from "./app/modules/location/socket.service";
import { seed_admin } from "./app/seed/admin.seed";
import { seed_driver } from "./app/seed/driver.seed";
import { seed_rider } from "./app/seed/rider.seed";
import { seed_super_admin } from "./app/seed/super-admin.seed";
import env from "./env";

let server: Server;

async function startServer() {
	try {
		await mongoose.connect(env.DB_URL);

		server = app.listen(env.PORT, () => {
			console.log(`Server is listening to port ${env.PORT}`);
		});

		// Initialize WebSocket service
		new SocketService(server);
	} catch (error) {
		console.log(error);
	}
}

(async () => {
	await connectRedis();
	await startServer();
	await Promise.all([
		seed_super_admin(),
		seed_admin(),
		seed_rider(),
		seed_driver(),
	]);
})();

process.on("SIGTERM", () => {
	console.log("SIGTERM signal recieved... Server shutting down..");

	if (server) {
		server.close(() => {
			process.exit(1);
		});
	}

	process.exit(1);
});

process.on("unhandledRejection", (err) => {
	console.log("Unhandled Rejecttion detected... Server shutting down..", err);

	if (server) {
		server.close(() => {
			process.exit(1);
		});
	}

	process.exit(1);
});

process.on("uncaughtException", (err) => {
	console.log("Uncaught Exception detected... Server shutting down..", err);

	if (server) {
		server.close(() => {
			process.exit(1);
		});
	}

	process.exit(1);
});
