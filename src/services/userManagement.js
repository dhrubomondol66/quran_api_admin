// services/userManagementApi.js
import { request } from './auth';

/**
 * Fetches all users from the backend
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of user records
 */
export async function getUsers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return request(`/admin-dashboard/user-management?${queryString}`);
}

/**
 * Performs administrative actions on a user (active, suspend, delete, reset_data)
 * @param {string | number} userId
 * @param {'active' | 'suspend' | 'delete' | 'reset_data'} action
 * @returns {Promise<Object>} Action response
 */
export async function postUserAction(userId, action) {
  return request(`/admin-dashboard/user-management/${userId}/${action}`, {
    method: 'POST',
  });
}

/**
 * Updates user information on the backend
 * @param {string | number} userId
 * @param {Object} userData
 * @returns {Promise<Object>} Updated user record
 */
export async function updateUser(userId, userData) {
  return request(`/admin-dashboard/user-management/${userId}`, {
    method: 'PUT',
    data: userData,
  });
}