// const { users, orders, warehouses } = require('../server.js');
const DroneDeliveryNetwork = require('./classes/DroneDeliveryNetwork.js');

// const w1 = new Wherhouse(2, new Location(1, 2));
// const w2 = new Wherhouse(2, new Location(1, 2));

// const user1 = new User(2, new Location(1, 2));
// const user2 = new User();
// const user3 = new User();

// const orders = [new Order(1, { a: 1 })];

// // Example usage
// const warehouses = [
//   { location: { x: 0, y: 0 }, droneCapacity: 100 },
//   { location: { x: 10, y: 10 }, droneCapacity: 200 },
// ];

// const customerOrders = [{ location: { x: 5, y: 5 } }, { location: { x: 7, y: 8 } }];

function processData(users, orders, warehouses) {
  const network = new DroneDeliveryNetwork(users, orders, warehouses);
  const totalTime = network.calculateTotalTime();

  return totalTime;
}

module.exports = { processData };
