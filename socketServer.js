
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
        // if (socket.handshake.query && socket.handshake.query.token) {
            if (socket.handshake.auth && socket.handshake.auth.token) {
            jwt.verify(socket.handshake.auth.token, process.env.JwtEncryptionKey, (err, decoded) => {
                if (err) {
                    return next(new Error('Authentication error'));
                }
                socket.username = decoded.username;
                socket.userId = decoded.user_id;
                next();
            });
        }
        else {
            console.log("access Denied");
            next(new Error('Authentication error'));
        }
    })

        .on('connection', async(socket) => {
            connectedClients[socket.userId] = socket.id;
            console.log("user connected", socket.userId);
            await User.findByIdAndUpdate(socket.userId,{statusOnline:true});

            socket.on('chat', (msg) => {
                console.log("on chat", msg);
                socketIO.emit('Message', msg);
            });

            socket.on('disconnect', async() => {
                console.log(`User disconnected: ${socket.id}`);
                await User.findByIdAndUpdate(socket.userId,{statusOnline:false});

                delete connectedClients[socket.userId];
            });

            socket.on('send-message', async (data) => {
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
                        return;
                    }
                }

                try {
                    const message = new Messages({
                        conversationId: data.conversationId,
                        sender: socket.userId,
                        recipient: data.toUser,
                        body: data.body,
                    });
                    await message.save();

                    const sendTo = await User.findById(data.toUser);
                    console.log("sendTo",sendTo);

                    if (sendTo && sendTo?.socket_id) {
                        socketIO.to(connectedClients[data.toUser]).emit('receive-message', {
                            conversationId: data.conversationId,
                            from: socket.userId,
                            body: data.body,
                        });
                    } else {
                        console.log(`Target socket not found: ${data.toUser}`);
                    }
                } catch (error) {
                    console.error('Error saving message:', error);
                }
            });

            socket.on('emit-typing', async (data) => {
                if (!data.conversationId) {
                    return;
                }
                try {
                    // Emit the message to the target user
                    if (connectedClients[data.toUser]) {
                        socketIO.to(connectedClients[data.toUser]).emit('listen-typing', {
                            conversationId: data.conversationId,
                            from: socket.userId,
                            typing: true
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