// server.js (ESM)
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// Healthcheck endpoints for quick tests
app.get("/", (req, res) => {
  res.send("✅ Socket.IO server is running!");
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Send a welcome message right after connect
  socket.emit("server:welcome", { id: socket.id, connectedAt: Date.now() });

  // Simple ping/pong latency test
  socket.on("client:ping", (payload, ack) => {
    if (typeof ack === "function") ack({ pong: true, at: Date.now(), echo: payload });
  });

  // Room join/leave to test scoped broadcasts
  socket.on("room:join", (roomName, ack) => {
    if (!roomName) return typeof ack === "function" && ack({ ok: false, error: "roomName required" });
    socket.join(roomName);
    console.log(`🏠 ${socket.id} joined room:`, roomName);
    io.to(roomName).emit("room:joined", { room: roomName, userId: socket.id });
    if (typeof ack === "function") ack({ ok: true });
  });

  socket.on("room:leave", (roomName, ack) => {
    if (!roomName) return typeof ack === "function" && ack({ ok: false, error: "roomName required" });
    socket.leave(roomName);
    console.log(`🚪 ${socket.id} left room:`, roomName);
    io.to(roomName).emit("room:left", { room: roomName, userId: socket.id });
    if (typeof ack === "function") ack({ ok: true });
  });

  // Basic chat message demo (optionally scoped to a room)
  socket.on("chat:message", ({ message, room }, ack) => {
    const payload = { userId: socket.id, message, at: Date.now() };
    if (room) {
      io.to(room).emit("chat:message", { ...payload, room });
    } else {
      io.emit("chat:message", payload);
    }
    if (typeof ack === "function") ack({ ok: true });
  });

  // Existing game events kept as-is for your client
  socket.on("addCard", () => {
    console.log("📥 addCard từ client");
    io.emit("addCard");
  });

  socket.on("mergeCard", () => {
    console.log("📥 mergeCard từ client");
    io.emit("mergeCard");
  });

  socket.on("resetFlow", () => {
    console.log("📥 resetFlow từ client");
    io.emit("resetFlow");
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, "reason:", reason);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("\n🛑 Shutting down...");
  io.close(() => {
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

