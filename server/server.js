import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import http from 'http'
import connectDB from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import friendRouter from './routes/friendRoutes.js'
import roomRouter from './routes/roomRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import passkeyRouter from './routes/passkeyRoutes.js'
import {Server} from 'socket.io'
import startRoomExpiryScheduler from './lib/roomExpiry.js'

// server creation
const app = express()
const server = http.createServer(app)

// NEW CONCEPT FOR ME: SOCKET.IO SETUP
// Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store online users
export const userSocketMap = {};
globalThis.io = io;
globalThis.userSocketMap = userSocketMap;
globalThis.roomPresence = {};

// Expose io and userSocketMap on globalThis to avoid circular import issues
globalThis.io = io;
globalThis.userSocketMap = userSocketMap;

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId);

  // Save user socket
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join room namespaces for group rooms
  socket.on("room:join", (roomId) => {
    socket.join(`room:${roomId}`);
    const uid = userId?.toString();
    if (!uid) return;
    if (!globalThis.roomPresence[roomId]) globalThis.roomPresence[roomId] = new Set();
    globalThis.roomPresence[roomId].add(uid);
    io.to(`room:${roomId}`).emit("room:presence", {
      roomId: roomId.toString(),
      present: Array.from(globalThis.roomPresence[roomId]),
    });
  });
  socket.on("room:leave", (roomId) => {
    socket.leave(`room:${roomId}`);
    const uid = userId?.toString();
    if (!uid) return;
    const set = globalThis.roomPresence[roomId];
    if (set) {
      set.delete(uid);
      io.to(`room:${roomId}`).emit("room:presence", {
        roomId: roomId.toString(),
        present: Array.from(set),
      });
    }
  });
  socket.on("room:typing", ({ roomId, userId, typing }) => {
    socket.to(`room:${roomId}`).emit("room:typing", { roomId, userId, typing });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);

    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }
    // Remove from all roomPresence sets
    const uid = userId?.toString();
    if (uid) {
      Object.entries(globalThis.roomPresence).forEach(([rid, set]) => {
        if (set.delete(uid)) {
          io.to(`room:${rid}`).emit("room:presence", { roomId: rid, present: Array.from(set) });
        }
      });
    }

    // Emit updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // WebRTC Signaling
  socket.on("call-user", ({ to, offer, callerInfo }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      socket.to(toSocketId).emit("incoming-call", { from: userId, offer, callerInfo });
    }
  });

  socket.on("answer-call", ({ to, answer }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      socket.to(toSocketId).emit("call-accepted", { from: userId, answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      socket.to(toSocketId).emit("ice-candidate", { from: userId, candidate });
    }
  });

  socket.on("reject-call", ({ to }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      socket.to(toSocketId).emit("call-rejected", { from: userId });
    }
  });

  socket.on("end-call", ({ to }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      socket.to(toSocketId).emit("call-ended", { from: userId });
    }
  });
});


// middlewares
app.use(express.json({limit: "50mb"}))
app.use(cors())

// sample routes
app.use("/api/status", (req, res)=> res.send("Server is live"))

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)
app.use("/api/friends", friendRouter)
app.use("/api/rooms", roomRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/passkey", passkeyRouter)

//connect to database
await connectDB()

const PORT = process.env.PORT || 6000
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on PORT: ${PORT}`)
})

// start expiry scheduler
startRoomExpiryScheduler(io)
