"use client";

/**
 * NotificationItem — single notification row.
 * Used inside both NotificationList and NotificationDropdown.
 *
 * Props:
 *  notification: {
 *    id: number | string,
 *    type: "submitted" | "reviewed" | "approved" | "rejected" | "changes" | "scheduled" | "info",
 *    title: string,
 *    message: string,
 *    time: string,       // "2 hours ago", "May 5, 2026"
 *    read: boolean,
 *    reportTitle?: string,
 *  }
 *  onRead?: (id) => void       — mark as read
 *  onDismiss?: (id) => void    — remove from list
 *  compact?: boolean           — smaller version for dropdown
 */

const TYPE_META = {
    submitted: { icon: "📤", bg: "bg-indigo-100", text: "text-indigo-600" },
    reviewed: { icon: "🔍", bg: "bg-sky-100", text: "text-sky-600" },
    approved: { icon: "✅", bg: "bg-emerald-100", text: "text-emerald-600" },
    rejected: { icon: "❌", bg: "bg-rose-100", text: "text-rose-600" },
    changes: { icon: "✏️", bg: "bg-violet-100", text: "text-violet-600" },
    scheduled: { icon: "📅", bg: "bg-amber-100", text: "text-amber-600" },
    info: { icon: "ℹ️", bg: "bg-gray-100", text: "text-gray-600" },
};

export default function NotificationItem({
    notification,
    onRead,
    onDismiss,
    compact = false,
}) {
    const meta = TYPE_META[notification.type] ?? TYPE_META.info;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group
        ${notification.read ? "bg-white hover:bg-gray-50" : "bg-indigo-50/60 hover:bg-indigo-50"}
      `}
            onClick={() => !notification.read && onRead?.(notification.id)}
        >
            {/* Icon */}
            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${meta.bg} ${meta.text}`}>
                {meta.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${notification.read ? "text-gray-600" : "text-[#0f1117] font-semibold"}`}>
                        {notification.title}
                    </p>
                    {/* Unread dot */}
                    {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    )}
                </div>

                {!compact && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                )}

                {notification.reportTitle && (
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5 truncate">
                        "{notification.reportTitle}"
                    </p>
                )}

                <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
            </div>

            {/* Dismiss button */}
            {onDismiss && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all text-xs"
                >
                    ✕
                </button>
            )}
        </div>
    );
}