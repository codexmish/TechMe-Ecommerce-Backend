import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import mongoose from "mongoose";

const scrypt = promisify(scryptCallback);

const hashPassword = async (password) => {
	const salt = randomBytes(16).toString("hex");
	const key = await scrypt(password, salt, 64);
	return `${salt}:${key.toString("hex")}`;
};

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 3,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		select: false,
	},
	avatar: {
		type: String,
		default: "",
	},
	phone: {
		type: String,
		trim: true,
	},
	address: {
		type: String,
	},
	otp: {
		type: String,
		default: "",
		select: false,
	},
	otpExpires: {
		type: Date,
		select: false,
	},
	otpVerifications: {
		type: Number,
		default: 0,
	},
	otpPurpose: {
		type: String,
		enum: ["verify-email", "reset-password"],
	},
	otpverify: {
		type: Boolean,
		default: false,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	resetPasswordToken: {
		type: String,
		select: false,
	},
	resetPasswordExpires: {
		type: Date,
		select: false,
	},
	role: {
		type: String,
		required: true,
		trim: true,
		enum: ["user", "admin", "subadmin"],
		default: "user",
	},
	isApproved: {
		type: Boolean,
		default: function () {
			return this.role === "admin";
		},
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	passwordChangedAt: {
		type: Date,
	},
	refreshTokens: {
		type: [
			{
				_id: false,
				tokenHash: { type: String, required: true },
				expiresAt: { type: Date, required: true },
			},
		],
		default: [],
		select: false,
	},
	failedLoginAttempts: {
		type: Number,
		default: 0,
	},
	lockUntil: {
		type: Date,
	},
});

userSchema.pre("validate", function () {
	if (this.role && !["user", "admin", "subadmin"].includes(this.role)) {
		this.role = "user";
	}
});

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await hashPassword(this.password);
	if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function (plainPassword) {
	const [salt, storedKey] = this.password.split(":");
	if (!salt || !storedKey) return false;
	return scrypt(plainPassword, salt, 64).then((key) =>
		timingSafeEqual(Buffer.from(storedKey, "hex"), key),
	);
};

userSchema.methods.changedPasswordAfter = function (tokenIssuedAt) {
	if (!this.passwordChangedAt) return false;
	return this.passwordChangedAt.getTime() / 1000 > tokenIssuedAt;
};

export const User = mongoose.model("User", userSchema);
