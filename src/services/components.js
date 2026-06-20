import { request } from './auth';

/**
 * Gets the current admin's profile settings from backend
 * @returns {Promise<{email: string}>}
 */
export async function getAdminProfiles() {
  return request('/admin-dashboard/profile-settings/');
}

/**
 * Gets the current admin's username (simplified for topbar usage from localStorage)
 * @returns {Promise<string>}
 */
export async function getCurrentAdminUsername() {
  try {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user.username) {
        return user.username;
      }
    }
    // Fallback: fetch from backend profile
    const profile = await getAdminProfiles();
    if (profile && profile.email) {
      return profile.email.split('@')[0];
    }
    return 'Admin';
  } catch (error) {
    console.error('Failed to get admin username:', error);
    return 'Admin';
  }
}