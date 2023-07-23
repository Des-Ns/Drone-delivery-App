const { sessionMiddleware, wrap } = require('./controlers/serverControler.js');
const Delivery = require('./utils/classes/Delivery.js');
const Drone = require('./utils/classes/Drone.js');
const Warehouse = require('./utils/classes/Warehouse.js');

const orders = [];
const ordersHistory = [];
const warehouses = [
  new Warehouse(93, 140, 'W-11', 5, [
    new Drone(),
    new Drone(),
    new Drone(),
    new Drone(),
    new Drone(),
  ]),
  new Warehouse(186, 140, 'W-12', 5, [
    new Drone(),
    new Drone(),
    new Drone(),
    new Drone(),
    new Drone(),
  ]),
];
// const rooms = [new Room(0, 'owner', '/'), new Room(1, 'client', '/')];

function setupSockets(io, users) {
  io.use(wrap(sessionMiddleware));
  const network = new Delivery(users, orders, warehouses);

  io.of('/').on('connection', (socket) => {
    console.log(
      '::59',
      `New socet connection ${socket.id}, sessinID:: ${socket.request.sessionID}`
    );
    const { sessionID } = socket.request;
    const user = users.find((user) => user.sessionIDs.includes(sessionID));

    if (user.socketIDs) {
      user.socketIDs.push(socket.id);
    }

    socket.on('joinRoom', (roomToJoin) => {
      socket.join(roomToJoin);
      console.log('::37', `Joined ${roomToJoin} room`);

      if (roomToJoin === 'owner') {
        socket.emit('warehouse-list', warehouses);
      }

      io.to(`${roomToJoin}`).emit('roomJoined', `User joined ${roomToJoin} room.`);
    });

    socket.on('add-warehouse', (newWarehouse) => {
      console.log('::47 newWarehouse =>', newWarehouse);
      newWarehouse.dronesStandingBy = [];
      for (let i = 0; i < newWarehouse.dronesCount; i++) {
        newWarehouse.dronesStandingBy.push(new Drone());
      }
      warehouses.push(
        new Warehouse(
          newWarehouse.location.x,
          newWarehouse.location.y,
          newWarehouse.id,
          newWarehouse.dronesCount,
          newWarehouse.dronesStandingBy
        )
      );

      io.to('owner').emit('warehouse-list', warehouses);
    });

    socket.on('order', (order) => {
      console.log(':: 77 order =>', order);
      if (user) {
        order.customerId = user.id;
        const closestWarehouseFound = network.findNearestWarehouse(order.location);
        order.distance = closestWarehouseFound.minDistance;
        console.log(':: closestFound =>', closestWarehouseFound);
        const closestWarehouse = warehouses.find(
          (warehouse) => warehouse.id === closestWarehouseFound.id
        );
        closestWarehouse.orderRecieved(order, closestWarehouse);
        user.orders.push(order);
        orders.push(order);
        ordersHistory.push(order);

        console.log(`New order assigned to user: ${user.username}, user Id: ${user.id}`);
        console.log(':: 99 order =>', order);

        user.socketIDs.forEach((socketId) => {
          io.to(socketId).emit('order-accepted', order);
        });

        const dispatchedDrone = closestWarehouse.dispatchDrone(closestWarehouse);

        if (dispatchedDrone) {
          dispatchedDrone.countdown(
            closestWarehouseFound.minDistance,
            dispatchedDrone,
            dispatchedDrone.distances(closestWarehouseFound.minDistance),
            (progressData) => {
              io.emit('order-update', progressData);
            }
          );
        } else {
          console.log('No available drone to dispatch.');
        }
        // =====================================

        // network.calculateOrderDistance(order, (orderWithTime) => {
        //   // Emit the order data with the timer to the client, including the initial countdown value
        //   console.log('::98 network => ', network);
        //   io.emit('orders-table', orderWithTime);
        //   console.log('::62 orderWithTime =>', orderWithTime);

        //   let deliveryTime = orderWithTime.time;
        //   orderWithTime.timer = setInterval(() => {
        //     deliveryTime -= 0.5;
        //     if (deliveryTime <= 0) {
        //       clearInterval(orderWithTime.timer);
        //       console.log('Order completed:', orderWithTime.orderId);
        //       order.timer = null;

        //       network.markOrderAsCompleted(order.orderId);
        //       console.log(order.status);
        //       // Remove the completed order from the orders array
        //       const index = orders.indexOf(orderWithTime);
        //       orders.splice(index, 1);
        //       // if (index > -1) {
        //       //   orders.splice(index, 1);
        //       // }
        //       // Emit the updated orders table to the client without the completed order
        //       io.emit('orders-table', orderWithTime);
        //     } else {
        //       console.log('Time left:', deliveryTime);
        //       // Update the countdown time in the orderWithTime object
        //       orderWithTime.time = deliveryTime;
        //       // Emit the updated order data with the countdown time to the client
        //       io.emit('orders-table', orderWithTime);
        //     }
        //   }, 500);
        // });
      } else {
        console.log('User not found');
        socket.to(socket.id).emit('order-msg', 'Order denied.');
      }
    });

    socket.on('disconnect', () => {
      const disconnectedSocketId = socket.id;
      const disconnectedSocketIndex = user.socketIDs.indexOf(disconnectedSocketId);
      user.socketIDs.splice(disconnectedSocketIndex, 1);

      io.emit('msg', 'User left');
    });
  });
}

module.exports = setupSockets;
