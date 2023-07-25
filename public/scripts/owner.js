import WarehouseInit from './Classes/WarehouseInit.js';
import { updateTable, highlightElement } from './shared.js';

const username = sessionStorage.getItem('username');
const usernameContainer = document.querySelector('.username');
const usernameEl = document.getElementById('username');
let warehousesContainer = document.getElementById('warehouses');
const warehouseEls = document.querySelectorAll('.warehouse');
const inputX = document.getElementById('loc-x');
const inputY = document.getElementById('loc-y');
const droneQuantity = document.getElementById('drone-quantity');
const addBtn = document.getElementById('add-btn');
const deleteBtn = document.getElementById('del-btn');
const tableBody = document.getElementById('tbody');
const orderRowMap = new Map();
console.log(warehouseEls);
const warehouses = [];

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
    warehouses.push(item);
    const warehouse = document.createElement('h4');
    warehouse.innerHTML = `
    <h4 class="warehouse" data-value="${item.id}">
      Warehouse '${item.id}': at X: ${item.location.x}, Y: ${item.location.y} | Drones: ${item.dronesCount}
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

socket.on('order-update', (data) => {
  updateTable(data, tableBody, orderRowMap);
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

document.addEventListener('DOMContentLoaded', () => {
  warehousesContainer = document.getElementById('warehouses');

  warehousesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('warehouse')) {
      const warehouse = event.target;
      const isSelected = warehouse.getAttribute('data-selected') === 'true';
      warehouse.setAttribute('data-selected', isSelected ? 'false' : 'true');
      highlightElement(warehouse);
    }
  });

  deleteBtn.addEventListener('click', () => {
    const selectedWarehouses = document.querySelectorAll('.warehouse[data-selected="true"]');
    console.log(selectedWarehouses);

    const warehousesIdsToDelete = Array.from(selectedWarehouses).map((warehouse) =>
      warehouse.getAttribute('data-value')
    );
    console.log(warehousesIdsToDelete);

    socket.emit('remove-warehouse', warehousesIdsToDelete);
  });
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
