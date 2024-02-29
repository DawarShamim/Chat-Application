const UserModel = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const { validationResult } = require("express-validator");
const { Op } = require('sequelize');


require("dotenv").config();
const jwtKey = process.env.jwtEncryptionKey;

exports.register = async (req, res, next) => {

    try {
        const username = req.body?.Username;
        const email = req.body?.Email;
        const password = req.body?.Password;
        const confirmPassword = req.body?.ConfirmPassword;
        const name = req.body?.Name;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                errors: errors.array(),
            });
        }

        // Check if the username or email already exists
        const existingUser = await UserModel.findOne({
            where: {
                [Op.or]: [{ username: username }, { email: email }],
            },
        });

        if (existingUser) {
            return existingUser.dataValues.username === username ?
                res.status(400).json({ success: false, message: 'Username already exists' }) :
                res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Create a new user entry in the database
        const newUser = await UserModel.create({
            username: username,
            email: email,
            password: password,
            name: name,
        });

        // Generate JWT token for the new user
        const token = jwt.sign(
            {
                user_id: newUser.user_id,
                username: newUser.username,
                name: newUser.name,
                email: newUser.email
            },
            jwtKey
        );

        res.status(200).json({ success: true, message: 'Registration successful', token });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to register', error: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const username = req.body?.Username;
        const password = req.body?.Password;
        let user = await UserModel.findOne({ where: { username: username } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.dataValues.password);
        // const passwordMatch = (password === user.Password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
        let token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                name: user.name,
                email: user.email
            },
            jwtKey
        );

        res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to login', error: err.message });
    }
};



exports.getAll = async (req, res) => {
    try {
        console.log("api called");
        let user = await UserModel.findAll();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'Login successful' ,user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to login', error: err.message });
    }
}
