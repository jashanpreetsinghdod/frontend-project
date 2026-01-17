import { useState } from "react";
import axios from "axios";

// --- CHANGE TO YOUR RENDER URL ---
const API_URL = "https://backend-business-wkiw.onrender.com"; 

// Pre-defined Avatar Options
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sawyer",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Caleb",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Felix",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aiden",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Nolan",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Destiny",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Liam",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Leah",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645404/cat_krufdy.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645403/gorilla_e7ogvd.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645402/dog_chs9ac.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645402/wolf_s6btkv.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645401/horse_vdoqez.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645401/bat_1_ycckeq.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645402/tiger_uchqhf.png",
  "https://res.cloudinary.com/dunen64uz/image/upload/v1768645402/bat_zhqf1m.png"
  
  
];


const Login = ({ setUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState("");
  
  // NEW STATE: For Username Checking
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Trigger check ONLY if we are registering and typing in username field
    if (name === "username" && isRegister) {
      checkUsernameAvailability(value);
    }
  };

  // The Checker Function
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameStatus(null); // Too short to check
      return;
    }

    setUsernameStatus("checking");

    try {
      const res = await axios.get(`${API_URL}/api/auth/check-username/${username}`);
      if (res.data.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    } catch (err) {
      console.error("Check failed", err);
      setUsernameStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isRegister && formData.username.length < 3) {
      setError("Username is too small (must be at least 3 characters)");
      return; // Stop here, do not send to server
    }
    // Prevent submit if username is taken
    if (isRegister && usernameStatus === "taken") {
      setError("Please choose a different username.");
      return;
    }
    

    const endpoint = isRegister ? "register" : "login";
    const payload = isRegister ? { ...formData, avatar: selectedAvatar } : { email: formData.email, password: formData.password };

    try {
      const res = await axios.post(`${API_URL}/api/auth/${endpoint}`, payload);
      const userData = isRegister ? res.data : res.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      setError(err.response?.data || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-800">
      
      {/* --- LEFT SIDE: PREMIUM DARK PANEL --- */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black z-0"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-xl">$</span>
          </div>
          <span className="font-bold text-2xl tracking-tight">Business</span>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-6xl font-extrabold tracking-tight leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Master the <br/> Market.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed border-l-4 border-emerald-500 pl-6">
            The modern way to manage your millions. Fast, secure, and built for your game night.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 opacity-80">
           <div className="flex -space-x-4">
             {AVATAR_OPTIONS.slice(0, 4).map((src, i) => (
               <img key={i} src={src} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="user" />
             ))}
           </div>
           <p className="text-sm font-medium">Join 2,000+ players today</p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative overflow-hidden">
        
        <div className="absolute inset-0 bg-dot-pattern opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white"></div>

        <div className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/50">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 mt-2">
              {isRegister ? "Let's set up your banking profile." : "Enter your details to access your vault."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* USERNAME INPUT WITH LIVE FEEDBACK */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                <div className="relative">
                   <input 
                     type="text" 
                     name="username" 
                     placeholder="MonopolyKing" 
                     className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all font-medium text-slate-900 
                       ${usernameStatus === 'taken' ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                       : usernameStatus === 'available' ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200' 
                       : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'}`}
                     onChange={handleChange} 
                     required 
                   />
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                
                {/* --- LIVE STATUS MESSAGE --- */}
                {usernameStatus === "checking" && (
                   <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                     <svg className="animate-spin h-3 w-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Checking availability...
                   </p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-xs text-emerald-600 mt-2 font-bold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Username available
                  </p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    Username unavailable
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium text-slate-900" 
                  onChange={handleChange} 
                  required 
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-medium text-slate-900" 
                  onChange={handleChange} 
                  required 
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>

            {/* Avatar Grid */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Avatar</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <button 
                      key={index} 
                      type="button" 
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? "border-emerald-500 ring-2 ring-emerald-100 scale-105" : "border-slate-100 hover:border-slate-300"}`}
                    >
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              {isRegister ? "Create Account" : "Sign In"}
            </button>

          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-emerald-600 font-bold hover:underline"
            >
              {isRegister ? "Log in" : "Create one"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
