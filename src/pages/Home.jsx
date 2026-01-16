import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      // 1. Ask Server to create a room
      const res = await axios.post("https://backend-business-wkiw.onrender.com/api/rooms/create", {
        userId: user._id,
        bankBalance: parseInt(bankBalance),
      });
      
      // 2. Server responds with the new Room Object
      // 3. We navigate to the game page using the new Room ID
      navigate(`/game/${res.data.roomId}`);
      
    } catch (err) {
      console.error(err);
      alert("Error creating room");
    }
  };

  // OPTION 2: Join an Existing Game
  const handleJoin = async () => {
    if (!roomCode) return alert("Please enter a code!");
    
    let retries = 0;
    const tryJoin = async () => {
      try {
        // 1. Ask Server to add me to this room
        const res = await axios.post("https://backend-business-wkiw.onrender.com/api/rooms/join", {
          userId: user._id,
          roomCode: roomCode.toUpperCase(), // Ensure code is uppercase
        });

        // 2. If successful, navigate there
        navigate(`/game/${res.data.roomId}`);
        
      } catch (err) {
        if (err.response?.data === "Room not found" && retries < 3) {
          retries++;
          setTimeout(tryJoin, 1000); // Retry after 1 second
        } else {
          console.error(err);
          alert("Room not found or Error joining!");
        }
      }
    };
    
    tryJoin();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative">
      
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-gray-800 text-gray-300 font-medium py-2 px-4 rounded border border-gray-700 hover:bg-gray-700 transition"
      >
        Logout
      </button>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
        
        {/* User Welcome */}
        <div className="text-center mb-8">
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-16 h-16 rounded-full mx-auto border border-gray-600 mb-4"
          />
          <h1 className="text-xl font-light text-white mb-2">Welcome, {user.username}</h1>
          <p className="text-gray-400 text-sm">Choose your next move</p>
        </div>

        {/* Option 1: CREATE */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Initial Bank Balance
          </label>
          <input 
            type="number" 
            placeholder="5000000"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-gray-500 text-white placeholder-gray-500 mb-4"
            value={bankBalance}
            onChange={(e) => setBankBalance(e.target.value)}
            min="100000"
          />
          <button 
            onClick={handleCreate}
            className="w-full bg-gray-700 text-white font-medium py-3 rounded hover:bg-gray-600 transition"
          >
            Create New Game
          </button>
        </div>

        <div className="relative flex py-3 items-center mb-6">
            <div className="grow border-t border-gray-600"></div>
            <span className="shrink mx-4 text-gray-500 text-sm">or</span>
            <div className="grow border-t border-gray-600"></div>
        </div>

        {/* Option 2: JOIN */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Join Game
          </label>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter code"
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-gray-500 text-white placeholder-gray-500 uppercase"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button 
              onClick={handleJoin}
              className="bg-gray-700 text-white font-medium px-6 rounded hover:bg-gray-600 transition"
            >
              Join
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;