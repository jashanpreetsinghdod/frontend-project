import { useState } from "react";
import axios from "axios";

// Pre-defined Avatar Options (DiceBear API)
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sawyer",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Caleb",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Destiny",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Leah",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aiden",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Nolan",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Liam"
];

const Login = ({ setUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Decide which endpoint to hit
    const endpoint = isRegister ? "register" : "login";
    
    // Prepare the payload
    const payload = isRegister 
      ? { ...formData, avatar: selectedAvatar } 
      : { email: formData.email, password: formData.password };

    try {
      const res = await axios.post(`https://backend-business-wkiw.onrender.com/api/auth/${endpoint}`, payload);
      
      // SUCCESS!
      // Save user to App state (and LocalStorage for persistence)
      const userData = isRegister ? res.data : res.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-white mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isRegister ? "Join the business world" : "Sign in to continue"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username (Only for Register) */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                name="username"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-gray-500 text-white placeholder-gray-500"
                placeholder="Enter username"
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-gray-500 text-white placeholder-gray-500"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-gray-500 text-white placeholder-gray-500"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Avatar Selection (Only for Register) */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Choose Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-12 h-12 rounded border-2 transition ${
                      selectedAvatar === avatar ? "border-gray-400" : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full rounded" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-700 text-white font-medium py-3 rounded hover:bg-gray-600 transition"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;