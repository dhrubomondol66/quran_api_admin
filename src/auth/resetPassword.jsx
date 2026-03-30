// auth/ResetPassword.jsx
import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import QariLogo from "../components/QariLogo";
import { useNavigate, useSearchParams } from "react-router-dom";

const authBg = {
  background: "radial-gradient(ellipse at 60% 40%, #2d5a3d 0%, #0f2018 60%, #06110c 100%)",
};
const cardStyle = {
  background: "rgba(30,60,40,0.85)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(201,168,76,0.2)",
  boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
};
const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
};

// Backend URL from environment
const API_BASE = import.meta.env.VITE_API_URL || "https://quran-backend-t6hz.onrender.com";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Guard: no token
  if (!token) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={authBg}>
        <div className="relative z-10 w-full max-w-[420px] rounded-[20px] px-10 py-12 text-center" style={cardStyle}>
          <QariLogo />
          <p className="text-[#e57368] mt-4">Invalid or missing reset link.</p>
          <button onClick={() => navigate("/")} className="mt-6 text-[#c9a84c] hover:underline text-sm">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Backend expects both token and password as query parameters
      const res = await fetch(`${API_BASE}/admin/admin-reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty body since token and password are in query params
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed.");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (done) return (
    <div className="fixed inset-0 flex items-center justify-center" style={authBg}>
      <div className="relative z-10 w-full max-w-[420px] rounded-[20px] px-10 py-12" style={cardStyle}>
        <QariLogo />
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-[#c9a84c]"
          style={{ background: "rgba(201,168,76,0.15)", border: "2px solid rgba(201,168,76,0.4)" }}
        >
          <CheckCircle size={28} />
        </div>
        <h2 className="text-white text-lg font-semibold text-center mb-2 font-serif">
          Password Updated!
        </h2>
        <p className="text-white/45 text-[13px] text-center mb-7">
          Your admin password has been reset successfully.
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3.5 rounded-[10px] text-white text-[15px] font-semibold cursor-pointer hover:opacity-85 transition-opacity"
          style={{ background: "linear-gradient(135deg, #1a2a1e 0%, #0a1a10 100%)" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  // Password reset form
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={authBg}>
      <div className="relative z-10 w-full max-w-[420px] rounded-[20px] px-10 py-12" style={cardStyle}>
        <QariLogo />
        <h2 className="text-white text-[26px] font-semibold text-center mb-2 font-serif">
          Reset Password
        </h2>
        <p className="text-white/45 text-[13px] text-center mb-7">
          Enter your new admin password below.
        </p>

        {error && (
          <div
            className="mb-3.5 px-3.5 py-2.5 rounded-lg text-[#e57368] text-[13px]"
            style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-3.5">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type={showPw ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3.5 rounded-[10px] text-white text-[14px] outline-none placeholder-white/30"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 bg-transparent border-none cursor-pointer"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="relative mb-5">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type={showPw ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full pl-10 pr-3.5 py-3.5 rounded-[10px] text-white text-[14px] outline-none placeholder-white/30"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[10px] text-white text-[15px] font-semibold cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-60 disabled:cursor-wait"
            style={{ background: "linear-gradient(135deg, #1a2a1e 0%, #0a1a10 100%)" }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;