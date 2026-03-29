// pages/Overview.jsx
import React, { useState, useEffect } from "react";
import { Users, DollarSign, UserCheck, UserX, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { getOverviewStats } from "../services/overview";

// Card component for stats
const Card = ({ label, value, icon, dark }) => (
  <div className={`rounded-[14px] p-5 border ${dark ? "bg-[#1a3a2a] border-[#1a3a2a]" : "bg-white border-[#e8eae8]"}`}>
    <div className="flex items-center justify-between mb-2.5">
      <span className={`text-[12px] font-medium ${dark ? "text-white/60" : "text-[#5a6b5e]"}`}>{label}</span>
      <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${dark ? "bg-white/10 text-white/80" : "bg-[#f0f4f1] text-[#5a6b5e]"}`}>
        {icon}
      </div>
    </div>
    <div className={`font-bold text-[30px] leading-none font-serif ${dark ? "text-white" : "text-[#1a2a1e]"}`}>{value}</div>
    <div className={`text-[11px] mt-1.5 ${dark ? "text-white/45" : "text-[#5a6b5e]"}`}>
      {dark ? "Updated in real time" : "Last updated recently"}
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [revData, setRevData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOverviewStats();

        setStats(data);

        // 🔥 map backend → chart format
        setGrowthData(
          (data.user_growth || []).map((item) => ({
            day: item.day,
            free: item.free,
            premium: item.premium,
          }))
        );

        setRevData(
          (data.revenue_growth || []).map((item) => ({
            day: item.day,
            rev: item.revenue,
          }))
        );

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-7">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold text-black font-serif">Dashboard</h1>
        <p className="text-[13px] text-[#5a6b5e]">Welcome to Qari Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        
        <Card label="Total Users" value={stats?.total_users || 0} icon={<Users size={15} />} dark />
        <Card label="Revenue" value={`$${stats?.total_revenue || 0}`} icon={<DollarSign size={15} />} />
        <Card label="Premium Users" value={stats?.premium_users || 0} icon={<UserCheck size={15} />} />
        <Card label="Free Users" value={stats?.free_users || 0} icon={<UserX size={15} />} />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-6">
        
        {/* User Growth */}
        <div className="bg-white rounded-[14px] border border-[#e8eae8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[15px] font-semibold text-[#1a2a1e]">User Growth Trend</div>
              <div className="flex gap-4 mt-1.5">
                <div className="flex items-center gap-1.5 text-[12px] text-[#5a6b5e]">
                  <div className="w-2 h-2 rounded-full bg-[#1a3a2a]" /> Free
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#5a6b5e]">
                  <div className="w-2 h-2 rounded-full bg-[#c9a84c]" /> Premium
                </div>
              </div>
            </div>
            <select className="text-[12px] text-[#5a6b5e] border border-[#e8eae8] rounded-md px-2.5 py-1 bg-white cursor-pointer">
              <option>Last 7 Days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5a6b5e" }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e8eae8", fontSize: 12 }} />
              <Bar dataKey="free" fill="#1a3a2a" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="premium" fill="#c9a84c" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-[14px] border border-[#e8eae8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[15px] font-semibold text-[#1a2a1e]">Revenue Growth</div>
            <select className="text-[12px] text-[#5a6b5e] border border-[#e8eae8] rounded-md px-2.5 py-1 bg-white cursor-pointer">
              <option>Last 7 Days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d5a3d" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2d5a3d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5a6b5e" }} />
              <YAxis hide />
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eae8" vertical={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e8eae8", fontSize: 12 }} />
              <Area type="monotone" dataKey="rev" stroke="#2d5a3d" strokeWidth={2} fill="url(#rg)" dot={{ fill: "#2d5a3d", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[14px] border border-[#e8eae8] p-5">
        <div className="text-[15px] font-semibold text-[#1a2a1e] mb-4">Recent Activity</div>
        <div className="text-center text-[#888b88] text-[13px] py-8">
          <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
          No recent activity to display
        </div>
      </div>
    </div>
  );
};

export default Overview;