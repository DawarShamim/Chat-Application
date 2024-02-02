
require("dotenv").config();
const jwt = require("jsonwebtoken");
const MAX_MESSAGES_TO_RECALL = 100; // Define the maximum number of messages to recall




const User = require('./models/User.js');
const GroupMessages = require('./models/GroupMessage.js');
const Groups = require('./models/Group.js');
const Messages = require('./models/Message.js');
const UserPrivateConversations = require('./models/UserPrivateConversation.js');

const socketServer = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    const connectedClients = {}; // This object will store socketId for each connected client

    io.use(function (socket, next) {
        // when testing with Postman
        if (socket.handshake.query && socket.handshake.query.token) {
            // if (socket.handshake.auth && socket.handshake.auth.token) {
            jwt.verify(socket.handshake.query.token, process.env.JwtEncryptionKey, function (err, decoded) {
                if (err) {
                    return next(new Error('Authentication error'));
                }
                socket.decoded = decoded.username;
                next();
            });
        }
        else {
            console.log("access Denied");
            next(new Error('Authentication error'));
        }
    })

        .on('connection', (socket) => {
            connectedClients[socket.decoded] = socket.id;

            socket.on('chat', (msg) => {
                console.log("on chat", msg);
                io.emit('Message', msg);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                delete connectedClients[socket.decoded];
            });

            socket.on('private-message', async (data) => {
                const targetSocketId = data.targetSocketId;

                if (connectedClients[targetSocketId]) {
                    try {
                        // Save the message to the database
                        const message = new Messages({
                            conversationId: data.conversationId,
                            fromUserId: socket.decoded.userId,
                            toUserId: data.toUserId, // Assuming you have the toUserId in the data
                            message: data.message,
                        });
                        await message.save();

                        // Emit the message to the target user
                        io.to(connectedClients[targetSocketId]).emit('private-message', {
                            from: socket.decoded,
                            message: data.message,
                        });
                    } catch (error) {
                        console.error('Error saving message:', error);
                    }
                } else {
                    console.log(`Target socket not found: ${targetSocketId}`);
                }
            });

            socket.on('last-messages', async (data) => {
                console.log("socket.id", socket.id);
                console.log("data.conversationId", data.conversationId);

                const page = data.page || 1;
                const skipMessages = (page - 1) * MAX_MESSAGES_TO_RECALL;
                try {
                    const lastMessages = await Messages.find({
                        conversationId: conversationId
                    })
                        .sort({ sent_at: -1 })
                        .skip(skipMessages)
                        .limit(PAGE_SIZE);

                    // Reverse the order to have the messages in ascending order
                    const reversedMessages = lastMessages.reverse();

                    // Emit the last 100 messages to the target user if connected
                    if (connectedClients[data.toUserId]) {
                        io.to(connectedClients[data.toUserId]).emit('recall-messages', {
                            messages: reversedMessages,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching or emitting messages:', error);
                }
            });
        });
};

module.exports = {
    socketServer
};