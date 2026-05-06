"use client";

/**
 * StatusBadge — colored pill for report/review statuses.
 *
 * Props:
 *  status: "Pending" | "Under Review" | "Approved" | "Rejected" |
 *          "Changes Requested" | "Stage 1 Approved" | "Pending Final"
 *  size?: "sm" | "md"   default "md"
 */

const STATUS_STYLES = {
    "Pending": "bg-amber-100 text-amber-700",
    "Under Review": "bg-sky-100 text-sky-700",
    "Approved": "bg-emerald-100 text-emerald-700",
    "Rejected": "bg-rose-100 text-rose-700",
    "Changes Requested": "bg-violet-100 text-violet-700",
    "Stage 1 Approved": "bg-indigo-100 text-indigo-700",
    "Pending Final": "bg-amber-100 text-amber-700",
};

const STATUS_ICONS = {
    "Pending": "⏳",
    "Under Review": "🔍",
    "Approved": "✅",
    "Rejected": "❌",
    "Changes Requested": "✏️",
    "Stage 1 Approved": "✔",
    "Pending Final": "⏳",
};

const SIZE = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
};

export default function StatusBadge({ status, size = "md" }) {
    const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
    const icon = STATUS_ICONS[status] ?? "•";

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${style} ${SIZE[size]}`}>
            <span>{icon}</span>
            {status}
        </span>
    );
}