"use client";

/**
 * ReportCard — card view of a single report.
 * Used in grid layouts on the employee reports page.
 *
 * Props:
 *  report: {
 *    id: number | string,
 *    title: string,
 *    type: string,
 *    department: string,
 *    frequency: string,
 *    submittedAt: string | null,
 *    dueDate: string,
 *    status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Changes Requested"
 *    reviewerComment?: string,
 *  }
 *  onClick?: (report) => void   — opens detail / status history view
 */

const STATUS_META = {
    "Pending": { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "⏳" },
    "Under Review": { bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-100 text-sky-700", icon: "🔍" },
    "Approved": { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: "✅" },
    "Rejected": { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", icon: "❌" },
    "Changes Requested": { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", icon: "✏️" },
};

const TYPE_ICONS = {
    "Monthly": "📅",
    "Weekly": "📆",
    "Quarterly": "📊",
    "Bi-Weekly": "🗓️",
};

export default function ReportCard({ report, onClick }) {
    const meta = STATUS_META[report.status] ?? STATUS_META["Pending"];
    const typeIcon = TYPE_ICONS[report.frequency] ?? "📋";

    return (
        <div
            onClick={() => onClick?.(report)}
            className={`rounded-2xl border p-5 flex flex-col gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${meta.bg} ${meta.border}`}
        >
            {/* Top row: type icon + status badge */}
            <div className="flex items-start justify-between">
                <span className="text-2xl">{typeIcon}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${meta.badge}`}>
                    <span>{meta.icon}</span> {report.status}
                </span>
            </div>

            {/* Title */}
            <div>
                <h3 className="font-extrabold text-sm text-[#0f1117] leading-snug line-clamp-2">
                    {report.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    {report.department} · {report.type} · {report.frequency}
                </p>
            </div>

            {/* Reviewer comment snippet (if changes requested or rejected) */}
            {report.reviewerComment && (report.status === "Changes Requested" || report.status === "Rejected") && (
                <div className="bg-white/70 rounded-xl px-3 py-2 border border-current/10">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase mb-0.5">Reviewer note</p>
                    <p className="text-xs text-gray-700 line-clamp-2">{report.reviewerComment}</p>
                </div>
            )}

            {/* Footer: dates */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
                <div>
                    <p className="text-[10px] text-gray-400 font-medium">Due date</p>
                    <p className="text-xs font-semibold text-gray-700">{report.dueDate}</p>
                </div>
                {report.submittedAt ? (
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-medium">Submitted</p>
                        <p className="text-xs font-semibold text-gray-700">{report.submittedAt}</p>
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        Not submitted
                    </span>
                )}
            </div>
        </div>
    );
}