"use client";
import { useState, useEffect, useCallback } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import ComplianceBar from "@/components/dashboard/ComplianceBar";
import ReportTable from "@/components/dashboard/ReportTable";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const STATUS_LABEL = {
    pending: "Pending",
    submitted: "Submitted",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
};

const FILE_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function normalizePending(r) {
    const stage1Log = (r.reviewLogs ?? []).find(
        (l) => l.stage === "stage_1" && l.action === "approved"
    );
    return {
        id: r.report_id,
        title: r.title,
        employee: r.employee?.full_name ?? "—",
        department: r.employee?.department?.name ?? "—",
        type: r.schedule?.title ?? r.schedule?.frequency ?? "Report",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
        stage1Reviewer: stage1Log?.reviewer?.full_name ?? null,
        fileUrl: r.file_path ?? null,
    };
}

function normalizeTableReport(r) {
    return {
        id: r.report_id,
        title: r.title,
        employee: r.employee?.full_name ?? "—",
        department: r.employee?.department?.name ?? "—",
        type: r.schedule?.frequency ?? "—",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "—",
        status: STATUS_LABEL[r.status] ?? r.status,
    };
}

// ── Inline ReportModal ────────────────────────────────────────
function ReportModal({ reportId, title, onClose }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/reports/${reportId}`);
                setReport(res.data.report ?? res.data);
            } catch {
                setError("Could not load report content.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-0.5">
                            Report Preview
                        </p>
                        <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading report…</div>
                    ) : error ? (
                        <div className="text-center py-10"><p className="text-red-500 text-sm">{error}</p></div>
                    ) : (
                        <div className="space-y-5">
                            {/* Meta info */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Employee", value: report?.employee?.full_name ?? "—" },
                                    { label: "Department", value: report?.employee?.department?.name ?? "—" },
                                    { label: "Team", value: report?.employee?.team?.name ?? "—" },
                                    { label: "Schedule", value: report?.schedule?.title ?? "—" },
                                    {
                                        label: "Submitted", value: report?.submitted_at
                                            ? new Date(report.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                            : "Not submitted"
                                    },
                                    {
                                        label: "Status", value: report?.status
                                            ? report.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                                            : "—"
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Report content */}
                            {report?.content && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Report Content</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {report.content}
                                    </div>
                                </div>
                            )}

                            {/* Attached file */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Attached File</p>
                                {report?.file_path ? (
                                    <a
                                        href={`${FILE_BASE_URL}${report.file_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={report.file_name ?? true}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {report.file_name ?? "Download file"}
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                                        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span className="text-sm text-gray-400">No file attached — this is a text report.</span>
                                    </div>
                                )}
                            </div>

                            {/* No content or file */}
                            {!report?.content && !report?.file_path && (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="text-sm">No content or file attached to this report.</p>
                                </div>
                            )}

                            {/* Review logs */}
                            {(report?.reviewLogs ?? []).length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Review History</p>
                                    <div className="space-y-2">
                                        {report.reviewLogs.map((log) => (
                                            <div
                                                key={log.log_id}
                                                className={`px-4 py-3 rounded-xl border text-xs ${log.action === "approved"
                                                    ? "bg-emerald-50 border-emerald-200"
                                                    : log.action === "rejected"
                                                        ? "bg-rose-50 border-rose-200"
                                                        : "bg-amber-50 border-amber-200"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-gray-700">
                                                        {log.reviewer?.full_name ?? "Reviewer"} — Stage {log.stage === "stage_1" ? "1" : "2"}
                                                    </span>
                                                    <span className={`font-bold capitalize ${log.action === "approved" ? "text-emerald-600" :
                                                        log.action === "rejected" ? "text-rose-600" : "text-amber-600"
                                                        }`}>
                                                        {log.action.replace("_", " ")}
                                                    </span>
                                                </div>
                                                {log.comment && <p className="text-gray-500 leading-relaxed">{log.comment}</p>}
                                                <p className="text-gray-400 mt-1">
                                                    {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function ApproverDashboard() {
    const { user } = useAuth();

    const [pendingReports, setPending] = useState([]);
    const [allReports, setAll] = useState([]);
    const [dashStats, setDashStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewing, setViewing] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [pendingRes, allRes, statsRes] = await Promise.all([
                api.get("/reviews/pending"),
                api.get("/reports"),
                api.get("/dashboard/approver"),
            ]);

            setPending((pendingRes.data.reports ?? []).map(normalizePending));
            setAll((allRes.data.reports ?? []).map(normalizeTableReport));
            setDashStats(statsRes.data);
        } catch (err) {
            setError("Failed to load approver dashboard.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleAction(id, action, comment) {
        try {
            await api.post(`/reviews/${id}`, { action, comment });
            setPending((prev) => prev.filter((r) => r.id !== id));
            load();
        } catch (err) {
            alert(err?.response?.data?.error ?? "Action failed.");
        }
    }

    const stats = [
        {
            label: "Awaiting Sign-off",
            value: pendingReports.length,
            icon: "hourglass",
            color: "amber",
            trend: "stage 2 queue",
            trendUp: pendingReports.length === 0,
        },
        {
            label: "Approved",
            value: dashStats?.approvedReports ?? 0,
            icon: "approved",
            color: "emerald",
            trend: `${dashStats?.approvedThisWeek ?? 0} this week`,
            trendUp: true,
        },
        {
            label: "Total Reports",
            value: dashStats?.totalReports ?? allReports.length,
            icon: "reports",
            color: "indigo",
            trend: `${dashStats?.reportsThisMonth ?? 0} this month`,
            trendUp: true,
        },
        {
            label: "Compliance Rate",
            value: `${Math.round(dashStats?.complianceRate ?? 0)}%`,
            icon: "compliance",
            color: "violet",
            trend: dashStats?.complianceRateDelta != null
                ? `${dashStats.complianceRateDelta > 0 ? "+" : ""}${dashStats.complianceRateDelta}% vs last month`
                : "org-wide",
            trendUp: (dashStats?.complianceRateDelta ?? 0) >= 0,
        },
    ];

    const deptCompliance = (dashStats?.departmentBreakdown ?? []).map((d, i) => ({
        name: d.name ?? `Dept ${i + 1}`,
        submitted: d.submitted ?? d.submittedCount ?? 0,
        total: d.total ?? d.totalCount ?? 1,
        color: ["indigo", "violet", "sky", "emerald", "amber", "rose"][i % 6],
    }));

    const complianceRate = Math.round(dashStats?.complianceRate ?? 0);
    const firstName = user?.full_name?.split(" ")[0] ?? "Approver";

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full bg-emerald-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Final Stage Approvals ✅</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Hey {firstName} —{" "}
                            {pendingReports.length === 0
                                ? "all reports signed off 🎉"
                                : `${pendingReports.length} awaiting your sign-off`}
                        </h1>
                    </div>
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
                        Compliance:{" "}
                        <span className={complianceRate >= 80 ? "text-emerald-600" : "text-amber-600"}>
                            {complianceRate}%
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <StatsGrid stats={stats} cols={4} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <ReviewQueue
                                    items={pendingReports}
                                    onAction={handleAction}
                                    stage={2}
                                    title="Stage 2 — Final Approval Queue"
                                />

                                {allReports.length > 0 && (
                                    <ReportTable
                                        reports={allReports.slice(0, 10)}
                                        showEmployee={true}
                                        onView={(r) => setViewing({ id: r.id, title: r.title })}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-6">
                                <ComplianceBar
                                    departments={deptCompliance}
                                    title="Dept. Compliance"
                                />

                                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-200">
                                    <p className="text-indigo-200 text-xs font-semibold mb-1">Overall Status</p>
                                    <p className="text-white text-3xl font-extrabold mb-1">{complianceRate}%</p>
                                    <p className="text-indigo-200 text-xs mb-4">Org compliance this period</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Approved", val: dashStats?.approvedReports ?? 0 },
                                            { label: "Pending", val: dashStats?.pendingReports ?? 0 },
                                            { label: "Rejected", val: dashStats?.rejectedReports ?? 0 },
                                            { label: "In Review", val: pendingReports.length },
                                        ].map((item) => (
                                            <div key={item.label} className="bg-white/10 rounded-xl p-2.5 text-center">
                                                <div className="text-white font-extrabold text-sm">{item.val}</div>
                                                <div className="text-indigo-200 text-[9px] font-medium">{item.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {viewing && (
                <ReportModal
                    reportId={viewing.id}
                    title={viewing.title}
                    onClose={() => setViewing(null)}
                />
            )}
        </div>
    );
}