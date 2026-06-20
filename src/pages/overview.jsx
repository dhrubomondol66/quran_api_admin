// pages/Overview.jsx
import React, { useState, useEffect } from "react";
import { Users, DollarSign, UserCheck, UserX, TrendingUp, Bell, CreditCard } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { getOverviewStats } from "../services/overview";
import { getNotifications } from "../services/notifications";

// Card component for stats
const Card = ({ label, value, subtext, icon, type }) => {
  const getStyles = () => {
    switch (type) {
      case "total_users":
        return {
          bg: "bg-[#1a3a2a] border-[#1a3a2a] dark:bg-[#162d20] dark:border-[#1c3a28]",
          label: "text-white/60",
          iconBg: "bg-white/10 text-white/80",
          value: "text-white",
          subtext: "text-white/45"
        };
      case "revenue":
        return {
          bg: "bg-[#1d3557]/15 border-[#1d3557]/20 dark:bg-[#1d3557]/10 dark:border-[#1d3557]/30",
          label: "text-[#1d3557] dark:text-[#a8dadc]",
          iconBg: "bg-[#1d3557]/10 dark:bg-[#1d3557]/20 text-[#1d3557] dark:text-[#a8dadc]",
          value: "text-[#1d3557] dark:text-[#f1faee]",
          subtext: "text-[#1d3557]/60 dark:text-[#a8dadc]/60"
        };
      case "premium":
        return {
          bg: "bg-[#457b9d]/15 border-[#457b9d]/20 dark:bg-[#457b9d]/10 dark:border-[#457b9d]/30",
          label: "text-[#457b9d] dark:text-[#e9c46a]",
          iconBg: "bg-[#457b9d]/10 dark:bg-[#457b9d]/20 text-[#457b9d] dark:text-[#e9c46a]",
          value: "text-[#457b9d] dark:text-[#e9c46a]",
          subtext: "text-[#457b9d]/60 dark:text-[#e9c46a]/60"
        };
      case "free":
      default:
        return {
          bg: "bg-[#e63946]/10 border-[#e63946]/15 dark:bg-[#e63946]/5 dark:border-[#e63946]/20",
          label: "text-[#e63946] dark:text-[#f07167]",
          iconBg: "bg-[#e63946]/10 dark:bg-[#e63946]/20 text-[#e63946] dark:text-[#f07167]",
          value: "text-[#e63946] dark:text-[#f07167]",
          subtext: "text-[#e63946]/60 dark:text-[#f07167]/60"
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-[14px] p-5 border ${styles.bg} transition-colors duration-200`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[12px] font-medium ${styles.label}`}>{label}</span>
        <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${styles.iconBg}`}>
          {icon}
        </div>
      </div>
      <div className={`font-bold text-[30px] leading-none font-sans ${styles.value}`}>{value}</div>
      <div className={`text-[11px] mt-1.5 ${styles.subtext}`}>
        {subtext || "Last updated recently"}
      </div>
    </div>
  );
};

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [revData, setRevData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const getActivityIcon = (message = "") => {
    const msg = message.toLowerCase();
    if (msg.includes("register") || msg.includes("account") || msg.includes("user")) {
      return <Users size={16} className="text-[#2d5a3d] dark:text-[#4ade80]" />;
    }
    if (msg.includes("subscription") || msg.includes("purchase") || msg.includes("plan") || msg.includes("buy") || msg.includes("stripe")) {
      return <CreditCard size={16} className="text-[#c9a84c] dark:text-[#fbbf24]" />;
    }
    return <Bell size={16} className="text-[#5a6b5e] dark:text-[#9ca3af]" />;
  };

  const getActivityColor = (message = "") => {
    const msg = message.toLowerCase();
    if (msg.includes("register") || msg.includes("account") || msg.includes("user")) {
      return "bg-emerald-50 dark:bg-[#122b1c]";
    }
    if (msg.includes("subscription") || msg.includes("purchase") || msg.includes("plan") || msg.includes("buy") || msg.includes("stripe")) {
      return "bg-amber-50 dark:bg-[#2e2614]";
    }
    return "bg-gray-50 dark:bg-[#1a1f1c]";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewStats, notificationsList] = await Promise.all([
          getOverviewStats(),
          getNotifications()
        ]);

        setStats(overviewStats);

        // Normalize activities / notifications
        let normalizedAct = [];
        if (Array.isArray(notificationsList)) {
          normalizedAct = notificationsList;
        } else if (Array.isArray(notificationsList?.notifications)) {
          normalizedAct = notificationsList.notifications;
        } else if (Array.isArray(notificationsList?.data)) {
          normalizedAct = notificationsList.data;
        }
        setActivities(normalizedAct.slice(0, 10)); // Top 10 activities

        // Generate simulated daily progression based on current totals for presentation
        const freeTotal = overviewStats.free_users || 0;
        const premiumTotal = overviewStats.premium_users || 0;
        const revTotal = overviewStats.revenue || overviewStats.total_earn || 0;

        const simulatedGrowth = [
          { day: "Mon", free: Math.round(freeTotal * 0.6), premium: Math.round(premiumTotal * 0.6) },
          { day: "Tue", free: Math.round(freeTotal * 0.7), premium: Math.round(premiumTotal * 0.7) },
          { day: "Wed", free: Math.round(freeTotal * 0.75), premium: Math.round(premiumTotal * 0.75) },
          { day: "Thu", free: Math.round(freeTotal * 0.85), premium: Math.round(premiumTotal * 0.8) },
          { day: "Fri", free: Math.round(freeTotal * 0.9), premium: Math.round(premiumTotal * 0.9) },
          { day: "Sat", free: Math.round(freeTotal * 0.95), premium: Math.round(premiumTotal * 0.95) },
          { day: "Sun", free: freeTotal, premium: premiumTotal },
        ];
        setGrowthData(simulatedGrowth);

        const simulatedRevenue = [
          { day: "Mon", rev: Math.round(revTotal * 0.5) },
          { day: "Tue", rev: Math.round(revTotal * 0.6) },
          { day: "Wed", rev: Math.round(revTotal * 0.7) },
          { day: "Thu", rev: Math.round(revTotal * 0.78) },
          { day: "Fri", rev: Math.round(revTotal * 0.85) },
          { day: "Sat", rev: Math.round(revTotal * 0.92) },
          { day: "Sun", rev: revTotal },
        ];
        setRevData(simulatedRevenue);

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center text-[#5a6b5e] dark:text-[#8ea094] flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#2d5a3d] border-t-transparent animate-spin" />
          <span>LOADING DASHBOARD...</span>
        </div>
      </div>
    );
  }

  const growthText = stats?.user_growth !== undefined ? `Growth this month: ${stats.user_growth}%` : "Updated in real time";

  return (
    <div className="flex-1 overflow-y-auto p-7 bg-[#f4f6f4] dark:bg-[#070b09] transition-colors duration-200">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-semibold text-black dark:text-white font-serif">DASHBOARD</h1>
        <p className="text-[13px] text-[#5a6b5e] dark:text-[#8ea094]">Welcome to QARI Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-sans">
        
        <Card label="TOTAL USERS" value={stats?.total_users || 0} subtext={growthText} icon={<Users size={15} />} type="total_users" />
        <Card label="REVENUE" value={`$${stats?.revenue || stats?.total_earn || 0}`} icon={<DollarSign size={15} />} type="revenue" />
        <Card label="PREMIUM USERS" value={stats?.premium_users || 0} icon={<UserCheck size={15} />} type="premium" />
        <Card label="FREE USERS" value={stats?.free_users || 0} icon={<UserX size={15} />} type="free" />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-6">
        
        {/* User Growth */}
        <div className="bg-white dark:bg-[#0d1611] rounded-[14px] border border-[#e8eae8] dark:border-[#1c3225] p-5 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[15px] font-semibold text-[#1a2a1e] dark:text-white">User Growth Trend</div>
              <div className="flex gap-4 mt-1.5">
                <div className="flex items-center gap-1.5 text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">
                  <div className="w-2 h-2 rounded-full bg-[#1a3a2a] dark:bg-[#4ade80]" /> Free
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#5a6b5e] dark:text-[#8ea094]">
                  <div className="w-2 h-2 rounded-full bg-[#c9a84c]" /> Premium
                </div>
              </div>
            </div>
            <span className="text-[11px] text-[#5a6b5e] dark:text-[#8ea094] border border-[#e8eae8] dark:border-[#1c3225] rounded-md px-2.5 py-1 bg-white dark:bg-[#132219] font-medium">
              Weekly view
            </span>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5a6b5e" }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e8eae8", fontSize: 12, backgroundColor: "#0d1611", color: "#fff" }} />
              <Bar dataKey="free" fill="#1a3a2a" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="premium" fill="#c9a84c" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-[#0d1611] rounded-[14px] border border-[#e8eae8] dark:border-[#1c3225] p-5 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[15px] font-semibold text-[#1a2a1e] dark:text-white">Revenue Growth</div>
            <span className="text-[11px] text-[#5a6b5e] dark:text-[#8ea094] border border-[#e8eae8] dark:border-[#1c3225] rounded-md px-2.5 py-1 bg-white dark:bg-[#132219] font-medium">
              Weekly view
            </span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eae8" strokeOpacity={0.1} vertical={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e8eae8", fontSize: 12, backgroundColor: "#0d1611", color: "#fff" }} />
              <Area type="monotone" dataKey="rev" stroke="#2d5a3d" strokeWidth={2} fill="url(#rg)" dot={{ fill: "#2d5a3d", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#0d1611] rounded-[14px] border border-[#e8eae8] dark:border-[#1c3225] p-5 transition-colors duration-200">
        <div className="text-[15px] font-semibold text-[#1a2a1e] dark:text-white mb-4">Recent Activity</div>
        
        {activities.length > 0 ? (
          <div className="divide-y divide-[#f2f4f2] dark:divide-[#1c3225] max-h-[300px] overflow-y-auto pr-2">
            {activities.map((activity, idx) => {
              const text = activity?.message || activity?.title || "Notification received";
              const timeRaw = activity?.created_at || activity?.timestamp;
              const timeText = timeRaw ? new Date(timeRaw).toLocaleString() : "";
              
              return (
                <div key={activity.id || idx} className="py-3 flex items-start gap-4 hover:bg-[#fcfdfc] dark:hover:bg-[#121f18] px-2 rounded-lg transition-colors duration-150">
                  <div className={`p-2 rounded-lg ${getActivityColor(text)}`}>
                    {getActivityIcon(text)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a2a1e] dark:text-[#d0d6d2] font-medium leading-relaxed">
                      {text}
                    </p>
                    {timeText && (
                      <span className="text-[11px] text-[#888b88] dark:text-[#5a6b5e] mt-1 block">
                        {timeText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-[#888b88] dark:text-[#5a6b5e] text-[13px] py-8">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
            No recent activity to display
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;