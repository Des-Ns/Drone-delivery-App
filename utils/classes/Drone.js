const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class Drone extends EventEmitter {
  constructor(warehouseId) {
    super();
    this.id = uuidv4();
    this.orderActiveIds = [];
    this.ordersDelivered = [];
    this.availableStatus = true;
    this.warehouseId = warehouseId;
  }

  distances(distance) {
    const distanceToCustomer = distance;
    const totalDistance = distance * 2;
    return { totalDistance, distanceToCustomer };
  }

  countdownDelivery(orderStatus, currOrderId, distanceToCustomer, progressDataUpdate) {
    this.orderActiveIds.push(currOrderId);
    let deliveryTime = distanceToCustomer;
    this.availableStatus = false;

    const transitToCustomer = setInterval(() => {
      deliveryTime -= 0.5;
      console.log('::25 deliveryTime =>', deliveryTime);

      if (deliveryTime <= 0) {
        this.orderActiveIds.forEach((orderId) => {
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
        const completedOrderId = this.orderActiveIds.filter((orderId) => orderId === currOrderId);
        const indexForDelete = this.orderActiveIds.indexOf(completedOrderId);
        this.orderActiveIds.splice(indexForDelete, 1);
        this.ordersDelivered.push(...completedOrderId);

        console.log('::36-Drone> Order Complete');

        this.countdownReturn(distanceToCustomer);
      } else {
        // Update the status of all active orders
        this.orderActiveIds.forEach((orderId) => {
          progressDataUpdate({
            id: orderId,
            status: 'Delivering',
            time: deliveryTime,
          });
        });
      }
    }, 500);
  }

  countdownReturn(distanceToCustomer) {
    let returnTime = distanceToCustomer;

    const transitToWarehouse = setInterval(() => {
      returnTime -= 0.5;
      if (returnTime <= 0) {
        clearInterval(transitToWarehouse);
        this.availableStatus = true;
        this.emit('countdownReturnCompleted');
      }
      console.log('::51 returnTime =>', returnTime);
    }, 500);
  }
}

module.exports = Drone;
