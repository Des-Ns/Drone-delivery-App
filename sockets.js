const { sessionMiddleware, wrap } = require('./controlers/serverControler.js');
const Network = require('./utils/classes/Network.js');
const Drone = require('./utils/classes/Drone.js');
const Warehouse = require('./utils/classes/Warehouse.js');

const orders = [];
const warehouses = [new Warehouse(93, 140, 'W-11', 1, []), new Warehouse(186, 140, 'W-12', 1, [])];
let drones = [];
// const rooms = [new Room(0, 'owner', '/'), new Room(1, 'client', '/')];
// let eventHistory = new Map()

warehouses.forEach((warehouse) => {
  drones.push(new Drone(warehouse.id));

  warehouse.dronesStandingBy.push(
    ...drones
      .filter((drone) => drone.warehouseId === warehouse.id)
      .map((drone) => ({ id: drone.id, batteryPower: drone.batteryPower }))
  );
});

function setupSockets(io, users) {
  io.use(wrap(sessionMiddleware));

  const network = new Network(warehouses, drones, users, orders);

  io.of('/').on('connection', (socket) => {
    console.log(`New socet connection ${socket.id}, sessinID:: ${socket.request.sessionID}`);

    const { sessionID } = socket.request;
    const user = users.find((user) => user.sessionIDs.includes(sessionID));

    user.socketIDs.push(socket.id);

    socket.on('joinRoom', (roomToJoin) => {
      socket.join(roomToJoin);
      console.log('::38', `Joined ${roomToJoin} room`);

      if (roomToJoin === 'owner') {
        socket.emit('warehouse-list', warehouses);
      }

      io.to(`${roomToJoin}`).emit(
        'roomJoined',
        `User '${user.username}', joined ${roomToJoin} room.`
      );
    });

    socket.on('add-warehouse', (newWarehouse) => {
      console.log('::51 newWarehouse =>', newWarehouse);
      warehouses.push(
        new Warehouse(
          newWarehouse.location.x,
          newWarehouse.location.y,
          newWarehouse.id,
          newWarehouse.dronesCount,
          newWarehouse.dronesStandingBy
        )
      );

      for (let i = 0; i < newWarehouse.dronesCount; i++) {
        const drone = new Drone(newWarehouse.id);
        newWarehouse.dronesStandingBy.push({ id: drone.id, batteryPower: drone.batteryPower });
        drones.push(drone);
      }

      io.to('owner').emit('warehouse-list', warehouses);
    });

    socket.on('remove-warehouse', (warehouseIdsToRemove) => {
      warehouseIdsToRemove.forEach((warehouseId) => {
        const indexOfWarehouseToDel = warehouses.findIndex(
          (warehouse) => warehouse.id === warehouseId
        );

        console.log(indexOfWarehouseToDel);

        drones = drones.filter((drone) => !warehouseIdsToRemove.includes(drone.warehouseId));
        warehouses.splice(indexOfWarehouseToDel, 1);
      });

      io.to('owner').emit('warehouse-list', warehouses);
    });

    socket.on('order', async (order) => {
      console.log('::82 order =>', order);

      order.customerId = user.id;
      user.orders.push(order.id);
      orders.push(order);
      const { closestWarehouse, closestWarehouseFound } = network.orderAcceptHandler(order);

      console.log(`::89 New order assigned to user: ${user.username}, user Id: ${user.id}`);

      user.socketIDs.forEach((socketId) => {
        io.to(socketId).emit('order-accepted', order);
      });
      io.to('owner').emit('order-accepted', order);

      const powerNeededForOrder = closestWarehouse.orderBatteryConsumption(
        closestWarehouseFound.minDistance
      );

      const { dispatchedDrone, currOrderId } = await closestWarehouse.dispatchDrone(
        powerNeededForOrder
      );

      if (dispatchedDrone) {
        console.log('::105 dispatchedDrone.id => ', dispatchedDrone.id);
        const currDrone = drones.find((drone) => drone.id === dispatchedDrone.id);

        network.countdownDelivery(
          currDrone,
          currOrderId,
          closestWarehouseFound.minDistance,
          powerNeededForOrder,
          (progressData) => {
            io.to('owner').emit('order-update', progressData);

            user.socketIDs.forEach((socketId) => {
              io.to(socketId).emit('order-update', progressData);
            });
          }
        );

        setInterval(() => {
          console.log('::123 closestWarehouse => ', closestWarehouse);
          console.log('::124 currDrone => ', currDrone);
        }, 2000);
      } else {
        console.log('::127 No available drone to dispatch.');
      }
    });

    socket.on('disconnect', () => {
      const disconnectedSocketIndex = user.socketIDs.indexOf(socket.id);
      user.socketIDs.splice(disconnectedSocketIndex, 1);

      io.emit('msg', 'User left');
    });
  });
}

module.exports = setupSockets;
