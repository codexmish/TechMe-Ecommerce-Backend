import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	}),
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========Test route======
app.get("/", async (req, res) => {
	res.status(200).json({
		success: true,
		message: "Welcome to Blood for life",
	});
});

export default app;
