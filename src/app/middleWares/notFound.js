import httpStatus from "http-status";
import { SendResponse } from "../utils/sendResponse.js";

export const notFoundRoute = (req, res) => {
	new SendResponse(res, {
		statusCode: httpStatus.NOT_FOUND,
		message: `Route not found: ${req.originalUrl}`,
	});
};
