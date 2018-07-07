'use strict';

import MainManager from '../main-manager';

import Errors from '../helpers/error';
import { Response, NextFunction, Router } from 'express';
import { UserModel } from '../models/user';
import { DefaultRequest } from '../etc/express/default-request';
import DefaultResponse from '../etc/express/default-response';

var router = Router();

router.post('/register', async function(
	request: DefaultRequest<UserModel>,
	response: DefaultResponse,
	next: NextFunction
) {
	try {
		const userData: UserModel = request.body.data;
		const newUser = await MainManager.userManager.add(userData);
		response.respond(newUser);
	} catch (e) {
		response.error(e);
	}
});

/*
router.get(
    '/session',
    app.filter.session.isUser(),
    app.managers.userManager.getSession
);

router.get(
    '/session/check',
    function (req, res, next) {
        res.json(null);
    }
);


router.delete(
    '/session',
    app.filter.session.isUser(),
    app.managers.userManager.logout
);


router.put(
    '/password',
    app.filter.session.isUser(),
    app.validator.validate(app.validator.api.user.edit),
    function (request, response, next) {

        var obj = {
            password: request.body.password,
            oldPassword: request.body.oldPassword,
            _id: request.session.user._id
        };

        app.managers.userManager.edit(obj, ['user', 'manager', 'admin'], function (err, res) {
            if (err) {
                next(err);
                return;
            }
            response.json(null, {})
        });
    });



router.post(
    '/password/reset',
    app.validator.validate(app.validator.api.user.passwordResetInit),
    function (request, response, next) {
        app.managers.userManager.passwordResetInit(request.body, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            response.json(null);
        });
    });

router.put(
    '/password/reset',
    app.validator.validate(app.validator.api.user.passwordReset),
    function (request, response, next) {
        app.managers.userManager.passwordReset(request.body, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            response.json(null,);
        });
    });


router.delete(
    '/:id',
    app.filter.session.isManager(),
    app.validator.validate(app.validator.api.user.remove),
    function (request, response, next) {
        var availableRolesToRemove = ["user", "manager"];
        if (request.session.user.role == "admin") {
            availableRolesToRemove.push("admin");
        }

        if (request.session.user._id == request.params.id) {
            return next(app.errors.REMOVE_SELF.get());
        }

        app.managers.userManager.remove(request.params.id, availableRolesToRemove, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            response.json(null, res);
        });
    });


router.post(
    '/register',
    app.validator.validate(),
    function (request, response, next) {
        if (!request.session.invitation || !request.session.invitation.approved) {
            return next(app.errors.SESSION_INVALID.get());
        }
        next();
    },
    function (request, response, next) {
        request.body.invitationToken = null;
        request.body.passwordResetToken = null;
        request.body.role = "user";
        next();
    },
    function (request, response, next) {
        var data = request.body;
        data.username = request.session.invitation.username;
        app.managers.userManager.add(data, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            response.json(null, res);
        });
    });

router.put(
    '/register/phone',
    app.validator.validate(app.validator.api.user.phoneConfirm),
    function (request, response, next) {
        if (request.session.user) {
            return next(app.errors.SESSION_INVALID.get());
        }
        if (!request.session.invitation) {
            return next(app.errors.SESSION_INVALID.get());
        }
        next();
    },
    function (request, response, next) {
        var data = request.body;
        if (request.session.invitation.invitationToken != data.invitationToken) {
            request.session.invitation = {};
            return next(app.errors.INVALID_TOKEN.get(), null);
        }

        request.session.invitation.approved = true;
        delete request.session.invitation.invitationToken;
        response.json(null, {
            username : request.session.invitation.username
        })
    });


router.post(
    '/register/phone',
    app.validator.validate(app.validator.api.user.phoneAdd),
    function (request, response, next) {
        if (request.session && request.session.user) {
            return next(app.errors.SESSION_INVALID.get());
        }
        next();
    },
    function (request, response, next) {
        var data = request.body;
        app.managers.userManager.generatePhoneToken(data.username, function (err, invitationToken) {
            if (err) {
                next(err);
                return;
            }
            request.session.invitation = {
                invitationToken: invitationToken,
                username: data.username
            }
            response.json(null, {username: data.username});
        });
    });



router.put(
    '/confirm',
    app.validator.validate(),
    function (request, response, next) {
        app.managers.userManager.confirm(request.body, function (err, res) {
            if (err) {
                return next(err);
            }
            response.json(null);
        });
    });


router.put(
    '/:id',
    // app.filter.session.isUser(),
    // app.validator.validate(app.validator.api.user.edit),
    // function(request, response, next){
    //     request.body = {
    //         password: request.body.password,
    //         role: request.body.role
    //     }
    //     if (request.session.user._id == request.params.id) {
    //         return next(app.errors.EDIT_SELF.get());
    //     }
    //     if (request.session.user.role == "manager" && request.body.role == "admin" ) {
    //         return next(app.errors.INSUFFICIENT_PRIVILEGES.get());
    //     }
    //     next();
    // },
    function (request, response, next) {
        if (request.session.user.role == "user") {
            request.body.role = "user";
        }
        next();
    },
    function (request, response, next) {
        var obj = request.body;
        obj._id = request.params.id;
        var availableRolesToEdit = ["user", "manager"];
        if (request.session.user.role == "admin") {
            availableRolesToEdit.push("admin");
        }

        app.managers.userManager.edit(obj, availableRolesToEdit, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            request.session.reload(function (err) {
                if (err) {
                    return next(app.errors.DB_ERROR.get());
                }
                response.json();
            })

        });
    });


router.get(
    '/',
    app.filter.session.isManager(),
    app.validator.validate(app.validator.api.user.search),
    function (request, response, next) {
        var searchParam = {}
        if (request.params.username) {
            searchParam.username = new RegExp(request.params.username, 'i')
        }
        if (request.params.role) {
            searchParam.role = request.params.role;
        }
        var paging = {};
        if (request.params.skip) {
            paging.skip = parseInt(request.params.skip);
        }
        if (request.params.limit) {
            paging.limit = parseInt(request.params.limit);
        }
        app.managers.userManager.search(searchParam, paging, function (err, res) {
            if (err) {
                next(err);
                return;
            }

            response.json(null, res);
        });
    });

router.get(
    '/:id',
    app.filter.session.isManager(),
    app.validator.validate(app.validator.api.user.get),
    function (request, response, next) {

        app.managers.userManager.get(request.params.id, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            response.json(null, res);
        });
    });


router.post(
    '/auth',
    app.validator.validate(),
    function (request, response, next) {
        app.managers.userManager.auth(request.body, function (err, res) {
            if (err) {
                next(err);
                return;
            }
            var user = res.toJSON();
            lodash.unset(user, 'password');
            lodash.unset(user, 'passwordResetToken');
            lodash.unset(user, 'invitationToken');

            request.session.save(function (error) {
                if (error) {
                    return next(app.errors.INVALID_CREDENTIALS.get());
                }
                request.session.user = user;
                next();
            });

        });
    },
    app.managers.userManager.getSession);
*/
module.exports = router;
