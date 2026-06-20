import { request } from './auth';

/**
 * Registers the active device token for push notifications.
 * @param {{ device_token: string, token?: string }} payload
 * @returns {Promise<Object>}
 */
export async function registerDeviceToken(payload) {
  return request('/settings/notifications/register-device/', {
    method: 'POST',
    data: { token: payload.device_token || payload.token },
  });
}

/**
 * Gets all notifications for the current admin.
 * @returns {Promise<Array>}
 */
export async function getNotifications() {
  return request('/settings/notifications/');
}

/**
 * Marks every notification as read.
 * @returns {Promise<Object>}
 */
export async function markAllNotificationsRead() {
  return request('/settings/notifications/', {
    method: 'PUT',
  });
}

/**
 * Gets the unread notifications count locally by counting unread from the list.
 * @returns {Promise<{unread_count: number}>}
 */
export async function getUnreadNotificationCount() {
  try {
    const list = await getNotifications();
    const notifications = Array.isArray(list) 
      ? list 
      : (Array.isArray(list?.notifications) ? list.notifications : []);
    const unreadCount = notifications.filter(n => !Boolean(n.is_read || n.read)).length;
    return { unread_count: unreadCount };
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return { unread_count: 0 };
  }
}

/**
 * Client-side mock since the backend does not have a single notification read endpoint.
 * @param {string | number} notificationId
 * @returns {Promise<{message: string}>}
 */
export async function markNotificationRead(notificationId) {
  return Promise.resolve({ message: "Marked read client-side" });
}

/**
 * Client-side mock since the backend does not have a delete notification endpoint.
 * @param {string | number} notificationId
 * @returns {Promise<{message: string}>}
 */
export async function deleteNotification(notificationId) {
  return Promise.resolve({ message: "Deleted client-side" });
}