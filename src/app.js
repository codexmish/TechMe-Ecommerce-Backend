import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandaler } from "./app/utils/globalErrorHandaler.js";
import { notFoundRoute } from "./app/middleWares/notFound.js";
import { requestLogger } from "./app/middleWares/requestLogger.js";
import router from "./app/routes/index.js";
import envConfig from "./app/configs/envConfig/index.js";

const app = express();

// =====request logger (first, so every request is logged)
app.use(requestLogger);
app.use(express.json());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(envConfig.BASE_URL, router);
// ========Test route======
app.get("/", async (req, res) => {
	res.status(200).json({
		success: true,
		message: "Welcome to Tech Me",
	});
});

// =====not found url
app.use(notFoundRoute);
// =====global error handaler
app.use(globalErrorHandaler);

export default app;
