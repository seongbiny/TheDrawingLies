import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupRoomHandlers } from "./handlers/roomHandlers";

const app = express();
const server = createServer(app);

// Socket.IO 서버 설정
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // 클라이언트 URL
    methods: ["GET", "POST"],
  },
});

// Express 미들웨어
app.use(express.json());

// 기본 라우트들
app.get("/", (req, res) => {
  res.json({
    message: "The Drawing Lies Server is running!",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO 연결 처리
io.on("connection", (socket) => {
  console.log(`✅ 새 사용자 연결: ${socket.id}`);

  // 방 관리 이벤트 핸들러 설정
  setupRoomHandlers(socket, io);

  socket.on("disconnect", (reason) => {
    console.log(`❌ 사용자 연결 해제: ${socket.id}, 이유: ${reason}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📊 상태 확인: http://localhost:${PORT}/health`);
});
