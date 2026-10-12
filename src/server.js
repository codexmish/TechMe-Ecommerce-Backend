import mongoose from "mongoose";
import app from "./app.js";
import { dbConfig } from "./app/configs/dbConfig/index.js";
import envConfig from "./app/configs/envConfig/index.js";

const port = envConfig.port || 8000;

const main = async () => {
	try {
		// -----db connection
		await dbConfig();
		// -----running server
		const server = app.listen(port, () => {
			console.log(`server is running on port ${port}`);
		});

		// -----graceful shutdown: finish running requests, then close the db
		const shutdown = (signal) => {
			console.log(`${signal} received, shutting down...`);

			// -----stop taking new requests; callback runs when running ones finish
			server.close(async () => {
				await mongoose.connection.close();
				console.log("Server and database closed");
				process.exit(0);
			});

			// -----if it takes more than 10s, force exit
			setTimeout(() => {
				console.error("Shutdown took too long, forcing exit");
				process.exit(1);
			}, 10000).unref();
		};

		process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl + C
		process.on("SIGTERM", () => shutdown("SIGTERM")); // hosting / deploy stop
	} catch (error) {
		console.error("Error starting the server:", error);
		process.exit(1);
	}
};

main();
