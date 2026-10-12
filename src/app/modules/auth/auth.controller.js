import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { authServices } from "./auth.services.js";
import httpStatus from "http-status";

// --------sign up user controller
const signupController = catchAsync(async (req, res) => {
	const result = await authServices.signupServices(req.body);

	SendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Check your email",
	});
});

export const authControllers = {
	signupController,
};
