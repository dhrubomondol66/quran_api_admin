import { request } from './auth';

/**
 * Registers the active device token for push notifications.
 * @param {{ device_token: string, platform?: string }} payload
 * @returns {Promise<{message: string}>}
 */
export async function registerDeviceToken(payload) {
  return request('/settings/notifications/device-token', {
    method: 'POST',
    data: payload,
  });
}

/**
 * Gets all notifications for the current user/admin.
 * @returns {Promise<Array>}
 */
export async function getNotifications() {
  return request('/settings/notifications');
}

/**
 * Marks a specific notification as read.
 * @param {string | number} notificationId
 * @returns {Promise<{message: string}>}
 */
export async function markNotificationRead(notificationId) {
  return request(`/settings/notifications/${notificationId}/read`, {
    method: 'POST',
  });
}

/**
 * Marks every notification as read.
 * @returns {Promise<{message: string}>}
 */
export async function markAllNotificationsRead() {
  return request('/settings/notifications/mark-all-read', {
    method: 'POST',
  });
}

/**
 * Gets the unread notifications count.
 * @returns {Promise<{unread_count: number}>}
 */
export async function getUnreadNotificationCount() {
  return request('/settings/notifications/unread-count');
}

/**
 * Deletes a specific notification.
 * @param {string | number} notificationId
 * @returns {Promise<{message: string}>}
 */
export async function deleteNotification(notificationId) {
  return request(`/settings/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}