const UserModel = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const { validationResult } = require("express-validator");
const conversationModel = require("../models/UserPrivateConversation");
const MessageModel = require("../models/Message");

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
            return res.status(422).json({
                success: false,
                message: "All fields are required",
                errors: errors.array(),
            });
        }

        const existingUser = await UserModel.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingUser) {
            return existingUser.username === username ?
                res.status(400).json({ success: false, message: 'Username already exists' }) :
                res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Create a new user entry in the database
        const newUser = new UserModel({
            username: username,
            email: email,
            password: password,
            name: name,
        });
        await newUser.save();

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
        let user = await UserModel.find({ username: username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);

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

exports.allConversations = async (req, res) => {
    const userId = req.user.id;
    try {
        const conversations = await conversationModel.aggregate([
            {
                $match: {
                    $or: [
                        { user_id_1: userId },
                        { user_id_2: userId }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'MessageModel', // Assuming the name of the Messages collection
                    let: { conversationId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$fromUserId', userId] },
                                        { $eq: ['$toUserId', userId] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { sent_at: -1 } // Sort by sent_at in descending order
                        },
                        {
                            $limit: 1 // Take only the latest message
                        }
                    ],
                    as: 'latestMessage'
                }
            },
            {
                $addFields: {
                    latestMessage: { $arrayElemAt: ['$latestMessage', 0] }
                }
            },
            {
                $project: {
                    user_id_1: 1,
                    user_id_2: 1,
                    created_at: 1,
                    latestMessage: {
                        _id: 1,
                        fromUserId: 1,
                        toUserId: 1,
                        message: 1,
                        sent_at: 1
                    }
                }
            }
        ]);

        return res.status(200).json({ success: true, conversations: conversations });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error retrieving conversations" });
    }
};
