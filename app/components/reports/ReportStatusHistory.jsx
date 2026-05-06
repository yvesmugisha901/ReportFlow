"use client";

/**
 * ReportStatusHistory — vertical timeline of a report's status journey.
 * Shown when employee clicks "View" on a report card/row.
 *
 * Props:
 *  report: {
 *    id, title, type, department, frequency, dueDate, submittedAt, status,
 *    history: Array<{
 *      status: string,
 *      actor: string,       // "You" | "Eric Nshimiyimana (Reviewer)" | "COO"
 *      role: string,        // "Employee" | "Reviewer" | "Approver"
 *      date: string,
 *      comment?: string,
 *    }>
 *  }
 *  onClose?: () => void     — if rendered inside a modal/drawer
 *  onResubmit?: () => void  — shown when status is "Changes Requested"
 */

const STEP_META = {
    "Submitted": { icon: "📤", dot: "bg-indigo-500", line: "bg-indigo-200" },
    "Under Review": { icon: "🔍", dot: "bg-sky-500", line: "bg-sky-200" },
    "Changes Requested": { icon: "✏️", dot: "bg-violet-500", line: "bg-violet-200" },
    "Resubmitted": { icon: "🔄", dot: "bg-indigo-400", line: "bg-indigo-200" },
    "Stage 1 Approved": { icon: "✅", dot: "bg-emerald-500", line: "bg-emerald-200" },
    "Approved": { icon: "🎉", dot: "bg-emerald-600", line: "bg-emerald-200" },
    "Rejected": { icon: "❌", dot: "bg-rose-500", line: "bg-rose-200" },
};

const STATUS_BADGE = {
    "Pending": "bg-amber-100 text-amber-700",
    "Under Review": "bg-sky-100 text-sky-700",
    "Approved": "bg-emerald-100 text-emerald-700",
    "Rejected": "bg-rose-100 text-rose-700",
    "Changes Requested": "bg-violet-100 text-violet-700",
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
                        {report.department} · {report.type} · {report.frequency}
                    </p>
                    <h2 className="text-base font-extrabold text-[#0f1117] leading-snug">{report.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[report.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {report.status}
                        </span>
                        <span className="text-xs text-gray-400">Due {report.dueDate}</span>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors shrink-0"
                    >
                        ✕
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
                        {/* vertical connector line */}
                        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gray-100" />

                        <ul className="flex flex-col gap-0">
                            {history.map((h, i) => {
                                const meta = STEP_META[h.status] ?? { icon: "•", dot: "bg-gray-400", line: "bg-gray-200" };
                                const isLast = i === history.length - 1;

                                return (
                                    <li key={i} className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-6"}`}>
                                        {/* dot */}
                                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm bg-white border-2 ${isLast ? `border-current shadow-md ${meta.dot.replace("bg-", "border-")}` : "border-gray-200"
                                            } ${isLast ? "ring-4 ring-offset-0 " + meta.dot.replace("bg-", "ring-") + "/20" : ""}`}>
                                            {meta.icon}
                                        </div>

                                        {/* content */}
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

                {/* Pending step — what comes next */}
                {report.status !== "Approved" && report.status !== "Rejected" && (
                    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">What happens next</p>
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-sm shrink-0">
                                {report.status === "Under Review" ? "✅" : report.status === "Changes Requested" ? "🔄" : "🔍"}
                            </div>
                            <p className="text-xs text-gray-500">
                                {report.status === "Under Review"
                                    ? "Awaiting reviewer decision (Stage 1)"
                                    : report.status === "Changes Requested"
                                        ? "Waiting for your resubmission"
                                        : "Submitted — waiting for Stage 1 review"}
                            </p>
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
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200"
                        >
                            ✏️ Resubmit with Changes
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