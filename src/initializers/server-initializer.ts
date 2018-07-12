'use strict';

import session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
import express, { NextFunction } from 'express';
import DefaultResponse, { Responder } from '../etc/express/default-response';
import { DefaultRequest } from '../etc/express/default-request';
import { Initializer } from '../etc/app/initializer';
import { DefaultSession } from '../etc/express/session';

//const RedisStore = require('connect-redis')(session);
const mongoStore = require('connect-mongo')(session);
const {
	MONGO_HOST,
	MONGO_PORT,
	MONGO_DB,
	MONGO_DB_SESSION_COLLECTION,
	SESSION_MAX_AGE,
	SESSION_SECRET
} = process.env;

const mongoStr = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;

export default class ServerInitializer extends Initializer {
	async run() {
		var a = {
			username: 'asd',
			joni: 'bbb'
		};
		const ds: DefaultSession = new DefaultSession();
		ds.publicData = {
			user: a
		};
		console.log(ds);

		// Create a new express application instance
		const server: express.Application = express();
		// The port the express app will listen on
		const port: string = process.env.PORT;

		server.use(bodyParser.json());
		server.use(cookieParser());

		const store = new mongoStore({
			url: mongoStr,
			collection: MONGO_DB_SESSION_COLLECTION
		});

		server.use(
			session({
				secret: SESSION_SECRET,
				cookie: {
					maxAge: parseInt(SESSION_MAX_AGE)
				},
				store: store,
				resave: true,
				saveUninitialized: false
			})
		);

		//adding responder to respond
		//error and respond methods
		server.use(
			(
				request: DefaultRequest<any>,
				response: DefaultResponse,
				next: NextFunction
			) => {
				if (!request.session.publicData) {
					request.session.publicData = {};
				}

				if (!request.session.privateData) {
					request.session.privateData = {};
				}

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
