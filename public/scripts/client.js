import Order from './Classes/Order.js';
import { updateTable, createTableRow, highlightElement } from './shared.js';

const username = sessionStorage.getItem('username');
const usernameContainer = document.querySelector('.username');
const usernameEl = document.getElementById('username');
const form = document.getElementById('form');
const productsEl = document.querySelectorAll('#product');
const tableBody = document.getElementById('tbody');
const orderRowMap = new Map();

setInterval(() => {
  console.dir(orderRowMap);
}, 1500);

let products = [];
let newOrder;

usernameEl.innerText = username;

function createOrder(productEl, name, locX, locY) {
  newOrder = new Order(name, locX, locY, productEl);
  return newOrder;
}

const socket = io('http://localhost:5000/');

socket.on('connect', () => {
  console.log(`Socket connected ${socket.id}`);
});

socket.emit('joinRoom', 'client');

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

productsEl.forEach((prodEl) => {
  prodEl.addEventListener('click', () => {
    highlightElement(prodEl);
    products.push(prodEl.getAttribute('data-value'));
    return prodEl;
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const locX = e.target.locx.value;
  const locY = e.target.locy.value;

  if (products.length === 0) {
    alert('Please select product.');
  } else {
    newOrder = createOrder(products, name, locX, locY);

    productsEl.forEach((prodEl) => {
      prodEl.classList = 'product';
    });
    form.reset();
    products = [];

    socket.emit('order', newOrder); // emit order object
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
