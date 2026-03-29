// pages/ProfileSetting.jsx
import React, { useState, useEffect } from "react";
import { Users, Eye, EyeOff, Edit2 } from "lucide-react";
import { getAdminProfiles, updateProfile } from "../services/profileSetting";

const ProfileCard = ({ admin, onUpdate }) => {
  const [showPw, setShowPw] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: admin.first_name,
    last_name: admin.last_name,
    email: admin.email,
    current_password: "",
    new_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      // Only include password fields if they're provided
      if (formData.current_password && formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      await updateProfile(updateData);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      
      // Notify parent to refresh data
      if (onUpdate) onUpdate();
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      current_password: "",
      new_password: "",
    });
    setEditing(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="bg-white rounded-[14px] border border-[#e8eae8] overflow-hidden">
      {/* Card Header */}
      <div className="bg-[#1a3a2a] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Users size={18} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white">{admin.role}</div>
            <div className="text-[11px] text-white/50">
              {admin.first_name} {admin.last_name}
              {admin.is_current_user && " (You)"}
            </div>
          </div>
        </div>
        {!admin.is_current_user ? (
          <div className="text-[11px] text-white/50">Read-only</div>
        ) : (
          <button
            onClick={editing ? handleSave : () => setEditing(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-white/65 text-[12px] bg-transparent border-none cursor-pointer hover:text-[#e8c97a] transition-colors disabled:opacity-50"
          >
            <Edit2 size={12} /> {loading ? "Saving..." : editing ? "Save" : "Edit"}
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5">
        {error && (
          <div className="mb-3 p-2.5 rounded-lg text-[12px] text-[#e57368] bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)]">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-3 p-2.5 rounded-lg text-[12px] text-[#2d5a3d] bg-[rgba(45,90,61,0.15)] border border-[rgba(45,90,61,0.3)]">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <div>
            <div className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] mb-1.5">First Name</div>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              readOnly={!editing || !admin.is_current_user}
              className={`w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] outline-none transition-all
                ${editing && admin.is_current_user ? "bg-white focus:border-[#2d5a3d]" : "bg-[#f0f4f1]"}`}
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] mb-1.5">Last Name</div>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              readOnly={!editing || !admin.is_current_user}
              className={`w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] outline-none transition-all
                ${editing && admin.is_current_user ? "bg-white focus:border-[#2d5a3d]" : "bg-[#f0f4f1]"}`}
            />
          </div>
        </div>

        <div className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] mb-1.5">Email</div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          readOnly={!editing || !admin.is_current_user}
          className={`w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] mb-3.5 outline-none transition-all
            ${editing && admin.is_current_user ? "bg-white focus:border-[#2d5a3d]" : "bg-[#f0f4f1]"}`}
        />

        {editing && admin.is_current_user && (
          <>
            <div className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] mb-1.5">Current Password</div>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              placeholder="Enter current password to change"
              className="w-full px-3.5 py-2.5 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] mb-3.5 outline-none bg-white focus:border-[#2d5a3d] transition-all"
            />

            <div className="text-[11px] font-semibold text-[#5a6b5e] uppercase tracking-[0.5px] mb-1.5">New Password</div>
            <div className="relative mb-3.5">
              <input
                type={showPw ? "text" : "password"}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder="Enter new password (optional)"
                className="w-full px-3.5 py-2.5 pr-10 border border-[#e8eae8] rounded-lg text-[13px] text-[#1a2a1e] outline-none bg-white focus:border-[#2d5a3d] transition-all"
              />
              <button
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888b88] bg-transparent border-none cursor-pointer flex items-center"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </>
        )}

        {editing && admin.is_current_user && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 border border-[#e8eae8] rounded-lg text-[13px] text-[#5a6b5e] bg-white hover:bg-[#f0f4f1] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 rounded-lg text-[13px] text-white bg-[#1a3a2a] hover:bg-[#2d5a3d] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileSetting = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminProfiles();
      setAdmins(data.admins || []);
    } catch (error) {
      setError(error.message || "Failed to fetch admin profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-7">
        <div className="text-center py-8">
          <div className="text-[13px] text-[#888b88]">Loading admin profiles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold text-black font-serif">Profile Setting</h1>
        <p className="text-[13px] text-[#5a6b5e] mt-0.5">Manage Super Admin & Sub Admin Profile</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg text-[12px] text-[#e57368] bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {admins.map((admin) => (
          <ProfileCard 
            key={admin.email} 
            admin={admin} 
            onUpdate={fetchAdmins}
          />
        ))}
      </div>

      {admins.length === 0 && (
        <div className="text-center py-8">
          <div className="text-[13px] text-[#888b88]">No admin profiles found</div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetting;