import { Router } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { redisClient } from "../configs/redisConfig/index.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { SendResponse } from "../utils/sendResponse.js";

const router = Router();

// -----server health check (no rate limit, no secrets)
router.get("/health", (req, res) => {
	const dbConnected = mongoose.connection.readyState === 1; // 1 = connected
	const redisConnected = redisClient.isReady;
	const healthy = dbConnected && redisConnected;

	new SendResponse(res, {
		statusCode: healthy ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE,
		message: healthy
			? "Server is healthy"
			: "Database or redis is not connected",
		data: {
			server: "up",
			database: dbConnected ? "connected" : "disconnected",
			redis: redisConnected ? "connected" : "disconnected",
			uptime: Math.round(process.uptime()),
		},
	});
});

// =====module routes
router.use("/auth", authRoutes);

export default router;
