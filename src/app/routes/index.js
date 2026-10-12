import { Router } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { SendResponse } from "../utils/sendResponse.js";

const router = Router();

// -----server health check (no rate limit, no secrets)
router.get("/health", (req, res) => {
	const dbConnected = mongoose.connection.readyState === 1; // 1 = connected

	new SendResponse(res, {
		statusCode: dbConnected ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE,
		message: dbConnected ? "Server is healthy" : "Database is not connected",
		data: {
			server: "up",
			database: dbConnected ? "connected" : "disconnected",
			uptime: Math.round(process.uptime()),
		},
	});
});


// =====module routes
router.use("/auth", authRoutes);

export default router;
