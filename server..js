const express = require('express');
const app = express();
const path = require('path');
const socketio = require('socket.io');

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
