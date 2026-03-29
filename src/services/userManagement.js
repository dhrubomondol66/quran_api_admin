// services/userManagementApi.js
import { request } from './auth';

// ─── Get Users ───────────────────────────────────────────────────────────

/**
 * Fetches paginated list of users
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Users per page (default: 10)
 * @param {string} params.search - Search term for name/email
 * @param {string} params.plan - Filter by plan ('Basic', 'Premium')
 * @returns {Promise<{users: Array, total: number, page: number, per_page: number, total_pages: number}>}
 */
export async function getUsers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return request(`/admin/users?${queryString}`);
}

// ─── Get User by ID ─────────────────────────────────────────────────────

/**
 * Fetches single user by ID
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getUserById(userId) {
  return request(`/admin/users/${userId}`);
}

// ─── Update User ─────────────────────────────────────────────────────────

/**
 * Updates user information
 * @param {string} userId
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export async function updateUser(userId, userData) {
  return request(`/admin/users/${userId}`, {
    method: 'PUT',
    data: userData,
  });
}

// ─── Delete User ─────────────────────────────────────────────────────────

/**
 * Deletes a user
 * @param {string} userId
 * @returns {Promise<{message: string}>}
 */
export async function deleteUser(userId) {
  return request(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

// ─── Change User Plan ───────────────────────────────────────────────────

/**
 * Changes user subscription plan
 * @param {string} userId
 * @param {string} plan - 'basic' or 'premium'
 * @returns {Promise<Object>}
 */
export async function changeUserPlan(userId, plan) {
  return request(`/admin/users/${userId}/plan`, {
    method: 'PATCH',
    data: { plan },
  });
}