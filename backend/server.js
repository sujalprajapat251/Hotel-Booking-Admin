process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors')
const path = require('path')
const http = require('http');
const { Server } = require('socket.io');
const socketManager = require('./socketManager/socketManager');
const indexRoutes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const {doubleCsrfProtection} = require("./middleware/csrfProtection");
const csrfRoutes = require("./routes/csrf.routes");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");

const numCPUs = os.cpus().length;
const port = process.env.PORT || 5000

if (cluster.isPrimary) {
  console.log(`🟢 Master ${process.pid} running`);

  const httpServer = http.createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  httpServer.listen(port);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`🔴worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  const app = express();
  const allowedOrigins = (process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'https://k02wn09x-3000.inc1.devtunnels.ms', 'https://hotel-admin-panel.netlify.app']);

  app.use(express.json())
  app.use(cookieParser());
  // app.use(mongoSanitize({ replaceWith: '_' }));
  // app.use(xss());
  app.use(helmet());
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use('/api', csrfRoutes);
  app.use('/api', doubleCsrfProtection);
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
    // pingTimeout: 60000,
    // pingInterval: 25000,
    // connectTimeout: 45000,
  });

  setupWorker(io);
  const pubClient = createClient({ url: process.REDIS_URL });
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('Redis Pub Error', err));
  subClient.on('error', (err) => console.error('Redis Sub Error', err));

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log(`✅ Redis Adapter connected (Worker ${process.pid})`);
  }).catch(err => {
    console.error("Redis connection failed, sockets might not sync", err);
  });

  

  const startServer = async () => {
    try {
      await connectDb();
      console.log(`✅ DB Connected (Worker ${process.pid})`);
  
      server.listen(0, () => {
        console.log(`🧵 Worker ${process.pid} ready`);
      });

      socketManager.initializeSocket(io);
    } catch (err) {
      console.error("❌ Worker initialization failed", err);
      process.exit(1);
    }
  };

  startServer();

  // server.listen(port, () => {
  //   connectDb();
  //   console.log(`Server is running on port ${port}`);
  // });
}


