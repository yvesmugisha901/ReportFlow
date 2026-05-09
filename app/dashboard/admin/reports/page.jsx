"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const STATUS_STYLES = {
    pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Pending" },
    submitted: { bg: "bg-blue-50", text: "text-blue-600", label: "Submitted" },
    under_review: { bg: "bg-amber-50", text: "text-amber-600", label: "Under Review" },
    changes_requested: { bg: "bg-orange-50", text: "text-orange-600", label: "Changes Requested" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Approved" },
    rejected: { bg: "bg-red-50", text: "text-red-600", label: "Rejected" },
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get("/reports", {
                params: { search, status: statusFilter || undefined, page, limit: 15 },
            });
            const data = res.data;
            setReports(data.reports ?? data);
            setTotalPages(data.totalPages ?? 1);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); }, [search, statusFilter]);
    useEffect(() => { load(); }, [search, statusFilter, page]);

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Admin / Reports</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Reports</h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm w-64"
                        placeholder="Search by title or employee…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {Object.entries(STATUS_STYLES).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <div className="text-5xl mb-4">📋</div>
                            <p className="font-medium">No reports found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Late?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports.map(r => {
                                    const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
                                    return (
                                        <tr key={r.report_id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[220px] truncate">{r.title}</td>
                                            <td className="px-5 py-3.5 text-gray-600">{r.employee?.full_name ?? r.employee_name ?? "—"}</td>
                                            <td className="px-5 py-3.5 text-gray-500">{r.employee?.Department?.name ?? r.dept_name ?? "—"}</td>
                                            <td className="px-5 py-3.5 text-gray-500">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {r.is_late
                                                    ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">Late</span>
                                                    : <span className="text-xs text-gray-400">—</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
                    </div>
                )}
            </div>
        </div>
    );
}