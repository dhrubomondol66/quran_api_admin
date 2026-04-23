// component/TopBar.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, CheckCheck, Trash2 } from "lucide-react";
import { getCurrentAdminUsername } from "../services/components";
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications";

const TopBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [adminUsername, setAdminUsername] = useState("Admin");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);

  const normalizeNotifications = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.notifications)) return response.notifications;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const fetchNotificationData = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const [listResponse, countResponse] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      const normalized = normalizeNotifications(listResponse);
      setNotifications(normalized);
      setUnreadCount(countResponse?.unread_count ?? 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const username = await getCurrentAdminUsername();
        setAdminUsername(username);
      } catch (error) {
        console.error("Failed to fetch admin username:", error);
        setAdminUsername("Admin");
      }
    };

    fetchUsername();
    fetchNotificationData();
  }, [fetchNotificationData]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isNotificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isNotificationOpen]);

  const getNotificationId = (notification) =>
    notification?.notification_id ?? notification?.id;

  const isNotificationRead = (notification) =>
    Boolean(notification?.is_read ?? notification?.read);

  const getNotificationText = (notification) =>
    notification?.message || notification?.title || "New notification";

  const getNotificationTime = (notification) => {
    const raw = notification?.created_at || notification?.timestamp;
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  const handleOpenNotifications = async () => {
    const nextState = !isNotificationOpen;
    setIsNotificationOpen(nextState);
    if (nextState) {
      await fetchNotificationData();
    }
  };

  const handleMarkOneRead = async (notification) => {
    const notificationId = getNotificationId(notification);
    if (!notificationId || isNotificationRead(notification)) return;

    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          getNotificationId(item) === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (event, notification) => {
    event.stopPropagation();
    const notificationId = getNotificationId(notification);
    if (!notificationId) return;

    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((item) => getNotificationId(item) !== notificationId)
      );
      if (!isNotificationRead(notification)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <header className="">
      <div className="px-7">
        <div className="flex items-center justify-between h-[60px]">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-[#5a6b5e] hover:bg-[#f0f4f1] bg-transparent border-none cursor-pointer"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-end gap-3 ml-auto">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-lg text-[#5a6b5e] hover:bg-[#f0f4f1] bg-transparent border-none cursor-pointer transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c9a84c] text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-[340px] bg-white border border-[#e8eae8] rounded-xl shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef1ee]">
                    <h3 className="text-sm font-semibold text-[#1a2a1e]">Notifications</h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 text-xs text-[#2d5a3d] hover:text-[#1a3a2a] bg-transparent border-none cursor-pointer"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-6 text-sm text-[#5a6b5e] text-center">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-[#5a6b5e] text-center">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const notificationId = getNotificationId(notification);
                        const isRead = isNotificationRead(notification);
                        return (
                          <div
                            key={notificationId ?? getNotificationText(notification)}
                            onClick={() => handleMarkOneRead(notification)}
                            className={`px-4 py-3 border-b border-[#f2f4f2] cursor-pointer ${
                              isRead ? "bg-white" : "bg-[#f8faf8]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 w-2 h-2 rounded-full ${
                                  isRead ? "bg-[#d6ddd8]" : "bg-[#c9a84c]"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1a2a1e] leading-5">
                                  {getNotificationText(notification)}
                                </p>
                                <p className="text-[11px] text-[#7b857d] mt-1">
                                  {getNotificationTime(notification)}
                                </p>
                              </div>
                              <button
                                onClick={(event) =>
                                  handleDeleteNotification(event, notification)
                                }
                                className="text-[#95a099] hover:text-[#a94442] bg-transparent border-none cursor-pointer p-0.5"
                                aria-label="Delete notification"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/profile-setting")}
              className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-[10px] hover:bg-[#f0f4f1] bg-transparent border-none cursor-pointer transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[13px] font-semibold text-[#1a2a1e]">
                  {adminUsername || user.name || "Admin"}
                </div>
                <div className="text-[11px] text-[#5a6b5e]">
                  {user.email || "Super Admin"}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1a3a2a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[13px] font-bold">
                  {adminUsername ? adminUsername[0].toUpperCase() : "A"}
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