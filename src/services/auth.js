// auth/authApi.js
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://quran-app-backend-8b57.onrender.com";

const requestCache = new Map();

/**
 * Clears the request cache.
 */
export function clearRequestCache() {
  requestCache.clear();
}

/**
 * Shared fetch helper — throws an Error with the server's message on non-2xx.
 * Implements client-side GET caching and cache invalidation on mutate requests.
 */
export async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  
  // Ensure the URL path ends with a trailing slash for Django compatibility
  let normalizedEndpoint = endpoint;
  const [path, query] = endpoint.split('?');
  if (path && !path.endsWith('/')) {
    normalizedEndpoint = `${path}/${query ? `?${query}` : ''}`;
  }

  const url = `${BASE_URL}${normalizedEndpoint}`;

  // Clear cache on any modification request (POST, PUT, DELETE, etc.)
  if (method !== 'GET') {
    requestCache.clear();
  }

  const cacheKey = `${method}:${url}:${JSON.stringify(options.data || '')}:${JSON.stringify(options.params || '')}`;

  if (method === 'GET' && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const config = {
    url,
    method,
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
    if (options.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }

  const promise = (async () => {
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
  })();

  if (method === 'GET') {
    requestCache.set(cacheKey, promise);
  }

  return promise;
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
  const data = await request("/admin-dashboard/admin-login", {
    method: "POST",
    data: { email, password },
  });

  const token = data.token || data.access;
  if (token) saveToken(token);
  return data;
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Sends password reset email with token
 * @param {{ email: string }} payload
 * @returns {{ message: string }}
 */
export async function forgotPassword({ email }) {
  try {
    return await request('/admin-dashboard/forgot-password/', {
      method: "POST",
      data: { email },
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
export async function resetPassword({ email, token, password, confirm_password }) {
  try {
    const response = await request('/admin-dashboard/reset-password/', {
      method: "POST",
      data: { 
        email,
        token,
        new_password: password,
        confirm_password
      },
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

  return request("/admin-dashboard/admin-logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}