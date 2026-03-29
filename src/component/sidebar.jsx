// component/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import QariLogo from "../assets/Background.png";

const navigation = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Profile Settings", href: "/profile-setting", icon: Settings },
];

const Sidebar = ({ mobile, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/";
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
      <img src={QariLogo} alt="QARI Logo" className="h-10 w-10" />
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold text-[#333] tracking-[1px] font-serif">
          QARI
        </span>
        <span className="text-[12px] text-[#333]">Admin Dashboard</span>
      </div>
    </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={mobile && onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#f7f7f7] text-[#c9a84c]"
                    : "text-[#333] hover:bg-[#f7f7f7] hover:text-[#333]"
                }`
              }
            >
              <Icon size={16} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium text-[#333] hover:bg-[#f7f7f7] hover:text-red-400 transition-all w-full cursor-pointer bg-transparent border-none"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  if (mobile) return content;

  return (
    <div className="flex flex-col w-[240px] bg-white">
      {content}
    </div>
  );
};

export default Sidebar;