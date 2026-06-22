"use client";
import { useNotifications } from "@/context/NotificationsContext";

// ── SVG Icons ─────────────────────────────────────────────────
const Icon = ({ name, className = "w-4 h-4" }) => {
    const base = {
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.75,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
    };
    const icons = {
        approved: <svg {...base}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
        rejected: <svg {...base}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
        changes_requested: <svg {...base}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        submitted: <svg {...base}><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>,
        under_review: <svg {...base}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
        final_approved: <svg {...base}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
        bell: <svg {...base}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
        close: <svg {...base}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
        check: <svg {...base}><polyline points="20 6 9 17 4 12" /></svg>,
        trash: <svg {...base}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
    };
    return icons[name] ?? icons.bell;
};

const EVENT_META = {
    approved: { icon: "approved", bg: "bg-emerald-50 border-emerald-200", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    rejected: { icon: "rejected", bg: "bg-rose-50 border-rose-200", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
    changes_requested: { icon: "changes_requested", bg: "bg-amber-50 border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    submitted: { icon: "submitted", bg: "bg-sky-50 border-sky-200", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
    under_review: { icon: "under_review", bg: "bg-indigo-50 border-indigo-200", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    final_approved: { icon: "final_approved", bg: "bg-violet-50 border-violet-200", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
};

const DEFAULT_META = {
    icon: "bell",
    bg: "bg-white border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
};

export default function NotificationList() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
    } = useNotifications();

    const hasRead = notifications.some((n) => n.is_read);

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Activity</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-xs text-indigo-600 font-semibold mt-1">
                                {unreadCount} unread
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {hasRead && (
                            <button
                                onClick={deleteAllRead}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Icon name="trash" className="w-3.5 h-3.5" />
                                Clear read
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Icon name="check" className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                        Loading…
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Icon name="bell" className="w-7 h-7" />
                        </div>
                        <p className="font-semibold text-gray-500">No notifications yet</p>
                        <p className="text-sm mt-1">
                            You'll see updates here when your reports are reviewed.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.map((n) => {
                            const meta = EVENT_META[n.event_type] ?? DEFAULT_META;
                            // notification_id is normalized by context (notif_id → notification_id)
                            const nid = n.notification_id;

                            return (
                                <div
                                    key={nid}
                                    onClick={() => !n.is_read && markAsRead(nid)}
                                    className={`group relative rounded-2xl border p-4 transition-all ${meta.bg} ${!n.is_read ? "cursor-pointer shadow-sm" : "opacity-70"
                                        }`}
                                >
                                    {/* Unread dot */}
                                    {!n.is_read && (
                                        <span className="absolute top-3 right-10 w-2 h-2 rounded-full bg-indigo-500" />
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(nid);
                                        }}
                                        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete notification"
                                        aria-label="Delete notification"
                                    >
                                        <Icon name="close" className="w-3.5 h-3.5" />
                                    </button>

                                    <div className="flex items-start gap-3 pr-6">
                                        {/* Icon badge */}
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${meta.iconBg} ${meta.iconColor}`}>
                                            <Icon name={meta.icon} className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(n.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}