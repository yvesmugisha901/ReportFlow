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
    "Pending": { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "clock" },
    "Under Review": { bg: "bg-sky-50", border: "border-sky-200", badge: "bg-sky-100 text-sky-700", icon: "search" },
    "Approved": { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: "check-circle" },
    "Rejected": { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", icon: "x-circle" },
    "Changes Requested": { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", icon: "edit" },
};

const TYPE_ICON = {
    "Monthly": "calendar-month",
    "Weekly": "calendar-week",
    "Quarterly": "bar-chart",
    "Bi-Weekly": "calendar",
};

// Inline SVG icon component — inherits currentColor
function Icon({ name, size = 14 }) {
    const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
    switch (name) {
        case "clock": return <svg {...s}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
        case "search": return <svg {...s}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
        case "check-circle": return <svg {...s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
        case "x-circle": return <svg {...s}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
        case "edit": return <svg {...s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
        case "calendar-month": return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3" strokeLinecap="round" /><line x1="12" y1="14" x2="12" y2="14" strokeWidth="3" strokeLinecap="round" /><line x1="16" y1="14" x2="16" y2="14" strokeWidth="3" strokeLinecap="round" /></svg>;
        case "calendar-week": return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><line x1="8" y1="15" x2="16" y2="15" /></svg>;
        case "bar-chart": return <svg {...s}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
        case "calendar": return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
        case "file-text": return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
        default: return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    }
}

export default function ReportCard({ report, onClick }) {
    const meta = STATUS_META[report.status] ?? STATUS_META["Pending"];
    const typeIconName = TYPE_ICON[report.frequency] ?? "file-text";

    return (
        <div
            onClick={() => onClick?.(report)}
            className={`rounded-2xl border p-5 flex flex-col gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${meta.bg} ${meta.border}`}
        >
            {/* Top row: type icon + status badge */}
            <div className="flex items-start justify-between">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.badge}`}>
                    <Icon name={typeIconName} size={18} />
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${meta.badge}`}>
                    <Icon name={meta.icon} size={11} />
                    {report.status}
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

            {/* Reviewer comment snippet */}
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