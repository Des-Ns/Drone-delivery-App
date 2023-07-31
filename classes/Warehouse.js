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

  // true ID method ?

  orderRecieved(order) {
    order.status = 'Accepted';
    this.ordersActive.push(order.id);
  }

  orderBatteryConsumption(orderDistance) {
    // powerConsumption is 1 unit of power per 1 unit of map
    const powerConsumption = 1;
    const powerNeeded = orderDistance * 2 * powerConsumption;

    return powerNeeded;
  }

  currOrderIdMoveToArray(array) {
    const currOrderId = this.ordersActive.shift();
    array.push(currOrderId);

    return currOrderId;
  }

  async dispatchDrone(powerNeeded) {
    const orderPowerConsumption = powerNeeded;

    if (this.ordersActive.length > 0 && this.dronesStandingBy.length > 0) {
      const dispatchedDrone = this.dronesStandingBy.shift();

      if (dispatchedDrone.batteryPower > orderPowerConsumption) {
        this.dronesInTransit.push(dispatchedDrone);
        const currOrderId = this.currOrderIdMoveToArray(this.orderHistory);

        return { dispatchedDrone, currOrderId };
      }

      if (dispatchedDrone.batteryPower < orderPowerConsumption) {
        this.powerCharging(dispatchedDrone, () => {
          this.dronesInTransit.push(dispatchedDrone);
          const currOrderId = this.currOrderIdMoveToArray(this.orderHistory);

          console.log('Drone is fully charged and available now.');

          return { dispatchedDrone, currOrderId };
        });
      }
    }

    if (this.ordersActive.length > 0 && this.dronesStandingBy.length <= 0) {
      const { dispatchedDrone, currOrderId } = await this.dispatchQueuedOrders(
        orderPowerConsumption
      );

      return { dispatchedDrone, currOrderId };
    }

    return console.log('No ordersActive.lenght');
  }

  dispatchQueuedOrders(orderPowerConsumption) {
    return new Promise((resolve) => {
      let currOrderId;
      const interval = setInterval(() => {
        if (this.ordersActive.length > 0 && this.dronesStandingBy.length > 0) {
          currOrderId = this.ordersActive.shift();
          const dispatchedDrone = this.dronesStandingBy.shift();
          const powerNeededForOrder = orderPowerConsumption;

          if (dispatchedDrone.batteryPower < powerNeededForOrder) {
            this.powerCharging(dispatchedDrone.batteryPower, () => {
              this.dronesInTransit.push(dispatchedDrone);
              this.orderHistory.push(currOrderId);

              console.log(`Drone is fully charged and available now.`);
            });
            clearInterval(interval);
            resolve({ dispatchedDrone, currOrderId });
          }

          this.dronesInTransit.push(dispatchedDrone);
          this.orderHistory.push(currOrderId);

          clearInterval(interval);
          resolve({ dispatchedDrone, currOrderId });

          console.log(`::62Warehouse => Dispatching queued order ${currOrderId}`);
        }

        console.log('Awaiting available drone ');
      }, 1000);
    });
  }

  powerCharging(currBatteryChargeLevel, callback) {
    const chargingTimeFull = 10000;
    const droneBatteryCapacity = 1000;
    const chargingTime =
      chargingTimeFull - (chargingTimeFull / droneBatteryCapacity) * currBatteryChargeLevel;

    setTimeout(() => {
      currBatteryChargeLevel = droneBatteryCapacity;
      callback();
    }, chargingTime);
  }
}

module.exports = Warehouse;
