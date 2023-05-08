const Song = require('../models/Song');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const User = require('../models/User');

class MeController {
    //[GET] /me/stored/songs
    storedSongs(req, res, next) {
        if (req.session.user && req.session.user.isAdmin == false) {
            Song.find({ createdBy: req.session.user._id })
                .then((songs) =>
                    res.render('me/stored-songs', {
                        songs: mutipleMongooseToObject(songs),
                        user: req.session.user,
                    }),
                )
                .catch(next);
        } else {
            Song.find({})
                .then((songs) =>
                    res.render('me/stored-songs', {
                        songs: mutipleMongooseToObject(songs),
                        user: req.session.user,
                    }),
                )
                .catch(next);
        }
    }

    //[GET] /me/trash/songs
    trashSongs(req, res, next) {
        if (req.session.user && req.session.user.isAdmin == false) {
            Song.findDeleted({ deletedBy: req.session.user._id })
                .then((songs) =>
                    res.render('me/trash-songs', {
                        songs: mutipleMongooseToObject(songs),
                        user: req.session.user,
                    }),
                )
                .catch(next);
        } else {
            Song.findDeleted({})
                .then((songs) =>
                    res.render('me/trash-songs', {
                        songs: mutipleMongooseToObject(songs),
                        user: req.session.user,
                    }),
                )
                .catch(next);
        }
    }

    //[GET] /me/stored/accounts
    storedAccounts(req, res, next) {
        User.find({})
            .then((users) =>
                res.render('me/stored-accounts', {
                    users: mutipleMongooseToObject(users),
                    user: req.session.user,
                }),
            )
            .catch(next);
    }

    //[GET] /me/trash/accounts
    trashAccounts(req, res, next) {
        User.findDeleted({})
            .then((users) =>
                res.render('me/trash-accounts', {
                    users: mutipleMongooseToObject(users),
                    user: req.session.user,
                }),
            )
            .catch(next);
    }
}

module.exports = new MeController();
