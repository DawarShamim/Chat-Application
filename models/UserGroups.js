const { DataTypes } = require('sequelize');
const sequelize = require('../config/DBserver');
const User = require('./User'); // Import the User model
const Groups = require('./Groups'); // Import the Groups model

const UserGroups = sequelize.define('UserGroups', {
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User, // Reference for Foreign Key.  
            key: 'user_id',
        },
    },
    group_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Groups, // Reference for Foreign Key.
            key: 'group_id',
        },
    },
}, {
    tableName: 'UserGroups',
    timestamps: false,
    primaryKey: true, // Define the composite primary key
});

module.exports = UserGroups;
