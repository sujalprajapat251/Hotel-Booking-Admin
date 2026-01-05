const jwt = require('jsonwebtoken');
const Staff = require('../models/staffModel')
const Notification = require('../models/notificationModel')

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
      const user = await Staff.findById(decoded._id);
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
  
    // Handle user room joining (explicit from client)
    socket.on("joinRoom", ({ userId }) => {
      if (userId) {
        const uid = String(userId);
        const set = userSocketMap.get(uid) || new Set();
        set.add(socket.id);
        userSocketMap.set(uid, set);
        socketUserMap.set(socket.id, uid);
        // Also join a per-user room so notifications work across clustered workers with Redis
        try {
          socket.join(`user:${uid}`);
        } catch (err) {
          console.error(`Failed to join user room user:${uid}:`, err?.message || err);
        }
      }
    });

    // Automatically map & join room for authenticated sockets
    if (socket.userId) {
      const uid = String(socket.userId);
      const set = userSocketMap.get(uid) || new Set();
      set.add(socket.id);
      userSocketMap.set(uid, set);
      socketUserMap.set(socket.id, uid);
      try {
        socket.join(`user:${uid}`);
      } catch (err) {
        console.error(`Failed to join user room on connect user:${uid}:`, err?.message || err);
      }
    }

    // Join music-specific room by ID
    socket.on("joinMusicRoom", ({ musicId }) => {
      if (!musicId) return;
      const room = `music:${musicId}`;
      try {
        socket.join(room);
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
      } catch (err) {
        console.error(`Failed to leave music room ${room}:`, err?.message || err);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err?.message || err);
    });

    // Handle disconnect with cleanup
    socket.on("disconnect", (reason) => {
       
      // Remove mappings on disconnect
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        const set = userSocketMap.get(userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) userSocketMap.delete(userId);
          else userSocketMap.set(userId, set);
        }
        socketUserMap.delete(socket.id);
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
    });
  });

  // Cleanup disconnected sockets periodically
  setInterval(() => {
    for (const [socketId, userId] of socketUserMap.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket || !socket.connected) {
        socketUserMap.delete(socketId);
        const set = userSocketMap.get(userId);
        if (set) {
          set.delete(socketId);
          if (set.size === 0) userSocketMap.delete(userId);
          else userSocketMap.set(userId, set);
        }
      }
    }
  }, 30000); // Check every 30 seconds
}

function buildDesignationRegex(designations = []) {
  const map = {
    hod: /^(hod|head\s*of\s*department)$/i,
    waiter: /^waiter$/i,
    chef: /^chef$/i,
    accountant: /^accountant$/i,
    admin: /^(admin|administrator)$/i,
    receptionist: /^receptionist$/i
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
      const dpt = departmentId || (t?.department ? String(t.department) : null);
      const payload = dpt ? { ...data, departmentId: dpt } : { ...data };
      // Emit to the per-user room so it works across all workers via Redis adapter
      ioInstance.to(`user:${uid}`).emit(event, payload);
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
    const payload = departmentId ? { ...data, departmentId } : { ...data };
    // Emit to per-user room so notifications reach correct user on any worker
    ioInstance.to(`user:${uid}`).emit(event, payload);
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
    emitBookingChanged: (data) => {
      try {
        if (!ioInstance) return;
        ioInstance.emit('booking_changed', data);
      } catch (error) {
        console.error("Error emitting booking_changed:", error);
      }
    },
  };
