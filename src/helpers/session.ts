import { Response, NextFunction, Router } from 'express';
import Errors from './error';
import { DefaultRequest } from '../etc/express/default-request';

const adminPermissions = {
	admin: true
};
const managerPermissions = {
	manager: true,
	admin: true
};
const userPermissions = {
	user: true,
	manager: true,
	admin: true
};
const userNonManager = {
	user: true,
	admin: true
};

const checkSession = function(
	checkObject: any,
	req: DefaultRequest,
	res: Response,
	next: NextFunction
) {
	if (req.session && req.session.user) {
		if (!checkObject[req.session.user.role]) {
			return res.status(403).json({
				errors: Errors.INSUFFICIENT_PRIVILEGES
			});
		}
		next();
	} else {
		res.status(401).json({
			errors: Errors.SESSION_INVALID
		});
	}
};

export default {
	isUser: function(req: DefaultRequest, res: Response, next: NextFunction) {
		checkSession(userPermissions, req, res, next);
	},
	isManager: function(req: DefaultRequest, res: Response, next: NextFunction) {
		checkSession(managerPermissions, req, res, next);
	},
	isAdmin: function(req: DefaultRequest, res: Response, next: NextFunction) {
		checkSession(adminPermissions, req, res, next);
	},
	isNonManager: function(
		req: DefaultRequest,
		res: Response,
		next: NextFunction
	) {
		checkSession(userNonManager, req, res, next);
	}
};
