const { DataTypes } = require('sequelize');
const sequelize = require('../config/DBserver');
const UserPrivateConversations = require('./UserPrivateConversations'); // Import the PrivateConversations model
const User = require('./User'); // Import the User model

const Messages = sequelize.define('Messages', {
    message_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    conversation_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: UserPrivateConversations, // Reference for Foreign Key.
            key: 'conversation_id',
        },
    },
    sent_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User, // Reference for Foreign Key.
            key: 'user_id',
        },
    },
    sent_to: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User, // Reference for Foreign Key.
            key: 'user_id',
        },
    },
    message_text: {
        type: DataTypes.TEXT,
    },
    sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Messages',
    timestamps: false,
});

module.exports = Messages;
