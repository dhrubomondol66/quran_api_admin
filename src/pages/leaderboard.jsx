// pages/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import { Trophy, Flame, Search, RefreshCw, Medal, RotateCcw, AlertTriangle } from "lucide-react";
import { getLeaderboard } from "../services/overview";
import { postUserAction } from "../services/userManagement";

const AVATAR_COLORS = [
  "#2d5a3d", "#1a3a2a", "#5a3d2d", "#2d3d5a", "#5a2d4a",
  "#3d5a2d", "#5a4a2d", "#2d4a5a", "#4a2d5a", "#5a2d2d",
];

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmResetUser, setConfirmResetUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load leaderboard data:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    let result = [...entries];
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.username?.toLowerCase().includes(term) ||
          entry.email?.toLowerCase().includes(term)
      );
    }
    setFilteredEntries(result);
  }, [search, entries]);

  const handleResetProgress = async (userId) => {
    try {
      setActionLoading(true);
      setMessage({ text: "", type: "" });
      await postUserAction(userId, "reset_data");
      setMessage({ text: "Successfully reset user progress and points.", type: "success" });
      setConfirmResetUser(null);
      fetchLeaderboard();
    } catch (error) {
      console.error("Failed to reset progress:", error);
      setMessage({ text: error.message || "Failed to reset user progress.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return <Medal size={20} className="text-[#c9a84c]" />; // Gold
    if (index === 1) return <Medal size={20} className="text-[#95a099]" />; // Silver
    if (index === 2) return <Medal size={20} className="text-[#a98263]" />; // Bronze
    return <span className="text-[12px] font-semibold text-[#5a6b5e] w-5 text-center">{index + 1}</span>;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto p-7 bg-[#f4f6f4] dark:bg-[#070b09] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold text-black dark:text-white font-serif">LEADERBOARD</h1>
          <p className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094] mt-0.5">Global user ranking based on progress points</p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="p-2.5 rounded-lg border border-[#e8eae8] dark:border-[#1c3225] bg-white dark:bg-[#0d1611] text-[#5a6b5e] dark:text-[#8ea094] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors cursor-pointer"
          title="Refresh Leaderboard"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {message.text && (
        <div className={`mb-5 p-4 rounded-xl border text-[13px] ${
          message.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400" 
            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative flex-1 min-w-[200px] mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888b88] dark:text-[#5a6b5e] pointer-events-none" />
        <input
          className="w-full pl-10 pr-3.5 py-[11px] border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[13px] text-[#1a2a1e] dark:text-white bg-white dark:bg-[#0d1611] outline-none focus:border-[#2d5a3d] dark:focus:border-[#4ade80] transition-colors"
          placeholder="Search ranked users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Leaderboard Table Container with Glassmorphism */}
      <div className="bg-white/70 dark:bg-[#0d1611]/75 border border-[#e8eae8]/80 dark:border-[#1c3225] rounded-[14px] overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["RANK", "USER", "STREAK", "POINTS", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold tracking-[0.8px] uppercase text-[#888b88] dark:text-[#5a6b5e] border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id || index} className="hover:bg-[#f8faf8]/50 dark:hover:bg-[#121f18]/50 transition-colors">
                  {/* Rank */}
                  <td className="px-5 py-4 border-b border-[#e8eae8]/80 dark:border-[#1c3225] w-20">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f8faf8] dark:bg-[#16271f] border border-[#e8eae8] dark:border-[#1c3225] text-black dark:text-white">
                      {getRankBadge(index)}
                    </div>
                  </td>

                  {/* User Profile */}
                  <td className="px-5 py-4 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 overflow-hidden"
                        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                        {entry.photo || entry.profile_image_url || entry.profile_image || entry.avatar ? (
                          <img 
                            src={entry.photo || entry.profile_image_url || entry.profile_image || entry.avatar} 
                            alt={entry.username} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(entry.username)
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#1a2a1e] dark:text-white">
                          {entry.username || "Anonymous"}
                        </div>
                        <div className="text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">{entry.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Reading Streak */}
                  <td className="px-5 py-4 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#e67e22]">
                      <Flame size={15} fill="#e67e22" />
                      {entry.streak || 0} days
                    </span>
                  </td>

                  {/* Points */}
                  <td className="px-5 py-4 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <span className="flex items-center gap-1.5 text-[14px] font-bold text-[#2d5a3d] dark:text-[#4ade80]">
                      <Trophy size={15} className="text-[#c9a84c]" />
                      {entry.points || 0} pts
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 border-b border-[#e8eae8]/80 dark:border-[#1c3225]">
                    <button
                      onClick={() => setConfirmResetUser(entry)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 bg-white dark:bg-[#0d1611] hover:bg-red-50 dark:hover:bg-red-950/20 text-[12px] font-semibold transition-colors cursor-pointer"
                      title="Reset User Progress"
                    >
                      <RotateCcw size={12} />
                      Reset Progress
                    </button>
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#888b88] dark:text-[#5a6b5e] py-12 text-[13px]">
                    {search ? "No ranked users match your search criteria" : "Leaderboard is currently empty"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmResetUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e8eae8] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-[#f0f4f1] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1a2a1e] font-serif">
                Reset Progress
              </h3>
              <button
                onClick={() => setConfirmResetUser(null)}
                className="text-[#888b88] hover:text-[#1a2a1e] text-[18px] cursor-pointer bg-transparent border-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#fdf3f2] border border-red-100 rounded-xl p-4 text-[12px] text-red-800 flex gap-3">
                <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-950 mb-0.5">Confirm Reset Operation</span>
                  Are you sure you want to reset the progress metrics for <strong>{confirmResetUser.username || confirmResetUser.email}</strong>? This will permanently set their progress points, reading streak, and leaderboard rank back to zero. This action cannot be undone.
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8faf8] border-t border-[#f0f4f1] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetUser(null)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-[#e8eae8] bg-white text-[#5a6b5e] hover:bg-[#f0f4f1] text-[13px] font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetProgress(confirmResetUser.id)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-[13px] font-semibold cursor-pointer transition-colors flex items-center gap-2 border-none"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Confirm Reset"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
