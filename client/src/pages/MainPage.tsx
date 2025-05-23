import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const MainPage = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ 연결 성공!", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ 연결 해제");
      setConnected(false);
    });
  }, []);

  return <div>{connected ? "✅ 연결됨" : "❌ 연결 안됨"}</div>;
};

export default MainPage;
