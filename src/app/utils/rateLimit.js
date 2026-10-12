import rateLimit from "express-rate-limit";

// ----------set api req limit
export const limiter = (time, limit, successSkip = true) => {
	return rateLimit({
		windowMs: time, // Time in milisecound
		limit: limit, // Limit each IP to 100 requests per `window`
		message: {
			success: false,
			statusCode: 429,
			message: "Too many requests, please try again later.",
		},
		skipSuccessfulRequests: successSkip,
	});
};
