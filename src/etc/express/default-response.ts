'use strict';

import express from 'express';
import Errors from '../../helpers/error';
import { DefaultRequest } from './default-request';
import { DefaultSession } from './session';

export class Responder {
	constructor(request: DefaultRequest<any>, response: express.Response) {
		this.response = response;
		this.request = request;
	}
	response: express.Response;
	request: DefaultRequest;
	respond(data?: any): void {
		if (!data) {
			data = {};
		}

		const session: DefaultSession = {};

		if (data.constructor.name === 'Error') {
			this.response.status(data.status).json({
				success: false,
				error: data,
				session: session.publicData
			});
		} else {
			this.response.json({
				success: true,
				data: data,
				session: session.publicData
			});
		}
	}
	error(e: any): void {
		console.log(e);
		this.respond(Errors.DB_ERROR.build(e));
	}
}

export default interface DefaultResponse extends express.Response {
	error: any;
	respond: any;
}
