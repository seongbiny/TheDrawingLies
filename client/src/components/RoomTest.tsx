import { useState, useEffect } from "react";
import {
  socketService,
  type User,
  type RoomCreatedResponse,
  type UserJoinedResponse,
  type UserLeftResponse,
  type ErrorResponse,
} from "../services/socket";

const RoomTest = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [username, setUsername] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Socket 연결
    const socket = socketService.connect();

    // 연결 상태 업데이트
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("🟢 클라이언트: Socket 연결 성공");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setCurrentRoom(null);
      setUsers([]);
      setCurrentUser(null);
      console.log("🔴 클라이언트: Socket 연결 해제");
    });

    // 이벤트 리스너 등록
    socketService.on("roomCreated", (data: RoomCreatedResponse) => {
      console.log("✅ 방 생성 성공:", data);
      setCurrentRoom(data.roomId);
      setUsers(data.users);
      setCurrentUser(data.user);
      setErrorMessage("");
    });

    socketService.on("roomJoined", (data: UserJoinedResponse) => {
      console.log("✅ 방 참여 성공:", data);
      setUsers(data.users);
      setCurrentUser(data.user);
      setErrorMessage("");
    });

    socketService.on("userJoined", (data: UserJoinedResponse) => {
      console.log("👋 새 사용자 참여:", data);
      setUsers(data.users);
    });

    socketService.on("userLeft", (data: UserLeftResponse) => {
      console.log("👋 사용자 퇴장:", data);
      setUsers(data.users);
    });

    socketService.on("error", (data: ErrorResponse) => {
      console.error("❌ 에러 발생:", data);
      setErrorMessage(`${data.code}: ${data.message}`);
    });

    // 정리
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (username.trim()) {
      console.log("📤 방 생성 요청:", username);
      socketService.createRoom(username.trim());
    }
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim() && username.trim()) {
      console.log("📤 방 참여 요청:", { roomId: joinRoomId, username });
      socketService.joinRoom(joinRoomId.trim(), username.trim());
      setCurrentRoom(joinRoomId.trim());
    }
  };

  const handleLeaveRoom = () => {
    console.log("📤 방 나가기 요청");
    socketService.leaveRoom();
    setCurrentRoom(null);
    setUsers([]);
    setCurrentUser(null);
  };

  const copyRoomUrl = () => {
    if (currentRoom) {
      const url = `${window.location.origin}?roomId=${currentRoom}`;
      navigator.clipboard.writeText(url);
      alert(`초대 URL 복사됨:\n${url}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">🎮 방 관리 테스트</h1>

      {/* 연결 상태 */}
      <div className="mb-6 p-4 rounded-lg bg-white shadow">
        <h2 className="text-lg font-semibold mb-2">연결 상태</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`font-medium ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConnected ? "Socket 연결됨" : "Socket 연결 안됨"}
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>에러:</strong> {errorMessage}
        </div>
      )}

      {/* 현재 방 정보 */}
      {currentRoom && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-800">현재 방</h2>
              <p className="text-blue-600 font-mono text-sm">{currentRoom}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyRoomUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                📋 초대 URL 복사
              </button>
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                🚪 방 나가기
              </button>
            </div>
          </div>

          {/* 사용자 목록 */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-700">
              👥 참여자 목록 ({users.length}명)
            </h3>
            <div className="grid gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.id === currentUser?.id
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`flex-1 ${
                      user.id === currentUser?.id
                        ? "font-bold text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {user.username}
                  </span>
                  <div className="flex gap-1">
                    {user.isHost && (
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                        👑 방장
                      </span>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                        🫵 나
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 방 생성/참여 폼 */}
      {!currentRoom && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 방 생성 */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              🏠 방 생성
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="닉네임 입력 (2-20자)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isConnected}
                  maxLength={20}
                />
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={
                  !isConnected || !username.trim() || username.length < 2
                }
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                🏠 방 만들기
              </button>
            </div>
          </div>

          {/* 방 참여 */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              🚪 방 참여
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="닉네임 입력 (2-20자)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!isConnected}
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  방 ID
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="방 ID 입력"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={!isConnected}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={
                  !isConnected ||
                  !username.trim() ||
                  !joinRoomId.trim() ||
                  username.length < 2
                }
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                🚪 방 참여하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 디버깅 정보 */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">🔧 디버깅 정보</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• 브라우저 개발자 도구(F12) → Console 탭에서 로그 확인</p>
          <p>
            • 서버 상태:{" "}
            <a
              href="http://localhost:3000/health"
              target="_blank"
              className="text-blue-500 underline"
            >
              http://localhost:3000/health
            </a>
          </p>
          <p>
            • Socket 연결 상태: {isConnected ? "✅ 연결됨" : "❌ 연결 안됨"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomTest;
