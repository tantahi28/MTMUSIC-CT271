const User = require('../models/User');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { mongooseToObject } = require('../../util/mongoose');
const mailer = require('../../util/mailer')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv/config')

class AuthController {
    // [GET] /auth/login
    getLogin(req, res, next) {
        res.render('auth/login');
    }

    // [GET] /auth/register
    getRegister(req, res, next) {
        res.render('auth/register');
    }

    //[POST] /auth/register
    register(req, res, next) {
        const { email, password, name, urlAvt } = req.body;
        if (email) {
            User.findOneDeleted({ email: email })
                .then((deletedUser) => {
                    if (deletedUser) {
                        const conflictError = 'Email này đã bị vô hiệu hóa!! Vui lòng liên hệ cho người quản trị.';
                        res.render('auth/register', {
                            email,
                            password,
                            conflictError,
                        });
                    } else {
                        User.findOne({ email: email })
                            .then((existUser) => {
                                if (existUser) {
                                    const conflictError =
                                        'Email này đã từng tạo tài khoản!!';
                                    res.render('auth/register', {
                                        email,
                                        password,
                                        conflictError,
                                    });
                                } else {
                                    bcrypt
                                        .hash(password,parseInt(process.env.BCRYPT_SALT_ROUND))
                                            .then((hashed) => {
                                                //Tạo người dùng mới
                                                const user = new User({
                                                    name: name,
                                                    email: email,
                                                    urlAvt: urlAvt,
                                                    password: hashed,
                                                });
                                                user.save()
                                                    .then(() => {
                                                        const successMes = 'Chúng tôi đã gửi email chứng thực tài khoản!'
                                                        bcrypt.hash(user.email, parseInt(process.env.BCRYPT_SALT_ROUND))
                                                            .then((hashedEmail) => {
                                                                console.log(`${process.env.APP_URL}/auth/verify?email=${user.email}&token=${hashedEmail}`);
                                                                mailer.sendMail(user.email, "Verify Email",
                                                                `<a href="${process.env.APP_URL}/auth/verify?email=${user.email}&token=${hashedEmail}"> Verify </a>`)
                                                            })
                                                        res.render('auth/login', {
                                                            successMes
                                                        });
                                                    })
                                                    .catch((error) => next(error));
                                            });
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                const conflictError =
                                    err + 'Có lỗi xảy ra khi đang đăng ký!';
                                res.render('auth/register', {
                                    email,
                                    password,
                                    conflictError,
                                });
                            });
                    }
                })
                .catch(next);
        }
    }

    verify(req, res) {
        bcrypt.compare(req.query.email, req.query.token, (err, result) => {
            if(result == true) {
                User.verify(req.query.email)
                    .then(() => {
                        if(!err) {
                            const successMes = 'Xác thực thành công! Bạn có thể đăng nhập!'
                            res.render('auth/login', {
                                successMes
                            })
                        } else {
                            res.redirect('/500')
                        }
                    }) 
            } else {

            }
        })
    }
    // POST /auth/logging
    login(req, res) {
        const { email, password } = req.body;

        if (email && password) {
            User.findOne({ email: email })
                .then((user) => {
                    if (!user) {
                        const conflictError =
                            'Tài khoản hoặc mật khẩu của bạn không đúng!!';
                        res.render('auth/login', {
                            email,
                            password,
                            conflictError,
                        });
                    } else {
                        bcrypt
                            .compare(password, user.password)
                            .then((result) => {
                                if (result == true) {
                                    if(user.emailVerifiedAt){
                                        req.session.loggedin = true;
                                        req.session.user = user;
                                        console.log('sucessfully!');
                                        res.redirect('/');
                                    } else {
                                        const conflictError = 'Vui lòng chứng thực tài khoản!!'
                                        bcrypt.hash(user.email, parseInt(process.env.BCRYPT_SALT_ROUND))
                                            .then((hashedEmail) => {
                                                console.log(`${process.env.APP_URL}/auth/verify?email=${user.email}&token=${hashedEmail}`);
                                                mailer.sendMail(user.email, "Verify Email",
                                                `<a href="${process.env.APP_URL}/auth/verify?email=${user.email}&token=${hashedEmail}"> Verify </a>`)
                                            })
                                        res.render('auth/login', {
                                            email,
                                            conflictError
                                        });
                                    }
                                } else {
                                    console.log('Error!');
                                    const conflictError =
                                        'Thông tin đăng nhập của người dùng không hợp lệ.';
                                    res.render('auth/login', {
                                        email,
                                        password,
                                        conflictError,
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                const conflictError =
                                    'Có lỗi xảy ra khi đang đăng nhập!';
                                res.render('auth/login', {
                                    email,
                                    password,
                                    conflictError,
                                });
                            });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    const conflictError = 'Có lỗi xảy ra khi đang đăng nhập!';
                    res.render('auth/login', {
                        email,
                        password,
                        conflictError,
                    });
                });
        } else {
            const conflictError =
                'Thông tin đăng nhập của người dùng không hợp lệ.';
            console.log('Error!!!');
            res.render('auth/login', { email, password, conflictError });
        }
    }

    // GET /auth/logout
    logout(req, res) {
        req.session.destroy(() => {
            res.redirect('/auth/login');
        });
    }

    //[DELETE] /auth/:id/delete
    delete(req, res, next) {
        User.findOne({ _id: req.params.id })
            .then((user) => {
                return user.delete({ _id: user._id });
            })
            .then(() => {
                res.redirect('/me/trash/accounts');
            })
            .catch((error) => next(error));
    }
    //[PATCH] /auth/:id/restore
    restore(req, res, next) {
        User.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    //[DELETE] /auth/:id/force
    forceDelete(req, res, next) {
        User.findOneDeleted({ _id: req.params.id, deleted: true })
            .then((user) => {
                User.deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.redirect('back');
                    })
                    .catch(next);
            })
            .catch(next);
    }

    //[GET] /auth/edit
    edit(req, res, next) {
        User.findById(req.session.user._id)
            .then((user) =>
                res.render('auth/edit', {
                    user: mongooseToObject(user),
                }),
            )
            .catch(next);
    }
    //[PUT] /auth/:id
    update(req, res, next) {
        const formData = req.body;
        const userId = req.session.user._id;
        const userPass = formData.passwordOld;
        const newPass = formData.password;

        if (newPass) {
            User.findOne({ _id: userId })
                .then((user) => {
                    bcrypt.compare(userPass, user.password)
                        .then((result) => {
                            if (result === true) {
                                const BCRYPT_SALT_ROUND = 10;
                                bcrypt.hash(newPass, BCRYPT_SALT_ROUND)
                                    .then((hashed) => {
                                        User.updateOne(
                                            { _id: user._id },
                                            {
                                                name: formData.name,
                                                urlAvt: formData.urlAvt,
                                                password: hashed,
                                            },
                                        )
                                            .then(() => {
                                                res.redirect('/auth/edit');
                                            })
                                            .catch(next);
                                    });
                            } else {
                                console.log('Error!');
                                const conflictError =
                                    'Bạn đã Nhập sai mật khẩu hiện tại';
                                res.render('auth/edit', { conflictError });
                            }
                        })
                        .catch(() => {
                            console.log('Error!');
                            const conflictError =
                                'Có lỗi xảy ra!';
                            res.render('auth/edit', { conflictError });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    req.session.destroy(() => {
                        res.redirect('/auth/login');
                    });
                });
        } else {
            const conflictError =
                'Vui lòng nhập mật khẩu mới.';
            res.render('auth/edit', { conflictError });
            
        }
    }

    //[GET] /auth/
    getFormForget(req, res, next) {
        res.render('auth/password/email');
    }

    //
    sendResetLinkEmail(req, res, next) {
        if(!req.body.email) {
            res.redirect('/auth/password/reset')
        } else {
            User.findOne({email: req.body.email})
                .then((user) => {
                    if(!user) {
                        const conflictError = "Email này chưa tạo tài khoản!!"
                        res.redirect('/auth/password/reset?status=failed')
                    } else {
                        bcrypt.hash(user.email, parseInt(process.env.BCRYPT_SALT_ROUND))
                            .then((hashedEmail) => {
                                mailer.sendMail(user.email, "Reset password", 
                                `<a href="${process.env.APP_URL}/auth/password/reset/${user.email}?token=${hashedEmail}> Reset password </a>`)
                                console.log(`${process.env.APP_URL}/auth/password/reset/${user.email}?token=${hashedEmail}`)
                            })
                        res.redirect('/auth/password/reset?status=success')
                    }
                })
        }
    }

    //
    getFormReset(req, res, next) {
        if(!req.params.email || !req.query.token) {
            res.redirect('/auth/password/reset')
        } else {
            res.render('auth/password/reset', {
                email: req.params.email,
                token: req.query.token
            })
        }
    }

    //
    resetPass(req, res, next) {
        const {email, token, password} = req.body
        console.log(email, token, password);
        if(!email || !token || !password) {
            res.redirect('/auth/password/reset')
        } else {
            bcrypt.compare(email, token)
                .then((result) => {
                    if(result == true) {
                        bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
                        .then((hashedPassword) => {
                            User.resetPassword(email, hashedPassword)
                                .then(() => {
                                    const successMes = "Đã cập nhật lại mật khẩu!"
                                    res.render('auth/login', {
                                        successMes
                                    })
                                })
                                .catch(next)
                        })
                    } else {
                        res.redirect('/auth/password/reset');
                    }
                })
        }
    }



}

module.exports = new AuthController();
