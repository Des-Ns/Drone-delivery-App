# Drone App

A Node.js application for managing drone deliveries, warehouses, and real-time order tracking. The app supports user authentication, owner and client roles, and live updates using Socket.IO. The app goal is delivery simulation and proof of concept exercise. Application is serveing static frontend files while providing a dynamic, real-time backend.

## Features

- **User Authentication:** Login/logout with session management.
- **Owner and Client Roles:** Owners can manage warehouses and view all orders; clients can place orders.
- **Warehouse Management:** Add/remove warehouses, manage drones, and track their status.
- **Order Management:** Place orders, assign drones, and track delivery progress in real time.
- **Order History:** Owners can view the history and progress of all orders.
- **Real-Time Updates:** Uses Socket.IO for live communication between server and clients.
- **Session Handling:** Ensures one session per browser, with session validation and redirection.

## Project Structure

```
drone-app/
│
├── server.js                # Main server entry point
├── sockets.js               # Socket.IO event handling
├── package.json
│
├── classes/
│   ├── Drone.js             # Drone class logic
│   ├── Network.js           # Network logic for order assignment and delivery
│   ├── Room.js              # Room class for order history and progress
│   ├── User.js              # User class
│   └── Warehouse.js         # Warehouse class logic
│
├── middlewares/
│   └── sessionMiddleware.js # Express session middleware and helpers
│
└── public/
    ├── index.html           # Login page
    ├── owner.html           # Owner dashboard
    ├── client.html          # Client dashboard
    ├── css/                 # Stylesheets
    ├── img/                 # Images
    └── scripts/             # Client-side JS
```

## Getting Started

### Prerequisites

- Node.js (v18.16.0 used)
- npm

### Installation

1. Clone the repository:

   ```
   git clone <your-repo-url>
   cd drone-app
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage

- **Login:** Use the login form on `index.html` to log in as an owner or client.
- **Owner Dashboard:** Access `owner.html` to manage warehouses and view all orders and their progress.
- **Client Dashboard:** Access `client.html` to place new orders and track their status.
- **Order History:** Owners receive the full order history (with progress) upon entering the owner room. History for users is not implemented!

## Code Highlights

- **Session Management:** Uses `express-session` with a memory store for development.
- **Socket.IO Integration:** Real-time events for joining rooms, order updates, and warehouse management.
- **Room Class:** Stores order history and progress for each room.
- **Network Class:** Handles order assignment, drone dispatch, and delivery countdowns.

## Development Notes

- The app goal is delivery simulation and proof of concept exercise.
- The app uses in-memory storage for sessions, users, and order data.
- There can be only one loggin per browser instance. ( different browsers or browser profiles can be used )
- The code is modular, with clear separation between server logic, business logic (classes), and client-side scripts.
