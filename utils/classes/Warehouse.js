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

  // true ID method

  orderRecieved(order) {
    order.status = 'Accepted'; // updating order status
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

      if (dispatchedDrone !== undefined && dispatchedDrone.batteryPower > orderPowerConsumption) {
        this.dronesInTransit.push(dispatchedDrone);
        const currOrderId = this.currOrderIdMoveToArray(this.orderHistory);

        return { dispatchedDrone, currOrderId };
      }

      if (dispatchedDrone !== undefined && dispatchedDrone.batteryPower < orderPowerConsumption) {
        this.powerCharging(dispatchedDrone, () => {
          console.log('Drone is fully charged and available now.');

          this.dronesInTransit.push(dispatchedDrone);
          const currOrderId = this.currOrderIdMoveToArray(this.orderHistory);
          return { dispatchedDrone, currOrderId };
        });
      }
    }

    if (this.ordersActive.length > 0 && this.dronesStandingBy.length <= 0) {
      const { dispatchedDrone, currOrderId } = await this.dispatchQueuedOrders(
        orderPowerConsumption
      );
      if (dispatchedDrone && currOrderId) {
        console.log('::62Warehouse => dispatching queued order');
      } else {
        console.log('No drones available. Order queued.');
      }
      return { dispatchedDrone, currOrderId };
    }

    return console.log('No ordersActive.lenght');
  }

  async dispatchQueuedOrders(orderPowerConsumption) {
    return new Promise((resolve, reject) => {
      let currOrderId;
      const interval = setInterval(() => {
        if (this.ordersActive.length > 0 && this.dronesStandingBy.length > 0) {
          currOrderId = this.ordersActive.shift();
          const dispatchedDrone = this.dronesStandingBy.shift();
          const powerNeededForOrder = orderPowerConsumption;

          if (dispatchedDrone.batteryPower < powerNeededForOrder) {
            console.log(`dispatching queued order ${currOrderId}`);
            this.powerCharging(dispatchedDrone.batteryPower, () => {
              this.dronesInTransit.push(dispatchedDrone);
              this.orderHistory.push(currOrderId);
              console.log(
                `Drone is fully charged and available now. Dispatching queued order ${currOrderId}`
              );
            });
            clearInterval(interval);
            resolve({ dispatchedDrone, currOrderId });
          }

          this.dronesInTransit.push(dispatchedDrone);
          this.orderHistory.push(currOrderId);

          clearInterval(interval);
          resolve({ dispatchedDrone, currOrderId });
          console.log(`dispatching queued order ${currOrderId}`);
        }

        console.log('Awaiting available drone ');
        // return { dispatchedDrone: null, currOrderId };
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

// indexOfDroneToDispatch(powerNeeded) {
//   this.dronesStandingBy.findIndex((indexOfDrone) => {
//     const drone = this.dronesStandingBy.find((drone) => drone.id > indexOfDrone);
//     return drone.batteryPower > powerNeeded;
//   });
// }

// clearDroneInTransitArray(droneId) {
//   const readyDrones = this.dronesInTransit.filter((drone) => drone === droneId);
//   const droneToRemove = this.dronesInTransit.findIndex((id) => id === droneId);
//   this.dronesStandingBy.push(...readyDrones);
//   this.dronesInTransit.splice(droneToRemove, 1);
// }

// clearDroneInTransitArray(closestWarehouse) {
//   const readyDrones = closestWarehouse.dronesInTransit.filter(
//     (drone) => drone.availableStatus === true
//   );
//   closestWarehouse.dronesStandingBy.push(...readyDrones);
// }

// dispatchDrone() {
//   if (this.ordersActive.length > 0 && this.dronesStandingBy.length > 0 ) {

//     const dispatchedDroneReference = this.dronesStandingBy.shift();
//     this.dronesInTransit.push(dispatchedDroneReference);

//     const currOrderId = this.ordersActive.shift();
//     this.orderHistory.push(currOrderId);

//     return { dispatchedDroneReference, currOrderId };
//   }
//   return 'No drones available';
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
