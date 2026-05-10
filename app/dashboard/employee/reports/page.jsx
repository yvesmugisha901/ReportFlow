"use client";
import { useState, useEffect, useCallback } from "react";
import ReportCard from "@/components/reports/ReportCard";
import ReportForm from "@/components/reports/ReportForm";
import ReportStatusHistory from "@/components/reports/ReportStatusHistory";
import ReportTable from "@/components/dashboard/ReportTable";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const STATUS_MAP = {
    pending: "Pending",
    submitted: "Pending",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
};

const REVIEW_LOG_STATUS_MAP = {
    submitted: "Submitted",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Stage 1 Approved",
    rejected: "Rejected",
    resubmitted: "Resubmitted",
    final_approved: "Approved",
};

function normalizeReport(r) {
    const uiStatus = STATUS_MAP[r.status] ?? "Pending";

    const history = (r.reviewLogs ?? []).map((log) => ({
        status: REVIEW_LOG_STATUS_MAP[log.action] ?? log.action,
        actor: log.reviewer?.full_name ?? "System",
        role: log.reviewer?.role ?? "",
        date: log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
        comment: log.comment ?? null,
    }));

    if (r.submitted_at && history.length > 0 && history[0].status !== "Submitted") {
        history.unshift({
            status: "Submitted",
            actor: "You",
            role: "Employee",
            date: new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            comment: null,
        });
    }

    const lastLog = r.reviewLogs?.slice(-1)[0];
    const reviewerComment = lastLog?.comment ?? null;

    return {
        id: r.report_id,
        title: r.title,
        type: r.schedule?.title ?? r.report_type ?? "Report",
        department: r.employee?.department?.name ?? r.department?.name ?? "—",
        frequency: capitalize(r.schedule?.frequency ?? r.frequency ?? ""),
        dueDate: r.schedule?.deadline
            ? new Date(r.schedule.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : null,
        status: uiStatus,
        reviewerComment,
        history,
        _raw: r,
    };
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, "-");
}

const ALL_STATUSES = ["All", "Pending", "Under Review", "Approved", "Changes Requested", "Rejected"];

export default function EmployeeReportsPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [view, setView] = useState("grid");
    const [statusFilter, setStatus] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [selectedReport, setSelected] = useState(null);
    const [resubmitReport, setResubmit] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/reports");
            const raw = res.data.reports ?? res.data ?? [];
            setReports(raw.map(normalizeReport));
        } catch {
            setError("Failed to load your reports.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = reports.filter(
        (r) => statusFilter === "All" || r.status === statusFilter
    );

    const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
        acc[s] = reports.filter((r) => r.status === s).length;
        return acc;
    }, {});

    const tableReports = filtered.map((r) => ({
        id: r.id,
        title: r.title,
        employee: user?.full_name ?? "Me",
        department: r.department,
        type: r.type,
        submittedAt: r.submittedAt ?? "—",
        status: r.status,
    }));

    function handleResubmit(report) {
        setSelected(null);
        setResubmit(report);
        setShowForm(true);
    }

    // ── UPDATED: formData is now a FormData object from ReportForm ────────────
    async function handleFormSubmit(formData) {
        try {
            if (resubmitReport) {
                // Resubmit existing report with file support
                await api.patch(`/reports/${resubmitReport.id}/submit`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                // Create new report with file support, then submit it
                const createRes = await api.post("/reports", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                const newId = createRes.data.report?.report_id;
                if (newId) {
                    await api.patch(`/reports/${newId}/submit`);
                }
            }
            setShowForm(false);
            setResubmit(null);
            load();
        } catch (err) {
            console.error("Submit failed:", err);
            throw err; // re-throw so ReportForm shows the error
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const deptName = user?.department?.name ?? user?.dept_name ?? "Your Department";

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">{deptName}</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Reports</h1>
                    </div>
                    <button
                        onClick={() => { setResubmit(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Submit Report
                    </button>
                </div>

                {/* Loading / Error */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : (
                    <>
                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => setStatus("All")}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === "All"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}
                            >
                                All ({reports.length})
                            </button>
                            {Object.entries(counts).map(([status, count]) => (
                                <button
                                    key={status}
                                    onClick={() => setStatus(status)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === status
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}
                                >
                                    {status} ({count})
                                </button>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-gray-400">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</p>
                            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                <button
                                    onClick={() => setView("grid")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
                                >
                                    ⊞ Grid
                                </button>
                                <button
                                    onClick={() => setView("table")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "table" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
                                >
                                    ☰ Table
                                </button>
                            </div>
                        </div>

                        {/* Grid View */}
                        {view === "grid" && (
                            filtered.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="font-medium">No reports with this status</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filtered.map((report) => (
                                        <ReportCard key={report.id} report={report} onClick={setSelected} />
                                    ))}
                                </div>
                            )
                        )}

                        {/* Table View */}
                        {view === "table" && (
                            <ReportTable
                                reports={tableReports}
                                showEmployee={false}
                                onView={(r) => setSelected(reports.find((m) => m.id === r.id))}
                            />
                        )}
                    </>
                )}
            </div>

            {/* ReportForm Modal */}
            {showForm && (
                <ReportForm
                    prefill={resubmitReport
                        ? { reportType: resubmitReport.type, department: resubmitReport.department, frequency: resubmitReport.frequency }
                        : null}
                    onClose={() => { setShowForm(false); setResubmit(null); }}
                    onSubmit={handleFormSubmit}
                />
            )}

            {/* ReportStatusHistory Modal */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
                >
                    <ReportStatusHistory
                        report={selectedReport}
                        onClose={() => setSelected(null)}
                        onResubmit={() => handleResubmit(selectedReport)}
                    />
                </div>
            )}
        </div>
    );
}