const { DataTypes } = require('sequelize');
const sequelize = require('../config/DBserver');
const User = require('./User'); // Import the User model

const UserPrivateConversations = sequelize.define('UserPrivateConversations', {
    conversation_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id_1: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id',
        },
    },
    user_id_2: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id',
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'UserPrivateConversations',
    timestamps: false,
});

module.exports = UserPrivateConversations;
