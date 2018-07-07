'use strict';

//const express = require('express');
//const session = require('express-session');

import session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
import express, { Response, NextFunction } from 'express';
import { Initializer } from '../etc/app/initializer';
import { DefaultRequest } from '../etc/express/default-request';
import DefaultResponse, { Responder } from '../etc/express/default-response';

const RedisStore = require('connect-redis')(session);

export default class ServerInitializer extends Initializer {
	async run() {
		// Create a new express application instance
		const server: express.Application = express();
		// The port the express app will listen on
		const port: string = process.env.PORT;

		server.use(bodyParser.json());
		server.use(cookieParser());

		const store = new RedisStore({
			host: process.env.SESSION_REDIS_HOST,
			port: process.env.SESSION_REDIS_PORT,
			db: parseInt(process.env.SESSION_REDIS_DB)
		});

		server.use(
			session({
				secret: process.env.SESSION_REDIS_SECRET,
				cookie: {
					maxAge: parseInt(process.env.SESSION_MAX_AGE)
				},
				store: store,
				resave: true,
				saveUninitialized: false
			})
		);

		server.use(
			(
				request: DefaultRequest<any>,
				response: DefaultResponse,
				next: NextFunction
			) => {
				const responder: Responder = new Responder(request, response);
				response.error = (args: any) => {
					responder.error(args);
				};
				response.respond = (args: any) => {
					responder.respond(args);
				};
				next();
			}
		);

		server.use('/api/user', require('../api/user'));

		server.listen(process.env.APP_POST || 8080);

		return true;
	}
}
