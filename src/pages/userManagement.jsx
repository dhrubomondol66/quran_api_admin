// pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { getUsers, postUserAction } from "../services/userManagement";

const AVATAR_COLORS = [
  "#2d5a3d", "#1a3a2a", "#5a3d2d", "#2d3d5a", "#5a2d4a",
  "#3d5a2d", "#5a4a2d", "#2d4a5a", "#4a2d5a", "#5a2d2d",
];

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState("all"); // 'all', 'free', 'premium'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'suspended'
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track which dropdown is open

  const perPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Client-side search and filtering
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      );
    }

    // Plan filter
    if (planFilter !== "all") {
      result = result.filter(
        (user) => user.subscription_status?.toLowerCase() === planFilter
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => {
        const isActive = Boolean(user.is_active);
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset page to 1 when filters change
  }, [search, planFilter, statusFilter, users]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(/[\s_.-]+/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleUserAction = async (userId, action) => {
    const actionVerbs = {
      active: "activate",
      suspend: "suspend",
      delete: "permanently delete",
      reset_data: "reset all data for",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${actionVerbs[action] || action} this user?`
    );
    if (!confirmed) {
      setDropdownOpen(null);
      return;
    }

    try {
      setLoading(true);
      await postUserAction(userId, action);
      alert(`User ${action === 'active' ? 'activated' : action} successfully.`);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      alert(`Failed to perform action: ${error.message || "Unknown error"}`);
    } finally {
      setDropdownOpen(null);
      setLoading(false);
    }
  };

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  // Pagination calculation
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / perPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="flex-1 overflow-y-auto p-7 bg-[#f4f6f4] dark:bg-[#070b09] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold text-black dark:text-white font-serif">USER MANAGEMENT</h1>
          <p className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094] mt-0.5">View, manage, and monitor all users</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-lg border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer"
          title="Refresh User List"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888b88] dark:text-[#5a6b5e] pointer-events-none" />
          <input
            className="w-full pl-10 pr-3.5 py-[11px] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[13px] text-[#1a2a1e] dark:text-white bg-white dark:bg-[#0d1611] outline-none focus:border-[#2d5a3d] dark:focus:border-[#4ade80] transition-colors"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] px-3.5 py-[11px] bg-white dark:bg-[#0d1611] cursor-pointer focus:border-[#2d5a3d] dark:focus:border-[#4ade80] outline-none"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] px-3.5 py-[11px] bg-white dark:bg-[#0d1611] cursor-pointer focus:border-[#2d5a3d] dark:focus:border-[#4ade80] outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      {/* Table Container with Glassmorphism */}
      <div className="bg-white/70 dark:bg-[#0d1611]/75 border border-[#e8eae8]/80 dark:border-[#1c3225] rounded-[14px] overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["USER", "PLAN", "STATUS", "JOINED", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#888b88] dark:text-[#5a6b5e] border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, i) => (
                <tr key={user.id} className="hover:bg-[#f8faf8]/50 dark:hover:bg-[#121f18]/50 transition-colors">
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 overflow-hidden"
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {user.photo || user.profile_image_url || user.profile_image || user.avatar ? (
                          <img 
                            src={user.photo || user.profile_image_url || user.profile_image || user.avatar} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#1a2a1e] dark:text-white">
                          {user.name || "N/A"}
                        </div>
                        <div className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border capitalize
                      ${user.subscription_status && user.subscription_status !== "free"
                        ? "bg-amber-100 dark:bg-[#2d220a] text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900/50"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700/50"}`}>
                      {user.subscription_status || 'free'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-[0.5px]
                      ${user.is_active
                        ? "bg-emerald-100 dark:bg-[#0c2214] text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900/50"
                        : "bg-rose-100 dark:bg-[#2d0f11] text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900/50"}`}>
                      {user.is_active ? 'active' : 'suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225] text-[13px] text-[#5a6b5e] dark:text-[#8ea094]">
                    {user.date_joined
                      ? new Date(user.date_joined).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-5 py-3.5 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(user.id)}
                        className="p-1 rounded-md text-[#888b88] hover:bg-[#f0f4f1] hover:text-[#1a2a1e] transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {dropdownOpen === user.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-[#e8eae8] rounded-md shadow-lg z-10 py-1">
                          <button
                            onClick={() => handleUserAction(user.id, 'active')}
                            disabled={user.is_active}
                            className="w-full text-left px-3 py-2 text-[13px] text-[#2d5a3d] hover:bg-[#f0f4f1] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            disabled={!user.is_active}
                            className="w-full text-left px-3 py-2 text-[13px] text-[#5a6b5e] hover:bg-[#f0f4f1] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'reset_data')}
                            className="w-full text-left px-3 py-2 text-[13px] text-[#c9a84c] hover:bg-[#f0f4f1] transition-colors"
                          >
                            Reset Data
                          </button>
                          <div className="border-t border-[#e8eae8] my-1" />
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="w-full text-left px-3 py-2 text-[13px] text-[#e57368] hover:bg-[#fef2f2] transition-colors"
                          >
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#888b88] py-8 text-[13px]">
                    {search || planFilter !== "all" || statusFilter !== "all"
                      ? "No users found matching your search/filters"
                      : "No users available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e8eae8]/80 dark:border-[#1c3225]">
            <div className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">
              Showing {Math.min((currentPage - 1) * perPage + 1, totalUsers)} to{" "}
              {Math.min(currentPage * perPage, totalUsers)} of {totalUsers} results
            </div>
            <div className="flex gap-1 items-center">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] flex items-center justify-center text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-[30px] h-[30px] rounded-md border text-[13px] flex items-center justify-center cursor-pointer transition-all
                      ${pageNum === currentPage
                        ? "bg-[#1a3a2a] dark:bg-[#2d5a3d] text-white dark:text-[#0d1611] border-[#1a3a2a] dark:border-[#2d5a3d]"
                        : "bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] border-[#e8eae8] dark:border-[#1c3225] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f]"}`}>
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] flex items-center justify-center text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;