const { DataTypes } = require('sequelize');
const sequelize = require('../config/DBserver');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        set(value) {
            // Hash the password before saving
            const hashedPassword = bcrypt.hashSync(value, 10);
            this.setDataValue('password', hashedPassword);
        },
    },
    name: {
        type: DataTypes.STRING(255),
    },
    profile_picture: {
        type: DataTypes.STRING(255), // Assuming you store the URL of the profile picture
        defaultValue: 'default_profile_picture_url.jpg', // Set a default if needed
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
}, {
    tableName: 'User',
    timestamps: false,
});

module.exports = User;
