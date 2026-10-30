import httpStatus from "http-status";

// -----send a final response
// statusCode is optional and defaults to 200, so callers can pass just { message, data }.
// The real HTTP status is set on res; it is not repeated inside the JSON body.
export class SendResponse {
	constructor(
		res,
		{ statusCode = httpStatus.OK, message, data = null, meta = null, error = null },
	) {
		const body = {
			success: statusCode < 400,
			message,
		};
		if (data !== null) body.data = data;
		if (error !== null) body.error = error;
		if (meta !== null) body.meta = meta;

		res.status(statusCode).json(body);
	}
}
