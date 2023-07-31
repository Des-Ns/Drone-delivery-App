const { v4: uuidv4 } = require('uuid');

class User {
  constructor(username, password, sessionID) {
    this.id = uuidv4();
    this.username = username;
    this.password = password;
    this.orders = [];
    this.sessionIDs = [sessionID];
    this.socketIDs = [];
  }
}

module.exports = User;
