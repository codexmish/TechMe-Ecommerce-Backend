import app from "./app.js";
import envConfig from "./app/configs/envConfig/index.js";

const port = envConfig.port || 8000;

const main = async () => {
	try {
		// -----running server
		app.listen(port, () => {
			console.log(`server is running on port ${port}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		process.exit(1);
	}
};

main();
