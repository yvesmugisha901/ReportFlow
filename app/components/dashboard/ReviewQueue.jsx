"use client";
import { useState } from "react";
import api from "@/lib/axios";

/**
 * ReviewQueue — expandable approve / reject / changes panel.
 * Used by Reviewer (stage 1) and Approver/COO (stage 2).
 *
 * Props:
 *  items: Array<{
 *    id, title, employee, department, type, submittedAt,
 *    stage1Reviewer?, fileUrl?
 *  }>
 *  onAction: (id, action, comment) => void
 *  stage?: 1 | 2
 *  title?: string
 */

const ACTION_STYLES = {
    approve: "bg-emerald-600 hover:bg-emerald-700 text-white",
    changes: "bg-violet-600  hover:bg-violet-700  text-white",
    reject: "bg-rose-600    hover:bg-rose-700    text-white",
};

// ── Report Content Modal ──────────────────────────────────────
function ReportModal({ reportId, title, onClose }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch full report detail on mount
    useState(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/reports/${reportId}`);
                setReport(res.data.report ?? res.data);
            } catch {
                setError("Could not load report content.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-0.5">
                            Report Preview
                        </p>
                        <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                            Loading report…
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-5">

                            {/* Meta info */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Employee", value: report?.employee?.full_name ?? "—" },
                                    { label: "Department", value: report?.employee?.department?.name ?? "—" },
                                    { label: "Team", value: report?.employee?.team?.name ?? "—" },
                                    { label: "Schedule", value: report?.schedule?.title ?? "—" },
                                    { label: "Submitted", value: report?.submitted_at ? new Date(report.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not submitted" },
                                    { label: "Status", value: report?.status ?? "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Report content */}
                            {report?.content && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        Report Content
                                    </p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {report.content}
                                    </div>
                                </div>
                            )}

                            {/* Attached file */}
                            {report?.file_path && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        Attached File
                                    </p>
                                    <a
                                        href={report.file_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {report.file_name ?? "Download file"}
                                    </a>
                                </div>
                            )}

                            {/* No content or file */}
                            {!report?.content && !report?.file_path && (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-3xl mb-2">📄</div>
                                    <p className="text-sm">No content or file attached to this report.</p>
                                </div>
                            )}

                            {/* Previous review logs */}
                            {(report?.reviewLogs ?? []).length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                        Review History
                                    </p>
                                    <div className="space-y-2">
                                        {report.reviewLogs.map((log) => (
                                            <div
                                                key={log.log_id}
                                                className={`px-4 py-3 rounded-xl border text-xs ${log.action === "approved"
                                                    ? "bg-emerald-50 border-emerald-200"
                                                    : log.action === "rejected"
                                                        ? "bg-rose-50 border-rose-200"
                                                        : "bg-amber-50 border-amber-200"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-gray-700">
                                                        {log.reviewer?.full_name ?? "Reviewer"} — Stage {log.stage === "stage_1" ? "1" : "2"}
                                                    </span>
                                                    <span className={`font-bold capitalize ${log.action === "approved" ? "text-emerald-600" :
                                                        log.action === "rejected" ? "text-rose-600" : "text-amber-600"
                                                        }`}>
                                                        {log.action.replace("_", " ")}
                                                    </span>
                                                </div>
                                                {log.comment && (
                                                    <p className="text-gray-500 leading-relaxed">{log.comment}</p>
                                                )}
                                                <p className="text-gray-400 mt-1">
                                                    {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main ReviewQueue ──────────────────────────────────────────
export default function ReviewQueue({ items = [], onAction, stage = 1, title }) {
    const [open, setOpen] = useState(null);       // id of expanded action row
    const [comment, setComment] = useState("");
    const [done, setDone] = useState(new Set());
    const [viewing, setViewing] = useState(null); // { id, title } of report being previewed

    const heading = title ?? `Stage ${stage} Review Queue`;

    function handleAction(id, action) {
        if (!comment.trim() && action !== "approve") return;
        onAction?.(id, action, comment);
        setDone((d) => new Set([...d, id]));
        setOpen(null);
        setComment("");
    }

    const pending = items.filter((i) => !done.has(i.id));

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-[#0f1117]">{heading}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {pending.length} pending · {done.size} actioned this session
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        Stage {stage}
                    </span>
                </div>

                {/* List */}
                {pending.length === 0 ? (
                    <div className="text-center py-14 text-gray-400">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs mt-1">No pending items in this queue.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {pending.map((item) => {
                            const isOpen = open === item.id;
                            return (
                                <li key={item.id} className="transition-colors hover:bg-indigo-50/20">

                                    {/* Collapsed row */}
                                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-[#0f1117] truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {item.employee} · {item.department} · {item.type}
                                                {item.stage1Reviewer && (
                                                    <span className="ml-2 text-violet-600 font-medium">
                                                        ✔ reviewed by {item.stage1Reviewer}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-gray-400">{item.submittedAt}</span>

                                            {/* View report button — always visible */}
                                            <button
                                                onClick={() => setViewing({ id: item.id, title: item.title })}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold border border-indigo-200 transition-colors flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>

                                            {/* Expand action panel */}
                                            <button
                                                onClick={() => {
                                                    setOpen(isOpen ? null : item.id);
                                                    setComment("");
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors"
                                            >
                                                {isOpen ? "Cancel" : "Review →"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded action panel */}
                                    {isOpen && (
                                        <div className="px-5 pb-5 border-t border-dashed border-gray-100 bg-gray-50/50">
                                            <div className="pt-4">
                                                {/* Remind reviewer to read first */}
                                                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                    <span className="text-amber-500 flex-shrink-0">💡</span>
                                                    <p className="text-[11px] text-amber-700">
                                                        Make sure you have read the report before taking action.{" "}
                                                        <button
                                                            onClick={() => setViewing({ id: item.id, title: item.title })}
                                                            className="underline font-semibold"
                                                        >
                                                            View report →
                                                        </button>
                                                    </p>
                                                </div>

                                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                    Comment{" "}
                                                    <span className="text-gray-400 font-normal">
                                                        (required for Reject / Request Changes)
                                                    </span>
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Add your review comment…"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
                                                />

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleAction(item.id, "approve")}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${ACTION_STYLES.approve}`}
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(item.id, "changes")}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${ACTION_STYLES.changes}`}
                                                    >
                                                        ✏ Request Changes
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(item.id, "reject")}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${ACTION_STYLES.reject}`}
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Report preview modal */}
            {viewing && (
                <ReportModal
                    reportId={viewing.id}
                    title={viewing.title}
                    onClose={() => setViewing(null)}
                />
            )}
        </>
    );
}