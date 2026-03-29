// services/profileSettingApi.js
import { request } from './auth';

// ─── Get Admin Profiles ─────────────────────────────────────────────────────

/**
 * Fetches admin profiles (super admin and sub admin)
 * @returns {Promise<{admins: Array<{email: string, first_name: string, last_name: string, role: string, is_current_user: boolean}>}>}
 */
export async function getAdminProfiles() {
  return request('/admin/profile/admins');
}

// ─── Update Profile ───────────────────────────────────────────────────────

/**
 * Updates admin profile information
 * @param {Object} profileData
 * @param {string} profileData.first_name
 * @param {string} profileData.last_name
 * @param {string} profileData.current_password (optional)
 * @param {string} profileData.new_password (optional)
 * @returns {Promise<Object>}
 */
export async function updateProfile(profileData) {
  return request('/admin/profile/update', {
    method: 'PUT',
    data: profileData,
  });
}

// ─── Change Password ─────────────────────────────────────────────────────

/**
 * Changes admin password (now part of profile update)
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
export async function changePassword(currentPassword, newPassword) {
  return updateProfile({
    current_password: currentPassword,
    new_password: newPassword,
  });
}

// ─── Update Email ─────────────────────────────────────────────────────────

/**
 * Updates admin email (now part of profile update)
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function updateEmail(email) {
  return updateProfile({ email });
}