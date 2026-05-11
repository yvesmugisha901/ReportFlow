import api from "@/lib/axios";

export const getNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

export const markAsRead = async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.patch("/notifications/mark-all-read"); // fixed
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
};

export const deleteNotification = async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

export const deleteAllRead = async () => {
    const response = await api.delete("/notifications/read");
    return response.data;
};