// eslint-disable-next-line no-undef
const socket = io();

const ownerLink = document.getElementById('owner');
const clientLink = document.getElementById('client');
// console.log(ownerLink);

socket.on('msg', (msg) => {
  console.log(msg);
});

ownerLink.addEventListener('click', () => {
  const roomName = 'owner';
  socket.emit('joinRoom', roomName);
});

clientLink.addEventListener('click', () => {
  const roomName = 'client';
  socket.emit('joinRoom', roomName);
});
