import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// 기본 라우트 추가
app.get("/", (req, res) => {
  res.json({ message: "The Drawing Lies Server is running!" });
});

// 헬스체크 엔드포인트
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`✅ 유저 연결됨: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ 유저 연결 종료: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
