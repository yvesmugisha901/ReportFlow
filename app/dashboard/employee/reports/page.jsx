"use client";
import { useState } from "react";
import ReportCard from "@/components/reports/ReportCard";
import ReportForm from "@/components/reports/ReportForm";
import ReportStatusHistory from "@/components/reports/ReportStatusHistory";
import ReportTable from "@/components/dashboard/ReportTable";

// ─── Sample data (replace with API fetch) ──────────────────────────────────────

const myReports = [
    {
        id: 1,
        title: "Monthly Operations Report",
        type: "Operations",
        department: "Operations",
        frequency: "Monthly",
        dueDate: "May 10, 2026",
        submittedAt: null,
        status: "Pending",
        reviewerComment: null,
        history: [],
    },
    {
        id: 2,
        title: "Q1 Team Performance",
        type: "Performance",
        department: "Operations",
        frequency: "Quarterly",
        dueDate: "May 5, 2026",
        submittedAt: "Apr 30, 2026",
        status: "Approved",
        reviewerComment: null,
        history: [
            { status: "Submitted", actor: "You", role: "Employee", date: "Apr 30, 2026", comment: null },
            { status: "Under Review", actor: "Eric Nshimiyimana", role: "Reviewer", date: "May 1, 2026", comment: null },
            { status: "Stage 1 Approved", actor: "Eric Nshimiyimana", role: "Reviewer", date: "May 2, 2026", comment: "Well documented, approved for final review." },
            { status: "Approved", actor: "COO", role: "Approver", date: "May 3, 2026", comment: "Good work this quarter." },
        ],
    },
    {
        id: 3,
        title: "Weekly Progress Update",
        type: "Progress",
        department: "Operations",
        frequency: "Weekly",
        dueDate: "May 3, 2026",
        submittedAt: "May 3, 2026",
        status: "Under Review",
        reviewerComment: null,
        history: [
            { status: "Submitted", actor: "You", role: "Employee", date: "May 3, 2026", comment: null },
            { status: "Under Review", actor: "Eric Nshimiyimana", role: "Reviewer", date: "May 4, 2026", comment: null },
        ],
    },
    {
        id: 4,
        title: "March Summary Report",
        type: "Summary",
        department: "Operations",
        frequency: "Monthly",
        dueDate: "Apr 5, 2026",
        submittedAt: "Apr 4, 2026",
        status: "Changes Requested",
        reviewerComment: "Please add the budget breakdown for section 3 and resubmit.",
        history: [
            { status: "Submitted", actor: "You", role: "Employee", date: "Apr 4, 2026", comment: null },
            { status: "Under Review", actor: "Eric Nshimiyimana", role: "Reviewer", date: "Apr 5, 2026", comment: null },
            { status: "Changes Requested", actor: "Eric Nshimiyimana", role: "Reviewer", date: "Apr 6, 2026", comment: "Please add the budget breakdown for section 3 and resubmit." },
        ],
    },
    {
        id: 5,
        title: "Safety Compliance Report",
        type: "Compliance",
        department: "Operations",
        frequency: "Bi-Weekly",
        dueDate: "Apr 20, 2026",
        submittedAt: "Apr 19, 2026",
        status: "Approved",
        reviewerComment: null,
        history: [
            { status: "Submitted", actor: "You", role: "Employee", date: "Apr 19, 2026", comment: null },
            { status: "Under Review", actor: "Eric Nshimiyimana", role: "Reviewer", date: "Apr 20, 2026", comment: null },
            { status: "Stage 1 Approved", actor: "Eric Nshimiyimana", role: "Reviewer", date: "Apr 21, 2026", comment: "All good." },
            { status: "Approved", actor: "COO", role: "Approver", date: "Apr 22, 2026", comment: null },
        ],
    },
];

// ─── For ReportTable (needs flat shape) ───────────────────────────────────────
const tableReports = myReports.map((r) => ({
    id: r.id,
    title: r.title,
    employee: "Me",
    department: r.department,
    type: r.type,
    submittedAt: r.submittedAt ?? "—",
    status: r.status,
}));

const ALL_STATUSES = ["All", "Pending", "Under Review", "Approved", "Changes Requested", "Rejected"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployeeReportsPage() {
    const [view, setView] = useState("grid");   // "grid" | "table"
    const [statusFilter, setStatus] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [selectedReport, setSelected] = useState(null);     // for status history modal
    const [resubmitReport, setResubmit] = useState(null);     // for resubmit → opens form

    const filtered = myReports.filter(
        (r) => statusFilter === "All" || r.status === statusFilter
    );

    const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
        acc[s] = myReports.filter((r) => r.status === s).length;
        return acc;
    }, {});

    function handleResubmit(report) {
        setSelected(null);
        setResubmit(report);
        setShowForm(true);
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Operations Department</p>
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

                {/* ── Status Summary Pills ── */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setStatus("All")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === "All"
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                            }`}
                    >
                        All ({myReports.length})
                    </button>
                    {Object.entries(counts).map(([status, count]) => (
                        <button
                            key={status}
                            onClick={() => setStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${statusFilter === status
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                                }`}
                        >
                            {status} ({count})
                        </button>
                    ))}
                </div>

                {/* ── Toolbar: view toggle ── */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-gray-400">{filtered.length} report{filtered.length !== 1 ? "s" : ""}</p>
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setView("grid")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            ⊞ Grid
                        </button>
                        <button
                            onClick={() => setView("table")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "table" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            ☰ Table
                        </button>
                    </div>
                </div>

                {/* ── Grid View ── */}
                {view === "grid" && (
                    <>
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <div className="text-4xl mb-3">📭</div>
                                <p className="font-medium">No reports with this status</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        onClick={setSelected}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Table View — uses shared ReportTable component ── */}
                {view === "table" && (
                    <ReportTable
                        reports={tableReports.filter((r) => statusFilter === "All" || r.status === statusFilter)}
                        showEmployee={false}
                        onView={(r) => setSelected(myReports.find((m) => m.id === r.id))}
                    />
                )}
            </div>

            {/* ── ReportForm Modal (new submission or resubmit) ── */}
            {showForm && (
                <ReportForm
                    prefill={resubmitReport ? { reportType: resubmitReport.title, department: resubmitReport.department, frequency: resubmitReport.frequency } : null}
                    onClose={() => { setShowForm(false); setResubmit(null); }}
                    onSubmit={(data) => {
                        console.log("Submitted:", data);
                        // TODO: POST /api/reports  or PATCH /api/reports/:id/resubmit
                        setShowForm(false);
                        setResubmit(null);
                    }}
                />
            )}

            {/* ── ReportStatusHistory Modal ── */}
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