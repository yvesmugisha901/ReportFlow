"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const EVENT_ICONS = {
    approved: "✅",
    rejected: "❌",
    changes_requested: "✏️",
    submitted: "📤",
    under_review: "🔍",
    final_approved: "🎉",
};

const EVENT_COLORS = {
    approved: "bg-emerald-50 border-emerald-200",
    rejected: "bg-rose-50 border-rose-200",
    changes_requested: "bg-amber-50 border-amber-200",
    submitted: "bg-sky-50 border-sky-200",
    under_review: "bg-indigo-50 border-indigo-200",
    final_approved: "bg-violet-50 border-violet-200",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/notifications");
            setNotifications(res.data.notifications ?? res.data ?? []);
        } catch {
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function markAllRead() {
        try {
            await api.patch("/notifications/mark-all-read");
            setNotifications(n => n.map(x => ({ ...x, is_read: true })));
        } catch { /* silent */ }
    }

    async function markRead(id) {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(n => n.map(x => x.notif_id === id ? { ...x, is_read: true } : x));
        } catch { /* silent */ }
    }

    const unread = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Employee · Activity</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
                        {unread > 0 && (
                            <p className="text-xs text-indigo-600 font-semibold mt-1">{unread} unread</p>
                        )}
                    </div>
                    {unread > 0 && (
                        <button onClick={markAllRead}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            Mark all read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-4xl mb-3">🔔</div>
                        <p className="font-medium">No notifications yet</p>
                        <p className="text-sm mt-1">You'll see updates here when your reports are reviewed.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.map(n => (
                            <div
                                key={n.notif_id}
                                onClick={() => !n.is_read && markRead(n.notif_id)}
                                className={`relative rounded-2xl border p-4 cursor-pointer transition-all ${EVENT_COLORS[n.event_type] ?? "bg-white border-gray-200"
                                    } ${!n.is_read ? "shadow-sm" : "opacity-70"}`}
                            >
                                {!n.is_read && (
                                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />
                                )}
                                <div className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">{EVENT_ICONS[n.event_type] ?? "🔔"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800">{n.message}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(n.created_at).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}