import { AppError } from "../../utils/appError.js";

// ---------signup services
const signupServices = async (payload) => {
	const { name, email, password } = payload;

	// -----checking if user already exist with same email

	// -----password hash

	// -----otp generate
	const otp = crypto.randomInt(100000, 1000000).toString();

	// -----redis data set

	// ---otp set on redis

	// ---sugnup data set on redis

	// ------sending mail

	return;
};

export const authServices = {
	signupServices,
};
