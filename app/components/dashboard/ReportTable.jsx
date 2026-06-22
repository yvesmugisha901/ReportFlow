"use client";
import { useState } from "react";

const STATUS_COLORS = {
    Pending: "bg-amber-100 text-amber-700",
    Submitted: "bg-blue-100 text-blue-700",
    "Under Review": "bg-sky-100 text-sky-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
    "Changes Requested": "bg-violet-100 text-violet-700",
};

const ALL_STATUSES = ["All", "Pending", "Submitted", "Under Review", "Approved", "Rejected", "Changes Requested"];

const Icon = ({ name, className = "w-4 h-4" }) => {
    const p = {
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };
    const icons = {
        search: (
            <svg className={className} {...p}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        arrowUp: (
            <svg className={className} {...p}>
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
            </svg>
        ),
        arrowDown: (
            <svg className={className} {...p}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
            </svg>
        ),
        arrowRight: (
            <svg className={className} {...p}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
        ),
    };
    return icons[name] ?? null;
};

export default function ReportTable({
    reports = [],
    showEmployee = true,
    onView,
}) {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("submittedAt");
    const [sortAsc, setSortAsc] = useState(false);

    const toggleSort = (key) => {
        if (sortKey === key) setSortAsc((a) => !a);
        else { setSortKey(key); setSortAsc(true); }
    };

    const visible = reports
        .filter((r) => filter === "All" || r.status === filter)
        .filter((r) =>
            [r.title, r.employee, r.department, r.type]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const va = a[sortKey] ?? "";
            const vb = b[sortKey] ?? "";
            return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        });

    const Th = ({ label, sortable, k }) => (
        <th
            className={`px-4 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide ${sortable ? "cursor-pointer select-none hover:text-indigo-600" : ""}`}
            onClick={sortable ? () => toggleSort(k) : undefined}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {sortable && sortKey === k && (
                    <Icon name={sortAsc ? "arrowUp" : "arrowDown"} className="w-3 h-3" />
                )}
            </span>
        </th>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icon name="search" className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search reports…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {ALL_STATUSES.filter(
                        (s) => s === "All" || reports.some((r) => r.status === s)
                    ).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === s
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                        <tr>
                            <Th label="Report" sortable k="title" />
                            {showEmployee && <Th label="Employee" sortable k="employee" />}
                            <Th label="Department" sortable k="department" />
                            <Th label="Type" sortable k="type" />
                            <Th label="Submitted" sortable k="submittedAt" />
                            <Th label="Status" />
                            <Th label="" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {visible.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={showEmployee ? 7 : 6}
                                    className="text-center py-12 text-gray-400 text-sm"
                                >
                                    No reports match your filters.
                                </td>
                            </tr>
                        ) : (
                            visible.map((r) => (
                                <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-sm text-[#0f1117] max-w-[200px] truncate">
                                        {r.title}
                                    </td>
                                    {showEmployee && (
                                        <td className="px-4 py-3 text-sm text-gray-600">{r.employee}</td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-gray-600">{r.department}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{r.type}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{r.submittedAt}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {onView && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(r);
                                                }}
                                                className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                                            >
                                                View <Icon name="arrowRight" className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
                Showing {visible.length} of {reports.length} reports
            </div>
        </div>
    );
}