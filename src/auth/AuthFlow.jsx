// auth/AuthFlow.jsx
// Manages the full authentication flow as a single state machine:
// login → forgotPassword → resetPassword → login (after success)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./login";
import ForgotPassword from "./forgotPassword";
import ResetPassword from "./resetPassword";

const AuthFlow = () => {
  const [screen, setScreen] = useState("login"); // "login" | "forgot" | "reset"
  const navigate = useNavigate();

  const handleLogin = () => {
    // Store auth token (mock for now)
    localStorage.setItem("token", "mock-jwt-token");
    localStorage.setItem("isAuthenticated", "true");
    navigate("/overview");
  };

  const handleForgotPassword = () => setScreen("forgot");
  const handleBackToLogin = () => setScreen("login");
  const handleOtpSent = () => setScreen("reset");
  const handleResetSuccess = () => setScreen("login");

  switch (screen) {
    case "forgot":
      return <ForgotPassword onBack={handleBackToLogin} onOtpSent={handleOtpSent} />;
    case "reset":
      return <ResetPassword onBack={handleBackToLogin} onSuccess={handleResetSuccess} />;
    case "login":
    default:
      return <Login onLogin={handleLogin} onForgotPassword={handleForgotPassword} />;
  }
};

export default AuthFlow;
