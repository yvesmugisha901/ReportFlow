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

/**
 * Normalize a raw notification from the API.
 * The DB returns `notif_id`; we alias it to `notification_id` so every
 * consumer in the app can use a single, consistent field name.
 */
function normalizeNotification(n) {
    return {
        ...n,
        // Prefer notif_id (real DB column), fall back if already mapped
        notification_id: n.notif_id ?? n.notification_id,
    };
}

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
            const raw = data.notifications ?? data ?? [];
            const list = raw.map(normalizeNotification);
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
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) =>
                n.notification_id === notificationId ? { ...n, is_read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await markAsRead(notificationId);
        } catch {
            // Revert on failure
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notification_id === notificationId ? { ...n, is_read: false } : n
                )
            );
            setUnreadCount((prev) => prev + 1);
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        try {
            await markAllAsRead();
        } catch {
            // Revert on failure
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const handleDelete = useCallback(async (notificationId) => {
        // Optimistic update
        setNotifications((prev) => {
            const removed = prev.find((n) => n.notification_id === notificationId);
            if (removed && !removed.is_read) {
                setUnreadCount((c) => Math.max(0, c - 1));
            }
            return prev.filter((n) => n.notification_id !== notificationId);
        });
        try {
            await deleteNotification(notificationId);
        } catch {
            // Revert on failure
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const handleDeleteAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.filter((n) => !n.is_read));
        try {
            await deleteAllRead();
        } catch {
            // Revert on failure
            fetchNotifications();
        }
    }, [fetchNotifications]);

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