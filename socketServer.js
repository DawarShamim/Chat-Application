
require("dotenv").config();
const jwt = require("jsonwebtoken");
const MAX_MESSAGES_TO_RECALL = 100; // Define the maximum number of messages to recall

const User = require('./models/User.js');
const GroupMessages = require('./models/GroupMessage.js');
const Groups = require('./models/Group.js');
const Messages = require('./models/Message.js');
const UserPrivateConversations = require('./models/UserPrivateConversation.js');


module.exports = (socketIO) => {

    const connectedClients = {};

    socketIO.use((socket, next) => {
        // when testing with Postman
        if (socket.handshake.query && socket.handshake.query.token) {
            // if (socket.handshake.auth && socket.handshake.auth.token) {
            jwt.verify(socket.handshake.query.token, process.env.JwtEncryptionKey, (err, decoded) => {
                if (err) {
                    return next(new Error('Authentication error'));
                }
                console.log("decoded",decoded.username);
                socket.username = decoded.username;
                socket.userId = decoded.userId;
                next();
            });
        }
        else {
            console.log("access Denied");
            next(new Error('Authentication error'));
        }
    })

        .on('connection', (socket) => {
            connectedClients[socket.username] = socket.id;

            socket.on('chat', (msg) => {
                console.log("on chat", msg);
                socketIO.emit('Message', msg);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                delete connectedClients[socket.username];
            });

            socket.on('send-message', async (data) => {
                console.log("data", data);
                console.log("socket.userId", socket.userId);

                if (!data.conversationId) {
                    try {
                        const newConversation = new UserPrivateConversations({
                            user_id_1: data.toUser,
                            user_id_2: socket.userId,
                        });
                        const savedConversation = await newConversation.save();
                        data.conversationId = savedConversation._id;
                    } catch (error) {
                        console.error('Error creating conversation:', error);
                        return; // Exit if an error occurs while creating a conversation
                    }
                }

                try {
                    const message = new Messages({
                        conversationId: data.conversationId,
                        sender: socket.userId,
                        recipient: data.toUser,
                        messageText: data.message,
                    });
                    await message.save();

                    // Emit the message to the target user
                    if (connectedClients[data.toUser]) {
                        socketIO.to(connectedClients[data.toUser]).emit('receive-message', {
                            from: socket.username,
                            message: data.message,
                        });
                    } else {
                        console.log(`Target socket not found: ${data.toUser}`);
                    }
                } catch (error) {
                    console.error('Error saving message:', error);
                }

            });

        });
};