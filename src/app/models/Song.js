const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
// const { MongoGridFS } = require('gridfs-stream');

const Schema = mongoose.Schema;

const SongSchema = new Schema(
    {
        _id: { type: Number },
        songName: { type: String },
        urlImg: { type: String, maxLength: 600 },
        urlSong: { type: String },
        singerName: { type: String },
        genre: { type: String },
        slug: { type: String, slug: 'songName' },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        userName: { type: String },
    },
    {
        _id: false,
        timestamps: true,
    },
);

// Add plugins
mongoose.plugin(slug);

SongSchema.plugin(AutoIncrement);
SongSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Song', SongSchema);
