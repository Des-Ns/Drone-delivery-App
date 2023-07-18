import { Order } from './Classes/Order.js';

const tableBody = document.getElementById('tbody');
const username = sessionStorage.getItem('username');
const usernameContainer = document.querySelector('.username');
const usernameEl = document.getElementById('username');
const form = document.getElementById('form');
const productsEl = document.querySelectorAll('#product');

let products = [];
let newOrder;

usernameEl.innerText = username;

function highliteProduct(prodEl) {
  if (prodEl.classList.contains('active')) {
    prodEl.classList.remove('active');
    return;
  }
  prodEl.classList.add('active');
}

function createOrder(productEl, name, locX, locY) {
  newOrder = new Order(name, locX, locY, productEl);
  return newOrder;
}

function addNewOrderToTable() {
  const newLine = `
  <tr>
    <td>#4531</td>
    <td>Domenic Jamess</td>
    <td>135/345</td>
    <td>95%</td>
    <td>156 units</td>
    <td>14 min</td>
    <td>in progress</td>
  </tr>
  `;

  tableBody.innerHTML += newLine;
}

// nsp ='/'
const socket = io('http://localhost:5000/');

socket.on('connect', () => {
  console.log(`Socket connected ${socket.id}`);
});

socket.on('msg', (msg) => {
  console.log(msg);
});

socket.emit('joinRoom', 'client');

socket.emit('Room', 'ABCD');

socket.on('roomJoined', (data) => {
  console.log(data);
});

socket.on('order-msg', (data) => {
  console.log(data);
});

productsEl.forEach((prodEl) => {
  prodEl.addEventListener('click', () => {
    highliteProduct(prodEl);
    products.push(prodEl.getAttribute('data-value'));
    return prodEl;
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const locX = e.target.locx.value;
  const locY = e.target.locy.value;

  newOrder = createOrder(products, name, locX, locY);

  productsEl.forEach((prodEl) => {
    prodEl.classList = 'product';
  });
  form.reset();
  products = [];

  socket.emit('order', newOrder); // emit order object
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
