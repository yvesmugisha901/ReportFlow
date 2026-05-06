"use client";
import { useState } from "react";

/**
 * ReportTable — sortable, filterable reports list used across all dashboards.
 *
 * Props:
 *  reports: Array<{
 *    id: number | string,
 *    title: string,
 *    employee: string,
 *    department: string,
 *    type: string,
 *    submittedAt: string,     // formatted date string
 *    status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Changes Requested"
 *  }>
 *  showEmployee?: boolean     // hide for employee's own table (default true)
 *  onView?: (report) => void  // click handler for a row
 */

const STATUS_COLORS = {
    Pending: "bg-amber-100 text-amber-700",
    "Under Review": "bg-sky-100 text-sky-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
    "Changes Requested": "bg-violet-100 text-violet-700",
};

const ALL_STATUSES = ["All", "Pending", "Under Review", "Approved", "Rejected", "Changes Requested"];

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
            {label} {sortable && sortKey === k && (sortAsc ? "↑" : "↓")}
        </th>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
                {/* search */}
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search reports…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                {/* status tabs */}
                <div className="flex flex-wrap gap-1.5">
                    {ALL_STATUSES.map((s) => (
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

            {/* table */}
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
                                <td colSpan={showEmployee ? 7 : 6} className="text-center py-12 text-gray-400 text-sm">
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
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {onView && (
                                            <button
                                                onClick={() => onView(r)}
                                                className="text-xs text-indigo-600 font-semibold hover:underline"
                                            >
                                                View →
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* footer count */}
            <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
                Showing {visible.length} of {reports.length} reports
            </div>
        </div>
    );
}