const newsRouter = require('./news');
const meRouter = require('./me');
const songsRouter = require('./songs');
const siteRouter = require('./site');
const authRouter = require('./auth');

function route(app) {
    app.use('/news', newsRouter);
    app.use('/me', meRouter);
    app.use('/songs', songsRouter);

    app.use('/', siteRouter);
    app.use('/auth', authRouter);
}
module.exports = route;
