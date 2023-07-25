const { sessionMiddleware, wrap } = require('./controlers/serverControler.js');
const Network = require('./utils/classes/Network.js');
const Drone = require('./utils/classes/Drone.js');
const Warehouse = require('./utils/classes/Warehouse.js');

const orders = [];
let warehouses = [
  new Warehouse(93, 140, 'W-11', 3, [new Drone('W-11'), new Drone('W-11'), new Drone('W-11')]),
  new Warehouse(186, 140, 'W-12', 3, [new Drone('W-12'), new Drone('W-12'), new Drone('W-12')]),
];
// const rooms = [new Room(0, 'owner', '/'), new Room(1, 'client', '/')];

function setupSockets(io, users) {
  io.use(wrap(sessionMiddleware));
  const networkUtil = new Network(users, orders, warehouses);

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

    socket.on('remove-warehouse', (warehouseIdsToRemove) => {
      warehouses = warehouses.filter((warehouse) => !warehouseIdsToRemove.includes(warehouse.id));

      io.to('owner').emit('warehouse-list', warehouses);
    });

    socket.on('order', (order) => {
      console.log(':: 77 order =>', order);
      if (user) {
        order.customerId = user.id;
        const closestWarehouseFound = networkUtil.findNearestWarehouse(order.location);
        order.distance = closestWarehouseFound.minDistance;
        console.log(':: closestFound =>', closestWarehouseFound);
        const closestWarehouse = warehouses.find(
          (warehouse) => warehouse.id === closestWarehouseFound.id
        );
        closestWarehouse.orderRecieved(order, closestWarehouse);
        user.orders.push(order);
        orders.push(order);

        console.log(`New order assigned to user: ${user.username}, user Id: ${user.id}`);
        console.log(':: 99 order =>', order);

        user.socketIDs.forEach((socketId) => {
          io.to(socketId).emit('order-accepted', order);
        });

        const dispatchedDrone = closestWarehouse.dispatchDrone();

        if (dispatchedDrone) {
          dispatchedDrone.countdownDelivery(
            closestWarehouseFound.minDistance,
            closestWarehouse,
            (progressData) => {
              io.emit('order-update', progressData);
            },
            () => {
              console.log('Countdown Return - Done');
              closestWarehouse.clearDroneInTransitArray();
              dispatchedDrone.closestWarehouse = null;
            }
          );
          setInterval(() => {
            console.log(':: 101 WH-orderHystory => ', closestWarehouse.orderHistory);
            console.log(':: 102 dispatchedDrone => ', dispatchedDrone);
          }, 2000);
        } else {
          console.log('No available drone to dispatch.');
        }
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
