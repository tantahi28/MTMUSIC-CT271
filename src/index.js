const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const plyr = require('plyr');
const app = express();
const port = 3000;

// Cấu hình session
app.use(
    session({
        secret: 'my-secret-key',
        resave: false,
        saveUninitialized: true,
    }),
);

// Cấu hình PassportJS
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//         API
const Song = require('./app/models/Song');

//[GET] /api/songs/:id
app.get('/api/songs/id/:songId', (req, res) => {
    const songId = req.params.songId;
    Song.findOne({ _id: songId })
        .then((song) => {
            if (song) {
                res.status(200).json(song);
            } else {
                res.status(404).json({ message: 'Song not found' });
            }
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
});
app.get('/api/songs/genre/:songGenre', (req, res) => {
    const songGenre = req.params.songGenre;
    Song.find({ genre: songGenre })
        .then((songs) => {
            if (songs.length > 0) {
                res.status(200).json(songs);
            } else {
                res.status(404).json({ message: 'Songs not found' });
            }
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
});

const route = require('./routes');
const db = require('./config/db');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

// HTTP logger
app.use(morgan('combined'));

//Template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
        },
    }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
});

// Connect to DB
db.connect();

//Routes init
route(app);
