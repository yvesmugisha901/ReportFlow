"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
} from "@/lib/api/notifications.api";
import { useAuth } from "@/context/AuthContext";

const NotificationsContext = createContext(null);

// Roles that get notifications
const NOTIF_ROLES = ["employee", "reviewer", "approver", "admin"];

export function NotificationsProvider({ children }) {
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const hasNotifications = NOTIF_ROLES.includes(user?.role);
    const ready = !authLoading && hasNotifications;

    const fetchNotifications = useCallback(async () => {
        if (!ready) return;
        setLoading(true);
        try {
            const data = await getNotifications();
            const list = data.notifications ?? data ?? [];
            setNotifications(list);
            setUnreadCount(list.filter((n) => !n.is_read).length);
        } catch {
            // Silent — notifications are non-critical
        } finally {
            setLoading(false);
        }
    }, [ready]);

    const fetchUnreadCount = useCallback(async () => {
        if (!ready) return;
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count ?? 0);
        } catch {
            // Silent
        }
    }, [ready]);

    // On mount / when auth settles: fetch full list once, then poll count every 30s
    useEffect(() => {
        if (!ready) return;
        fetchNotifications();
        const interval = setInterval(fetchUnreadCount, 30_000);
        return () => clearInterval(interval);
    }, [ready, fetchNotifications, fetchUnreadCount]);

    // ── Actions ──────────────────────────────────────────────────────────

    const handleMarkAsRead = useCallback(async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notification_id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // Silent
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch {
            // Silent
        }
    }, []);

    const handleDelete = useCallback(async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            setNotifications((prev) => {
                const removed = prev.find((n) => n.notification_id === notificationId);
                if (removed && !removed.is_read) {
                    setUnreadCount((c) => Math.max(0, c - 1));
                }
                return prev.filter((n) => n.notification_id !== notificationId);
            });
        } catch {
            // Silent
        }
    }, []);

    const handleDeleteAllRead = useCallback(async () => {
        try {
            await deleteAllRead();
            setNotifications((prev) => prev.filter((n) => !n.is_read));
        } catch {
            // Silent
        }
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
                deleteNotification: handleDelete,
                deleteAllRead: handleDeleteAllRead,
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