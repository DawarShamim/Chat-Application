const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); // Add this

require("dotenv").config();
app.use(cors()); // Add cors middleware

const server = http.createServer(app); // Add this

const ChatroomController = require('./Controllers/Chatroom');
const leaveRoom = require('./utils/leave-room'); // Add this

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});




io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);
  
    // Handle private messages
    socket.on('join_room', (data) => {
      const { username, room } = data; // Data sent from client when join_room event emitted
      socket.join(room); // Join the user to a socket room
  
      ChatroomController.getSpecificMessages(room)
        .then((last100Messages) => {
          // console.log('latest messages', last100Messages);
          socket.emit('last_100_messages', last100Messages);
        })
        .catch((err) => console.log(err));
  
      // Add this
      let __createdtime__ = Date.now(); // Current timestamp
      // Send message to all users currently in the room, apart from the user that just joined
      socket.to(room).emit('receive_message', {
        message: `${username} has joined the chat room`,
        username: CHAT_BOT,
        __createdtime__,
      })
      socket.emit('receive_message', {
        message: `Welcome ${username}`,
        username: "CHAT_BOT",
        __createdtime__,
      });
  
      chatRoom = room;
      allUsers.push({ id: socket.id, username, room });
      chatRoomUsers = allUsers.filter((user) => user.room === room);
      socket.to(room).emit('chatroom_users', chatRoomUsers);
      socket.emit('chatroom_users', chatRoomUsers);
  
  
      socket.on('send_message', (data) => {
        console.log("data", data);
        const room = data?.room;
  
        io.in(room).emit('receive_message', data); // Send to all users in room, including sender
        ChatroomController.saveMessage(data) // Save message in db
          .then((response) => console.log(response))
          .catch((err) => console.log(err));
      });
  
  
      socket.on('leave_room', (data) => {
        const { username, room } = data;
        socket.leave(room);
        const __createdtime__ = Date.now();
        // Remove user from memory
        allUsers = leaveRoom(socket.id, allUsers);
        socket.to(room).emit('chatroom_users', allUsers);
        socket.to(room).emit('receive_message', {
          username: CHAT_BOT,
          message: `${username} has left the chat`,
          __createdtime__,
        });
        console.log(`${username} has left the chat`);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected from the chat');
        const user = allUsers.find((user) => user.id == socket.id);
        if (user?.username) {
          allUsers = leaveRoom(socket.id, allUsers);
          socket.to(chatRoom).emit('chatroom_users', allUsers);
          socket.to(chatRoom).emit('receive_message', {
            message: `${user.username} has disconnected from the chat.`,
          });
        }
      });
  
    });
  
  });
