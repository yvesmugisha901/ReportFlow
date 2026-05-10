"use client";
import { useState, useEffect, useCallback } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReportTable from "@/components/dashboard/ReportTable";
import ScheduleList from "@/components/dashboard/ScheduleList";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ReportForm from "@/components/reports/ReportForm";
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

function normalizeReport(r) {
    return {
        id: r.report_id,
        title: r.title,
        employee: r.employee?.full_name ?? "Me",
        department: r.employee?.department?.name ?? "—",
        type: r.schedule?.title ?? "Report",
        frequency: r.schedule?.frequency ?? "",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : null,
        dueDate: r.schedule?.deadline
            ? new Date(r.schedule.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : null,
        status: STATUS_MAP[r.status] ?? "Pending",
        is_late: r.is_late ?? false,
        schedule_id: r.schedule_id,
        _raw: r,
    };
}

function normalizeSchedule(s) {
    return {
        id: s.schedule_id,
        reportType: s.title ?? `Schedule #${s.schedule_id}`,
        department: s.department?.name ?? "—",
        dueDate: s.deadline,
        frequency: s.frequency,
        submitted: false,
    };
}

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [prefilledSchedule, setPrefill] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [reportsRes, schedulesRes] = await Promise.all([
                api.get("/reports"),
                api.get("/schedules"),
            ]);

            const rawReports = reportsRes.data.reports ?? reportsRes.data ?? [];
            const rawSchedules = schedulesRes.data.schedules ?? schedulesRes.data ?? [];

            const normalized = rawReports.map(normalizeReport);
            setReports(normalized);

            const submittedScheduleIds = new Set(
                normalized
                    .filter(r => r.status !== "Pending")
                    .map(r => r.schedule_id)
                    .filter(Boolean)
            );

            setSchedules(
                rawSchedules
                    .map(s => ({ ...normalizeSchedule(s), submitted: submittedScheduleIds.has(s.schedule_id) }))
                    .filter(s => s.dueDate && new Date(s.dueDate) >= new Date())
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5)
            );
        } catch {
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const counts = {
        total: reports.length,
        approved: reports.filter(r => r.status === "Approved").length,
        pending: reports.filter(r => r.status === "Pending").length,
        changes: reports.filter(r => r.status === "Changes Requested").length,
    };

    const stats = [
        { label: "Total Reports", value: counts.total, icon: "📋", color: "indigo" },
        { label: "Approved", value: counts.approved, icon: "✅", color: "emerald" },
        { label: "Pending", value: counts.pending, icon: "⏳", color: "amber" },
        { label: "Needs Changes", value: counts.changes, icon: "✏️", color: "rose" },
    ];

    const tableReports = reports.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title,
        employee: r.employee,
        department: r.department,
        type: r.type,
        submittedAt: r.submittedAt ?? "—",
        status: r.status,
    }));

    const nextDue = schedules.find(s => !s.submitted);
    const overdueCount = reports.filter(r => r.is_late && r.status !== "approved").length;

    const activities = reports.slice(0, 6).map(r => {
        const typeMap = {
            "Approved": { type: "approved", message: "Your report was approved" },
            "Changes Requested": { type: "changes", message: "Changes requested on" },
            "Pending": { type: "submitted", message: "Pending submission:" },
            "Under Review": { type: "submitted", message: "Under review:" },
            "Rejected": { type: "changes", message: "Report rejected:" },
        };
        const meta = typeMap[r.status] ?? { type: "submitted", message: "Report:" };
        return {
            id: r.id,
            type: meta.type,
            message: meta.message,
            reportTitle: r.title,
            time: r.submittedAt ?? "—",
        };
    });

    // ── Single-step submit: FormData goes straight to POST /reports
    // The controller now sets status='submitted' on create, so no PATCH needed.
    async function handleFormSubmit(formData) {
        await api.post("/reports", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setShowForm(false);
        setPrefill(null);
        load();
    }

    function handleSubmitFromSchedule(schedule) {
        setPrefill({
            reportType: schedule.reportType,
            department: schedule.department,
            frequency: schedule.frequency,
            schedule_id: schedule.id,
        });
        setShowForm(true);
    }

    const firstName = user?.full_name?.split(" ")[0] ?? "there";

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
                        <p className="text-sm text-gray-500 mb-1">Welcome back 👋 {firstName}</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
                    </div>
                    <button
                        onClick={() => { setPrefill(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Submit Report
                    </button>
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

                        {(overdueCount > 0 || nextDue) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <div className="flex-1">
                                    {overdueCount > 0 ? (
                                        <>
                                            <p className="text-sm font-bold text-amber-800">
                                                {overdueCount} overdue report{overdueCount > 1 ? "s" : ""}
                                            </p>
                                            <p className="text-xs text-amber-600">Please submit as soon as possible.</p>
                                        </>
                                    ) : nextDue ? (
                                        <>
                                            <p className="text-sm font-bold text-amber-800">
                                                Upcoming: {nextDue.reportType}
                                            </p>
                                            <p className="text-xs text-amber-600">Due {new Date(nextDue.dueDate).toLocaleDateString()}</p>
                                        </>
                                    ) : null}
                                </div>
                                <button
                                    onClick={() => { setPrefill(null); setShowForm(true); }}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                                >
                                    Submit Now
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {tableReports.length === 0 ? (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
                                        <div className="text-4xl mb-3">📭</div>
                                        <p className="font-medium">No reports yet</p>
                                        <p className="text-sm mt-1">Submit your first report to get started.</p>
                                    </div>
                                ) : (
                                    <ReportTable
                                        reports={tableReports}
                                        showEmployee={false}
                                        onView={(r) => console.log("View", r.id)}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-6">
                                <ScheduleList
                                    schedules={schedules}
                                    onSubmit={handleSubmitFromSchedule}
                                    title="Upcoming Deadlines"
                                />
                                <ActivityFeed
                                    activities={activities}
                                    title="Recent Activity"
                                    maxItems={4}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showForm && (
                <ReportForm
                    prefill={prefilledSchedule}
                    onClose={() => { setShowForm(false); setPrefill(null); }}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
}