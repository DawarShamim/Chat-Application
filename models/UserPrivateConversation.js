const mongoose = require('mongoose');

const userPrivateConversationsSchema = new mongoose.Schema({
    user_id_1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    user_id_2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const UserPrivateConversations = mongoose.model('UserPrivateConversations', userPrivateConversationsSchema);

module.exports = UserPrivateConversations;
