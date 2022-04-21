'use strict';

const express = require('express');
const http=require('http');
const path=require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generatedLocationMessage } = require('./utils/messages');
const {getUser,getUsersInRoom,removeUser,addUser}=require('./utils/users');




const app=express();
const server=http.createServer(app);//we create this because in socket.io we have to provide the server by our side but in case of express it will be created automatically
const io=socketio(server);


const port=process.env.PORT || 3000;
const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));

// let count=0;

io.on('connection',(socket)=>{//connection is the event which is going to run every time when a new connection is connected to our server
    // console.log('New WebSocket Connection');

    
    socket.on('join', ({ username, room },callback) => {
       
        const { error, user } = addUser({ id: socket.id, username, room },callback);
        if (error)
        {
            return callback(error);
        }
        socket.join(user.room);

       

        socket.emit('message', generateMessage('Admin',"Welcome!"));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined `));// this broadcasts message to every user in the server except the joined user
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users:getUsersInRoom(user.room)
        })

        callback();
        
    })

    socket.on('recievedMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();


        if (filter.isProfane(message))
            return callback('Bad Language is not allowed');
        io.to(user.room).emit('message', generateMessage(user.username,message));
        callback();
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generatedLocationMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`) );
        callback('Location was shared');
    })
    // this is a inbuilt event in the socket library so we don't need to emit it, it is same like the io.on(connection)

    socket.on('disconnect', () => {

        const user = removeUser(socket.id);
        if (user)
        {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})




server.listen(port,()=>{
    // console.log('Server is running in port '+port);
});