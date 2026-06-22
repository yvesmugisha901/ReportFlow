"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const ACTION_STYLES = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    changes_requested: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ApproverHistoryPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/reviews/my-history");
            setLogs(res.data.logs ?? res.data ?? []);
        } catch {
            setError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = filter === "all" ? logs : logs.filter(l => l.action === filter);

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <div className="max-w-4xl mx-auto px-6 py-8">

                <div className="mb-8">

                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Approval History</h1>
                    <p className="text-sm text-gray-500 mt-1">All approval decisions you have made.</p>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {["all", "approved", "rejected", "changes_requested"].map(a => (
                        <button key={a} onClick={() => setFilter(a)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === a ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                            {a === "all" ? "All" : a.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="font-medium">No approvals found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Report</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Comment</th>
                                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(log => (
                                        <tr key={log.log_id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-3.5 font-medium text-gray-800 max-w-[160px] truncate">
                                                {log.report?.title ?? `Report #${log.report_id}`}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {log.report?.employee?.full_name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500">
                                                {log.report?.employee?.department?.name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${ACTION_STYLES[log.action] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                                                    {log.action.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 max-w-[180px] truncate">
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
                    </div>
                )}
            </div>
        </div>
    );
}