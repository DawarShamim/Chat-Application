
require("dotenv").config();
const jwt = require("jsonwebtoken");

const socketServer = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    const connectedClients = {}; // This object will store socketId for each connected client

    io.use(function (socket, next) {
        //set middleware for socket server here before establishing connection.

        // when testing with Postman
        // if (socket.handshake.query && socket.handshake.query.token) {

        if (socket.handshake.auth && socket.handshake.auth.token) {
            jwt.verify(socket.handshake.query.token, process.env.JwtEncryptionKey, function (err, decoded) {
                if (err) { 
                    return next(new Error('Authentication error')); }
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
                console.log("msg", msg);
                io.emit('Message', msg);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                delete connectedClients[socket.decoded];
            });

            socket.on('private-message', (data) => {
                const targetSocketId = data.targetSocketId;

                if (connectedClients[targetSocketId]) {
                    // Send a private message to the specified client if the User is connected
                    io.to(connectedClients[targetSocketId]).emit('private-message', {
                        from: socket.decoded, 
                        message: data.message
                    });
                } else {
                    console.log(`Target socket not found: ${targetSocketId}`);
                }
            });
        });
};

module.exports = {
    socketServer
};