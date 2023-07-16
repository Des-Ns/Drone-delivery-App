export class Order {
  constructor(name, locX, locY, products) {
    this.products = products;
    this.name = name;
    this.locX = locX;
    this.locY = locY;
    this.orderId = this.uuidv4();
  }

  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
}
