process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const express = require('express');
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDb = require('./db/db');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const socketManager = require('./socketManager/socketManager');
const indexRoutes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const { doubleCsrfProtection } = require("./middleware/csrfProtection");
const csrfRoutes = require("./routes/csrf.routes");

const port = process.env.PORT || 5000;

const app = express();

// ✅ Allowed Origins
const allowedOrigins = (process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://k02wn09x-3000.inc1.devtunnels.ms',
      'https://hotel-admin-panel.netlify.app'
    ]);

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api', csrfRoutes);
app.use('/api', doubleCsrfProtection);
app.use('/api', indexRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Hello Hotel Booking Admin Panel !');
});

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Socket.IO setup (simple)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
});

// Initialize sockets
socketManager.initializeSocket(io);

// ✅ Start server
const startServer = async () => {
  try {
    await connectDb();
    console.log('✅ DB Connected');

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error("❌ Server start failed", err);
    process.exit(1);
  }
};

startServer();