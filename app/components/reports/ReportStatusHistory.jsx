"use client";

/**
 * ReportStatusHistory — vertical timeline of a report's status journey.
 */

// Inline SVG icons — all inherit currentColor
function Icon({ name, size = 16 }) {
    const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
    switch (name) {
        case "send": return <svg {...s}><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>;
        case "search": return <svg {...s}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
        case "edit": return <svg {...s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
        case "refresh": return <svg {...s}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
        case "check-circle": return <svg {...s}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
        case "star": return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
        case "x-circle": return <svg {...s}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
        case "dot": return <svg {...s}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></svg>;
        default: return <svg {...s}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></svg>;
    }
}

const STEP_META = {
    "Submitted": { icon: "send", dot: "bg-indigo-500", color: "text-indigo-500" },
    "Under Review": { icon: "search", dot: "bg-sky-500", color: "text-sky-500" },
    "Changes Requested": { icon: "edit", dot: "bg-violet-500", color: "text-violet-500" },
    "Resubmitted": { icon: "refresh", dot: "bg-indigo-400", color: "text-indigo-400" },
    "Stage 1 Approved": { icon: "check-circle", dot: "bg-emerald-500", color: "text-emerald-500" },
    "Approved": { icon: "star", dot: "bg-emerald-600", color: "text-emerald-600" },
    "Rejected": { icon: "x-circle", dot: "bg-rose-500", color: "text-rose-500" },
};

const STATUS_BADGE = {
    "Pending": "bg-amber-100 text-amber-700",
    "Under Review": "bg-sky-100 text-sky-700",
    "Approved": "bg-emerald-100 text-emerald-700",
    "Rejected": "bg-rose-100 text-rose-700",
    "Changes Requested": "bg-violet-100 text-violet-700",
};

const NEXT_STEP_META = {
    "Pending": { icon: "search", text: "Awaiting submission & Stage 1 review" },
    "Under Review": { icon: "check-circle", text: "Awaiting reviewer decision (Stage 1)" },
    "Changes Requested": { icon: "refresh", text: "Waiting for your resubmission" },
};

export default function ReportStatusHistory({ report, onClose, onResubmit }) {
    if (!report) return null;

    const history = report.history ?? [];

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] w-full max-w-lg">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                        {[report.department, report.type, report.frequency].filter(Boolean).join(" · ")}
                    </p>
                    <h2 className="text-base font-extrabold text-[#0f1117] leading-snug">{report.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[report.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {report.status}
                        </span>
                        {report.dueDate && report.dueDate !== "—" && (
                            <span className="text-xs text-gray-400">Due {report.dueDate}</span>
                        )}
                        {report.submittedAt && (
                            <span className="text-xs text-gray-400">Submitted {report.submittedAt}</span>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors shrink-0"
                    >
                        <Icon name="x-circle" size={14} />
                    </button>
                )}
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Status History</p>

                {history.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No history available yet.</p>
                ) : (
                    <div className="relative">
                        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gray-100" />
                        <ul className="flex flex-col gap-0">
                            {history.map((h, i) => {
                                const meta = STEP_META[h.status] ?? { icon: "dot", dot: "bg-gray-400", color: "text-gray-400" };
                                const isLast = i === history.length - 1;
                                const dotBorder = meta.dot.replace("bg-", "border-");
                                const dotRing = meta.dot.replace("bg-", "ring-");

                                return (
                                    <li key={i} className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-6"}`}>
                                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border-2 ${isLast ? `${dotBorder} shadow-md ring-4 ${dotRing}/20 ${meta.color}` : "border-gray-200 text-gray-400"}`}>
                                            <Icon name={meta.icon} size={14} />
                                        </div>
                                        <div className="flex-1 pt-0.5 pb-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-sm font-bold ${isLast ? "text-[#0f1117]" : "text-gray-600"}`}>
                                                    {h.status}
                                                </span>
                                                <span className="text-[10px] text-gray-400 shrink-0">{h.date}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {h.actor}
                                                {h.role && <span className="text-gray-400"> · {h.role}</span>}
                                            </p>
                                            {h.comment && (
                                                <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                                                    <p className="text-xs text-gray-700 leading-relaxed">"{h.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* What happens next */}
                {NEXT_STEP_META[report.status] && (
                    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">What happens next</p>
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                                <Icon name={NEXT_STEP_META[report.status].icon} size={14} />
                            </div>
                            <p className="text-xs text-gray-500">{NEXT_STEP_META[report.status].text}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer actions */}
            {(report.status === "Changes Requested" || report.status === "Rejected") && onResubmit && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    {report.status === "Changes Requested" && (
                        <button
                            onClick={onResubmit}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <Icon name="edit" size={14} />
                            Resubmit with Changes
                        </button>
                    )}
                    {report.status === "Rejected" && (
                        <p className="text-xs text-center text-gray-400">
                            This report was rejected. Contact your department reviewer for more information.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}