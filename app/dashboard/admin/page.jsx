"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReportTable from "@/components/dashboard/ReportTable";
import ComplianceBar from "@/components/dashboard/ComplianceBar";
import { useAuth } from "@/context/AuthContext";
import {
    getAdminDashboardStats,
    getPendingUsers,
    approveUser,
    getTeams,
} from "@/lib/api/admin.api";

// ── Status normalizer ─────────────────────────────────────────
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

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Approve Modal ─────────────────────────────────────────────
function ApproveModal({ user, onClose, onApproved }) {
    const [teams, setTeams] = useState([]);
    const [teamId, setTeamId] = useState("");
    const [loading, setLoading] = useState(false);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setTeamsLoading(true);
            try {
                const data = await getTeams(user.dept_id);
                setTeams(data.teams ?? data.data ?? data ?? []);
            } catch {
                setTeams([]);
            } finally {
                setTeamsLoading(false);
            }
        };
        if (user.dept_id) load();
        else setTeamsLoading(false);
    }, [user.dept_id]);

    const handleApprove = async () => {
        setLoading(true);
        setError("");
        try {
            await approveUser(user.user_id, { team_id: teamId || null });
            onApproved(user.user_id);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.error || "Approval failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Approve Employee</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Employee info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
                        {(user.full_name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {user.department && (
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg flex-shrink-0">
                            {user.department.name}
                        </span>
                    )}
                </div>

                {/* Team picker */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Assign to team <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    {teamsLoading ? (
                        <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400">
                            Loading teams…
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600">
                            {user.dept_id
                                ? "No teams in this department yet — you can assign later."
                                : "No department selected — you can assign a team later."}
                        </div>
                    ) : (
                        <select
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">No team (assign later)</option>
                            {teams.map((t) => (
                                <option key={t.team_id} value={t.team_id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Approving…
                            </>
                        ) : (
                            <>✓ Approve & Activate</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
    const { user } = useAuth();
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pending users state
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [toast, setToast] = useState("");

    // Load dashboard stats
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

    // Load pending users
    const loadPending = useCallback(async () => {
        setPendingLoading(true);
        try {
            const data = await getPendingUsers();
            setPendingUsers(data.users ?? []);
        } catch {
            setPendingUsers([]);
        } finally {
            setPendingLoading(false);
        }
    }, []);

    useEffect(() => { loadPending(); }, [loadPending]);

    const handleApproved = (userId) => {
        setPendingUsers(prev => prev.filter(u => u.user_id !== userId));
        setToast("Employee approved and activated!");
        setTimeout(() => setToast(""), 4000);
        // Refresh dashboard stats to update employee count
        getAdminDashboardStats().then(setDashData).catch(() => { });
    };

    // Build stats
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

    const recentReports = (dashData?.recentReports ?? []).map(normalizeReport);
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

                        {/* ── Pending Approvals ───────────────────────────────── */}
                        <div className="mb-6">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-base">⏳</span>
                                        <h2 className="text-sm font-bold text-gray-900">Pending Approvals</h2>
                                        {pendingUsers.length > 0 && (
                                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                                                {pendingUsers.length}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={loadPending}
                                        className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {/* Body */}
                                {pendingLoading ? (
                                    <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
                                ) : pendingUsers.length === 0 ? (
                                    <div className="px-5 py-8 text-center">
                                        <div className="text-2xl mb-2">✅</div>
                                        <p className="text-sm text-gray-400">No pending approvals — all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {pendingUsers.map((u) => (
                                            <div key={u.user_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                                                    {(u.full_name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                </div>

                                                {/* Department badge */}
                                                {u.department ? (
                                                    <span className="hidden sm:inline-flex text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                                                        {u.department.name}
                                                    </span>
                                                ) : (
                                                    <span className="hidden sm:inline-flex text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                                                        No dept.
                                                    </span>
                                                )}

                                                {/* Time */}
                                                <span className="hidden md:block text-[11px] text-gray-400 flex-shrink-0">
                                                    {u.created_at ? timeAgo(u.created_at) : "—"}
                                                </span>

                                                {/* Review button */}
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="flex-shrink-0 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-indigo-200"
                                                >
                                                    Review →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                        onView={(report) => console.log("View report:", report.id)}
                                    />
                                )}
                            </div>
                            <ComplianceBar departments={deptCompliance} title="Dept. Compliance" />
                        </div>
                    </>
                )}
            </div>

            {/* Approve Modal */}
            {selectedUser && (
                <ApproveModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onApproved={handleApproved}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-xl">
                    <span className="text-emerald-400">✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
}