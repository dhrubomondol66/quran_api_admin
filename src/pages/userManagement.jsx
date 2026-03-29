// pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { getUsers } from "../services/userManagement";

const AVATAR_COLORS = [
  "#2d5a3d", "#1a3a2a", "#5a3d2d", "#2d3d5a", "#5a2d4a",
  "#3d5a2d", "#5a4a2d", "#2d4a5a", "#4a2d5a", "#5a2d2d",
];

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          per_page: pagination.per_page,
        };
        
        // Only add search parameter if it's not empty
        if (search.trim()) {
          params.search = search.trim();
        }
        
        const data = await getUsers(params);
        
        setUsers(data.users || []);
        setPagination({
          total: data.total || 0,
          per_page: data.per_page || 10,
          total_pages: data.total_pages || 0,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, search]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getFullName = (firstName, lastName) => {
    return `${firstName || ""} ${lastName || ""}`.trim();
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-7">
        <div className="text-center py-8">
          <div className="text-[13px] text-[#888b88]">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold text-black font-serif">User Management</h1>
        <p className="text-[13px] text-[#5a6b5e] mt-0.5">View, manage, and monitor all users</p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888b88] pointer-events-none" />
          <input
            className="w-full pl-10 pr-3.5 py-[11px] border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-white outline-none focus:border-[#2d5a3d] transition-colors"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-1.5 px-[18px] py-[11px] border border-[#e8eae8] rounded-[10px] bg-white text-[13px] font-medium text-[#5a6b5e] cursor-pointer hover:bg-[#f0f4f1] whitespace-nowrap transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[14px] border border-[#e8eae8] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["USER", "PLAN", "JOINED", "ACTIONS"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#888b88] border-b border-[#e8eae8]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="hover:bg-[#f8faf8] transition-colors">
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {getInitials(user.first_name, user.last_name)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[#1a2a1e]">
                        {getFullName(user.first_name, user.last_name)}
                      </div>
                      <div className="text-[12px] text-[#5a6b5e]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold
                    ${user.plan === "Premium" || user.plan === "premium"
                      ? "bg-[rgba(201,168,76,0.15)] text-[#c9a84c]"
                      : "bg-[#f0f4f1] text-[#5a6b5e]"}`}>
                    {user.plan || 'Basic'}
                  </span>
                </td>
                <td className="px-5 py-3.5 border-b border-[#e8eae8] text-[13px] text-[#5a6b5e]">
                  {user.joined || 'N/A'}
                </td>
                <td className="px-5 py-3.5 border-b border-[#e8eae8]">
                  <button className="p-1 rounded-md text-[#888b88] hover:bg-[#f0f4f1] hover:text-[#1a2a1e] transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-[#888b88] py-8 text-[13px]">
                  {search ? "No users found matching your search" : "No users available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e8eae8]">
          <div className="text-[12px] text-[#5a6b5e]">
            Showing {Math.min((currentPage - 1) * pagination.per_page + 1, pagination.total)} to{" "}
            {Math.min(currentPage * pagination.per_page, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-1 items-center">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] bg-white flex items-center justify-center text-[#5a6b5e] hover:bg-[#f0f4f1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            
            {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-[30px] h-[30px] rounded-md border text-[13px] flex items-center justify-center cursor-pointer transition-all
                    ${pageNum === currentPage
                      ? "bg-[#1a3a2a] text-white border-[#1a3a2a]"
                      : "bg-white text-[#5a6b5e] border-[#e8eae8] hover:bg-[#f0f4f1]"}`}>
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
              disabled={currentPage === pagination.total_pages}
              className="w-[30px] h-[30px] rounded-md border border-[#e8eae8] bg-white flex items-center justify-center text-[#5a6b5e] hover:bg-[#f0f4f1] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;