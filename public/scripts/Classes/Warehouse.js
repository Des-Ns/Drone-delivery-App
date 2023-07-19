export default class Warehouse {
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
    this.id = this.index();
  }

  index() {
    const index = Math.floor(Math.random() * 10) + 1; // for test only
    return `W-${index}`;
  }
}
