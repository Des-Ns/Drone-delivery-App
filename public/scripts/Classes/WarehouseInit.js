export default class WarehouseInit {
  constructor(coordX, coordY, dronesCount) {
    this.location = { x: coordX, y: coordY };
    this.id = this.index();
    this.dronesCount = dronesCount;
    this.dronesStandingBy = [];
  }

  index() {
    const index = Math.floor(Math.random() * 10) + 1; // for test only
    return `W-${index}`;
  }
}
