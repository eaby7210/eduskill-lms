/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import apiClient, { wsUrl } from "../../apis/interceptors/axios";
import NotificationIcon from "../svgs/NotificationIcon";

import { useErrorHandler, useNavigationState } from "../../hooks/Hooks";
import { useSelector } from "react-redux";

const Notifications = () => {
  const user = useSelector((state) => state.user);
  const handleError = useErrorHandler();
  const { setIdle, setLoading } = useNavigationState();
  const [notifications, setNotifications] = useState({
    count: 0,
    next: null,
    previous: null,
    results: {
      total_count: 0,
      notifications: [],
    },
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const WS_URL = `${wsUrl}/ws/notification/`;

  const { lastMessage } = useWebSocket(WS_URL, {
    queryParams: { token: localStorage.getItem("access_token") },
    onOpen: () => {
      console.log("WebSocket Connected");
      if ("Notification" in window) {
        Notification.requestPermission();
      }
    },
    onClose: () => {
      console.log("WebSocket Disconnected");
    },
    onError: (error) => {
      console.error("WebSocket Error:", error);
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    heartbeat: {
      message: JSON.stringify({ action: "ping" }),
      timeout: 5000,
      interval: 2000,
    },
  });

  // Fetch notifications
  const fetchNotifications = async (url = "/user/notifications/") => {
    try {
      setLoading();
      setIsLoading(true);
      const response = await apiClient.get(url);
      setNotifications((prev) => ({
        ...response.data,
        results: {
          ...response.data.results,
          notifications:
            url === "/user/notifications/"
              ? response.data.results.notifications
              : [
                  ...prev.results.notifications,
                  ...response.data.results.notifications,
                ],
        },
      }));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      handleError(error);
    } finally {
      setIdle();
      setIsLoading(false);
    }
  };

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.patch(
        `/core/notifications/${notificationId}/mark_as_read/`
      );
      setNotifications((prev) => ({
        ...prev,
        results: {
          ...prev.results,
          notifications: prev.results.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          ),
        },
      }));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      handleError(error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await apiClient.post("/user/notifications/clear_all/");
      setNotifications({
        count: 0,
        next: null,
        results: {
          total_count: 0,
          notifications: [],
        },
      });
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  // Load more notifications
  const loadMoreNotifications = () => {
    if (notifications.next) {
      fetchNotifications(notifications.next);
    }
  };

  // Fetch initial notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);

      if (data.message !== "pong") {
        // Update notifications state with new notification
        setNotifications((prev) => ({
          ...prev,
          results: {
            total_count: prev.results.total_count + 1,
            notifications: [data, ...prev.results.notifications],
          },
        }));

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(`EduSkill - ${user.username}`, {
            body: data.message,
          });
        }
      }
    }
  }, [lastMessage]);

  // Unread notifications count
  const unreadCount = notifications.results.notifications.filter(
    (n) => !n.is_read
  ).length;

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <NotificationIcon h={"h-11"} w={"w-11"} />
          {unreadCount > 0 && (
            <span className="badge badge-sm badge-primary indicator-item">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
      {isOpen && (
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-96 max-h-96 overflow-y-auto"
        >
          <div className="flex justify-between items-center p-2 border-b">
            <h3 className="font-bold">Notifications</h3>
            {notifications.results.notifications.length > 0 && (
              <button
                className="btn btn-xs btn-ghost text-error"
                onClick={clearAllNotifications}
                disabled={isLoading}
              >
                Clear All
              </button>
            )}
          </div>

          {notifications.results.notifications.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No notifications</li>
          ) : (
            notifications.results.notifications.map((notification) => (
              <li key={notification.id} className="hover:bg-base-200">
                <div className="flex justify-between items-center p-2">
                  <div>
                    <p
                      className={`text-sm ${
                        !notification.is_read ? "font-bold" : "text-gray-500"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <small className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </small>
                  </div>
                  {!notification.is_read && (
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => markNotificationAsRead(notification.id)}
                      disabled={isLoading}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </li>
            ))
          )}

          {notifications.next && (
            <div className="p-2 text-center">
              <button
                className="btn btn-sm btn-outline"
                onClick={loadMoreNotifications}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
