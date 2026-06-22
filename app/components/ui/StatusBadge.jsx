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

const SIZE = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
};

const ICON_SIZE = { sm: 10, md: 12 };

// Inline SVG icons — all use currentColor so they inherit the badge text color.
function StatusIcon({ status, size = 12 }) {
    const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 };

    switch (status) {
        case "Pending":
        case "Pending Final":
            // Clock
            return (
                <svg {...s}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            );
        case "Under Review":
            // Magnifier
            return (
                <svg {...s}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            );
        case "Approved":
            // Circle check
            return (
                <svg {...s}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            );
        case "Rejected":
            // Circle X
            return (
                <svg {...s}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        case "Changes Requested":
            // Pencil
            return (
                <svg {...s}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            );
        case "Stage 1 Approved":
            // Simple checkmark (no circle — visually distinct from full Approved)
            return (
                <svg {...s}>
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            );
        default:
            // Dot fallback
            return (
                <svg {...s}>
                    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                </svg>
            );
    }
}

export default function StatusBadge({ status, size = "md" }) {
    const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
    const iconSize = ICON_SIZE[size] ?? 12;

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${style} ${SIZE[size]}`}>
            <StatusIcon status={status} size={iconSize} />
            {status}
        </span>
    );
}