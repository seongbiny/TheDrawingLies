import { GameState, Room, User } from "../types";
import { v4 as uuidv4 } from "uuid";

// 메모리에 모든 방 정보 저장
const rooms = new Map<string, Room>();

// Socket ID -> 방 ID 매핑 (사용자가 어느 방에 있는지 추적)
const socketToRoom = new Map<string, string>();

export class RoomService {
  static createRoom(hostUsername: string, hostSocketId: string): Room {
    const roomId = uuidv4();

    const host: User = {
      id: uuidv4(),
      username: hostUsername,
      socketId: hostSocketId,
      role: null,
      joinedAt: new Date(),
      isHost: true,
    };

    const initialGameState: GameState = {
      status: "waiting",
      word: null,
      startedAt: null,
      timeLeft: 30,
      winner: null,
    };

    const room: Room = {
      id: roomId,
      users: [host],
      gameState: initialGameState,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    rooms.set(roomId, room);
    socketToRoom.set(hostSocketId, roomId);

    console.log(`✅ 방 생성: ${roomId}, 방장: ${hostUsername}`);
    return room;
  }

  static addUserToRoom(
    roomId: string,
    username: string,
    socketId: string
  ): { room: Room; user: User } | null {
    const room = rooms.get(roomId);

    if (!room) {
      console.log(`❌ 존재하지 않는 방: ${roomId}`);
      return null;
    }

    const existingUser = room.users.find((u) => u.username === username);
    if (existingUser) {
      console.log(`❌ 중복 닉네임: ${username}`);
      return null;
    }

    const newUser: User = {
      id: uuidv4(),
      username,
      socketId,
      role: null,
      joinedAt: new Date(),
      isHost: false,
    };

    room.users.push(newUser);
    room.updatedAt = new Date();
    socketToRoom.set(socketId, roomId);

    console.log(`✅ 사용자 참여: ${username} → 방 ${roomId}`);
    return { room, user: newUser };
  }

  static removeUserFromRoom(
    socketId: string
  ): { roomId: string; userId: string; users: User[] } | null {
    const roomId = socketToRoom.get(socketId);

    if (!roomId) {
      console.log(`❌ 방을 찾을 수 없음: ${socketId}`);
      return null;
    }

    const room = rooms.get(roomId);
    if (!room) {
      return null;
    }

    const userIndex = room.users.findIndex((u) => u.socketId === socketId);
    if (userIndex === -1) {
      return null;
    }

    const removedUser = room.users[userIndex];
    room.users.splice(userIndex, 1);
    room.updatedAt = new Date();
    socketToRoom.delete(socketId);

    console.log(`✅ 사용자 퇴장: ${removedUser.username} ← 방 ${roomId}`);

    // 방이 비었으면 삭제
    if (room.users.length === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ 빈 방 삭제: ${roomId}`);
      return { roomId, userId: removedUser.id, users: [] };
    }

    // 방장이 나갔으면 다음 사람을 방장으로
    if (removedUser.isHost && room.users.length > 0) {
      room.users[0].isHost = true;
      console.log(`👑 새 방장: ${room.users[0].username}`);
    }

    return { roomId, userId: removedUser.id, users: room.users };
  }

  static getRoomById(roomId: string): Room | null {
    return rooms.get(roomId) || null;
  }

  static getRoomBySocketId(socketId: string): Room | null {
    const roomId = socketToRoom.get(socketId);
    return roomId ? rooms.get(roomId) || null : null;
  }
}
