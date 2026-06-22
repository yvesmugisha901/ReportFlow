"use client";
import { useState, useEffect, useRef } from "react";
import NotificationItem from "@/components/notifications/NotificationItem";

/**
 * NotificationDropdown — bell icon with unread badge + preview dropdown.
 * Drop this into your Navbar wherever the bell button currently is.
 *
 * Props:
 *  notifications: Array<NotificationItem props notification shape>
 *  onMarkAllRead?: () => void
 *  onViewAll?: () => void       — navigates to /dashboard/notifications
 */

export default function NotificationDropdown({
    notifications = [],
    onMarkAllRead,
    onViewAll,
}) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(notifications);
    const ref = useRef(null);

    const unreadCount = items.filter((n) => !n.read).length;
    const preview = items.slice(0, 5); // show max 5 in dropdown

    // Close on outside click
    useEffect(() => {
        function handle(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    function markRead(id) {
        setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }

    function markAllRead() {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        onMarkAllRead?.();
    }

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#0f1117]">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-indigo-600 font-semibold hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                        {preview.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <div className="text-2xl mb-1">🔔</div>
                                <p className="text-xs">No notifications</p>
                            </div>
                        ) : (
                            preview.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={markRead}
                                    compact={true}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => { setOpen(false); onViewAll?.(); }}
                            className="w-full text-center text-xs text-indigo-600 font-bold hover:underline"
                        >
                            View all notifications →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}