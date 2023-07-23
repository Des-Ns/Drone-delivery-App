class Warehouse {
  constructor(coordX, coordY, id, droneQuantity, dronesStandingBy) {
    this.location = { x: coordX, y: coordY };
    this.id = id;
    this.ordersActive = [];
    this.orderHistory = [];
    this.dronesCount = droneQuantity;
    this.dronesStandingBy = dronesStandingBy;
    this.dronesInTransit = [];
  }

  id() {
    const index = Math.floor(Math.random() * 10) + 1; // for test only
    return `W-${index}`;
  }

  orderRecieved(order, closestWarehouse) {
    order.status = 'Accepted';
    closestWarehouse.ordersActive.push(order);
  }

  droneStatus(drone) {
    if (drone.availableStatus === false) {
      this.dronesInTransit.push(drone);
    }
    this.dronesStandingBy.push(drone);
  }

  dispatchDrone(closestWarehouse) {
    if (closestWarehouse.ordersActive.length > 0 && closestWarehouse.dronesStandingBy.length > 0) {
      const dispatchedDrone = closestWarehouse.dronesStandingBy.shift();
      const currOrder = closestWarehouse.ordersActive.shift();
      currOrder.status = 'Delivering';
      dispatchedDrone.order.push(currOrder);
      dispatchedDrone.availableStatus = false;
      closestWarehouse.dronesInTransit.push(dispatchedDrone);
      closestWarehouse.orderHistory.push(currOrder);
      return dispatchedDrone;
    }
    return 'No drones available';
  }
}

module.exports = Warehouse;
