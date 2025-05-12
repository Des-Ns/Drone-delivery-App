class Room {
  constructor(roomId, roomTitle, namespace, privateRoom = false) {
    this.roomId = roomId;
    this.roomTitle = roomTitle;
    this.namespace = namespace;
    this.privateRoom = privateRoom;
    this.history = new Map();
  }

  addOrderData(order, progress = null) {
    this.history.set(order.id, { order, progress });
  }

  updateOrderProgress(orderId, progress) {
    if (this.history.has(orderId)) {
      const existingOrderData = this.history.get(orderId);
      this.history.set(orderId, {
        ...existingOrderData,
        progress,
      });
    }
  }

  getHystory() {
    if (this.history.size === 0) {
      return null;
    }

    const historyArray = Array.from(this.history.values());

    return historyArray;
  }

  clearHistory() {
    this.history.clear();
  }
}

module.exports = Room;

// const historyExample = [
//   {
//     order: {
//       products: ['doner'],
//       name: '2',
//       location: { x: '90', y: '145' },
//       id: 'b7545860-2188-4d68-8618-049c7fd19d0c',
//       customerId: 'dfa6839c-3b60-4780-a03a-707666adaa41',
//       status: 'none',
//     },
//     progress: {
//       id: 'b7545860-2188-4d68-8618-049c7fd19d0c',
//       status: 'Delivering',
//       time: 4.830951894845301,
//     },
//   },
// ];
