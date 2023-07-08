const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const rooms = [
  { room: 'owner', privateRoom: false },
  { room: 'client', privateRoom: false },
];
console.log(rooms[0].room);

app.use(express.static(path.join(__dirname, 'public')));

// connect Client
io.on('connection', (socket) => {
  console.log('New socet connection');

  socket.on('joinRoom', (roomToJoin) => {
    console.log(roomToJoin);
    socket.join(roomToJoin);
    socket.emit(`${roomToJoin}`, `Joined ${roomToJoin} room.`);
  });

  socket.emit('msg', 'Welcome to nsp /');

  socket.on('disconnect', () => {
    io.emit('msg', 'User left');
  });

  socket.on('order', (data) => console.log(data));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
