// services/overview.js
import { request } from './auth';

// ─── Dashboard Stats ────────────────────────────────────────────────────────

/**
 * Fetches dashboard statistics
 * @returns {Promise<{total_users: number, premium_users: number, free_users: number, total_revenue: number, revenue_change_percent: number, user_growth: Array, revenue_growth: Array}>}
 */
export async function getOverviewStats() {
  return request('/admin-dashboard/overview');
}

// ─── User Growth Data ─────────────────────────────────────────────────────

/**
 * Fetches user growth data for charts
 * Note: This is included in getOverviewStats() response as user_growth field
 * @param {string} period - '7d', '30d', '90d'
 * @returns {Promise<Array<{day: string, free: number, premium: number, date: string}>>}
 */
export async function getUserGrowth(_period = '7d') {
  void _period;
  // Data is included in overview stats, but keeping function for compatibility
  const stats = await getOverviewStats();
  return stats.user_growth || [];
}

// ─── Revenue Data ───────────────────────────────────────────────────────────

/**
 * Fetches revenue data for charts
 * Note: This is included in getOverviewStats() response as revenue_growth field
 * @param {string} period - '7d', '30d', '90d'
 * @returns {Promise<Array<{day: string, revenue: number, date: string}>>}
 */
export async function getRevenueData(period = '7d') {
  void period;
  // Data is included in overview stats, but keeping function for compatibility
  const stats = await getOverviewStats();
  return stats.revenue_growth || [];
}

// ─── Recent Activity ───────────────────────────────────────────────────────

/**
 * Fetches recent user activities
 * Note: This endpoint may not exist yet, returning empty array for now
 * @param {number} limit - number of activities to fetch
 * @returns {Promise<Array<{name: string, action: string, time: string}>>}
 */
export async function getRecentActivity(limit = 10) {
  void limit;
  // This endpoint may not exist in backend yet
  return [];
}

/**
 * Fetches the global leaderboard data
 * @returns {Promise<Array<{id: number, username: string, email: string, points: number, streak: number}>>}
 */
export async function getLeaderboard() {
  return request('/admin-dashboard/leaderboard/');
}

/**
 * Fetches all subscription plans from the backend
 * @returns {Promise<Array>} List of plans
 */
export async function getSubscriptionPlans() {
  return request('/admin-dashboard/subscription-plans/');
}

/**
 * Creates or updates a subscription plan
 * @param {{ interval: 'monthly' | 'yearly', price: number, is_active?: boolean }} payload
 * @returns {Promise<Object>}
 */
export async function saveSubscriptionPlan(payload) {
  return request('/admin-dashboard/subscription-plans/', {
    method: 'POST',
    data: payload,
  });
}