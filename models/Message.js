const UserPrivateConversations = require('./UserPrivateConversation'); // Import the PrivateConversations model
const User = require('./User'); // Import the User model
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPrivateConversations', // Reference for Foreign Key.
        required: true,
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference for Foreign Key.
        required: true,
    },
    sentTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference for Foreign Key.
        required: true,
    },
    messageText: {
        type: String,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
});

const Messages = mongoose.model('Messages', messageSchema);

module.exports = Messages;
