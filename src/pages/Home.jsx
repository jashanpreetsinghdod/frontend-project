import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- CHANGE TO YOUR RENDER URL FOR PRODUCTION ---
const API_URL = "https://backend-business-wkiw.onrender.com"; // Or your Render URL

const Home = ({ user, setUser }) => {
  const [roomCode, setRoomCode] = useState("");
  const [bankBalance, setBankBalance] = useState(5000000);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  // OPTION 1: Create a New Private Game
  const handleCreate = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/rooms/create`, {
        userId: user._id,
        bankBalance: parseInt(bankBalance),
      });
      navigate(`/game/${res.data.roomId}`);
    } catch (err) {
      console.error(err);
      alert("Error creating room");
    }
  };

  // OPTION 2: Join an Existing Game
  const handleJoin = async () => {
    if (!roomCode) return alert("Please enter a code!");

    try {
      const res = await axios.post(`${API_URL}/api/rooms/join`, {
        userId: user._id,
        roomCode: roomCode.toUpperCase(),
      });
      navigate(`/game/${res.data.roomId}`);
    } catch (err) {
      console.error(err);
      alert("Room not found or Error joining!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 font-sans text-slate-800 relative">
      
      {/* Logout Button (Top Right) */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-2 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>

      <div className="w-full max-w-md space-y-6 pt-12 md:pt-0">
        
        {/* CARD 1: WELCOME PROFILE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-5 border-gray-400 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm"
            />
            {/* Online Status Dot */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">Welcome, {user.username}</h1>
            <p className="text-gray-400 text-sm">Ready to play?</p>
          </div>
        </div>

        {/* CARD 2: GAME ACTIONS */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-5 border-gray-400">
          
          {/* Section: Create Game */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Start a new game</h2>
            <p className="text-gray-400 text-sm mb-6">Create a room and invite your friends</p>
            
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Initial Bank Balance
            </label>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                placeholder="5000000"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black/5 outline-none font-medium text-gray-900 placeholder-gray-400 transition-all"
                value={bankBalance}
                onChange={(e) => setBankBalance(e.target.value)}
                min="100000"
              />
            </div>
            
            <button
              onClick={handleCreate}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create game
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-8 md:mb-10">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-gray-300 text-xs font-medium uppercase tracking-widest">or join existing</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Section: Join Game - UPDATED FOR RESPONSIVENESS */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Enter game code
            </label>
            
            {/* CHANGE: 
                - flex-col: Stacks items vertically by default (Mobile)
                - sm:flex-row: Stacks items side-by-side on screens larger than 640px (Tablet/Desktop)
            */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="XK7F2"
                className="w-full sm:flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none font-bold text-gray-900 placeholder-gray-300 uppercase tracking-widest text-center"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                maxLength={6}
              />
              {/* CHANGE:
                 - w-full: Full width button on mobile
                 - sm:w-auto: Natural width button on desktop
              */}
              <button
                onClick={handleJoin}
                className="w-full sm:w-auto bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-6 py-3 sm:py-0 rounded-xl font-bold transition-colors"
              >
                Join
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
