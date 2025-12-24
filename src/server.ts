import type { Server } from "node:http";
import mongoose from "mongoose";
import app from "./app";
import { connectRedis } from "./app/config/redis-config";
import SocketService from "./app/modules/location/socket-service";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import env from "./env";

let server: Server;

const startServer = async () => {
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
};

(async () => {
	await connectRedis();
	await startServer();
	await seedSuperAdmin();
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
