import * as Mongoose from 'mongoose';
import crypto from 'crypto';
import MainManager from '../main-manager';
import { UserModel } from '../models/user';
import Errors from '../helpers/error';

export class UserManager {
	public async add(userData: UserModel) {
		var me = this;
		if (userData.password) {
			userData.password = encriptPassword(userData.password.toString());
		}
		var newUser = new UserModel(userData);

		let foundUser = await UserModel.findOne({
			username: userData.username
		});
		if (foundUser) {
			throw Errors.USER_EXISTS;
		}

		return await newUser.save();
	}

	public async auth(userData: UserModel) {
		var me = this;

		let foundUser = await UserModel.findOne({
			username: userData.username,
			password: encriptPassword(userData.password)
		});

		if (!foundUser) {
			throw Errors.INVALID_CREDENTIALS;
		}
		/*
        if (foundUser.invitationToken) {
            throw Errors.NOT_VERIFIED;
        }
*/
		return foundUser;
	}

	/*

    


    userManager.passwordResetInit = function (userData, cb) {
        var me = this;
        me.app.models.user.findOne({
            username: userData.username
        }, function (err1, res1) {
            console.log(err1)
            if (err1) {
                return cb(me.app.errors.DB_ERROR.get());
            }
            if (!res1) {
                return cb(null, null);
            }

            res1.passwordResetToken = uuidv4();
            res1.passwordResetTokenSendDate = new Date();
            res1.save(function (err2, res2) {
                if (err2) {
                    return cb(me.app.errors.DB_ERROR.get());
                }
                var compiledTemplate = me.app.email.templates.passwordReset({
                    username: res1.username,
                    firstName: res1.firstName,
                    domain: me.app.config.app.websiteUrl,
                    passwordResetToken: res1.passwordResetToken
                });
                var emailObj = {
                    from: me.app.config.email.mainEmail,
                    to: res1.username,
                    subject: "მოგესალმებით!",
                    html: compiledTemplate
                }
                //me.app.email.sender.send(emailObj, function (err, res) {});
                cb(null, null);
            });
        })
    };

    userManager.passwordReset = function (userData, cb) {
        var me = this;
        var date = new Date();
        var passwordResetDeadline = date.getTime() - me.app.config.app.passwordResetDeadline;

        me.app.models.user.findOne({
            passwordResetToken: userData.passwordResetToken,
            passwordResetTokenSendDate: {$gt: passwordResetDeadline}

        }, function (err1, user) {
            if (err1) {
                return cb(me.app.errors.DB_ERROR.get());
            }
            if (!user) {
                return cb(me.app.errors.INVALID_TOKEN.get());
            }

            user.passwordResetToken = null;
            user.invitationToken = null;
            user.password = encriptPassword(userData.password);
            user.save(function (err2, res2) {
                if (err2) {
                    return cb(me.app.errors.DB_ERROR.get());
                }
                cb(null, null);
            });

        });
    }

    userManager.confirm = function (userData, cb) {
        var me = this;
        let date = new Date();
        const registerTokenDeadline = date.getTime() - me.app.config.app.registerTokenDeadline;

        me.app.models.user.findOne({
            invitationToken: userData.invitationToken,
            invitationTokenSendDate: {$gt: registerTokenDeadline}
        }, function (err, user) {
            if (err) {
                return cb(me.app.errors.DB_ERROR.get());
            }
            if (!user) {
                return cb(me.app.errors.INVALID_TOKEN.get());
            }

            if (!user.password) {
                if (!userData.password) {
                    return cb(me.app.errors.USER_WITHOUT_PASSWORD.get());
                }
                user.password = encriptPassword(userData.password);
            }
            user.invitationToken = null;
            user.passwordResetToken = null;
            user.save(function (err2, res2) {
                if (err2) {
                    cb(me.app.errors.DB_ERROR.get());
                    return;
                }
                cb(err2, res2);
            });
        });
    }

    userManager.edit = function (userData, availableRolesToEdit, cb) {
        var me = this;
        me.app.models.user.findOne({_id: userData._id, role: {$in: availableRolesToEdit}}, function (err, user) {
            if (err) {
                return cb(me.app.errors.DB_ERROR.get());
            }
            if (!user) {
                return cb(me.app.errors.INVALID_ID.get());
            }

            if (userData.role) {
                user.role = userData.role;
            }

            if (userData.firstName) {
                user.firstName = userData.firstName;
            }

            if (userData.lastName) {
                user.lastName = userData.lastName;
            }

            if (userData.pid) {
                user.pid = userData.pid;
            }
            user.save(function (err2, res2) {
                if (err2) {
                    cb(me.app.errors.DB_ERROR.get());
                    return;
                }
                me.updateUserSessions(userData._id, cb);
            });
        })
    };

    userManager.search = function (userData, paging, cb) {
        var me = this;
        me.app.models.user.find(userData, null, paging, function (err, dataResponse) {
            if (err) {
                return cb(me.app.errors.DB_ERROR.get());
            }
            me.app.models.user.count(userData, function (err, countResponse) {
                if (err) {
                    return cb(me.app.errors.DB_ERROR.get());
                }
                cb(null, {
                    data: dataResponse,
                    totalCount: countResponse
                });
            });

        });
    };


    userManager.get = function (id, cb) {
        var me = this;
        me.app.models.user.findOne({_id: id}, ['username', '_id', 'createdAt', 'updatedAt', 'role'], function (err, resp) {
            if (err) {

                return cb(me.app.errors.DB_ERROR.get());
            }
            if (!resp) {
                return cb(me.app.errors.INVALID_ID.get());
            }
            cb(null, resp);

        });
    };

    

    userManager.getSession = function (req, res, next) {
        var me = this;
        if (req.session && req.session.user) {
            res.status(200).json(null, req.session.user);
        } else {
            next(me.app.errors.SESSION_INVALID.get());
        }
    };

    userManager.logout = function (req, res, next) {
        var me = this;
        if (req.session && req.session.user) {
            req.session.destroy(function (error) {
                if (error) {
                    next(me.app.errors.SESSION_ERROR.get());
                } else {
                    res.json();
                }
            });
        } else {
            res.json();
        }
    };

    userManager.remove = function (id, availablerolesToRemove, cb) {
        var me = this;
        me.app.models.user.remove({
            _id: id,
            role: {$in: availablerolesToRemove}
        }, function (err, dataResponse) {
            if (err) {
                return cb(me.app.errors.DB_ERROR.get());
            }
            if (dataResponse.result.n == 0) {
                return cb(me.app.errors.INVALID_ID.get());
            }
            me.app.models.jog.remove({
                userId: id
            }, function () {
                me.updateUserSessions(id, cb);
            })

        });
    };

    userManager.getAdminCount = function (cb) {
        var me = this;
        me.app.models.user.count({role: "admin"}, cb);
    }

    userManager.updateUserSessions = function (userId, cb) {
        var me = this;
        me.app.models.user.findOne({_id: userId}, function (err, user) {
            if (err) {
                cb(me.app.errors.DB_ERROR.get());
            }
            if (!user) {
                me.app.models.session.remove({
                    "session.user._id": me.app.mongoose.mongoose.Types.ObjectId(userId)
                }, function (removeErr) {
                    if (removeErr) {
                        cb(me.app.errors.DB_ERROR.get());
                    }
                    cb();
                });
            } else {
                var userObj = user.toJSON();
                lodash.unset(userObj, 'password');
                lodash.unset(userObj, 'passwordResetToken');
                lodash.unset(userObj, 'invitationToken');

                me.app.models.session.update({
                    "session.user._id": me.app.mongoose.mongoose.Types.ObjectId(userId)
                }, {
                    "$set": {
                        "session.user": userObj
                    }
                }, {
                    multi: true
                }, function (removeErr, b, c) {
                    if (removeErr) {
                        return cb(me.app.errors.DB_ERROR.get());
                    }
                    cb();
                });
            }
        })
    }


    userManager.generateUniqueInvitationToken = function (cb) {
        const me = this;
        const date = new Date();
        const registerTokenDeadline = date.getTime() - me.app.config.app.registerTokenDeadline;

        let invitationToken = uuidv4();

        if (!me.app.config.app.invitationToken.useUUID) {
            invitationToken = getRandomInt(
                me.app.config.app.invitationToken.min,
                me.app.config.app.invitationToken.max);
        }

        me.app.models.user.findOne({
            invitationToken: invitationToken,
            invitationTokenSendDate: {$gt: registerTokenDeadline}

        }, function (err, user) {
            if (err) {
                return cb(me.app.errors.DB_ERROR.get());
            }

            if (!user) {
                return cb(null, invitationToken);
            }

            me.generateUniqueInvitationToken(cb)

        })
    }
    
    userManager.generatePhoneToken = async function (username, cb) {
        const me = this;

        const invitationToken = getRandomInt(
            me.app.config.app.invitationToken.min,
            me.app.config.app.invitationToken.max);

        /!*var compiledTemplate = me.app.email.templates.invite({
            domain: me.app.config.app.websiteUrl,
            invitationToken: invitationToken
        });
        var emailObj = {
            from: me.app.config.email.mainEmail,
            to: "aapge@mailinator.com",
            subject: "მოგესალმებათ aap!",
            html: compiledTemplate
        }*!/
        try {
            const conf = me.app.config.sms;

            const resp = await fetch(`${conf.url}?key=${conf.key}&destination=${username}&sender=${conf.sender}&content=${invitationToken}`);
        }catch (e){
            console.log(e);
            return cb(me.app.errors.DB_ERROR.get());
        }
        /!*me.app.email.sender.send(emailObj, function (err, res) {
        });*!/
        cb(null, invitationToken)
    }
    
    */
}

const encriptPassword = (salt: string) => {
	const hash = crypto.createHmac('sha512', salt);
	const value = hash.digest('hex');
	return value;
};

const getRandomInt = function(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
