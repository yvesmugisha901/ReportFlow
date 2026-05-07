"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "@/lib/api/notifications.api";
import { useAuth } from "@/context/AuthContext";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data.notifications ?? data);
        } catch {
            // Silent fail — notifications are non-critical
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count ?? 0);
        } catch {
            // Silent fail
        }
    }, [isAuthenticated]);

    // Poll for new notifications every 60 seconds
    useEffect(() => {
        if (!isAuthenticated) return;

        fetchNotifications();
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 60_000);

        return () => clearInterval(interval);
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

    const handleMarkAsRead = useCallback(async (notificationId) => {
        await markAsRead(notificationId);
        setNotifications((prev) =>
            prev.map((n) =>
                n.notification_id === notificationId ? { ...n, is_read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }, []);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead: handleMarkAsRead,
                markAllAsRead: handleMarkAllAsRead,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
    return ctx;
}