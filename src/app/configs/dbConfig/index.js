import mongoose from "mongoose";
import envConfig from "../envConfig/index.js";

export const dbConfig = async () => {
	try {
		await mongoose.connect(envConfig.DATABASE_URL);
		console.log("MongoDb Connected");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		throw error;
	}
};
