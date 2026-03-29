// auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../services/auth";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = getToken();

  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
