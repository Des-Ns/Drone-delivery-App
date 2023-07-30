const { v4: uuidv4 } = require('uuid');

class Drone {
  constructor(warehouseId) {
    this.id = uuidv4();
    this.orderActiveIds = [];
    this.ordersDelivered = [];
    this.availableStatus = true;
    this.warehouseId = warehouseId;
    this.batteryPower = 1000;
  }
}

module.exports = Drone;
