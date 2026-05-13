"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const EVENT_ICONS = {
    approved: "",
    rejected: "",
    changes_requested: "",
    submitted: "",
    under_review: "",
    final_approved: "",
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
    const [deletingId, setDeletingId] = useState(null);
    const [clearingRead, setClearingRead] = useState(false);

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

    // Mark single as read + optimistic update
    async function markRead(id) {
        if (!id) return;
        setNotifications(n =>
            n.map(x => x.notif_id === id ? { ...x, is_read: true } : x)
        );
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch {
            // revert optimistic update on failure
            load();
        }
    }

    // Mark all read + optimistic update
    async function markAllRead() {
        setNotifications(n => n.map(x => ({ ...x, is_read: true })));
        try {
            await api.patch("/notifications/mark-all-read");
        } catch {
            load();
        }
    }

    // Delete single notification
    async function deleteOne(e, id) {
        e.stopPropagation(); // prevent triggering markRead
        setDeletingId(id);
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(n => n.filter(x => x.notif_id !== id));
        } catch {
            load();
        } finally {
            setDeletingId(null);
        }
    }

    // Delete all read notifications
    async function clearAllRead() {
        setClearingRead(true);
        try {
            await api.delete("/notifications/read");
            setNotifications(n => n.filter(x => !x.is_read));
        } catch {
            load();
        } finally {
            setClearingRead(false);
        }
    }

    const unread = notifications.filter(n => !n.is_read).length;
    const hasRead = notifications.some(n => n.is_read);

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

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {hasRead && (
                            <button
                                onClick={clearAllRead}
                                disabled={clearingRead}
                                className="px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {clearingRead ? "Clearing…" : "Clear read"}
                            </button>
                        )}
                        {unread > 0 && (
                            <button
                                onClick={markAllRead}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
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
                                className={`group relative rounded-2xl border p-4 transition-all ${EVENT_COLORS[n.event_type] ?? "bg-white border-gray-200"
                                    } ${!n.is_read ? "cursor-pointer shadow-sm" : "opacity-70"}`}
                            >
                                {/* Unread dot */}
                                {!n.is_read && (
                                    <span className="absolute top-3 right-10 w-2 h-2 rounded-full bg-indigo-500" />
                                )}

                                {/* Delete button — visible on hover */}
                                <button
                                    onClick={(e) => deleteOne(e, n.notif_id)}
                                    disabled={deletingId === n.notif_id}
                                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                    title="Delete notification"
                                    aria-label="Delete notification"
                                >
                                    {deletingId === n.notif_id ? (
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </button>

                                <div className="flex items-start gap-3 pr-6">
                                    <span className="text-xl flex-shrink-0">
                                        {EVENT_ICONS[n.event_type] ?? "🔔"}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800">{n.message}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(n.created_at).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                                hour: "2-digit", minute: "2-digit",
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