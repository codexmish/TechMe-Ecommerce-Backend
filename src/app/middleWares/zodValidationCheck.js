import { catchAsync } from "../utils/catchAsync.js";

export const zodValidation = (zodSchema, source = "body") => {
	return catchAsync((req, res, next) => {
		const payload = req[source] ?? {};

		// -----checking data
		const result = zodSchema.safeParse(payload);
		if (!result.success) throw result.error;

		// ----setting verified data
		if (source === "query") {
			req.validatedQuery = result.data;
		} else {
			req[source] = result.data;
		}

		next();
	});
};
