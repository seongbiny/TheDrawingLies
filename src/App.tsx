import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import ResultPage from "./pages/ResultPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/lobby/:roomId" element={<LobbyPage />} />
      <Route path="/game/:roomId" element={<GamePage />} />
      <Route path="/result/:roomId" element={<ResultPage />} />
    </Routes>
  );
}

export default App;
