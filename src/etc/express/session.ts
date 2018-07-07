'use strict';

import express from 'express';

export interface DefaultRequest<Body = any> extends express.Request {
	session: any;
	body: DefaultRequestObjectObject<Body>;
}

export class DefaultRequestObjectObject<Body> {
	data: Body;
}

export class ClassDefaultObject<Body> {
	data: Body;
}
