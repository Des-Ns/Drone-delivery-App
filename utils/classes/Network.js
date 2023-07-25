class Network {
  constructor(users, orders, warehouses) {
    this.warehouses = warehouses;
    this.customers = users;
    this.orders = orders;
  }

  calculateDistance(location1, location2) {
    const y = location2.x - location1.x;
    const x = location2.y - location1.y;

    return Math.sqrt(x * x + y * y);
  }

  findNearestWarehouse(location) {
    let minDistance = Infinity;
    let id = null;

    for (const warehouse of this.warehouses) {
      const distance = this.calculateDistance(location, warehouse.location);
      if (distance < minDistance) {
        minDistance = distance;
        id = warehouse.id;
      }
    }

    return { minDistance, id };
  }
}

module.exports = Network;

// calculateOrderDistance(order, callback) {
//   const orderWithDistance = {
//     ...order,
//     distance: this.findNearestWarehouse(order.location),
//   };
//   const bestDistance = orderWithDistance.distance.minDistance;

//   order.distance = bestDistance;
//   order.time = bestDistance;
//   order.timer = null;

//   console.log(':: 27 orderWithDistance =>', orderWithDistance);

//   callback(order);
// }

// calculateTotalLocation() {
//   const orderLocation = this.orders.map((order) => {
//     const { location } = order;
//     return { ...order, location };
//   });
//   console.log(':: orderLocation =>', orderLocation);
// }

// markOrderAsCompleted(orderId) {
//   const completedOrder = this.orders.find((order) => order.orderId === orderId);
//   if (completedOrder) {
//     completedOrder.status = 'completed';
//   }
//   return completedOrder;
// }
