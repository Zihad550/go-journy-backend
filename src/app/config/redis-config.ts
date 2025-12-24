import { createClient } from "redis";
import env from "../../env";

export const redisClient = createClient({
	username: env.REDIS_USERNAME,
	password: env.REDIS_PASSWORD,
	socket: {
		host: env.REDIS_HOST,
		port: Number(env.REDIS_PORT),
	},
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export async function connectRedis() {
	if (!redisClient.isOpen) {
		await redisClient.connect();
		console.log("Redis Connected");
	}
}
