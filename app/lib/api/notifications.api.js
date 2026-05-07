import api from "@/lib/axios";

/**
 * Notifications API
 * Covers FR-09 (notification triggers) and FR-10 (in-app alerts)
 */

// Get all notifications for the current user
export const getNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

// Mark a single notification as read
export const markAsRead = async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
};

// Get unread count (for the bell icon badge)
export const getUnreadCount = async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
};