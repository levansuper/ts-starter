'use strict';

import express from 'express';
import { DefaultSession } from './session';

export interface ExtendedRequest<Body = any> extends express.Request {
	body: DefaultRequestObjectObject<Body>;
}

export type DefaultRequest<Body = any> = ExtendedRequest & {
	session: DefaultSession;
	sessionID: any;
};

export class DefaultRequestObjectObject<Body> {
	data: Body;
}
