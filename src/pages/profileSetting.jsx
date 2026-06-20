// pages/ProfileSetting.jsx
import React, { useState, useEffect } from "react";
import { User, Eye, EyeOff, Edit2, Shield } from "lucide-react";
import { getAdminProfiles, updateProfile } from "../services/profileSetting";

const ProfileSetting = () => {
  const [profile, setProfile] = useState({ email: "" });
  const [showPw, setShowPw] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminProfiles();
      setProfile(data || { email: "" });
      setFormData({
        email: data?.email || "",
        password: "",
      });
    } catch (err) {
      console.error("Failed to fetch profile settings:", err);
      setError(err.message || "Failed to load admin profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        email: formData.email.trim(),
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const response = await updateProfile(payload);
      setSuccess("Profile settings updated successfully!");
      setEditing(false);
      
      // Update local cache
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (response.email) {
        user.email = response.email;
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      fetchProfile();
    } catch (err) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profile.email || "",
      password: "",
    });
    setEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading && !profile.email) {
    return (
      <div className="flex-1 overflow-y-auto p-7">
        <div className="text-center py-8">
          <div className="text-[13px] text-[#888b88]">Loading admin profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-7 bg-[#f4f6f4] dark:bg-[#070b09] transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold text-black dark:text-white font-serif font-serif">PROFILE SETTINGS</h1>
        <p className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094] mt-0.5">Manage your admin identity and authentication credentials</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#e57368] bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)] dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#2d5a3d] bg-[rgba(45,90,61,0.15)] border border-[rgba(45,90,61,0.3)] dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div className="max-w-[560px]">
        <div className="bg-white/70 dark:bg-[#0d1611]/75 border border-[#e8eae8]/80 dark:border-[#1c3225] rounded-[14px] overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] transition-colors duration-200">
          {/* Card Header */}
          <div className="bg-[#1a3a2a] dark:bg-[#162d20] border-b border-transparent dark:border-[#1c3a28] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-[14px] font-semibold">Super Admin Account</div>
                <div className="text-[11px] text-white/50">{profile.email}</div>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-[12px] bg-transparent border-none cursor-pointer hover:underline transition-all"
              >
                <Edit2 size={12} /> Edit Profile
              </button>
            )}
          </div>

          {/* Card Body */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#5a6b5e] dark:text-[#8ea094] uppercase tracking-[0.5px] block mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                readOnly={!editing}
                className={`w-full px-3.5 py-2.5 border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[13px] outline-none transition-all
                  ${editing 
                    ? "bg-white dark:bg-[#132219] text-[#1a2a1e] dark:text-white focus:border-[#2d5a3d] dark:focus:border-[#4ade80]" 
                    : "bg-[#f8faf8] dark:bg-[#0c1611] text-[#717b73] dark:text-[#5a6b5e]"}`}
              />
            </div>

            {editing && (
              <div>
                <label className="text-[11px] font-semibold text-[#5a6b5e] dark:text-[#8ea094] uppercase tracking-[0.5px] block mb-1.5">
                  New Admin Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 pr-10 border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[13px] text-[#1a2a1e] dark:text-white bg-white dark:bg-[#132219] outline-none focus:border-[#2d5a3d] dark:focus:border-[#4ade80] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888b88] dark:text-[#5a6b5e] bg-transparent border-none cursor-pointer flex items-center"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {editing && (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-[#e8eae8] dark:border-[#1c3225] rounded-[10px] text-[13px] font-semibold text-[#5a6b5e] dark:text-[#8ea094] bg-white dark:bg-[#132219] hover:bg-[#f0f4f1] dark:hover:bg-[#16271f] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#1a3a2a] dark:bg-[#2d5a3d] hover:bg-[#2d5a3d] dark:hover:bg-[#34bd65] rounded-[10px] text-[13px] font-semibold text-white dark:text-[#0d1611] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center border-none"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;