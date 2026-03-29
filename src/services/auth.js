// auth/authApi.js
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://quran-backend-t6hz.onrender.com";

/**
 * Shared fetch helper — throws an Error with the server's message on non-2xx.
 */
export async function request(endpoint, options = {}) {
  const config = {
    url: `${BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };
  
  // Add authorization token if available
  const token = localStorage.getItem("qari_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (options.data) {
    config.data = options.data;
  }

  try {
    const res = await axios(config);

    if (res.status < 200 || res.status >= 300) {
      throw new Error(res.data?.message || "Something went wrong. Please try again.");
    }

    return res.data;
  } catch (error) {
    if (error.response?.status === 422) {
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Invalid request data';
      throw new Error(errorMessage);
    }
    throw new Error(error.response?.data?.message || error.message || "Something went wrong. Please try again.");
  }
}

// ─── Auth token helpers ────────────────────────────────────────────────────────

export function saveToken(token) {
  localStorage.setItem("qari_token", token);
}

export function getToken() {
  return localStorage.getItem("qari_token");
}

export function clearToken() {
  localStorage.removeItem("qari_token");
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: object }}
 */
export async function login({ email, password }) {
  const data = await request("/admin/admin-login", {
    method: "POST",
    data: { email, password },
  });

  if (data.token) saveToken(data.token);
  return data;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Sends password reset email with token
 * @param {{ email: string }} payload
 * @returns {{ message: string }}
 */
export async function forgotPassword({ email }) {
  // Backend expects email as query parameter, not in request body
  try {
    return await request(`/admin/admin-forgot-password?email=${encodeURIComponent(email)}`, {
      method: "POST",
      data: {}, // Empty body since email is in query params
    });
  } catch (error) {
    console.log('Forgot password error:', error.response?.data);
    throw error;
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Resets the user's password using the token from email
 * @param {{ token: string, password: string }} payload
 * @returns {{ message: string }}
 */
export async function resetPassword({ token, password }) {
  return request("/admin/admin-reset-password", {
    method: "POST",
    data: { token, password },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Invalidates the session on the server and clears the local token.
 * @returns {{ message: string }}
 */
export async function logout() {
  const token = getToken();
  clearToken();

  return request("/admin/admin-logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}