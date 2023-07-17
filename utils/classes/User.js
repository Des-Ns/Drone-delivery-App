class User {
  constructor(id, username, password, sessionToken) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.sessionTokens = [sessionToken];
    this.orders = [];
    this.socketIds = [];
  }

  addOrder(order) {
    this.orders.push(order);
  }
}

module.exports = User;
