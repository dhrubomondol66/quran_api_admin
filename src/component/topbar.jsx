// component/TopBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";

const TopBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="">
      <div className="px-7">
        <div className="flex items-center justify-between h-[60px]">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-[#5a6b5e] hover:bg-[#f0f4f1] bg-transparent border-none cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          {/* <div className="hidden md:flex relative flex-1 max-w-[360px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888b88] pointer-events-none" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-3.5 py-2 border border-[#e8eae8] rounded-[10px] text-[13px] text-[#1a2a1e] bg-[#f8faf8] outline-none focus:border-[#2d5a3d] transition-colors"
            />
          </div> */}

          {/* Right side */}
          <div className="flex items-end gap-3 ml-auto">
          {/* Notifications */}
  <button className="relative p-2 rounded-lg text-[#5a6b5e] hover:bg-[#f0f4f1] bg-transparent border-none cursor-pointer transition-colors">
    <Bell size={18} />
    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c9a84c] rounded-full" />
  </button>

  {/* Profile */}
  <button
    onClick={() => navigate("/profile-setting")}
    className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-[10px] hover:bg-[#f0f4f1] bg-transparent border-none cursor-pointer transition-colors"
  >
    <div className="text-right hidden sm:block">
      <div className="text-[13px] font-semibold text-[#1a2a1e]">
        {user.name || "Admin"}
      </div>
      <div className="text-[11px] text-[#5a6b5e]">
        {user.email || "Super Admin"}
      </div>
    </div>
    <div className="w-9 h-9 rounded-full bg-[#1a3a2a] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[13px] font-bold">
        {user.name ? user.name[0].toUpperCase() : "A"}
      </span>
    </div>
  </button>
</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;