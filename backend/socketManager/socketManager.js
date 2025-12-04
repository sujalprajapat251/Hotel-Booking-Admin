const jwt = require('jsonwebtoken');
const Staff = require('../models/staffModel')
const Notification = require('../models/notificationModel')

// Store user-to-socket mappings
const userSocketMap = new Map();
const socketUserMap = new Map();

let ioInstance = null;

function initializeSocket(io) {
  // Store io instance for later use
  ioInstance = io;
  // Socket authentication middleware
  io.use(async (socket, next) => {
    const { userId, token } = socket.handshake.auth;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      
      // Check if user exists
      // console.log(decoded._id);
      const user = await Staff.findById(decoded._id);
      // console.log(user);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.userId = decoded._id?.toString() || userId;
      next();
    } catch (error) {
      console.error('Socket Authentication Error:', error);
      return next(new Error('Authentication error'));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "userId:", socket.userId || null);
  
    // Handle user room joining
    socket.on("joinRoom", ({ userId }) => {
      if (userId) {
        // Store socket-user mapping
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, userId);
        // console.log(`User ${userId} joined their personal room`);
      }
    });

    if (socket.userId) {
      userSocketMap.set(String(socket.userId), socket.id);
      socketUserMap.set(socket.id, String(socket.userId));
    }

    // Join music-specific room by ID
    socket.on("joinMusicRoom", ({ musicId }) => {
      if (!musicId) return;
      const room = `music:${musicId}`;
      try {
        socket.join(room);
        // console.log(`Socket ${socket.id} joined music room ${room}`);
      } catch (err) {
        console.error(`Failed to join music room ${room}:`, err?.message || err);
      }
    });

    // Leave music-specific room
    socket.on("leaveMusicRoom", ({ musicId }) => {
      if (!musicId) return;
      const room = `music:${musicId}`;
      try {
        socket.leave(room);
        // console.log(`Socket ${socket.id} left music room ${room}`);
      } catch (err) {
        console.error(`Failed to leave music room ${room}:`, err?.message || err);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err?.message || err);
    });

    // Handle disconnect with cleanup
    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
       
      // Remove mappings on disconnect
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      // console.log(`Socket ${socket.id} reconnected`);
    });
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    const disconnectedSockets = [];
    
    for (const [socketId, userId] of socketUserMap.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        disconnectedSockets.push({ socketId, userId });
      }
    }
    
    disconnectedSockets.forEach(({ socketId, userId }) => {
      userSocketMap.delete(userId);
      socketUserMap.delete(socketId);
      // console.log(`Cleaned up disconnected socket ${socketId} for user ${userId}`);
    });
  
  }, 30000); // Check every 30 seconds
}

function buildDesignationRegex(designations = []) {
  const map = {
    hod: /^(hod|head\s*of\s*department)$/i,
    waiter: /^waiter$/i,
    chef: /^chef$/i,
    accountant: /^accountant$/i,
    admin: /^admin$/i
  };
  return designations.map(d => {
    const key = String(d || '').toLowerCase();
    const regex = map[key] || new RegExp(`^${key}$`, 'i');
    return { designation: { $regex: regex } };
  });
}

async function emitRoleNotification({ departmentId, designations = [], excludeUserId = null, event = 'notify', data = {} } = {}) {
  try {
    if (!ioInstance || !designations.length) return;
    const or = buildDesignationRegex(designations);
    const baseQuery = departmentId ? { department: departmentId, $or: or } : { $or: or };
    const targets = await Staff.find(baseQuery).select('_id department');
    const excludeId = excludeUserId ? String(excludeUserId) : null;
    const docs = [];
    targets.forEach(t => {
      const uid = String(t._id);
      if (excludeId && uid === excludeId) return;
      const socketId = userSocketMap.get(uid);
      const dpt = departmentId || (t?.department ? String(t.department) : null);
      const payload = dpt ? { ...data, departmentId: dpt } : { ...data };
      if (socketId) {
        ioInstance.to(socketId).emit(event, payload);
      }
      docs.push({ user: uid, department: dpt, type: data?.type || event, message: data?.message || '', payload: data, seen: false });
    });
    if (docs.length) {
      await Notification.insertMany(docs.map(d => ({ ...d })), { ordered: false });
    }
  } catch {}
}

async function emitUserNotification({ userId, event = 'notify', data = {}, departmentId = null } = {}) {
  try {
    if (!ioInstance || !userId) return;
    const uid = String(userId);
    if (!departmentId) {
      try {
        const u = await Staff.findById(uid).populate('department');
        departmentId = u?.department?._id || null;
      } catch {}
    }
    const socketId = userSocketMap.get(uid);
    const payload = departmentId ? { ...data, departmentId } : { ...data };
    if (socketId) {
      ioInstance.to(socketId).emit(event, payload);
    }
    try {
      const Notification = require('../models/notificationModel');
      await Notification.create({ user: uid, department: departmentId || null, type: payload?.type || event, message: payload?.message || '', payload, seen: false });
    } catch {}
  } catch {}
}
  module.exports = { 
    initializeSocket,
    getUserSocketMap: () => userSocketMap,
    getSocketUserMap: () => socketUserMap,
    // notifyMusicUpdated,
    emitWorkerAssigneChnaged:(workerId)=>{
      try {
        if (!ioInstance) return;
        ioInstance.emit('worker_asignee_changed', { workerId });
      } catch {}
    },
    emitCafeOrderChanged: (tableId, order) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('cafe_order_changed', { tableId, order });
      } catch {}
    },
    emitBarOrderChanged: (tableId, order) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('bar_order_changed', { tableId, order });
      } catch {}
    },
    emitRestaurantOrderChanged: (tableId, order) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('restaurant_order_changed', { tableId, order });
      } catch {}
    },
    emitCafeTableStatusChanged: (tableId, table) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('cafe_table_status_changed', { tableId, table });
      } catch {}
    },
    emitBarTableStatusChanged: (tableId, table) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('bar_table_status_changed', { tableId, table });
      } catch {}
    },
    emitRestaurantTableStatusChanged: (tableId, table) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('restaurant_table_status_changed', { tableId, table });
      } catch {}
    },
    emitRoleNotification,
    emitUserNotification,
  };
