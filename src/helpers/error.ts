type ErrorType = {
	status: number;
	code: string;
	message?: string;
};

export class Error {
	public status: number;
	public code: string;
	public message?: string;

	constructor(error: ErrorType) {
		this.status = error.status;
		this.code = error.code;
		this.message = error.message;
	}

	public build(error: any) {
		if (error.constructor.name === Error.name) {
			return error;
		}
		return this;
	}

	public static build(error: ErrorType): Error {
		return new Error(error);
	}
}

const Errors = {
	DB_ERROR: Error.build({
		status: 500,
		code: 'DB_ERROR',
		message: 'DB error happened'
	}),
	INSUFFICIENT_PRIVILEGES: Error.build({
		status: 401,
		code: 'INSUFFICIENT_PRIVILEGES',
		message: 'You do not have permission!'
	}),
	SESSION_INVALID: Error.build({
		status: 401,
		code: 'SESSION_INVALID',
		message: 'Your session is not valid!'
	}),
	INVALID_PARAMETERS: Error.build({
		status: 422,
		code: 'INVALID_PARAMETERS',
		message: 'Parameters you sent are invalid!'
	}),
	USER_EXISTS: Error.build({
		status: 422,
		code: 'USER_EXISTS',
		message: 'The email you provided already exists'
	})
};

export default Errors;
