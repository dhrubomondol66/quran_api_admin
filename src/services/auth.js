// auth/authApi.js
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://quran-backend-3xc4.onrender.com";

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
 * @param {{ token: string, password: string, confirm_password: string }} payload
 * @returns {{ message: string }}
 */
export async function resetPassword({ token, password, confirm_password }) {
  // Backend expects token, password, and confirm_password as query parameters, not in request body
  try {
    const response = await request(`/admin/admin-reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}&confirm_password=${encodeURIComponent(confirm_password)}`, {
      method: "POST",
      data: {}, // Empty body since all params are in query params
    });
    return response;
  } catch (error) {
    console.log('Reset password error:', error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      const errorMessage = errorData.detail || errorData.message || errorData.error || 'Invalid reset request';
      
      // Check for common error patterns
      if (errorMessage.toLowerCase().includes('token')) {
        throw new Error('Invalid or expired reset token. Please request a new password reset.');
      } else if (errorMessage.toLowerCase().includes('password')) {
        throw new Error('Password validation failed. Please ensure your password meets the requirements.');
      } else {
        throw new Error(errorMessage);
      }
    }
    
    throw error;
  }
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