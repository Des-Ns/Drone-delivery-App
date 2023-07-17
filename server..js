const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const { sessionMiddleware, wrap, userSessionStore } = require('./controlers/serverControler');

const User = require('./utils/classes/User');
const Room = require('./utils/classes/Room');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = [];
const connectedUsesrs = {};
const rooms = [new Room(0, 'owner', '/'), new Room(1, 'client', '/')];

function generateSessionToken() {
  return uuidv4();
}

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sessionToken = generateSessionToken();
  let user = users.find((user) => user.username === username && user.password === password);

  if (user) {
    user.sessionTokens.push(sessionToken);
  } else {
    const id = Math.floor(Math.random() * 5) + 1; // for test only
    user = new User(id, username, password, sessionToken);
    users.push(user);
  }

  userSessionStore.set(sessionToken, user); // use session token or user Id
  console.log('44-userSessionStore::', userSessionStore);

  req.session.sessionToken = sessionToken; // Save the authenticated user details in the session
  console.log('47-session::', req.session, req.sessionID);

  res.cookie('connect.sid', sessionToken); // set session token in cookie
  console.log('50-users[]::', users);

  return res.status(200).json({ success: true, username: user.username }); // Return success response
});

io.use(wrap(sessionMiddleware));

// connect Client '/' nsp
io.of('/').on('connection', (socket) => {
  console.log('59', `New socet connection ${socket.id}, ${socket.request.sessionID}`);
  const { sessionToken } = socket.request.session;
  let user = users.find((user) => user.sessionTokens.includes(sessionToken));
  user.socketIds.push(socket.id);
  console.log('63-user::', user);

  socket.emit('msg', `Welcome to nsp: "/" socket.id: ${socket.id} `);

  socket.on('joinRoom', (roomToJoin) => {
    socket.join(roomToJoin);
    console.log('65::', `Joined ${roomToJoin} room`);

    io.to(`${roomToJoin}`).emit('roomJoined', `User joined ${roomToJoin} room.`);
  });

  socket.on('order', (order) => {
    console.log('71-userSessionStore::', userSessionStore);

    const { sessionToken } = socket.request.session;
    user = users.find((user) => user.sessionTokens.includes(sessionToken));

    console.log('77-users::', users);
    console.log('78-user::', user);
    if (user) {
      user.addOrder(order);

      console.log('87-user.orders::', user.orders);
      console.log(`New order assigned to user: ${user.username}, Id: ${user.id}`);
      socket.to(socket.id).emit('order-msg', 'Order received.');
      user.socketIds.forEach((socketId) => {
        io.to(socketId).emit('order-msg', 'Order received.');
      });
    } else {
      console.log('User not found');
      socket.to(socket.id).emit('order-msg', 'Order denied.');
    }
  });

  socket.on('disconnect', () => {
    const disconnectedSocketId = socket.id;
    user.socketIds.console.log('103::', disconnectedUser);
    io.emit('msg', 'User left');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
