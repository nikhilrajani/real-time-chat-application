const path = require('path');
const http=require('http');
const express = require('express');
const socket=require('socket.io');
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser,deleteUser,getRoomList}=require('./utils/users');
const {createRoom, getRoom}=require('./utils/rooms');

const app = express();
const server=http.createServer(app);
const io=socket(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName='Real-Time-Chat App';

//Run when a client connects
io.on('connection',socket =>{
    socket.on('joinRoom', ({username,room})=>{
        const user=userJoin(socket.id,username,room);

        socket.join(user.room);
        //Welcome new user
        socket.emit('message', formatMessage(botName,'Welcome to a Real Time Chat Application'));
    
        //Broadcast to others when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomList(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg)=>{
        const user=getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    //When client disconnects
    socket.on('disconnect', ()=>{
        const user=deleteUser(socket.id);

        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomList(user.room)
        });
        }
    });
});

const PORT=3000||process.env.PORT;

server.listen(PORT, ()=> console.log(`Server Running on port : ${PORT}`));