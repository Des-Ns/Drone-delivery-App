const socket = io();

const form = document.getElementById('form');
const productsEl = document.querySelectorAll('#product');

let product = [];
let newOrder;

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

productsEl.forEach((prodEl) => {
  prodEl.addEventListener('click', () => {
    highliteProduct(prodEl);
    product.push(prodEl.getAttribute('data-value'));
    return prodEl;
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const locX = e.target.locx.value;
  const locY = e.target.locy.value;

  newOrder = createOrder(product, name, locX, locY);

  productsEl.forEach((prodEl) => {
    prodEl.classList = 'product';
  });
  form.reset();
  product = [];

  socket.emit('order', newOrder);
});
