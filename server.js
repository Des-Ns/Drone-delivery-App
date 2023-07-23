const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const { sessionMiddleware, userSessionStore } = require('./controlers/serverControler.js');

const User = require('./utils/classes/User.js');
// const Room = require('./utils/classes/Room.js');

const setupSockets = require('./sockets.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = [];

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
    // const id = Math.floor(Math.random() * 10) + 1; // for test only
    user = new User(username, password, sessionID);
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

setupSockets(io, users);
// module.exports = { users };

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
