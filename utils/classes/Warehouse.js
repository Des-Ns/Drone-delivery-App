class Warehouse {
  constructor(coordX, coordY, id, droneQuantity, dronesIds) {
    this.location = { x: coordX, y: coordY };
    this.id = id;
    this.ordersActive = [];
    this.orderHistory = [];
    this.dronesCount = droneQuantity;
    this.dronesStandingBy = dronesIds;
    this.dronesInTransit = [];
  }

  idGen() {
    const index = Math.floor(Math.random() * 10) + 1; // for test only
    return `W-${index}`;
  }

  orderRecieved(order) {
    order.status = 'Accepted';
    this.ordersActive.push(order.id);
  }

  dispatchDrone() {
    if (this.ordersActive.length > 0 && this.dronesStandingBy.length > 0) {
      const dispatchedDroneId = this.dronesStandingBy.shift();
      const currOrderId = this.ordersActive.shift();
      this.dronesInTransit.push(dispatchedDroneId);
      this.orderHistory.push(currOrderId);

      return { dispatchedDroneId, currOrderId };
    }
    return 'No drones available';
  }
}

module.exports = Warehouse;

// clearDroneInTransitArray(droneId) {
//   const readyDrones = this.dronesInTransit.filter((drone) => drone === droneId);
//   const droneToRemove = this.dronesInTransit.findIndex((id) => id === droneId);
//   this.dronesStandingBy.push(...readyDrones);
//   this.dronesInTransit.splice(droneToRemove, 1);
// }

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
