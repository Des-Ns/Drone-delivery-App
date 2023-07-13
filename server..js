const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

const User = require('./utils/classes/User');
const Room = require('./utils/classes/Room');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = [];
const rooms = [new Room(0, 'owner', '/'), new Room(1, 'client', '/')]; // room objects
const sessionStore = new Map();

function generateSessionToken() {
  return uuidv4();
}

function getUserFromSessionToken(sessionToken) {
  return sessionStore.get(sessionToken);
}

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  let user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    const id = Math.floor(Math.random() * 3) + 1; // for test only
    user = new User(id, username, password);
    users.push(user);
  }

  const sessionToken = generateSessionToken();

  sessionStore.set(sessionToken, user); // use session token or user Id
  console.log(sessionStore);

  req.session.sessionToken = sessionToken; // Save the authenticated user details in the session

  return res.status(200).json({ success: true, username: user.username }); // Return success response
});

console.log(users);

// connect Client '/' nsp
io.of('/').on('connection', (socket) => {
  console.log(`New socet connection ${socket.id}`);
  console.log(socket.handshake);

  socket.emit('msg', `Welcome to nsp: "/" socket.id: ${socket.id} `);

  socket.on('joinRoom', (roomToJoin) => {
    socket.join(roomToJoin);
    console.log(`Joined ${roomToJoin} room`);

    io.to(`${roomToJoin}`).emit('roomJoined', `User joined ${roomToJoin} room.`);
  });

  socket.on('Room', (data) => console.log(data)); // 1234 or ABCD

  socket.on('order', (data) => {
    console.log(data);

    const { sessionToken } = socket.handshake;
    console.log(socket);
    const user = getUserFromSessionToken(sessionToken);

    if (user) {
      // Assign the newOrder object to the user
      user.order = newOrder;

      console.log(`New order assigned to user: ${user.username}`);
    } else {
      console.log('User not found');
    }
  }); // order object

  socket.on('disconnect', () => {
    io.emit('msg', 'User left');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
