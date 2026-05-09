"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReportTable from "@/components/dashboard/ReportTable";
import ComplianceBar from "@/components/dashboard/ComplianceBar";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboardStats } from "@/lib/api/admin.api";

// ── Status normalizer for backend snake_case → UI Title Case ──────────────────
const STATUS_LABEL = {
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
        employee: r.employee?.full_name ?? "—",
        department: r.employee?.department?.name ?? r.department?.name ?? "—",
        type: r.schedule?.frequency ? capitalize(r.schedule.frequency) : "—",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
        status: STATUS_LABEL[r.status] ?? "Pending",
    };
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, "-");
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getAdminDashboardStats();
                setDashData(data);
            } catch {
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Build stats array from real data
    const stats = dashData ? [
        {
            label: "Total Reports",
            value: String(dashData.totalReports ?? 0),
            icon: "📋",
            trend: `${dashData.reportsThisMonth ?? 0} this month`,
            trendUp: true,
            color: "indigo",
        },
        {
            label: "Pending Review",
            value: String(dashData.pendingReports ?? 0),
            icon: "⏳",
            trend: `${dashData.overdueReports ?? 0} overdue`,
            trendUp: (dashData.overdueReports ?? 0) === 0,
            color: "amber",
        },
        {
            label: "Approved",
            value: String(dashData.approvedReports ?? 0),
            icon: "✅",
            trend: `${dashData.approvedThisWeek ?? 0} this week`,
            trendUp: true,
            color: "emerald",
        },
        {
            label: "Departments",
            value: String(dashData.totalDepartments ?? 0),
            icon: "🏢",
            trend: "All active",
            trendUp: true,
            color: "sky",
        },
        {
            label: "Employees",
            value: String(dashData.totalEmployees ?? 0),
            icon: "👥",
            trend: `${dashData.newEmployeesThisMonth ?? 0} this month`,
            trendUp: true,
            color: "violet",
        },
        {
            label: "Compliance Rate",
            value: dashData.complianceRate != null ? `${Math.round(dashData.complianceRate)}%` : "—",
            icon: "📊",
            trend: dashData.complianceRateDelta != null
                ? `${dashData.complianceRateDelta > 0 ? "+" : ""}${dashData.complianceRateDelta}% vs last month`
                : "—",
            trendUp: (dashData.complianceRateDelta ?? 0) >= 0,
            color: "rose",
        },
    ] : [];

    // Recent reports from backend
    const recentReports = (dashData?.recentReports ?? []).map(normalizeReport);

    // Department compliance breakdown
    const deptCompliance = (dashData?.departmentBreakdown ?? []).map((d, i) => ({
        name: d.name ?? d.dept_name ?? `Dept ${i + 1}`,
        submitted: d.submittedCount ?? d.submitted ?? 0,
        total: d.totalCount ?? d.total ?? 0,
        color: ["indigo", "violet", "sky", "emerald", "amber", "rose"][i % 6],
    }));

    return (
        <div className="min-h-full bg-[#f8f9fc] text-[#0f1117]">
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 px-6 py-8">

                {/* Page header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-0.5">
                            Hey 👋 {user?.full_name?.split(" ")[0] ?? "Admin"}
                        </p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
                    </div>
                    <Link
                        href="/dashboard/admin/employees/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Employee
                    </Link>
                </div>

                {/* Loading / Error */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={() => window.location.reload()} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="mb-6">
                            <StatsGrid stats={stats} cols={4} />
                        </div>

                        {/* Quick links */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {[
                                { label: "Departments", href: "/dashboard/admin/departments", icon: "🏢" },
                                { label: "Teams", href: "/dashboard/admin/teams", icon: "👥" },
                                { label: "Schedules", href: "/dashboard/admin/schedules", icon: "🗓️" },
                                { label: "All Reports", href: "/dashboard/admin/reports", icon: "📋" },
                            ].map(a => (
                                <Link
                                    key={a.label}
                                    href={a.href}
                                    className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all group hover:border-indigo-200"
                                >
                                    <div className="text-xl">{a.icon}</div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{a.label}</span>
                                    <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>

                        {/* Reports table + Compliance */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {recentReports.length === 0 ? (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
                                        <div className="text-4xl mb-3">📋</div>
                                        <p className="font-medium">No recent reports</p>
                                    </div>
                                ) : (
                                    <ReportTable
                                        reports={recentReports}
                                        showEmployee={true}
                                        onView={(report) => {
                                            // Navigate to report detail or open modal — extend as needed
                                            console.log("View report:", report.id);
                                        }}
                                    />
                                )}
                            </div>
                            <ComplianceBar
                                departments={deptCompliance}
                                title="Dept. Compliance"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}