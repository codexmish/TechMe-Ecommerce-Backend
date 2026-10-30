import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { authServices } from "./auth.services.js";

const signupController = catchAsync(async (req, res) => {
	const data = await authServices.signupServices(req.body);
	new SendResponse(res, { statusCode: 201, message: "Account created", data });
});

const loginController = catchAsync(async (req, res) => {
	const data = await authServices.loginServices(req.body);
	new SendResponse(res, { statusCode: 200, message: "Login successful", data });
});
 
const verifyOtpController = catchAsync(async (req, res) => {
	const data = await authServices.verifyOtpServices(req.body);
	new SendResponse(res, { statusCode: 200, message: "Email verified", data });
});

const resendOtpController = catchAsync(async (req, res) => {
	const data = await authServices.resendOtpServices(req.body);
	new SendResponse(res, { statusCode: 200, message: data.message, data });
});

const forgotPasswordController = catchAsync(async (req, res) => {
	const data = await authServices.forgotPasswordServices(req.body);
	new SendResponse(res, { statusCode: 200, message: data.message, data });
});

const resetPasswordController = catchAsync(async (req, res) => {
	const data = await authServices.resetPasswordServices(req.body);
	new SendResponse(res, { statusCode: 200, message: data.message, data });
});

const refreshController = catchAsync(async (req, res) => {
	const data = await authServices.refreshServices(req.body.refreshToken);
	new SendResponse(res, { statusCode: 200, message: "Tokens refreshed", data });
});

const logoutController = catchAsync(async (req, res) => {
	await authServices.logoutServices(req.body.refreshToken);
	new SendResponse(res, { statusCode: 200, message: "Logged out" });
});

export const authControllers = { signupController, loginController, verifyOtpController, resendOtpController, forgotPasswordController, resetPasswordController, refreshController, logoutController };

