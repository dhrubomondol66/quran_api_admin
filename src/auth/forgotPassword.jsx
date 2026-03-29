// ============================================================
// auth/ForgotPassword.jsx  — no changes needed to the UI,
// but the flow now matches a real token-in-link approach.
// The "Enter Reset Code" button is removed — the user clicks
// the link in their email instead.
// ============================================================

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import QariLogo from "../components/QariLogo";
import { forgotPassword } from "../services/auth";
import { useNavigate } from "react-router-dom";

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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      // Backend now actually sends the email and returns a generic 200
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/");

  // ── Sent confirmation screen ──────────────────────────────
  if (sent) return (
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
          Check Your Email
        </h2>
        <p className="text-white/45 text-[13px] text-center mb-7">
          A password-reset link has been sent to<br />
          <span className="text-[#c9a84c] font-medium">{email}</span>
          <br /><span className="text-white/30">The link expires in 1 hour.</span>
        </p>

        {/* No "Enter Reset Code" button — user clicks the link in their email */}
        <p className="text-center mt-4 text-[13px] text-white/40">
          Didn't receive it?{" "}
          <span
            onClick={() => setSent(false)}
            className="text-[#c9a84c] cursor-pointer font-medium hover:underline ml-1"
          >
            Resend
          </span>
        </p>
        <p className="text-center mt-2.5 text-[13px]">
          <span onClick={handleBack} className="text-[#c9a84c] cursor-pointer font-medium hover:underline">
            ← Back to Login
          </span>
        </p>
      </div>
    </div>
  );

  // ── Email input screen ────────────────────────────────────
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={authBg}>
      <div className="relative z-10 w-full max-w-[420px] rounded-[20px] px-10 py-12" style={cardStyle}>
        <QariLogo />
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-white/45 text-[13px] cursor-pointer bg-transparent border-none mb-5 p-0 hover:text-[#c9a84c] transition-colors font-[DM_Sans,sans-serif]"
        >
          <ArrowLeft size={15} /> Back to Login
        </button>

        <h2 className="text-white text-[26px] font-semibold text-center mb-2 font-serif">
          Forgot Password?
        </h2>
        <p className="text-white/45 text-[13px] text-center mb-7">
          Enter your email and we'll send you a reset link.
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
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
