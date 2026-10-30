import { createHash, randomInt, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { AppError } from "../../utils/appError.js";
import envConfig from "../../configs/envConfig/index.js";
import { sendOtpEmail } from "../../utils/email/mailSender.js";
import { User } from "./auth.model.js";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const createOtp = () => randomInt(100000, 1000000).toString();
const saveOtp = async (user, purpose) => {
	const otp = createOtp();
	user.otp = otp;
	user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
	user.otpPurpose = purpose;
	user.otpVerifications = 0;
	user.otpverify = false;
	await user.save();
	await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });
};
const issueTokens = async (user) => {
	const accessToken = jwt.sign(
		{ sub: user.id, role: user.role },
		envConfig.JWT_ACCESS_SECRET,
		{ expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN },
	);
	const refreshToken = jwt.sign(
		{ sub: user.id, jti: randomUUID() },
		envConfig.JWT_REFRESH_SECRET,
		{ expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN },
	);
	const decoded = jwt.decode(refreshToken);
	user.refreshTokens.push({ tokenHash: hashToken(refreshToken), expiresAt: new Date(decoded.exp * 1000) });
	await user.save();
	return { accessToken, refreshToken };
};


// ----------signup 
const signupServices = async ({ name, email, password }) => {
	if (await User.exists({ email })) throw new AppError(httpStatus.CONFLICT, "Email already exists");
	const user = await User.create({ name, email, password });
	await saveOtp(user, "verify-email");
	return { message: "Verification code sent. Check your email to finish signup." };
};


// ----------login 
const loginServices = async ({ email, password }) => {
	const user = await User.findOne({ email }).select("+password +refreshTokens");
	const genericError = () => new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
	if (!user) throw genericError();
	if (user.isBlocked) throw new AppError(httpStatus.FORBIDDEN, "Account is blocked");
	if (!user.isVerified) throw new AppError(httpStatus.FORBIDDEN, "Verify your email before signing in");
	if (user.lockUntil && user.lockUntil > new Date()) throw new AppError(httpStatus.TOO_MANY_REQUESTS, "Account temporarily locked. Try again later.");
	if (!(await user.comparePassword(password))) {
		user.failedLoginAttempts += 1;
		if (user.failedLoginAttempts >= 5) {
			user.failedLoginAttempts = 0;
			user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
		}
		await user.save();
		throw genericError();
	}
	user.failedLoginAttempts = 0;
	user.lockUntil = undefined;
	const tokens = await issueTokens(user);
	return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens };
};

// ----------verify otp 
const verifyOtpServices = async ({ email, otp }) => {
	const user = await User.findOne({ email }).select("+otp +otpExpires +refreshTokens");
	if (!user || user.otpPurpose !== "verify-email") throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
	if (!user.otpExpires || user.otpExpires < new Date() || user.otpVerifications >= 5) throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
	if (user.otp !== otp) {
		user.otpVerifications += 1;
		await user.save();
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
	}
	user.isVerified = true;
	user.otpverify = true;
	user.otp = null;
	user.otpExpires = undefined;
	user.otpPurpose = undefined;
	user.otpVerifications = 0;
	await user.save();
	const tokens = await issueTokens(user);
	return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens };
};


// ------------resendOtp
const resendOtpServices = async ({ email }) => {
	const user = await User.findOne({ email }).select("+otp +otpExpires");
	if (!user || user.isVerified) return { message: "If the account can receive an OTP, one has been sent." };
	await saveOtp(user, "verify-email");
	return { message: "If the account can receive an OTP, one has been sent." };
};


// ---------forgotPassword
const forgotPasswordServices = async ({ email }) => {
	const user = await User.findOne({ email }).select("+otp +otpExpires");
	if (!user) return { message: "If the account exists, password reset instructions have been sent." };
	await saveOtp(user, "reset-password");
	return { message: "If the account exists, password reset instructions have been sent." };
};


// ---------resetPassword
const resetPasswordServices = async ({ email, otp, password }) => {
	const user = await User.findOne({ email }).select("+otp +otpExpires +password");
	if (!user || user.otpPurpose !== "reset-password" || !user.otpExpires || user.otpExpires < new Date() || user.otpVerifications >= 5 || user.otp !== otp) {
		if (user && user.otpPurpose === "reset-password" && user.otpVerifications < 5) {
			user.otpVerifications += 1;
			await user.save();
		}
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP");
	}
	user.password = password;
	user.otp = null;
	user.otpExpires = undefined;
	user.otpPurpose = undefined;
	user.otpVerifications = 0;
	user.otpverify = true;
	user.refreshTokens = [];
	await user.save();
	return { message: "Password reset successful" };
};

// ----------refresh 
const refreshServices = async (token) => {
	let decoded;
	try { decoded = jwt.verify(token, envConfig.JWT_REFRESH_SECRET); }
	catch { throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token"); }
	const user = await User.findById(decoded.sub).select("+refreshTokens");
	if (!user || user.isBlocked) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
	const tokenHash = hashToken(token);
	const index = user.refreshTokens.findIndex((entry) => entry.tokenHash === tokenHash && entry.expiresAt > new Date());
	if (index < 0) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
	user.refreshTokens.splice(index, 1);
	const tokens = await issueTokens(user);
	return tokens;
};


// ----------logout 
const logoutServices = async (token) => {
	try {
		const decoded = jwt.verify(token, envConfig.JWT_REFRESH_SECRET);
		const user = await User.findById(decoded.sub).select("+refreshTokens");
		if (user) {
			user.refreshTokens = user.refreshTokens.filter((entry) => entry.tokenHash !== hashToken(token));
			await user.save();
		}
	} catch { /* Logout remains idempotent for invalid or expired tokens. */ }
};

export const authServices = { signupServices, loginServices, verifyOtpServices, resendOtpServices, forgotPasswordServices, resetPasswordServices, refreshServices, logoutServices };

