"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const ACTION_COLORS = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    changes_requested: "bg-amber-50 text-amber-700 border-amber-200",
    submitted: "bg-sky-50 text-sky-700 border-sky-200",
    created: "bg-indigo-50 text-indigo-700 border-indigo-200",
    updated: "bg-violet-50 text-violet-700 border-violet-200",
    deleted: "bg-red-50 text-red-700 border-red-200",
};

function actionColor(action) {
    return ACTION_COLORS[action] ?? "bg-gray-50 text-gray-700 border-gray-200";
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("all");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/reviews/logs");
            const raw = res.data.logs ?? res.data ?? [];
            setLogs(raw);
        } catch {
            setError("Failed to load audit logs.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const actions = ["all", ...Array.from(new Set(logs.map(l => l.action)))];

    const filtered = logs.filter(l => {
        const matchSearch = !search ||
            l.reviewer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            l.report?.title?.toLowerCase().includes(search.toLowerCase());
        const matchAction = actionFilter === "all" || l.action === actionFilter;
        return matchSearch && matchAction;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-1">Admin · System</p>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Audit Logs</h1>
                    <p className="text-sm text-gray-500 mt-1">Full history of all review actions across the system.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Search by reviewer or report…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white w-72"
                    />
                    <select
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                        {actions.map(a => (
                            <option key={a} value={a}>{a === "all" ? "All Actions" : a.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <button onClick={load} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        ↻ Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <p className="text-red-500 mb-3">{error}</p>
                            <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="text-4xl mb-3">🗂️</div>
                            <p className="font-medium">No logs found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Reviewer</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Report</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Stage</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Comment</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(log => (
                                        <tr key={log.log_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-gray-800">
                                                {log.reviewer?.full_name ?? "—"}
                                                <p className="text-xs text-gray-400 font-normal">{log.reviewer?.role ?? ""}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-700 max-w-[180px] truncate">
                                                {log.report?.title ?? `Report #${log.report_id}`}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {log.stage === "stage_1" ? "Stage 1" : "Stage 2"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${actionColor(log.action)}`}>
                                                    {log.action.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">
                                                {log.comment ?? <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleDateString("en-US", {
                                                    month: "short", day: "numeric", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit"
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400 mt-3 text-right">{filtered.length} log{filtered.length !== 1 ? "s" : ""} shown</p>
            </div>
        </div>
    );
}