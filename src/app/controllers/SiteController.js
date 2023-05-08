const Song = require('../models/Song');
const { mutipleMongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongoose');
const session = require('express-session');
const User = require('../models/User');

class SiteController {
    //[GET] /
    index(req, res) {
        const user = req.session.user;
        Song.find({})
            .then((songs) => {
                res.render('root', {
                    songs: mutipleMongooseToObject(songs),
                    user: user,
                });
            })
            .catch((err) => {
                res.status(400).json({ error: 'SiteERROR..!!!' });
            });
    }
    //[GET] /search
    search(req, res) {
        const query = req.query.q;
        Song.find({
            $or: [
                { songName: { $regex: query, $options: 'i' } },
                { singerName: { $regex: query, $options: 'i' } },
            ],
        })
            .then((songs) => {
                // console.log(songs)
                res.render('search', {
                    songs: mutipleMongooseToObject(songs),
                });
            })
            .catch((err) => {
                res.status(400).json({ error: 'ERROR..!!!' });
            });
    }
}

module.exports = new SiteController();
