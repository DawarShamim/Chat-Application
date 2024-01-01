const { DataTypes } = require('sequelize');
const sequelize = require('../config/DBserver');
const User = require('./User'); // Import the User model

const Groups = sequelize.define('Groups', {
    group_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    group_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_by_user_id: {
        type: DataTypes.BIGINT,
        references: {
            model: User, // Reference for Foreign Key.
            key: 'user_id',
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Groups',
    timestamps: false,
});

module.exports = Groups;
