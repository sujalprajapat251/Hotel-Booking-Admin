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
const allowedOrigins = (process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000','http://localhost:3001','http://127.0.0.1:3000','http://127.0.0.1:3001', 'http://localhost:3002','https://k02wn09x-3000.inc1.devtunnels.ms']);

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
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
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
});
 
socketManager.initializeSocket(io);

server.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
});
