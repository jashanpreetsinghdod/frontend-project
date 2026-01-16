import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("https://backend-business-wkiw.onrender.com");

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
      const message = data.reason === "admin" ? "Game has been deleted by the admin" :
                      data.reason === "expired" ? "Game has expired and been deleted" :
                      "Game has been deleted as all players left";
      alert(message);
      window.location.href = "/home";
    });

    return () => {
      socket.off("update_data");
      socket.off("transaction_error");
      socket.off("transaction_notification");
      socket.off("room_deleted");
    };
  }, [roomId]);

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

  // 3. Leave Room (For all players)
  const handleLeaveRoom = async () => {
    if (!window.confirm("Are you sure you want to quit?")) return;

    try {
      // 1. Tell Database to remove player (API)
      await axios.post("https://backend-business-wkiw.onrender.com/api/rooms/leave", {
        roomId,
        userId: user._id
      });

      // 2. Tell Socket to cut connection (Real-time)
      // <--- THIS WAS MISSING
      socket.emit("leave_room", { roomId, userId: user._id }); 

      // 3. Go home
      navigate("/home"); 

    } catch (err) {
      console.error(err);
      // Even if error, force leave to prevent getting stuck
      navigate("/home");
    }
  };

  if (!gameData) return <div className="text-center mt-10">Loading...</div>;

  const isAdmin = user._id === gameData.adminId;

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-sans">
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 z-50">
          {notification}
        </div>
      )}
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div>
          <h1 className="text-2xl font-light text-white">Room: {roomId}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Playing as: <span className="font-medium">{user.username}</span> 
            {isAdmin && <span className="text-gray-500 ml-2">(Admin)</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs uppercase">Bank Balance</p>
          <h2 className="text-xl font-medium text-white">
            ${gameData.bankBalance.toLocaleString()}
          </h2>
          <button
            onClick={handleLeaveRoom}
            className="mt-3 bg-gray-700 text-gray-300 font-medium py-1 px-3 rounded border border-gray-600 hover:bg-gray-600 transition text-sm"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* PLAYERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameData.players.map((player) => {
          const isMe = player.userId === user._id;

          return (
            <div 
              key={player.userId} 
              className={`p-6 rounded-lg border relative ${
                isMe ? "border-gray-500 bg-gray-800" : "border-gray-700 bg-gray-800"
              }`}
            >
              {/* Admin Badge */}
              {player.userId === gameData.adminId && (
                <span className="absolute top-3 right-3 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  Admin
                </span>
              )}

              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={player.avatar} 
                  alt="avatar" 
                  className="w-12 h-12 rounded-full border border-gray-600"
                />
                <div>
                  <h3 className="text-lg font-medium text-white">{player.username}</h3>
                  {isMe && <span className="text-gray-400 text-sm">(You)</span>}
                </div>
              </div>

              <div className="text-center my-4 border-t border-b border-gray-700 py-3">
                <p className="text-xl font-medium text-white">
                  ${player.balance.toLocaleString()}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2">
                
                {/* Pay Button */}
                {!isMe && (
                  <button
                    onClick={() => handlePay(player.userId)}
                    className="w-full bg-gray-700 text-white py-2 rounded border border-gray-600 hover:bg-gray-600 transition font-medium"
                  >
                    Pay Player
                  </button>
                )}

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={() => handleBank(player.userId, "ADD")}
                      className="bg-gray-700 text-gray-300 py-1 rounded border border-gray-600 hover:bg-gray-600 text-sm font-medium"
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => handleBank(player.userId, "DEDUCT")}
                      className="bg-gray-700 text-gray-300 py-1 rounded border border-gray-600 hover:bg-gray-600 text-sm font-medium"
                    >
                      - Deduct
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