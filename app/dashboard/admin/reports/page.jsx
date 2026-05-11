"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const STATUS_STYLES = {
    pending: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Pending" },
    submitted: { bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500", label: "Submitted" },
    under_review: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", label: "Under Review" },
    changes_requested: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", label: "Changes Requested" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", label: "Approved" },
    rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Rejected" },
};

// ── Icons ────────────────────────────────────────────────────────
const Icon = ({ name, className = "w-3.5 h-3.5" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        search: <svg className={className} {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
        download: <svg className={className} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
        export: <svg className={className} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
        eye: <svg className={className} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
        file: <svg className={className} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
        close: <svg className={className} {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
        chevron: <svg className={className} {...p}><polyline points="6 9 12 15 18 9" /></svg>,
        clock: <svg className={className} {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    };
    return icons[name] ?? null;
};

// ── CSV Export ───────────────────────────────────────────────────
function exportToCSV(reports) {
    const headers = ["Title", "Employee", "Department", "Submitted", "Status", "Late"];
    const rows = reports.map(r => [
        `"${r.title ?? ""}"`,
        `"${r.employee?.full_name ?? r.employee_name ?? ""}"`,
        `"${r.employee?.department?.name ?? r.dept_name ?? ""}"`,
        r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "",
        STATUS_STYLES[r.status]?.label ?? r.status ?? "",
        r.is_late ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── File Preview Modal ───────────────────────────────────────────
function FileModal({ report, onClose }) {
    if (!report) return null;
    const fileUrl = report.file_path
        ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}${report.file_path}`
        : null;
    const fileName = report.file_name ?? report.title ?? "report-file";
    const isPdf = fileUrl && /\.pdf$/i.test(fileUrl);
    const isImage = fileUrl && /\.(png|jpe?g|gif|webp)$/i.test(fileUrl);

    const download = () => {
        if (!fileUrl) return;
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        a.target = "_blank";
        a.click();
    };

    const dept = report.employee?.department?.name ?? report.dept_name ?? "—";
    const status = STATUS_STYLES[report.status] ?? STATUS_STYLES.pending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">

                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Icon name="file" className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{report.title}</p>
                            <p className="text-xs text-gray-400">{report.employee?.full_name ?? report.employee_name ?? "—"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {fileUrl && (
                            <button onClick={download} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                                <Icon name="download" className="w-3 h-3" /> Download
                            </button>
                        )}
                        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <Icon name="close" className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* File viewer */}
                <div className="flex-1 overflow-auto p-5 min-h-[300px]">
                    {!fileUrl ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                <Icon name="file" className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium">No file attached</p>
                            <p className="text-xs mt-1">This report has no uploaded file.</p>
                        </div>
                    ) : isPdf ? (
                        <iframe src={fileUrl} className="w-full h-[55vh] rounded-lg border border-gray-200" title={fileName} />
                    ) : isImage ? (
                        <img src={fileUrl} alt={fileName} className="max-w-full mx-auto rounded-lg border border-gray-200" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                <Icon name="file" className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium">Preview unavailable</p>
                            <p className="text-xs mt-1 mb-4">This file type cannot be previewed.</p>
                            <button onClick={download} className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                                <Icon name="download" className="w-3 h-3" /> Download File
                            </button>
                        </div>
                    )}
                </div>

                {/* Meta footer */}
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Department", value: dept },
                        { label: "Submitted", value: report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : "—" },
                        { label: "Status", value: status.label },
                        { label: "Late", value: report.is_late ? "Yes" : "No" },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="text-xs text-gray-700 font-medium mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────
export default function AdminReportsPage() {
    const [reports, setReports] = useState([]);
    const [departments, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [preview, setPreview] = useState(null);

    // ── Load reports ─────────────────────────────────────────────
    // NOTE: `load` is intentionally NOT wrapped in useCallback so it
    // always reads the latest state values directly from the closure.
    const load = useCallback(async (currentPage, currentSearch, currentStatus, currentDept) => {
        try {
            setLoading(true);
            const res = await api.get("/reports", {
                params: {
                    search: currentSearch || undefined,
                    status: currentStatus || undefined,
                    dept_id: currentDept || undefined,
                    page: currentPage,
                    limit: 15,
                },
            });
            const data = res.data;
            setReports(data.reports ?? data ?? []);
            setTotalPages(data.totalPages ?? 1);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    // Load departments once
    useEffect(() => {
        api.get("/departments")
            .then(res => setDepts(res.data.departments ?? res.data ?? []))
            .catch(() => { });
    }, []);

    // ── FIX: When filters change, reset to page 1 and fetch immediately ──
    // By passing values directly to load() we avoid the stale-closure /
    // double-render race that caused the department filter to be ignored.
    useEffect(() => {
        setPage(1);
        load(1, search, statusFilter, deptFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter, deptFilter]);

    // ── When only the page changes (prev/next buttons), re-fetch ──
    useEffect(() => {
        load(page, search, statusFilter, deptFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <>
            <div className="min-h-screen bg-[#f5f6fa] text-[#0f1117]">
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-violet-100/50 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-100/40 blur-[90px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-5 py-6">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs text-gray-400 mb-0.5">Admin / Reports</p>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">All Reports</h1>
                        </div>
                        <button
                            onClick={() => exportToCSV(reports)}
                            disabled={loading || reports.length === 0}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-40"
                        >
                            <Icon name="export" className="w-3.5 h-3.5" />
                            Export CSV
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Icon name="search" className="w-3.5 h-3.5" />
                            </span>
                            <input
                                className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm w-52 placeholder:text-gray-400"
                                placeholder="Search by title or employee…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Status */}
                        <div className="relative">
                            <select
                                className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {Object.entries(STATUS_STYLES).map(([val, { label }]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Icon name="chevron" className="w-3 h-3" />
                            </span>
                        </div>

                        {/* Department */}
                        <div className="relative">
                            <select
                                className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                                value={deptFilter}
                                onChange={e => setDeptFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                                ))}
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Icon name="chevron" className="w-3 h-3" />
                            </span>
                        </div>

                        <span className="ml-auto text-xs text-gray-400">
                            {loading ? "Loading…" : `${reports.length} report${reports.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading…</div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <Icon name="file" className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium">No reports found</p>
                                <p className="text-xs mt-1">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs min-w-[820px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/80">
                                            {["Title", "Employee", "Department", "Submitted", "Status", "Late?", "File", "Actions"].map(h => (
                                                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reports.map(r => {
                                            const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
                                            const dept = r.employee?.department?.name ?? r.dept_name ?? "—";
                                            const fileUrl = r.file_path ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}${r.file_path}` : null;
                                            const hasFile = !!fileUrl;

                                            return (
                                                <tr key={r.report_id} className="hover:bg-gray-50/60 transition-colors">

                                                    {/* Title */}
                                                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate whitespace-nowrap">
                                                        {r.title}
                                                    </td>

                                                    {/* Employee */}
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                        {r.employee?.full_name ?? r.employee_name ?? "—"}
                                                    </td>

                                                    {/* Department */}
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                        {dept}
                                                    </td>

                                                    {/* Submitted */}
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                        {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                                                            {s.label}
                                                        </span>
                                                    </td>

                                                    {/* Late */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {r.is_late
                                                            ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                                                                <Icon name="clock" className="w-3 h-3" /> Late
                                                            </span>
                                                            : <span className="text-gray-300">—</span>
                                                        }
                                                    </td>

                                                    {/* File indicator */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {hasFile
                                                            ? <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                                <Icon name="file" className="w-3 h-3" /> File
                                                            </span>
                                                            : <span className="text-gray-300 text-[10px]">No file</span>
                                                        }
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreview(r)}
                                                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors font-medium"
                                                            >
                                                                <Icon name="eye" className="w-3 h-3" /> Review
                                                            </button>
                                                            {hasFile && (
                                                                <a
                                                                    href={fileUrl}
                                                                    download={r.file_name ?? "report"}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors font-medium"
                                                                >
                                                                    <Icon name="download" className="w-3 h-3" /> Download
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-5">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                ← Prev
                            </button>
                            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* File preview modal */}
            {preview && <FileModal report={preview} onClose={() => setPreview(null)} />}
        </>
    );
}