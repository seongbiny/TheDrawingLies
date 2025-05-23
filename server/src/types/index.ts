export interface User {
  id: string; // 고유 식별자
  username: string; // 닉네임
  socketId: string; // Socket 연결 ID
  role: Role | null; // 게임 내 역할
  joinedAt: Date; // 입장 시간
  isHost: boolean; // 방장 여부
}

export interface Room {
  id: string; // 방 고유 ID
  users: User[]; // 참여자 목록
  gameState: GameState; // 게임 상태
  createdAt: Date; // 생성 시간
  updatedAt: Date; // 수정 시간
}

export interface GameState {
  status: "waiting" | "playing" | "finished";
  word: string | null; // 현재 제시어
  startedAt: Date | null; // 게임 시작 시간
  timeLeft: number; // 남은 시간
  winner: string | null; // 승자
}

export type Role = "mafia" | "drawer" | "guesser";

// Socket 이벤트 페이로드
export interface CreateRoomPayload {
  username: string;
}

export interface JoinRoomPayload {
  roomId: string;
  username: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

// 서버 응답 페이로드
export interface RoomCreatedResponse {
  roomId: string;
  user: User;
  users: User[];
}

export interface UserJoinedResponse {
  user: User;
  users: User[];
}

export interface UserLeftResponse {
  userId: string;
  users: User[];
}

export interface ErrorResponse {
  code: string;
  message: string;
}
