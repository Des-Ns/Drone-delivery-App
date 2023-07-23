const { v4: uuidv4 } = require('uuid');

class Drone {
  constructor() {
    this.id = uuidv4();
    this.order = [];
    this.ordersDelivered = [];
    // this.totalDistance = this.totalDistance(this.distance);
    this.availableStatus = true;
  }

  distances(distance) {
    const distanceToCustomer = distance;
    const totalDistance = distance * 2;
    return { totalDistance, distanceToCustomer };
  }

  countdown(distanceToCustomer, dispatchedDrone, totalDistance, progressUpdate) {
    let deliveryTime = distanceToCustomer;
    let returnTime = totalDistance / 2;

    const toCustomer = setInterval(() => {
      deliveryTime -= 0.5;
      dispatchedDrone.availableStatus = false;

      if (deliveryTime <= 0) {
        clearInterval(toCustomer);
        dispatchedDrone.order[0].status = 'Completed';
        dispatchedDrone.ordersDelivered.push(dispatchedDrone.order[0]);
        dispatchedDrone.order.splice(0, 1);
      }

      progressUpdate({
        orderId: dispatchedDrone.order[0].orderId,
        status: dispatchedDrone.order[0].status,
        time: deliveryTime,
      });
    }, 500);

    const toWarehouse = setInterval(() => {
      returnTime -= 5;
      if (returnTime <= 0) {
        clearInterval(toWarehouse);
        this.availableStatus = true;
      }
    }, 500);
  }
}

module.exports = Drone;
