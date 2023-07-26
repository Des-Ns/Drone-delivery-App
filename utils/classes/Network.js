class Network {
  constructor(warehouses, drones, users, orders) {
    this.warehouses = warehouses;
    this.drones = drones;
    this.customers = users;
    this.orders = orders;
  }

  calculateDistance(location1, location2) {
    const y = location2.x - location1.x;
    const x = location2.y - location1.y;

    return Math.sqrt(x * x + y * y);
  }

  findClosestWarehouse(location) {
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

  orderAcceptHandler(order) {
    const closestWarehouseFound = this.findClosestWarehouse(order.location);
    order.distance = closestWarehouseFound.minDistance;
    const closestWarehouse = this.warehouses.find(
      (warehouse) => warehouse.id === closestWarehouseFound.id
    );
    closestWarehouse.orderRecieved(order);
    console.log('::38-Network closestFound =>', closestWarehouseFound);
    return { closestWarehouse, closestWarehouseFound };
  }

  countdownDelivery(drone, orderStatus, currOrderId, distanceToCustomer, progressDataUpdate) {
    drone.orderActiveIds.push(currOrderId);
    let deliveryTime = distanceToCustomer;
    drone.availableStatus = false;

    const transitToCustomer = setInterval(() => {
      deliveryTime -= 0.5;
      console.log('::25 deliveryTime =>', deliveryTime);

      if (deliveryTime <= 0) {
        drone.orderActiveIds.forEach((orderId) => {
          if (orderId === currOrderId) {
            progressDataUpdate({
              id: orderId,
              status: 'Completed',
              time: ' - ',
            });
          } else {
            progressDataUpdate({
              id: orderId,
              status: 'Delivering',
              time: deliveryTime,
            });
          }
        });

        clearInterval(transitToCustomer);
        const completedOrderId = drone.orderActiveIds.filter((orderId) => orderId === currOrderId);
        const indexForDelete = drone.orderActiveIds.indexOf(completedOrderId);
        drone.orderActiveIds.splice(indexForDelete, 1);
        drone.ordersDelivered.push(...completedOrderId);

        console.log('::36-Drone> Order Complete');

        this.countdownReturn(drone, distanceToCustomer);
      } else {
        drone.orderActiveIds.forEach((orderId) => {
          progressDataUpdate({
            id: orderId,
            status: 'Delivering',
            time: deliveryTime,
          });
        });
      }
    }, 500);
  }

  countdownReturn(drone, distanceToCustomer) {
    let returnTime = distanceToCustomer;

    const transitToWarehouse = setInterval(() => {
      returnTime -= 0.5;
      if (returnTime <= 0) {
        clearInterval(transitToWarehouse);
        drone.availableStatus = true;
        // drone.emit('countdownReturnCompleted');
        // this.clearDroneInTransitArray()
      }
      console.log('::51 returnTime =>', returnTime);
    }, 500);
  }

  clearDroneInTransitArray(droneId, closestWarehouse) {
    const readyDrones = closestWarehouse.dronesInTransit.filter((drone) => drone === droneId);
    const droneToRemove = closestWarehouse.dronesInTransit.findIndex((id) => id === droneId);
    closestWarehouse.dronesStandingBy.push(...readyDrones);
    closestWarehouse.dronesInTransit.splice(droneToRemove, 1);
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
