"use client";
import { useState, useEffect, useCallback } from "react";
import ScheduleList from "@/components/dashboard/ScheduleList";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ReportForm from "@/components/reports/ReportForm";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const STATUS_MAP = {
    pending: "Pending",
    submitted: "Submitted",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
};

const Icon = ({ name, className = "w-5 h-5" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        warning: <svg className={className} {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
        wave: <svg className={className} {...p}><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>,
        plus: <svg className={className} {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
        reports: <svg className={className} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
        check: <svg className={className} {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
        clock: <svg className={className} {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        edit: <svg className={className} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        x: <svg className={className} {...p}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
        send: <svg className={className} {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
        eye: <svg className={className} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    };
    return icons[name] ?? null;
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

// Stat card config
const STAT_CARDS = [
    {
        key: "total",
        label: "Total Reports",
        icon: "reports",
        bg: "bg-indigo-50",
        iconColor: "text-indigo-500",
        iconBg: "bg-indigo-100",
        valueColor: "text-indigo-700",
        border: "border-indigo-100",
    },
    {
        key: "approved",
        label: "Approved",
        icon: "check",
        bg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-100",
        valueColor: "text-emerald-700",
        border: "border-emerald-100",
    },
    {
        key: "submitted",
        label: "Submitted",
        icon: "send",
        bg: "bg-sky-50",
        iconColor: "text-sky-500",
        iconBg: "bg-sky-100",
        valueColor: "text-sky-700",
        border: "border-sky-100",
    },
    {
        key: "under_review",
        label: "Under Review",
        icon: "eye",
        bg: "bg-violet-50",
        iconColor: "text-violet-500",
        iconBg: "bg-violet-100",
        valueColor: "text-violet-700",
        border: "border-violet-100",
    },
    {
        key: "pending",
        label: "Pending",
        icon: "clock",
        bg: "bg-amber-50",
        iconColor: "text-amber-500",
        iconBg: "bg-amber-100",
        valueColor: "text-amber-700",
        border: "border-amber-100",
    },
    {
        key: "changes",
        label: "Changes Requested",
        icon: "edit",
        bg: "bg-orange-50",
        iconColor: "text-orange-500",
        iconBg: "bg-orange-100",
        valueColor: "text-orange-700",
        border: "border-orange-100",
    },
    {
        key: "rejected",
        label: "Rejected",
        icon: "x",
        bg: "bg-rose-50",
        iconColor: "text-rose-500",
        iconBg: "bg-rose-100",
        valueColor: "text-rose-700",
        border: "border-rose-100",
    },
];

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
        submitted: reports.filter(r => r.status === "Submitted").length,
        under_review: reports.filter(r => r.status === "Under Review").length,
        pending: reports.filter(r => r.status === "Pending").length,
        changes: reports.filter(r => r.status === "Changes Requested").length,
        rejected: reports.filter(r => r.status === "Rejected").length,
    };

    const nextDue = schedules.find(s => !s.submitted);
    const overdueCount = reports.filter(r => r.is_late && r.status !== "Approved").length;

    const activities = reports.slice(0, 8).map(r => {
        const typeMap = {
            "Approved": { type: "approved", message: "Your report was approved" },
            "Changes Requested": { type: "changes", message: "Changes requested on" },
            "Pending": { type: "submitted", message: "Pending submission:" },
            "Submitted": { type: "submitted", message: "Submitted for review:" },
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
            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
                            <Icon name="wave" className="w-4 h-4 text-amber-400" />
                            Welcome back, {firstName}
                        </p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
                    </div>
                    <button
                        onClick={() => { setPrefill(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <Icon name="plus" className="w-4 h-4" />
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
                        {/* Overdue / Upcoming Banner */}
                        {(overdueCount > 0 || nextDue) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Icon name="warning" className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {overdueCount > 0 ? (
                                        <>
                                            <p className="text-sm font-bold text-amber-800">
                                                {overdueCount} overdue report{overdueCount > 1 ? "s" : ""}
                                            </p>
                                            <p className="text-xs text-amber-600">Please submit as soon as possible.</p>
                                        </>
                                    ) : nextDue ? (
                                        <>
                                            <p className="text-sm font-bold text-amber-800">Upcoming: {nextDue.reportType}</p>
                                            <p className="text-xs text-amber-600">Due {new Date(nextDue.dueDate).toLocaleDateString()}</p>
                                        </>
                                    ) : null}
                                </div>
                                <button
                                    onClick={() => { setPrefill(null); setShowForm(true); }}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
                                >
                                    Submit Now
                                </button>
                            </div>
                        )}

                        {/* Stats — 4 cols on lg, 2 on sm, all 7 cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
                            {STAT_CARDS.map((card) => (
                                <div
                                    key={card.key}
                                    className={`${card.bg} border ${card.border} rounded-2xl p-4 flex flex-col gap-3`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">
                                            {card.label}
                                        </span>
                                        <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon name={card.icon} className={`w-4 h-4 ${card.iconColor}`} />
                                        </div>
                                    </div>
                                    <p className={`text-3xl font-extrabold ${card.valueColor} leading-none`}>
                                        {counts[card.key]}
                                    </p>
                                </div>
                            ))}

                            {/* 8th cell: quick submit CTA — fills the row nicely */}
                            <div className="bg-indigo-600 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:bg-indigo-700 transition-colors"
                                onClick={() => { setPrefill(null); setShowForm(true); }}>
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Icon name="plus" className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-tight">New Report</p>
                                    <p className="text-indigo-200 text-xs mt-0.5">Submit now</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Grid: Activity + Schedules */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Activity — takes 2 cols */}
                            <div className="lg:col-span-2">
                                <ActivityFeed
                                    activities={activities}
                                    title="Recent Activity"
                                    maxItems={8}
                                />
                            </div>

                            {/* Upcoming Deadlines */}
                            <div>
                                <ScheduleList
                                    schedules={schedules}
                                    onSubmit={handleSubmitFromSchedule}
                                    title="Upcoming Deadlines"
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