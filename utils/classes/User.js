class User {
  constructor(id, username, password, sessionToken) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.sessionTokens = [sessionToken];
    this.orders = [];
  }

  addOrder(order) {
    this.orders.push(order);

    // this.sessionTokens.forEach((sessionToken) => {
    //   const sockets = Array.from(io.sockets.connected).filter(
    //     ([_, socket]) => socket.user && socket.user.sessionTokens.includes(sessionToken)
    //   );
    //   sockets.forEach(([_, socket]) => {
    //     socket.emit('order-msg', 'Order received.');
    //   });
    // });
  }
}

module.exports = User;
