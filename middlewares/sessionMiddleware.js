const session = require('express-session');

const userSessionStore = new Map(); // session user data

const sessionMiddleware = session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new session.MemoryStore(), // session data
});

const wrap = (expressMiddleware) => (socket, next) => expressMiddleware(socket.request, {}, next);

module.exports = { sessionMiddleware, wrap, userSessionStore };
