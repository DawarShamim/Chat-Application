const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Group = require('./Group');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String, required: true, lowercase: true, validate: {
            validator: function (value) {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                return emailRegex.test(value);
            },
            message: props => `${props.value} is not a valid email address!`,
        },
    },
    password: { type: String, required: true },
    connections: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    user_groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    profileimgurl: { type: String, default: "/public/default_profile_pic.jpg" },
    statusOnline: { type: Boolean, default: false },
    socket_id: { type: String }
}, {
    tableName: 'User',
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) {
        return next();
    }

    const passwordRegex = /^(?=(.*\d){1,})(?=(.*\W){1,})(?!.*\s).{8,20}$/;
    if (!passwordRegex.test(this.password)) {
        const error = new Error('Password contain one lowercase letter, one uppercase letter, one numeric character and one special');
        return next(error);
    }

    try {
        const hashedpassword = await bcrypt.hash(this.password, 10);

        this.password = hashedpassword;
        next();
    } catch (error) {
        next(error);
    }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
