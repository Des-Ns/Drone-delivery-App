class User {
  constructor(id, username, password, sessionID) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.orders = [];
    this.sessionIDs = [sessionID];
    this.socketIDs = [];
  }

  addOrder(order) {
    this.orders.push(order);
  }
}

module.exports = User;
