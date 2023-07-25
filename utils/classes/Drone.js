const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class Drone extends EventEmitter {
  constructor(warehouseId) {
    super();
    this.id = uuidv4();
    this.order = [];
    this.ordersDelivered = [];
    this.availableStatus = true;
    this.warehouseId = warehouseId;
    this.closestWarehouse = null;
  }

  distances(distance) {
    const distanceToCustomer = distance;
    const totalDistance = distance * 2;
    return { totalDistance, distanceToCustomer };
  }

  countdownDelivery(distanceToCustomer, progressUpdate, onComplete) {
    let deliveryTime = distanceToCustomer;

    const toCustomer = setInterval(() => {
      deliveryTime -= 0.5;
      this.availableStatus = false;
      console.log('::25 deliveryTime =>', deliveryTime);

      if (deliveryTime <= 0) {
        progressUpdate({
          orderId: this.order[0].orderId,
          status: (this.order[0].status = 'Completed'),
          time: 0,
        });

        clearInterval(toCustomer);
        this.ordersDelivered.push(this.order[0]);
        this.order.splice(0, 1);
        console.log('::36-Drone> Order Complete');

        this.countdownReturn(distanceToCustomer, onComplete);
      } else {
        progressUpdate({
          orderId: this.order[0].orderId,
          status: this.order[0].status,
          time: deliveryTime,
        });
      }
    }, 500);
  }

  countdownReturn(distanceToCustomer) {
    let returnTime = distanceToCustomer;
    // this.closestWarehouse = closestWarehouse;

    const toWarehouse = setInterval(() => {
      returnTime -= 0.5;
      if (returnTime <= 0) {
        clearInterval(toWarehouse);
        this.availableStatus = true;
        this.emit('countdownReturnCompleted');
      }
      console.log('::51 returnTime =>', returnTime);
    }, 500);
  }
}

module.exports = Drone;
