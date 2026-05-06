"use client";
import { useState } from "react";

/**
 * ReviewQueue — expandable approve / reject / changes-requested panel.
 * Used by both Reviewer (stage 1) and Approver/COO (stage 2) dashboards.
 *
 * Props:
 *  items: Array<{
 *    id: number | string,
 *    title: string,
 *    employee: string,
 *    department: string,
 *    type: string,
 *    submittedAt: string,
 *    stage1Reviewer?: string,   // Approver dashboard: who already cleared stage 1
 *    fileUrl?: string,
 *  }>
 *  onAction: (id, action: "approve"|"reject"|"changes", comment: string) => void
 *  stage?: 1 | 2              // cosmetic label, default 1
 *  title?: string
 */

const ACTION_STYLES = {
    approve: "bg-emerald-600 hover:bg-emerald-700 text-white",
    changes: "bg-violet-600 hover:bg-violet-700 text-white",
    reject: "bg-rose-600   hover:bg-rose-700   text-white",
};

export default function ReviewQueue({
    items = [],
    onAction,
    stage = 1,
    title,
}) {
    const [open, setOpen] = useState(null);   // id of expanded row
    const [comment, setComment] = useState("");
    const [done, setDone] = useState(new Set());

    const heading = title ?? `Stage ${stage} Review Queue`;

    function handleAction(id, action) {
        if (!comment.trim() && action !== "approve") return; // require comment for reject/changes
        onAction?.(id, action, comment);
        setDone((d) => new Set([...d, id]));
        setOpen(null);
        setComment("");
    }

    const pending = items.filter((i) => !done.has(i.id));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* header */}
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

            {/* list */}
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
                                {/* collapsed row */}
                                <button
                                    className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                                    onClick={() => {
                                        setOpen(isOpen ? null : item.id);
                                        setComment("");
                                    }}
                                >
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
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-gray-400">{item.submittedAt}</span>
                                        <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                                    </div>
                                </button>

                                {/* expanded panel */}
                                {isOpen && (
                                    <div className="px-5 pb-5 border-t border-dashed border-gray-100">
                                        {item.fileUrl && (
                                            <a
                                                href={item.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline mt-3 mb-4"
                                            >
                                                📎 View attached file
                                            </a>
                                        )}

                                        <label className="block text-xs font-semibold text-gray-600 mt-3 mb-1">
                                            Comment <span className="text-gray-400 font-normal">(required for Reject / Changes)</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Add your review comment…"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
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
                                            <button
                                                onClick={() => { setOpen(null); setComment(""); }}
                                                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}