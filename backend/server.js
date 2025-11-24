process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors')
const path = require('path')
const http = require('http');
const { Server } = require('socket.io');
const socketManager = require('./socketManager/socketManager');
const indexRoutes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',   // your frontend URL
    credentials: true
  }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', indexRoutes);

// Define a root route
app.get('/', (req, res) => {
    res.send('Hello Hotel Booking Admin Panel !');
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});
 
socketManager.initializeSocket(io);

app.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
});
