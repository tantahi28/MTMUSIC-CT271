const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        urlAvt: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        emailVerifiedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

//Add plugin
UserSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

UserSchema.statics.verify = async function (email) {
    const user = await this.findOneAndUpdate(
        { email: email },
        { emailVerifiedAt: new Date() },
        { new: true }
    );
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

UserSchema.statics.resetPassword =  async function(email, password, callback) {
    const user = await this.findOneAndUpdate(
        { email: email },
        { password: password },
        { new: true }
    );
    if (!user) {
        throw new Error('User not found');
    }
    return user;
  };
  

module.exports = mongoose.model('User', UserSchema);
