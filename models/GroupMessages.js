const { DataTypes } = require('sequelize');
const sequelize = require('../config/DBserver');
const Groups = require('./Groups'); // Import the Groups model
const User = require('./User'); // Import the Users model

const GroupMessages = sequelize.define('GroupMessages', {
    group_message_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    group_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Groups, // Reference for Foreign Key.
            key: 'group_id',
        },
    },
    user_id: {
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
    tableName: 'GroupMessages',
    timestamps: false,
});

module.exports = GroupMessages;
