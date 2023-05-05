const Song = require('../models/Song');
const { mongooseToObject } = require('../../util/mongoose');
const { default: mongoose } = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

const uploadMultiple = upload.fields([
    { name: 'urlImg', maxCount: 1 },
    { name: 'urlSong', maxCount: 1 },
]);

class SongController {
    //[GET] /songs/:slug
    show(req, res, next) {
        Song.findOne({ slug: req.params.slug })
            .then((song) => {
                res.render('songs/show', {
                    song: mongooseToObject(song),
                    user: req.session.user
                });
            })
            .catch(next);

        // res.send('Song detail - ' + req.params.slug)
    }

    //[GET] /songs/create
    create(req, res, next) {
        res.render('songs/create', {
            user: req.session.user
        });
    }

    //[POST] /songs/store
    store(req, res, next) {
        uploadMultiple(req, res, (err) => {
            console.log(req.files);
            if (err) {
                return next(err);
            }
            const formData = req.body;
            const urlImg = req.files['urlImg']
                ? '/uploads/' + req.files['urlImg'][0].filename
                : null; // Lấy đường dẫn file ảnh đã được upload
            const urlSong = req.files['urlSong']
                ? '/uploads/' + req.files['urlSong'][0].filename
                : null; // Lấy đường dẫn file nhạc đã được upload
            const song = new Song({
                songName: formData.songName,
                urlImg: urlImg,
                urlSong: urlSong,
                singerName: formData.singerName,
                genre: formData.genre,
                createdBy: req.session.user._id,
                userName: req.session.user.name,
            });
            song.save()
                .then(() => {
                    res.redirect('http://localhost:3000/me/stored/songs');
                })
                .catch((error) => next(error));
        });
    }

    //[GET] /songs/:id/edit
    edit(req, res, next) {
        Song.findById(req.params.id)
            .then((song) =>
                res.render('songs/edit', {
                    song: mongooseToObject(song),
                    user: req.session.user
                }),
            )
            .catch(next);
    }

    //[PUT] /songs/:id
    update(req, res, next) {
        const formData = req.body;
        const songId = req.params.id;
        Song.findById(songId)
            .then((song) => {
                if (!song) {
                    const error = new Error('Song not found');
                    error.statusCode = 404;
                    throw error;
                }
                const oldSongPath =
                    '/SelfLearning-Web/Learn/MTMusic/src/public' + song.urlSong;
                const oldImagePath =
                    '/SelfLearning-Web/Learn/MTMusic/src/public' + song.urlImg;
                uploadMultiple(req, res, (err) => {
                    if (err) {
                        return next(err);
                    }

                    const formData = req.body;
                    const urlImg = req.files['urlImg']
                        ? '/uploads/' + req.files['urlImg'][0].filename
                        : song.urlImg;
                    const urlSong = req.files['urlSong']
                        ? '/uploads/' + req.files['urlSong'][0].filename
                        : song.urlSong;

                    Song.updateOne(
                        { _id: songId },
                        {
                            songName: formData.songName || song.songName,
                            urlImg: urlImg,
                            urlSong: urlSong,
                            singerName: formData.singerName || song.singerName,
                            genre: formData.genre || song.genre,
                        },
                    )
                        .then(() => {
                            if (oldSongPath !== urlSong && oldSongPath) {
                                fs.unlink(oldSongPath, (err) => {
                                    if (err) {
                                        console.error(
                                            `Error deleting old song file: ${err}`,
                                        );
                                    } else {
                                        console.log(
                                            `Old song file deleted: ${oldSongPath}`,
                                        );
                                    }
                                });
                            }

                            if (oldImagePath !== urlImg && oldImagePath) {
                                fs.unlink(oldImagePath, (err) => {
                                    if (err) {
                                        console.error(
                                            `Error deleting old image file: ${err}`,
                                        );
                                    } else {
                                        console.log(
                                            `Old image file deleted: ${oldImagePath}`,
                                        );
                                    }
                                });
                            }

                            res.redirect(`/me/stored/songs`);
                        })
                        .catch(next);
                });
            })
            .catch(next);
    }

    //[DELETE] /songs/:id/soft
    delete(req, res, next) {
        Song.findOne({ _id: req.params.id })
            .then((song) => {
                if (!song) {
                    throw new Error('Song not found');
                }
                song.deletedBy = req.session.user._id;
                return song.save();
            })
            .then((song) => {
                return Song.delete({ _id: song._id });
            })
            .then(() => {
                res.redirect('http://localhost:3000/me/stored/songs');
            })
            .catch((error) => next(error));
    }

    

    //[DELETE] /songs/:id/force
    forceDelete(req, res, next) {
        Song.findOneDeleted({ _id: req.params.id, deleted: true })
            .then((song) => {
                console.log(song);
                if (!song) {
                    const error = new Error('Song not found');
                    error.statusCode = 404;
                    throw error;
                }
                const songPath =
                    '/SelfLearning-Web/Learn/MTMusic/src/public' + song.urlSong;
                const imagePath =
                    '/SelfLearning-Web/Learn/MTMusic/src/public' + song.urlImg;
                // console.log(songPath, imagePath, song.urlImg, song.urlSong)
                Song.deleteOne({ _id: req.params.id })
                    .then(() => {
                        if (songPath) {
                            fs.unlink(songPath, (err) => {
                                if (err) {
                                    console.error(
                                        `Error deleting song file: ${err}`,
                                    );
                                } else {
                                    console.log(
                                        `Song file deleted: ${songPath}`,
                                    );
                                }
                            });
                        }

                        if (imagePath) {
                            fs.unlink(imagePath, (err) => {
                                if (err) {
                                    console.error(
                                        `Error deleting image file: ${err}`,
                                    );
                                } else {
                                    console.log(
                                        `Image file deleted: ${imagePath}`,
                                    );
                                }
                            });
                        }

                        res.redirect('back');
                    })
                    .catch(next);
            })
            .catch(next);
    }

    //[PATCH] /songs/:id/restore
    restore(req, res, next) {
        Song.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }

    // //[GET] /api/songs/:id
    // lookSong(req, res, next) {
    //     const songId = req.params.songId;
    //     const song = Song.find((song) => song.id === songId);
    //     if (song) {
    //         res.status(200).json(song);
    //     } else {
    //         res.status(404).json({ message: 'Song not found' });
    //     }
    // }
}

module.exports = new SongController();
