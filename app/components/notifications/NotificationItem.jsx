"use client";

/**
 * NotificationItem — single notification row.
 * Used inside both NotificationList and NotificationDropdown.
 *
 * The real API returns:
 *   notification_id, type, title, message, is_read, created_at, report_title?
 *
 * Props:
 *  notification  — shape above
 *  onRead?       — (notification_id) => void
 *  onDismiss?    — (notification_id) => void
 *  compact?      — smaller version for dropdown (default false)
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

function formatTime(raw) {
    if (!raw) return "";
    const date = new Date(raw);
    if (isNaN(date)) return raw; // already a display string, pass through
    const now = Date.now();
    const diff = now - date.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotificationItem({
    notification,
    onRead,
    onDismiss,
    compact = false,
}) {
    const meta = TYPE_META[notification.type] ?? TYPE_META.info;

    // Support both API shape (is_read / notification_id) and legacy sample shape (read / id)
    const isRead = notification.is_read ?? notification.read ?? false;
    const nid = notification.notification_id ?? notification.id;
    const time = notification.created_at ?? notification.time ?? "";
    const report = notification.report_title ?? notification.reportTitle ?? null;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group
                ${isRead ? "bg-white hover:bg-gray-50" : "bg-indigo-50/60 hover:bg-indigo-50"}`}
            onClick={() => !isRead && onRead?.(nid)}
        >
            {/* Icon */}
            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${meta.bg} ${meta.text}`}>
                {meta.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${isRead ? "text-gray-600" : "text-[#0f1117] font-semibold"}`}>
                        {notification.title}
                    </p>
                    {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    )}
                </div>

                {!compact && notification.message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                    </p>
                )}

                {report && (
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5 truncate">
                        &ldquo;{report}&rdquo;
                    </p>
                )}

                <p className="text-[10px] text-gray-400 mt-1">{formatTime(time)}</p>
            </div>

            {/* Dismiss */}
            {onDismiss && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDismiss(nid); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all text-xs"
                    aria-label="Dismiss notification"
                >
                    ✕
                </button>
            )}
        </div>
    );
}