// document.addEventListener('DOMContentLoaded', () => {
const username = sessionStorage.getItem('username');
const usernameEl = document.getElementById('username');

usernameEl.innerText = username;

console.log(sessionStorage);

// nsp ='/'
const socket = io('http://localhost:5000/');

socket.on('connect', () => {
  console.log(`Socket connected ${socket.id}`);
});

socket.on('msg', (msg) => {
  console.log(msg);
});

socket.emit('joinRoom', 'owner');

socket.emit('Room', '1234');

socket.on('roomJoined', (data) => {
  console.log(data);
});
// });
