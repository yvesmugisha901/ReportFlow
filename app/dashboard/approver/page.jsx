"use client";
import { useState, useEffect, useCallback } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import ComplianceBar from "@/components/dashboard/ComplianceBar";
import ReportTable from "@/components/dashboard/ReportTable";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboardStats } from "@/lib/api/admin.api";
import api from "@/lib/axios";

const STATUS_LABEL = {
    pending: "Pending",
    submitted: "Pending",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
};

function normalizePending(r) {
    // Find who did stage 1 review
    const stage1Log = (r.reviewLogs ?? []).find(l => l.stage === 'stage_1' && l.action === 'approved');
    return {
        id: r.report_id,
        title: r.title,
        employee: r.employee?.full_name ?? "—",
        department: r.employee?.department?.name ?? "—",
        type: r.schedule?.title ?? r.schedule?.frequency ?? "Report",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
        stage1Reviewer: stage1Log?.reviewer?.full_name ?? "Reviewer",
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
        status: STATUS_LABEL[r.status] ?? "Pending",
    };
}

export default function ApproverDashboard() {
    const { user } = useAuth();
    const [pendingReports, setPending] = useState([]);
    const [allReports, setAllReports] = useState([]);
    const [dashStats, setDashStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [pendingRes, allRes, statsRes] = await Promise.all([
                api.get("/reviews/pending"),
                api.get("/reports"),
                getAdminDashboardStats().catch(() => null), // non-fatal
            ]);

            setPending((pendingRes.data.reports ?? []).map(normalizePending));
            setAllReports((allRes.data.reports ?? []).map(normalizeTableReport));
            setDashStats(statsRes);
        } catch {
            setError("Failed to load approver dashboard.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleAction(id, action, comment) {
        try {
            await api.post(`/reviews/${id}`, { action, comment });
            setPending(prev => prev.filter(r => r.id !== id));
            load();
        } catch (err) {
            const msg = err?.response?.data?.error ?? "Action failed.";
            alert(msg);
        }
    }

    const complianceRate = dashStats?.complianceRate ?? 0;
    const deptCompliance = (dashStats?.departmentBreakdown ?? []).map((d, i) => ({
        name: d.name,
        submitted: d.submitted,
        total: d.total || 1,
        color: ["indigo", "violet", "sky", "emerald", "amber", "rose"][i % 6],
    }));

    const stats = [
        { label: "Awaiting Sign-off", value: pendingReports.length, icon: "⏳", color: "amber" },
        { label: "Approved Today", value: dashStats?.approvedReports ?? 0, icon: "✅", color: "emerald" },
        { label: "Total Reports", value: dashStats?.totalReports ?? allReports.length, icon: "📋", color: "indigo" },
        { label: "Compliance Rate", value: `${complianceRate}%`, icon: "📊", color: "violet" },
    ];

    const overallCompliance = complianceRate;
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
                            Hey {firstName} — {pendingReports.length} awaiting your sign-off
                        </h1>
                    </div>
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
                        Compliance: <span className="text-emerald-600">{overallCompliance}%</span>
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
                                {/* Stage 2 review queue */}
                                <ReviewQueue
                                    items={pendingReports}
                                    onAction={handleAction}
                                    stage={2}
                                    title="Stage 2 — Final Approval Queue"
                                />

                                {/* All reports table */}
                                <ReportTable
                                    reports={allReports.slice(0, 10)}
                                    showEmployee={true}
                                    onView={(r) => console.log("View report:", r.id)}
                                />
                            </div>

                            {/* Right column */}
                            <div className="flex flex-col gap-6">
                                <ComplianceBar departments={deptCompliance} title="Dept. Compliance" />

                                {/* Summary card */}
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-200">
                                    <p className="text-indigo-200 text-xs font-semibold mb-1">Overall Status</p>
                                    <p className="text-white text-3xl font-extrabold mb-1">{overallCompliance}%</p>
                                    <p className="text-indigo-200 text-xs mb-4">Org compliance this period</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Approved", val: dashStats?.approvedReports ?? 0 },
                                            { label: "Pending", val: dashStats?.pendingReports ?? 0 },
                                            { label: "Rejected", val: dashStats?.rejectedReports ?? 0 },
                                            { label: "In Review", val: pendingReports.length },
                                        ].map(item => (
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
        </div>
    );
}