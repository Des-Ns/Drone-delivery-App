const serveOrderWithSameDrone = true;
// const serveOrderWithSameDrone = false;

class DroneDeliveryNetwork {
  constructor(users, orders, warehouses) {
    this.warehouses = warehouses;
    this.customers = users;
    this.orders = orders;
  }

  calculateTotalTime() {
    const orderWithCustomerLocation = this.orders.map((order) => {
      const customer = this.customers.find((customer) => customer.id === order.customerId);
      const customerLocation = customer.location;
      return { ...order, customerLocation };
    });

    const orderWithDistances = orderWithCustomerLocation.map((order) => {
      const distance = this.findNearestWarehouse(order.customerLocation);
      return { ...order, distance };
    });

    console.log(':: orderWithDistances => ', orderWithDistances);

    if (serveOrderWithSameDrone) {
      let groupOrders = orderWithDistances.reduce((acc, curr) => {
        if (acc[curr.customerId]) {
          acc[curr.customerId].push(curr);
        } else {
          acc[curr.customerId] = [curr];
        }

        return acc;
      }, {});

      console.log(':: groupOrders => ', groupOrders);

      groupOrders = Object.values(groupOrders).map((orderGroup) =>
        orderGroup.reduce((acc, curr, index) => {
          if (index > 0) {
            return acc + curr.distance * 2;
          }

          return acc + curr.distance;
        }, 0)
      );

      return Math.max(...groupOrders);
    }
    return Math.max(...orderWithDistances.map((order) => order.distance));
  }

  calculateDistance(location1, location2) {
    const y = location2.x - location1.x;
    const x = location2.y - location1.y;

    return Math.sqrt(x * x + y * y);
  }

  findNearestWarehouse(location) {
    let minDistance = Infinity;
    let nearestWarehouse = null;

    for (const warehouse of this.warehouses) {
      const distance = this.calculateDistance(location, warehouse.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearestWarehouse = warehouse;
      }
    }

    return { minDistance, nearestWarehouse };
  }
}

module.exports = DroneDeliveryNetwork;
