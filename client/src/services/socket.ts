import { io, Socket } from "socket.io-client";

// 서버 타입들과 동일하게 맞춤
interface User {
  id: string;
  username: string;
  socketId: string;
  role: "mafia" | "drawer" | "guesser" | null;
  joinedAt: string; // 클라이언트에서는 string으로 받음
  isHost: boolean;
}

interface GameState {
  status: "waiting" | "playing" | "finished";
  word: string | null;
  startedAt: string | null;
  timeLeft: number;
  winner: string | null;
}

interface Room {
  id: string;
  users: User[];
  gameState: GameState;
  createdAt: string;
  updatedAt: string;
}

// 이벤트 페이로드 타입들
interface CreateRoomPayload {
  username: string;
}

interface JoinRoomPayload {
  roomId: string;
  username: string;
}

interface RoomCreatedResponse {
  roomId: string;
  user: User;
  users: User[];
}

interface UserJoinedResponse {
  user: User;
  users: User[];
}

interface UserLeftResponse {
  userId: string;
  users: User[];
}

interface ErrorResponse {
  code: string;
  message: string;
}

class SocketService {
  private socket: Socket | null = null;
  private eventCallbacks: Map<string, ((date: any) => void)[]> = new Map();

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log("🔌 Socket 연결 시도...");

    this.socket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    this.setupBaseEventListeners();
    return this.socket;
  }

  private setupBaseEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket 연결 성공:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket 연결 해제:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket 연결 실패:", error.message);
    });

    // 서버 이벤트 리스너들
    this.socket.on("roomCreated", (data: RoomCreatedResponse) => {
      console.log("📥 방 생성 완료:", data);
      this.triggerCallbacks("roomCreated", data);
    });

    this.socket.on("roomJoined", (data: UserJoinedResponse) => {
      console.log("📥 방 참여 완료:", data);
      this.triggerCallbacks("roomJoined", data);
    });

    this.socket.on("userJoined", (data: UserJoinedResponse) => {
      console.log("📥 새 사용자 참여:", data);
      this.triggerCallbacks("userJoined", data);
    });

    this.socket.on("userLeft", (data: UserLeftResponse) => {
      console.log("📥 사용자 퇴장:", data);
      this.triggerCallbacks("userLeft", data);
    });

    this.socket.on("error", (data: ErrorResponse) => {
      console.error("❌ 서버 에러:", data);
      this.triggerCallbacks("error", data);
    });
  }

  // 이벤트 콜백 등록
  on(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)?.push(callback);
  }

  // 이벤트 콜백 제거
  off(event: string, callback: (data: any) => void) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 콜백 실행
  private triggerCallbacks(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // 방 생성
  createRoom(username: string) {
    if (!this.socket?.connected) {
      console.error("❌ Socket이 연결되지 않음");
      return;
    }

    const payload: CreateRoomPayload = { username };
    console.log("📤 방 생성 요청:", payload);
    this.socket.emit("createRoom", payload);
  }

  // 방 참여
  joinRoom(roomId: string, username: string) {
    if (!this.socket?.connected) {
      console.error("❌ Socket이 연결되지 않음");
      return;
    }

    const payload: JoinRoomPayload = { roomId, username };
    console.log("📤 방 참여 요청:", payload);
    this.socket.emit("joinRoom", payload);
  }

  // 방 나가기
  leaveRoom() {
    if (!this.socket?.connected) {
      console.error("❌ Socket이 연결되지 않음");
      return;
    }

    console.log("📤 방 나가기 요청");
    this.socket.emit("leaveRoom");
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      console.log("🔌 Socket 연결 해제");
      this.socket.disconnect();
      this.socket = null;
      this.eventCallbacks.clear();
    }
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// 싱글톤 인스턴스
export const socketService = new SocketService();

// 타입들도 export (다른 컴포넌트에서 사용)
export type {
  User,
  Room,
  GameState,
  RoomCreatedResponse,
  UserJoinedResponse,
  UserLeftResponse,
  ErrorResponse,
};
