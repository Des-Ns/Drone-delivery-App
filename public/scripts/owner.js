import WarehouseInit from './Classes/WarehouseInit.js';
import { abbreviateInput, updateTable } from './shared.js';

const username = sessionStorage.getItem('username');
const usernameContainer = document.querySelector('.username');
const usernameEl = document.getElementById('username');
const warehousesContainer = document.getElementById('warehouses');
const inputX = document.getElementById('loc-x');
const inputY = document.getElementById('loc-y');
const droneQuantity = document.getElementById('drone-quantity');
const addBtn = document.getElementById('add-btn');
// const deleteBtn = document.getElementById('del-btn');
const tableBody = document.getElementById('tbody');
const orderRowMap = new Map();

usernameEl.innerText = username;

// SOCKETS

const socket = io('http://localhost:5000/');

socket.on('connect', () => {
  console.log(`Socket connected ${socket.id}`);
});

socket.on('warehouse-list', (list) => {
  console.log(list);
  warehousesContainer.innerHTML = '';
  list.forEach((item) => {
    const warehouse = document.createElement('h4');
    warehouse.innerHTML = `
    <h4>
      Warehouse '${item.id}': at
      <span class="coords">X: ${item.location.x}, Y: ${item.location.y} | Drones: ${item.dronesCount}</span>
    </h4>
    `;
    warehousesContainer.appendChild(warehouse);
  });
});

socket.emit('joinRoom', 'owner');

socket.on('roomJoined', (data) => {
  console.log(data);
});

socket.on('order-accepted', (data) => {
  console.log(':: order-accepted =>', data);
  createTableRow(data, tableBody, orderRowMap);
});

socket.on('orders-table', (tableData) => {
  updateTable(tableData, tableBody, orderRowMap);
  console.log(tableData);
});

addBtn.addEventListener('click', () => {
  if (inputX.value !== '' && inputY.value !== '' && droneQuantity.value !== '') {
    const coordX = parseInt(inputX.value, 10);
    const coordY = parseInt(inputY.value, 10);
    const dronesCount = parseInt(droneQuantity.value, 10);
    console.log(typeof dronesCount);
    const newWarehouse = new WarehouseInit(coordX, coordY, dronesCount);

    socket.emit('add-warehouse', newWarehouse);

    inputX.value = '';
    inputY.value = '';
    droneQuantity.value = '';
  } else {
    alert('please input coordinates');
  }
});

usernameContainer.addEventListener('mouseenter', () => {
  usernameEl.innerText = 'Logout';
});

usernameContainer.addEventListener('mouseleave', () => {
  usernameEl.innerText = username;
});

usernameContainer.addEventListener('click', async () => {
  try {
    await fetch('/logout', { method: 'POST' });
    window.location.href = 'index.html';
    console.log('Logout ok');
  } catch (error) {
    console.log('Logout fail', error);
  }
});
