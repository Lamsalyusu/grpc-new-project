# GRPC Task Management Project

This project is a task management system with authentication, task collaboration, real-time messaging, notifications, and reminders. It is built in two main parts:

- [InternProject1](InternProject1) - Express REST API, static frontend, Socket.IO real-time features, reminder job
- [server](server) - gRPC backend service that handles business logic and database communication

The project is designed to support team task management, user collaboration, and live updates across connected clients.

## Main features

- User registration and login
- JWT-based authentication
- Task creation, update, deletion, and filtering
- Task collaborator management
- Real-time chat per task
- Notification system
- Reminder scheduling
- Admin-related routes and access control
- Health check endpoint

## Project structure

```text
GRPC-NEW/
├── .env.example
├── README.md
├── proto/
│   ├── auth.proto
│   ├── task.proto
│   ├── ...
├── InternProject1/
│   ├── client/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── server/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

## How the app works

### 1) Express app
The app in [InternProject1/src/app.ts](InternProject1/src/app.ts) sets up:

- Express server
- CORS and Helmet security
- JSON parsing
- Public frontend files from the client folder
- Route groups for auth, tasks, notifications, collaboration, and admin
- Socket.IO initialization

The server starts in [InternProject1/src/server.ts](InternProject1/src/server.ts).

### 2) Real-time features
The app uses Socket.IO for live task communication. The chat and socket logic is handled in the socket folder under [InternProject1/src/sockets](InternProject1/src/sockets).

### 3) gRPC backend
The backend in [server/src/server.ts](server/src/server.ts) loads the proto files from the [proto](proto) folder and registers all gRPC services. It connects to the database and exposes service handlers for auth, tasks, messages, reminders, notifications, collaboration, and admin functions.

### 4) Database layer
The project uses Sequelize with a MySQL/PostgreSQL-style setup. The config is defined in [server/src/config/config.js](server/src/config/config.js) and the project keeps its database access in the server-side folders.

## Tech stack

- TypeScript
- Express.js
- Socket.IO
- gRPC
- Sequelize ORM
- PostgreSQL / MySQL compatible setup
- JWT authentication
- Zod validation
- Node-cron for reminders
- Winston logging

## Environment setup

Create a .env file based on [.env.example](.env.example) in the project root.

Example values:

```env
DB_NAME="your db name"
DB_HOST="your db host"
DB_PORT="your db port"
DB_USER="username"
DB_PASSWORD="password"
JWT_SECRET="your jwt secret key"
GRPC_PORT="50051"
```

## Install dependencies

From the root project folder:

```bash
npm install
```

Then install dependencies for each app separately:

```bash
cd InternProject1
npm install

cd ../server
npm install
```

## Run the project

### Start the Express app

```bash
cd InternProject1
npm run dev
```

This starts the HTTP server and realtime socket server.

### Start the gRPC backend

```bash
cd server
npm run dev
```

The gRPC service usually runs on the port defined in GRPC_PORT.

## Useful commands

### In [InternProject1](InternProject1):

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### In [server](server):

```bash
npm run dev
npm run build
npm run start
npm run migrate
npm run migrate:undo
npm run seed
npm run lint
```

## Access points

- Frontend / API: http://localhost:3000
- Health check: http://localhost:3000/health
- gRPC server: usually 127.0.0.1:50051

## Notes

- This project is structured as a full-stack task app with both API and realtime logic.
- The frontend is served as static HTML/CSS/JS files, while the backend handles the application logic.
- The project is meant to be run with both the Express app and the gRPC server active together.

## Summary

This project combines a traditional web app with a gRPC backend and realtime collaboration features. It is a good base for task management apps where users can work together, receive notifications, and chat on tasks in real time.
