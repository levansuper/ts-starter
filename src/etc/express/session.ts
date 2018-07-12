'use strict';

import express from 'express';

export class DefaultSession {
	publicData?: {
		user?: {
			username?: string;
			firstName?: string;
			lastName?: string;
			email?: string;
			role?: string;
			createdAt?: Date;
			updatedAt?: Date;
		};
	} = {};
	privateData?: {} = {};
}
