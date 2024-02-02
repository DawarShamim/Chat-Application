const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    group_name: {
        type: String,
        required: true,
    },
    created_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference for Foreign Key.
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
