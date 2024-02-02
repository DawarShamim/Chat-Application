
const Group = require('./Group'); // Import the Groups model
const User = require('./User'); // Import the Users model

const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group', // Reference for Foreign Key.
        required: true,
    },
    sent_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference for Foreign Key.
        required: true,
    },
    message_text: {
        type: String,
    },
    sent_at: {
        type: Date,
        default: Date.now,
    },
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

module.exports = GroupMessage;

