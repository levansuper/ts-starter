'use strict';

import express from 'express';
import { DefaultRequest } from './session';
import Errors from '../../helpers/error';
import session from '../../helpers/session';

export class Responder {
	constructor(request: DefaultRequest, response: express.Response) {
		this.response = response;
		this.request = request;
	}
	response: express.Response;
	request: express.Request;
	respond(data: any): void {
		console.log(data.constructor.name);
		if (data.constructor.name === 'Error') {
			this.response.status(data.status).json({
				error: data,
				session: this.request.session
			});
		} else {
			this.response.json({
				data: data,
				session: this.request.session
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
