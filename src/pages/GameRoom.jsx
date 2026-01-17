import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

// --- CHANGE TO YOUR RENDER URL FOR PRODUCTION ---
const SOCKET_URL = "https://backend-business-wkiw.onrender.com"; // Or your Render URL
const socket = io.connect(SOCKET_URL);

const GameRoom = ({ user }) => {
  const { roomId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("update_data", (roomObject) => {
      setGameData(JSON.parse(JSON.stringify(roomObject)));
    });

    socket.on("transaction_error", (msg) => {
      alert(msg);
    });

    socket.on("transaction_notification", (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
    });

    socket.on("room_deleted", (data) => {
      const message =
        data.reason === "admin"
          ? "Game has been deleted by the admin"
          : data.reason === "expired"
          ? "Game has expired and been deleted"
          : "Game has been deleted as all players left";
      alert(message);
      navigate("/home");
    });

    return () => {
      socket.off("update_data");
      socket.off("transaction_error");
      socket.off("transaction_notification");
      socket.off("room_deleted");
    };
  }, [roomId, navigate]);

  // 1. Regular Player Pay
  const handlePay = (receiverId) => {
    const amount = prompt("Enter amount to send:");
    if (!amount) return;
    socket.emit("send_money", {
      roomId,
      senderId: user._id,
      receiverId,
      amount: parseInt(amount),
    });
  };

  // 2. Admin Bank Functions
  const handleBank = (playerId, action) => {
    const amountStr = prompt(`Enter amount to ${action.toLowerCase()}:`);
    if (!amountStr) return;

    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    socket.emit("bank_transaction", {
      roomId,
      playerId,
      amount,
      action, // "ADD" or "DEDUCT"
    });
  };

  // 3. Leave Room
  const handleLeaveRoom = async () => {
    if (!window.confirm("Are you sure you want to quit?")) return;
    try {
      await axios.post(`${SOCKET_URL}/api/rooms/leave`, {
        roomId,
        userId: user._id,
      });
      socket.emit("leave_room", { roomId, userId: user._id });
      navigate("/home");
    } catch (err) {
      console.error(err);
      navigate("/home");
    }
  };

  if (!gameData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading Game Data...
      </div>
    );

  const isAdmin = user._id === gameData.adminId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 font-sans text-slate-800">
      
      {/* --- NOTIFICATION TOAST --- */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce">
          {notification}
        </div>
      )}

      {/* --- HEADER CARD --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Room Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-900 rounded-xl flex items-center justify-center text-emerald-400">
            {/* Building Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Room {roomId}</h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              Playing as <span className="font-bold text-gray-900">{user.username}</span>
              {isAdmin && (
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  Banker
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Bank & Leave */}
        <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Central Bank</p>
            <h2 className="text-2xl font-bold text-emerald-500">
              ${gameData.bankBalance.toLocaleString()}
            </h2>
          </div>
          
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave
          </button>
        </div>
      </div>

      {/* --- PLAYERS GRID --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameData.players.map((player) => {
          const isMe = player.userId === user._id;
          const isBanker = player.userId === gameData.adminId;

          return (
            <div
              key={player.userId}
              className={`bg-white rounded-3xl p-6 shadow-sm border ${
                isMe ? "border-emerald-200 ring-4 ring-emerald-50" : "border-gray-100"
              } transition-all hover:shadow-md flex flex-col justify-between`}
            >
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <img
                    src={player.avatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-gray-100"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {player.username}
                      {isMe && <span className="text-gray-400 font-normal text-sm">(You)</span>}
                    </h3>
                  </div>
                </div>
                {isBanker && (
                  <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg">
                    Banker
                  </span>
                )}
              </div>

              {/* Balance Section */}
              <div className="mb-8">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Balance</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  ${player.balance.toLocaleString()}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="space-y-3">
                
                {/* 1. Send Money Button (Black Button) */}
                {/* Logic: Show if it's NOT me */}
                {!isMe && (
                  <button
                    onClick={() => handlePay(player.userId)}
                    className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send money
                  </button>
                )}

                {/* 2. Admin Controls (Green/Red Buttons) */}
                {/* Logic: Show ONLY if I am Admin */}
                {isAdmin && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBank(player.userId, "ADD")}
                      className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add
                    </button>
                    <button
                      onClick={() => handleBank(player.userId, "DEDUCT")}
                      className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 py-2 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Deduct
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameRoom;
