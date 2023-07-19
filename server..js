const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');

// const { v4: uuidv4 } = require('uuid');
const { sessionMiddleware, wrap, userSessionStore } = require('./controlers/serverControler.js');

const User = require('./utils/classes/User.js');
// const Room = require('./utils/classes/Room.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = [];
const orders = [];
const warehouses = [
  { coordX: '93', coordY: '140', id: 'W-11' },
  { coordX: '186', coordY: '140', id: 'W-12' },
];
// const rooms = [new Room(0, 'owner', '/'), new Room(1, 'client', '/')];

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const { sessionID } = req;
  let user = users.find((user) => user.username === username && user.password === password);

  if (user) {
    user.sessionIDs.push(sessionID);
  } else {
    const id = Math.floor(Math.random() * 10) + 1; // for test only
    user = new User(id, username, password, sessionID);
    users.push(user);
  }

  userSessionStore.set(sessionID, user);
  req.session.sessionID = sessionID; // Save the authenticated user details in the session

  res.cookie('connect.sid', sessionID); // set sessionID in cookie
  return res.status(200).json({ success: true, username: user.username }); // Return success response
});

app.post('/logout', async (req, res) => {
  const sessionID = req.session.id;
  const user = users.find((user) => user.sessionIDs.includes(sessionID));
  console.log('48::', user, 'sessinoID:', sessionID, 'req.session', req.session);

  req.session.destroy(() => {
    io.in(sessionID).disconnectSockets();
    res.status(204).end();
  });

  if (user && user.sessionIDs.length > 0) {
    user.sessionIDs.splice(sessionID, 1);
  }

  if (user && user.sessionIDs.length === 0 && user.socketIDs.length > 0) {
    user.socketIDs = [];
  }

  res.status(204).end();
});

io.use(wrap(sessionMiddleware));

io.of('/').on('connection', (socket) => {
  console.log('59', `New socet connection ${socket.id}, sessinID:: ${socket.request.sessionID}`);
  const { sessionID } = socket.request;
  const user = users.find((user) => user.sessionIDs.includes(sessionID));

  if (user.socketIDs) {
    user.socketIDs.push(socket.id);
  }

  socket.emit('msg', `Welcome to nsp: "/" socket.id: ${socket.id} `);

  socket.on('joinRoom', (roomToJoin) => {
    socket.join(roomToJoin);
    console.log('65::', `Joined ${roomToJoin} room`);

    if (roomToJoin === 'owner') {
      socket.emit('warehouse-list', warehouses);
    }

    io.to(`${roomToJoin}`).emit('roomJoined', `User joined ${roomToJoin} room.`);
  });

  socket.on('add-warehouse', (newWarehouse) => {
    console.log('88::', newWarehouse);
    warehouses.push(newWarehouse);
    io.to('owner').emit('warehouse-list', warehouses);
  });

  socket.on('order', (order) => {
    if (user) {
      user.addOrder(order);
      orders.push(order);
      console.log(`New order assigned to user: ${user.username}, user Id: ${user.id}`);

      socket.to(socket.id).emit('order-msg', 'Order received.');
      user.socketIDs.forEach((socketId) => {
        io.to(socketId).emit('order-msg', 'Order received.');
      });
    } else {
      console.log('User not found');
      socket.to(socket.id).emit('order-msg', 'Order denied.');
    }
  });

  socket.on('disconnect', () => {
    const disconnectedSocketId = socket.id;
    const disconnectedSocketIndex = user.socketIDs.indexOf(disconnectedSocketId);
    user.socketIDs.splice(disconnectedSocketIndex, 1);

    io.emit('msg', 'User left');
  });
});

module.exports = {
  users,
  orders,
  warehouses,
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
