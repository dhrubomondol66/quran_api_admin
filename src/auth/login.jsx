// auth/Login.jsx
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import QariLogo from "../components/QariLogo";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";
import backgroundimg from "../assets/Desktop - 2.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { 
      setError("Please fill in all fields."); 
      return; 
    }
    
    setError("");
    setLoading(true);
    
    try {
      const data = await login({ email, password });
      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      localStorage.setItem("isAuthenticated", "true");
      navigate("/overview");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundimg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative z-10 w-full max-w-[420px] rounded-[20px] px-10 py-12 animate-[fadeUp_0.4s_ease]"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(201,168,76,0.2)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
        }}
      >
        <QariLogo />
        <h2 className="text-white text-lg font-semibold text-center mb-1 font-serif">
          Log In with Email
        </h2>
        <p className="text-white/45 text-[13px] text-center mb-7">
          Enter Your Email &amp; Password for Log in
        </p>

        {error && (
          <div className="mb-3.5 px-3.5 py-2.5 rounded-lg text-[#e57368] text-[13px]"
            style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="relative mb-3.5">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3.5 rounded-[10px] text-white text-[14px] outline-none transition-colors placeholder-white/30 focus:border-[#c9a84c]"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
          </div>

          {/* Password */}
          <div className="relative mb-5">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3.5 rounded-[10px] text-white text-[14px] outline-none transition-colors placeholder-white/30 focus:border-[#c9a84c]"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center bg-transparent border-none cursor-pointer">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="text-right mb-5 -mt-2">
            <span onClick={handleForgotPassword} className="text-[#c9a84c] cursor-pointer font-medium text-[13px] hover:underline">
              Forgot Password?
            </span>
          </div>

          <button type="submit"
            className="w-full py-3.5 rounded-[10px] text-white text-[15px] font-semibold tracking-[0.5px] cursor-pointer hover:opacity-85 hover:-translate-y-px active:translate-y-0 transition-all"
            style={{ background: "linear-gradient(135deg, #1a2a1e 0%, #0a1a10 100%)" }}>
            Log In
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default Login;