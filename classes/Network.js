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
    console.log('::34-Network closestWarehouseFound =>', closestWarehouseFound);

    const closestWarehouse = this.warehouses.find(
      (warehouse) => warehouse.id === closestWarehouseFound.id
    );
    closestWarehouse.orderRecieved(order, order.distance);

    return { closestWarehouse, closestWarehouseFound };
  }

  countdownDelivery(
    drone,
    currOrderId,
    distanceToCustomer,
    powerNeededForOrder,
    progressDataUpdate
  ) {
    drone.orderActiveIds.push(currOrderId);
    drone.availableStatus = false;
    let deliveryTime = distanceToCustomer;

    const transitToCustomer = setInterval(() => {
      deliveryTime -= 1;
      console.log('::57-Network deliveryTime =>', deliveryTime);

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

        console.log('::82-Network Drone -> Order Complete');

        this.countdownReturn(drone, distanceToCustomer, powerNeededForOrder);
      } else {
        drone.orderActiveIds.forEach((orderId) => {
          progressDataUpdate({
            id: orderId,
            status: 'Delivering',
            time: deliveryTime,
          });
        });
      }
    }, 1000);
  }

  countdownReturn(drone, distanceToCustomer, powerNeededForOrder) {
    let returnTime = distanceToCustomer;

    const transitToWarehouse = setInterval(() => {
      returnTime -= 1;
      if (returnTime <= 0) {
        clearInterval(transitToWarehouse);
        drone.availableStatus = true;
        drone.batteryPower -= powerNeededForOrder;
        this.clearDroneInTransitArray(drone, powerNeededForOrder);
      }
      console.log('::108-Network returnTime =>', returnTime);
    }, 1000);
  }

  clearDroneInTransitArray(drone, powerNeededForOrder) {
    const warehouse = this.warehouses.find((warehouse) => warehouse.id === drone.warehouseId);
    const droneToRemoveIndex = warehouse.dronesInTransit.findIndex((obj) => obj.id === drone.id);
    const droneInWarehouse = warehouse.dronesInTransit[droneToRemoveIndex];
    droneInWarehouse.batteryPower -= powerNeededForOrder;

    warehouse.dronesStandingBy.push(droneInWarehouse);
    warehouse.dronesInTransit.splice(droneToRemoveIndex, 1);
  }
}

module.exports = Network;
