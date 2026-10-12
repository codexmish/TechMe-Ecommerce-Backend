export class SendResponse {
	constructor(
		res,
		{ statusCode, message, data = null, meta = null, error = null },
	) {
		this.success = statusCode < 400;
		this.statusCode = statusCode;
		this.message = message;
		if (data !== null) this.data = data;
		if (error !== null) this.error = error;
		if (meta !== null) this.meta = meta;

		res.status(statusCode).json(this);
	}
}
