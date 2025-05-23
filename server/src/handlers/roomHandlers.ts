import { Server, Socket } from "socket.io";
import {
  CreateRoomPayload,
  ErrorResponse,
  JoinRoomPayload,
  RoomCreatedResponse,
  UserJoinedResponse,
  UserLeftResponse,
} from "../types";
import { RoomService } from "../services/roomService";

export function setupRoomHandlers(socket: Socket, io: Server) {
  socket.on("createRoom", (payload: CreateRoomPayload) => {
    try {
      if (!payload.username || typeof payload.username !== "string") {
        const error: ErrorResponse = {
          code: "INVALID_USERNAME",
          message: "유효한 사용자명을 입력해주세요.",
        };
        socket.emit("error", error);
        return;
      }

      if (payload.username.length < 2 || payload.username.length > 20) {
        const error: ErrorResponse = {
          code: "INVALID_USERNAME",
          message: "닉네임은 2-20자 사이여야 합니다.",
        };
        socket.emit("error", error);
        return;
      }

      const room = RoomService.createRoom(payload.username, socket.id);

      socket.join(room.id);

      const response: RoomCreatedResponse = {
        roomId: room.id,
        user: room.users[0],
        users: room.users,
      };

      socket.emit("roomCreated", response);

      console.log(`📤 방 생성 완료: ${room.id}`);
    } catch (error) {
      console.error("방 생성 에러:", error);
      const errorResponse: ErrorResponse = {
        code: "SERVER_ERROR",
        message: "방 생성 중 오류가 발생했습니다.",
      };
      socket.emit("error", errorResponse);
    }
  });

  socket.on("joinRoom", (payload: JoinRoomPayload) => {
    try {
      if (!payload.roomId || !payload.username) {
        const error: ErrorResponse = {
          code: "INVALID_INPUT",
          message: "방 ID와 사용자명이 필요합니다.",
        };

        socket.emit("error", error);
        return;
      }

      if (payload.username.length < 2 || payload.username.length > 20) {
        const error: ErrorResponse = {
          code: "INVALID_USERNAME",
          message: "닉네임은 2-20자 사이여야 합니다.",
        };

        socket.emit("error", error);
        return;
      }

      const result = RoomService.addUserToRoom(
        payload.roomId,
        payload.username,
        socket.id
      );

      if (!result) {
        const error: ErrorResponse = {
          code: "JOIN_FAILED",
          message:
            "방 참여에 실패했습니다. 방이 존재하지 않거나 중복된 닉네임입니다.",
        };
        socket.emit("error", error);
        return;
      }

      socket.join(payload.roomId);

      const joinResponse: UserJoinedResponse = {
        user: result.user,
        users: result.room.users,
      };
      socket.emit("roomJoined", joinResponse);

      socket.to(payload.roomId).emit("userJoined", joinResponse);

      console.log(`📤 방 참여 완료: ${payload.username} → ${payload.roomId}`);
    } catch (error) {
      console.error("방 참여 에러:", error);
      const errorResponse: ErrorResponse = {
        code: "SERVER_ERROR",
        message: "방 참여 중 오류가 발생했습니다.",
      };
      socket.emit("error", errorResponse);
    }
  });

  // 방 나가기 이벤트
  socket.on("leaveRoom", () => {
    handleUserLeave(socket, io);
  });

  // 연결 해제 시 자동으로 방에서 제거
  socket.on("disconnect", () => {
    console.log(`🔌 사용자 연결 해제: ${socket.id}`);
    handleUserLeave(socket, io);
  });
}

function handleUserLeave(socket: Socket, io: Server) {
  try {
    const result = RoomService.removeUserFromRoom(socket.id);

    if (result) {
      const response: UserLeftResponse = {
        userId: result.userId,
        users: result.users,
      };

      socket.to(result.roomId).emit("userLeft", response);
      console.log(`📤 사용자 퇴장 알림: 방 ${result.roomId}`);
    }
  } catch (error) {
    console.error("사용자 퇴장 처리 에러:", error);
  }
}
