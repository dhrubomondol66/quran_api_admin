import { request } from "./auth";

// ─── Library Management ───────────────────────────────────────────────────

/**
 * Fetches list of library items with optional filtering and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Current page number
 * @param {number} params.per_page - Number of items per page
 * @param {string} params.search - Search filter for title/description
 * @param {string} params.content_type - Filter by content type ('audio', 'video', 'text')
 * @param {string} params.access - Filter by access ('free', 'premium')
 * @returns {Promise<Object | Array>} Paginated library object or list of items
 */
export async function getLibrary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/admin-dashboard/library?${queryString}`);
}

/**
 * Creates a new library resource
 * @param {FormData | Object} payload - Resource details, can be FormData for file uploads
 * @returns {Promise<Object>} Created resource
 */
export async function postLibrary(payload) {
    return request(`/admin-dashboard/library`, {
        method: 'POST',
        data: payload,
    });
}

/**
 * Updates an existing library resource
 * @param {string | number} id - ID of the resource
 * @param {FormData | Object} payload - Updated resource details
 * @returns {Promise<Object>} Updated resource
 */
export async function putLibrary(id, payload) {
    return request(`/admin-dashboard/library/${id}`, {
        method: 'PUT',
        data: payload,
    });
}

/**
 * Deletes a library resource
 * @param {string | number} id - ID of the resource
 * @returns {Promise<Object>} Deletion status message
 */
export async function deleteLibrary(id) {
    return request(`/admin-dashboard/library/${id}`, {
        method: 'DELETE',
    });
}
