// component/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, BookOpen, Trophy, CreditCard } from "lucide-react";
import QariLogo from "../assets/Background.png";
import { logout, clearToken } from "../services/auth";

const navigation = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Library", href: "/library", icon: BookOpen },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Profile Settings", href: "/profile-setting", icon: Settings },
];

const Sidebar = ({ mobile, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to call logout API, clearing token client-side:", err);
      clearToken();
    }
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/";
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0d1611]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
      <img src={QariLogo} alt="QARI Logo" className="h-10 w-10" />
      <div className="flex flex-col">
        <span className="text-[15px] font-semibold text-[#333] dark:text-white tracking-[1px] font-serif">
          QARI
        </span>
        <span className="text-[10px] text-[#333] dark:text-[#8ea094] uppercase tracking-wider font-bold">ADMIN DASHBOARD</span>
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
                    ? "bg-[#f7f7f7] dark:bg-[#16271f] text-[#c9a84c]"
                    : "text-[#333] dark:text-[#d0d6d2] hover:bg-[#f7f7f7] dark:hover:bg-[#16271f] hover:text-[#333] dark:hover:text-white"
                }`
              }
            >
              <Icon size={16} />
              {item.name.toUpperCase()}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full cursor-pointer bg-transparent border-none"
        >
          <LogOut size={16} />
          LOGOUT
        </button>
      </div>
    </div>
  );

  if (mobile) return content;

  return (
    <div className="flex flex-col w-[240px] bg-white dark:bg-[#0d1611]">
      {content}
    </div>
  );
};

export default Sidebar;