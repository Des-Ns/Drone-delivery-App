import Warehouse from './Classes/Warehouse.js';

const username = sessionStorage.getItem('username');
const usernameContainer = document.querySelector('.username');
const usernameEl = document.getElementById('username');
const warehousesContainer = document.getElementById('warehouses');
const inputX = document.getElementById('loc-x');
const inputY = document.getElementById('loc-y');
const addBtn = document.getElementById('add-btn');
// const deleteBtn = document.getElementById('del-btn');

usernameEl.innerText = username;

// nsp ='/'
const socket = io('http://localhost:5000/');

socket.on('connect', () => {
  console.log(`Socket connected ${socket.id}`);
});

socket.on('msg', (msg) => {
  console.log(msg);
});

socket.on('warehouse-list', (list) => {
  console.log(list);
  warehousesContainer.innerHTML = '';
  list.forEach((item) => {
    const warehouse = document.createElement('h4');
    warehouse.innerHTML = `
    <h4>
      Warehouse '${item.id}': at
      <span class="coords">X: ${item.location.x}, Y: ${item.location.y}</span>
    </h4>
    `;
    warehousesContainer.appendChild(warehouse);
  });
});

socket.emit('joinRoom', 'owner');

socket.on('roomJoined', (data) => {
  console.log(data);
});

addBtn.addEventListener('click', () => {
  if (inputX.value !== '' && inputY.value !== '') {
    const coordX = inputX.value;
    const coordY = inputY.value;
    const newWarehouse = new Warehouse(coordX, coordY);
    console.log(coordX, coordY, newWarehouse);

    socket.emit('add-warehouse', newWarehouse);

    inputX.value = '';
    inputY.value = '';
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
