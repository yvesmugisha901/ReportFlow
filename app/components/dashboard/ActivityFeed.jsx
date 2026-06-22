"use client";

/**
 * ActivityFeed — chronological activity timeline (used on Employee dashboard).
 *
 * Props:
 *  activities: Array<{
 *    id: number | string,
 *    type: "submitted" | "approved" | "rejected" | "review" | "changes" | "scheduled" | "info",
 *    message: string,
 *    time: string,        // e.g. "2 hours ago", "May 1, 2025"
 *    reportTitle?: string
 *  }>
 *  title?: string
 *  maxItems?: number      // default shows all, pass a number to cap and show "View all"
 */

import { useState } from "react";

const TYPE_META = {
    submitted: { icon: "", dot: "bg-indigo-500" },
    approved: { icon: "", dot: "bg-emerald-500" },
    rejected: { icon: "", dot: "bg-rose-500" },
    review: { icon: "", dot: "bg-sky-500" },
    changes: { icon: "", dot: "bg-violet-500" },
    scheduled: { icon: "", dot: "bg-amber-400" },
    info: { icon: "ℹ", dot: "bg-gray-400" },
};

export default function ActivityFeed({
    activities = [],
    title = "Recent Activity",
    maxItems,
}) {
    const [expanded, setExpanded] = useState(false);

    const visible =
        maxItems && !expanded ? activities.slice(0, maxItems) : activities;
    const hasMore = maxItems && activities.length > maxItems;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0f1117] mb-4">{title}</h3>

            {activities.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">No recent activity.</p>
            ) : (
                <div className="relative">
                    {/* vertical line */}
                    <div className="absolute left-[17px] top-0 bottom-0 w-px bg-gray-100" />

                    <ul className="flex flex-col gap-0">
                        {visible.map((a, i) => {
                            const meta = TYPE_META[a.type] ?? TYPE_META.info;
                            return (
                                <li key={a.id ?? i} className="relative flex gap-3 pb-5 last:pb-0">
                                    {/* dot */}
                                    <span
                                        className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base ${meta.dot} bg-opacity-10 border-2 border-white shadow-sm`}
                                        style={{ background: "white" }}
                                    >
                                        <span>{meta.icon}</span>
                                    </span>

                                    {/* content */}
                                    <div className="flex flex-col pt-1.5 min-w-0">
                                        <p className="text-sm text-[#0f1117] leading-snug">
                                            {a.message}
                                            {a.reportTitle && (
                                                <span className="font-semibold text-indigo-600">
                                                    {" "}"{a.reportTitle}"
                                                </span>
                                            )}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-0.5">{a.time}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {hasMore && (
                        <button
                            onClick={() => setExpanded((e) => !e)}
                            className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                        >
                            {expanded ? "Show less" : `View all ${activities.length} activities`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}