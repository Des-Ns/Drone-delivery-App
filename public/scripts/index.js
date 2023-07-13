const loginForm = document.getElementById('login-form');
const backdrop = document.getElementById('backdrop');
const ownerBtn = document.getElementById('owner');
const clientBtn = document.getElementById('client');

let user;

ownerBtn.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  backdrop.classList.remove('hidden');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // get and store the username from the server
        const data = await response.json();
        const usernameRes = data.username;
        sessionStorage.setItem('username', usernameRes);

        window.location.href = 'http://localhost:5000/owner.html';
      } else {
        const errorData = await response.json();
        console.error(errorData.error);
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
    }
  });
});

clientBtn.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  backdrop.classList.remove('hidden');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const usernameRes = data.username;
        sessionStorage.setItem('username', usernameRes);

        window.location.href = 'http://localhost:5000/client.html';
      } else {
        const errorData = await response.json();
        console.error(errorData.error);
      }
    } catch (error) {
      console.error('An error occurred during login:', error);
    }
  });
});
