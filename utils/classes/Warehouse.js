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

  orderRecieved(order) {
    order.status = 'Accepted';
    this.ordersActive.push(order);
  }

  dispatchDrone() {
    if (this.ordersActive.length > 0 && this.dronesStandingBy.length > 0) {
      const dispatchedDrone = this.dronesStandingBy.shift();
      const currOrder = this.ordersActive.shift();
      currOrder.status = 'Delivering';
      dispatchedDrone.order.push(currOrder);
      dispatchedDrone.availableStatus = false;
      this.dronesInTransit.push(dispatchedDrone);
      this.orderHistory.push(currOrder);
      return dispatchedDrone;
    }
    return 'No drones available';
  }

  clearDroneInTransitArray() {
    const readyDrones = this.dronesInTransit.filter((drone) => drone.availableStatus === true);
    this.dronesStandingBy.push(...readyDrones);
    this.dronesInTransit = this.dronesInTransit.filter((drone) => drone.availableStatus === false);
  }
}

module.exports = Warehouse;

// dispatchDrone(closestWarehouse) {
//   if (closestWarehouse.ordersActive.length > 0 && closestWarehouse.dronesStandingBy.length > 0) {
//     const dispatchedDrone = closestWarehouse.dronesStandingBy.shift();
//     const currOrder = closestWarehouse.ordersActive.shift();
//     currOrder.status = 'Delivering';
//     dispatchedDrone.order.push(currOrder);
//     dispatchedDrone.availableStatus = false;
//     closestWarehouse.dronesInTransit.push(dispatchedDrone);
//     closestWarehouse.orderHistory.push(currOrder);
//     return dispatchedDrone;
//   }
//   return 'No drones available';
// }

// clearDroneInTransitArray(closestWarehouse) {
//   const readyDrones = closestWarehouse.dronesInTransit.filter(
//     (drone) => drone.availableStatus === true
//   );
//   closestWarehouse.dronesStandingBy.push(...readyDrones);
// }

// droneStatus(drone) {
//   if (drone.availableStatus === false) {
//     this.dronesInTransit.push(drone);
//   }
//   this.dronesStandingBy.push(drone);
// }
