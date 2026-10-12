import httpStatus from "http-status";
import { AppError } from "./appError.js";
import envConfig from "../configs/envConfig/index.js";
import { SendResponse } from "./sendResponse.js";

export const globalErrorHandaler = (err, req, res, next) => {
	// -----initial error res data
	let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
	let errMessage =
		envConfig.node_env === "development" ? err.message : "Something went wrong";

	// -----err set error
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		errMessage = err.message;
	} else {
		console.error(err);
	}

	// ------final err response send to client
	new SendResponse(res, {
		statusCode,
		message: errMessage,
		error: envConfig.node_env === "development" ? err.stack : null,
	});
};
