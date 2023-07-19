// const io = require('./server').io;

const { sessionMiddleware, wrap, userSessionStore } = require('./controlers/serverControler.js');

function setupSockets(io, users, orders, warehouses) {
  io.use(wrap(sessionMiddleware));

  io.of('/').on('connection', (socket) => {
    console.log('59', `New socet connection ${socket.id}, sessinID:: ${socket.request.sessionID}`);
    const { sessionID } = socket.request;
    const user = users.find((user) => user.sessionIDs.includes(sessionID));

    if (user.socketIDs) {
      user.socketIDs.push(socket.id);
    }

    socket.emit('msg', `Welcome to nsp: "/" socket.id: ${socket.id} `);

    socket.on('joinRoom', (roomToJoin) => {
      socket.join(roomToJoin);
      console.log('65::', `Joined ${roomToJoin} room`);

      if (roomToJoin === 'owner') {
        socket.emit('warehouse-list', warehouses);
      }

      io.to(`${roomToJoin}`).emit('roomJoined', `User joined ${roomToJoin} room.`);
    });

    socket.on('add-warehouse', (newWarehouse) => {
      console.log('88::', newWarehouse);
      warehouses.push(newWarehouse);
      io.to('owner').emit('warehouse-list', warehouses);
    });

    socket.on('order', (order) => {
      if (user) {
        order.customerId = user.id;
        user.addOrder(order);
        orders.push(order);
        console.log(`New order assigned to user: ${user.username}, user Id: ${user.id}`);

        socket.to(socket.id).emit('order-msg', 'Order received.');
        user.socketIDs.forEach((socketId) => {
          io.to(socketId).emit('order-msg', 'Order received.');
        });
      } else {
        console.log('User not found');
        socket.to(socket.id).emit('order-msg', 'Order denied.');
      }
    });

    setInterval(() => {
      io.emit('orders-table', () => {
        setTimeout(() => {
          // network.orders;
        });
      });
    }, 33);

    socket.on('disconnect', () => {
      const disconnectedSocketId = socket.id;
      const disconnectedSocketIndex = user.socketIDs.indexOf(disconnectedSocketId);
      user.socketIDs.splice(disconnectedSocketIndex, 1);

      io.emit('msg', 'User left');
    });
  });
}
// setInterval(() => {
//   console.log('126::', users, orders, warehouses);
// }, 1000);

module.exports = setupSockets;
