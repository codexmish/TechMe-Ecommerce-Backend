import nodemailer from "nodemailer";
import httpStatus from "http-status";
import envConfig from "../../configs/envConfig/index.js";
import { AppError } from "../appError.js";
import { emailTemp } from "./emailTemp.js";

let transporter;

const getTransporter = () => {
	if (!envConfig.SMTP_HOST || !envConfig.SMTP_USER || !envConfig.SMTP_PASS) {
		throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "Email delivery is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
	}
	if (!transporter) {
		// Gmail app passwords are 16 characters with no spaces; strip any pasted spaces.
		const smtpPass = String(envConfig.SMTP_PASS).replace(/\s+/g, "");
		transporter = nodemailer.createTransport({
			host: envConfig.SMTP_HOST,
			port: envConfig.SMTP_PORT,
			secure: envConfig.SMTP_PORT === 465,
			auth: { user: envConfig.SMTP_USER, pass: smtpPass },
			connectionTimeout: 10_000,
			greetingTimeout: 10_000,
			socketTimeout: 20_000,
		});
	}
	return transporter;
};

export const sendOtpEmail = async ({ to, name, otp, purpose, expiresInMinutes = 10 }) => {
	const { subject, text, html } = emailTemp({ name, otp, purpose, expiresInMinutes });
	// SMTP_FROM may already be "Name <email>"; wrapping it twice makes Gmail reject the message.
	const smtpFrom = envConfig.SMTP_FROM || envConfig.SMTP_USER;
	const from = smtpFrom.includes("<") ? smtpFrom : `TechMe <${smtpFrom}>`;
	try {
		return await getTransporter().sendMail({ from, to, subject, text, html });
	} catch (error) {
		if (error instanceof AppError) throw error;
		console.error("OTP email delivery failed:", error.message);
		throw new AppError(httpStatus.BAD_GATEWAY, "Could not send email. Check the SMTP configuration and try again.");
	}
};
