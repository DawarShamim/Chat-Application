const UserModel = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require("passport");
const { validationResult } = require("express-validator");
const conversationModel = require("../models/UserPrivateConversation");
const MessageModel = require("../models/Message");
const Messages = require("../models/Message");
const User = require("../models/User");
const mongoose = require('mongoose');

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
                user_id: newUser._id,
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
        const email = req.body?.Email;
        const password = req.body?.Password;
        let user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        let token = jwt.sign(
            {
                user_id: user._id,
                username: user.username,
                name: user.name,
                email: user.email
            },
            jwtKey
        );

        res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (err) {
        console.log("err", err);
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
                        { user_id_1: new mongoose.Types.ObjectId(userId) },
                        { user_id_2: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            }, {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "conversationId",
                    as: "messages"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id_1",
                    foreignField: "_id",
                    as: "user_id_1"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id_2",
                    foreignField: "_id",
                    as: "user_id_2"
                }
            },



        ]);

        return res.status(200).json({ success: true, conversations: conversations });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error retrieving conversations", error: err });
    }
};

exports.allMessages = async (req, res) => {
    const MAX_MESSAGES_TO_RECALL = 100;
    const userId = req.user.id;
    const conversationsId = req.params.conversationId;

    const page = req.params.page || 1;
    const skipMessages = (page - 1) * MAX_MESSAGES_TO_RECALL;
    try {
        const lastMessages = await Messages.find({
            conversationId: conversationsId
        })
            .sort({ sent_at: -1 })
            .skip(skipMessages)
            .limit(MAX_MESSAGES_TO_RECALL);
        const reversedMessages = lastMessages.reverse();

        return res.status(200).json({ success: true, messages: reversedMessages });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error retrieving conversations", error: err });
    }
};

exports.searchUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const UserKeyword = req.query?.q;


        const user = await UserModel.aggregate([

            {
                $match: { _id: new mongoose.Types.ObjectId(userId) } // Convert userId to ObjectId and match the user by _id
            },
            {
                $addFields: {
                    connections: { $map: { input: "$connections", as: "conn", in: { $toObjectId: "$$conn" } } } // Convert each connection to ObjectId
                }
            },
            {
                $unwind: "$connections" // Deconstruct the connections array to prepare for the lookup
            },
            {
                $lookup: {
                    from: "users", // Collection name where user data is stored
                    localField: "connections", // Field in the current collection (UserModel) to perform the lookup
                    foreignField: "_id", // Field in the foreign collection (users) to match against
                    as: "connectionUserData" // Output array field where the connected user data will be stored
                }
            }, {
                $unwind: "$connectionUserData",
            },
            {
                $project: {
                    "connectionUserData._id": 1,
                    "connectionUserData.username": 1,
                    "connectionUserData.email": 1,
                },
            },
        ]);

        return res.status(200).json({ success: true, friends: user, UserKeyword });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Error retrieving messages" });
    }
};