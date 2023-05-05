const User = require('../models/User');
const Song = require('../models/Song');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { mongooseToObject } = require('../../util/mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
            User.findOneDeleted({email: email})
                .then((deletedUser) => {
                    if(deletedUser) {
                        const conflictError = 'Email này đang bị vô hiệu hóa!!';
                            res.render('auth/register', {
                                email,
                                password,
                                conflictError,
                            });
                    } else {
                        User.findOne({ email: email })
                            .then((existUser) => {
                                if (existUser) {
                                    const conflictError = 'Email này đã từng tạo tài khoản!!';
                                    res.render('auth/register', {
                                        email,
                                        password,
                                        conflictError,
                                    });
                                } else {
                                    const BCRYPT_SALT_ROUND = 10;
                                    bcrypt.hash(password, BCRYPT_SALT_ROUND).then((hashed) => {
                                        //Tạo người dùng mới
                                        const user = new User({
                                            name: name,
                                            email: email,
                                            urlAvt: urlAvt,
                                            password: hashed,
                                        });
                                        user.save()
                                            .then(() => {
                                                res.redirect('/auth/login');
                                            })
                                            .catch((error) => next(error));
                                    });
                
                                }
                            })
                            .catch((err) => {
                                console.log(err);  
                                const conflictError = err + 'Có lỗi xảy ra khi đang đăng ký!';
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
    // POST /auth/logging
    login(req, res) {
        const { email, password } = req.body;

        if (email && password) {
            User.findOne({ email: email })
                .then((user) => {
                    if (!user) {
                        const conflictError =
                                'Tài khoản của bạn đã bị vô hiệu hóa!!';
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
                                    req.session.loggedin = true;
                                    req.session.user = user;
                                    console.log('sucessfully!');
                                    res.redirect('/')
                                   
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
            const conflictError = 'Thông tin đăng nhập của người dùng không hợp lệ.';
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

    //[DELETE] /songs/:id/force
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

    google(req, res, next) {
        passport.authenticate('/google', { scope: ['profile', 'email'] }),
            function (req, res) {
                // Xử lý khi đăng nhập thành công
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1');
                res.redirect('http://localhost:3000/');
            };

        // Serialize and deserialize user
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });
    }
}

module.exports = new AuthController();
