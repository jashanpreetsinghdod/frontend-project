// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import GameRoom from "./pages/GameRoom";

function App() {
  // We will store the user in a global state for simplicity
 const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* If not logged in, go to Login */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} 
        />
        
        {/* Home: Join or Create Room */}
        <Route 
          path="/home" 
          element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/" />} 
        />
        
        {/* The Main Game Board */}
        <Route 
          path="/game/:roomId" 
          element={user ? <GameRoom user={user} /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;