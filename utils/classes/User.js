class User {
  constructor(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.orders = [];
  }

  addOrder(order) {
    this.order.push(order);
  }
}

module.exports = User;
