import { request } from './auth';

// ─── Component Management ───────────────────────────────────────────────────
/**
 * Gets the current admin's username from the admin profiles
 * @returns {Promise<{admins: Array<{email: string, first_name: string, last_name: string, role: string, is_current_user: boolean}>}>}
 */
export async function getAdminProfiles() {
  return request('/admin/profile/admins');
}

/**
 * Gets the current admin's username (simplified for topbar usage)
 * @returns {Promise<string>}
 */
export async function getCurrentAdminUsername() {
  try {
    const profiles = await getAdminProfiles();
    const currentAdmin = profiles.admins?.find(admin => admin.is_current_user);
    return currentAdmin?.first_name || currentAdmin?.email || 'Admin';
  } catch (error) {
    console.error('Failed to get admin username:', error);
    return 'Admin';
  }
}