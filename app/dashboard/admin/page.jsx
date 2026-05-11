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
import api from "@/lib/axios";

// ── SVG Icons ─────────────────────────────────────────────────
const Icon = ({ name, className = "w-5 h-5" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        reports: <svg className={className} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
        pending: <svg className={className} {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        approved: <svg className={className} {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
        departments: <svg className={className} {...p}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg>,
        employees: <svg className={className} {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        compliance: <svg className={className} {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
        teams: <svg className={className} {...p}><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3M20 21c0-2.21-1.79-4-4-4M1 21c0-2.761 2.239-5 5-5h6c2.761 0 5 2.239 5 5" /><circle cx="9" cy="7" r="4" /></svg>,
        schedules: <svg className={className} {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
        allreports: <svg className={className} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
        chevron: <svg className={className} {...p}><polyline points="9 18 15 12 9 6" /></svg>,
        close: <svg className={className} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>,
        refresh: <svg className={className} {...p}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
        spinner: <svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
        user: <svg className={className} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        eye: <svg className={className} {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    };
    return icons[name] ?? null;
};

// ── Status normalizer ─────────────────────────────────────────
const STATUS_LABEL = {
    pending: "Pending", submitted: "Pending",
    under_review: "Under Review", changes_requested: "Changes Requested",
    approved: "Approved", rejected: "Rejected",
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

// ── Report Preview Modal ──────────────────────────────────────
const FILE_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function ReportModal({ reportId, title, onClose }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get(`/reports/${reportId}`)
            .then(res => setReport(res.data.report ?? res.data))
            .catch(() => setError("Could not load report."))
            .finally(() => setLoading(false));
    }, [reportId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col">
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-0.5">Report Preview</p>
                        <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Icon name="close" className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading report…</div>
                    ) : error ? (
                        <p className="text-red-500 text-sm text-center py-10">{error}</p>
                    ) : (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Employee", value: report?.employee?.full_name ?? "—" },
                                    { label: "Department", value: report?.employee?.department?.name ?? "—" },
                                    { label: "Schedule", value: report?.schedule?.title ?? "—" },
                                    { label: "Status", value: report?.status?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "—" },
                                    { label: "Submitted", value: report?.submitted_at ? new Date(report.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>
                            {report?.content && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Content</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-700 whitespace-pre-wrap">{report.content}</div>
                                </div>
                            )}
                            {report?.file_path && (
                                <a href={`${FILE_BASE_URL}${report.file_path}`} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors">
                                    Download attached file
                                </a>
                            )}
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
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
                const data = await getTeams(user.dept_id ? { dept_id: user.dept_id } : undefined);
                setTeams(data.teams ?? data.data ?? data ?? []);
            } catch { setTeams([]); }
            finally { setTeamsLoading(false); }
        };
        load();
    }, [user.dept_id]);

    const handleApprove = async () => {
        setLoading(true); setError("");
        try {
            await approveUser(user.user_id, { team_id: teamId || null });
            onApproved(user.user_id);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.error || "Approval failed. Please try again.");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Approve Employee</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <Icon name="close" className="w-4 h-4" />
                    </button>
                </div>
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
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Assign to team <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    {teamsLoading ? (
                        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400">Loading teams…</div>
                    ) : teams.length === 0 ? (
                        <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600">
                            No teams in this department yet — you can assign later.
                        </div>
                    ) : (
                        <select value={teamId} onChange={e => setTeamId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer">
                            <option value="">No team (assign later)</option>
                            {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.name}</option>)}
                        </select>
                    )}
                </div>
                {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">{error}</div>}
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200 transition-all">Cancel</button>
                    <button onClick={handleApprove} disabled={loading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2">
                        {loading ? <><Icon name="spinner" className="w-4 h-4 animate-spin" /> Approving…</> : "✓ Approve & Activate"}
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

    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewingReport, setViewingReport] = useState(null); // FIX: report preview state
    const [toast, setToast] = useState("");

    useEffect(() => {
        getAdminDashboardStats()
            .then(setDashData)
            .catch(() => setError("Failed to load dashboard data."))
            .finally(() => setLoading(false));
    }, []);

    const loadPending = useCallback(async () => {
        setPendingLoading(true);
        try {
            const data = await getPendingUsers();
            setPendingUsers(data.users ?? []);
        } catch { setPendingUsers([]); }
        finally { setPendingLoading(false); }
    }, []);

    useEffect(() => { loadPending(); }, [loadPending]);

    const handleApproved = (userId) => {
        setPendingUsers(prev => prev.filter(u => u.user_id !== userId));
        setToast("Employee approved and activated!");
        setTimeout(() => setToast(""), 4000);
        getAdminDashboardStats().then(setDashData).catch(() => { });
    };

    const stats = dashData ? [
        { label: "Total Reports", value: String(dashData.totalReports ?? 0), icon: "reports", trend: `${dashData.reportsThisMonth ?? 0} this month`, trendUp: true, color: "indigo" },
        { label: "Pending Review", value: String(dashData.pendingReports ?? 0), icon: "pending", trend: `${dashData.overdueReports ?? 0} overdue`, trendUp: (dashData.overdueReports ?? 0) === 0, color: "amber" },
        { label: "Approved", value: String(dashData.approvedReports ?? 0), icon: "approved", trend: `${dashData.approvedThisWeek ?? 0} this week`, trendUp: true, color: "emerald" },
        { label: "Departments", value: String(dashData.totalDepartments ?? 0), icon: "departments", trend: "All active", trendUp: true, color: "sky" },
        { label: "Employees", value: String(dashData.totalEmployees ?? 0), icon: "employees", trend: `${dashData.newEmployeesThisMonth ?? 0} new`, trendUp: true, color: "violet" },
        {
            label: "Compliance Rate",
            value: dashData.complianceRate != null ? `${Math.round(dashData.complianceRate)}%` : "—",
            icon: "compliance",
            trend: dashData.complianceRateDelta != null ? `${dashData.complianceRateDelta > 0 ? "+" : ""}${dashData.complianceRateDelta}% vs last month` : "—",
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

    const quickLinks = [
        { label: "Departments", href: "/dashboard/admin/departments", icon: "departments" },
        { label: "Teams", href: "/dashboard/admin/teams", icon: "teams" },
        { label: "Schedules", href: "/dashboard/admin/schedules", icon: "schedules" },
        { label: "All Reports", href: "/dashboard/admin/reports", icon: "allreports" },
    ];

    return (
        <div className="min-h-full bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-0.5">Hey 👋 {user?.full_name?.split(" ")[0] ?? "Admin"}</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
                    </div>
                    <Link href="/dashboard/admin/employees/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200">
                        <Icon name="user" className="w-4 h-4" />
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
                        <div className="mb-6"><StatsGrid stats={stats} cols={4} /></div>

                        {/* Quick links — SVG icons replacing emojis */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {quickLinks.map(a => (
                                <Link key={a.label} href={a.href}
                                    className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all group hover:border-indigo-200">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                                        <Icon name={a.icon} className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{a.label}</span>
                                    <Icon name="chevron" className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                </Link>
                            ))}
                        </div>

                        {/* Pending Approvals */}
                        <div className="mb-6">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                            <Icon name="pending" className="w-4 h-4" />
                                        </div>
                                        <h2 className="text-sm font-bold text-gray-900">Pending Approvals</h2>
                                        {pendingUsers.length > 0 && (
                                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                                                {pendingUsers.length}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={loadPending}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                                        <Icon name="refresh" className="w-3.5 h-3.5" />
                                        Refresh
                                    </button>
                                </div>

                                {pendingLoading ? (
                                    <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
                                ) : pendingUsers.length === 0 ? (
                                    <div className="px-5 py-10 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                                            <Icon name="approved" className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <p className="text-sm text-gray-400">No pending approvals — all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {pendingUsers.map((u) => (
                                            <div key={u.user_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                                                    {(u.full_name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                </div>
                                                {u.department ? (
                                                    <span className="hidden sm:inline-flex text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                                                        {u.department.name}
                                                    </span>
                                                ) : (
                                                    <span className="hidden sm:inline-flex text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                                                        No dept.
                                                    </span>
                                                )}
                                                <span className="hidden md:block text-[11px] text-gray-400 flex-shrink-0">
                                                    {u.created_at ? timeAgo(u.created_at) : "—"}
                                                </span>
                                                <button onClick={() => setSelectedUser(u)}
                                                    className="flex-shrink-0 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-indigo-200">
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
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                            <Icon name="reports" className="w-7 h-7 text-gray-300" />
                                        </div>
                                        <p className="font-medium">No recent reports</p>
                                    </div>
                                ) : (
                                    // FIX: onView now opens the ReportModal instead of console.log
                                    <ReportTable
                                        reports={recentReports}
                                        showEmployee={true}
                                        onView={(report) => setViewingReport({ id: report.id, title: report.title })}
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
                <ApproveModal user={selectedUser} onClose={() => setSelectedUser(null)} onApproved={handleApproved} />
            )}

            {/* FIX: Report preview modal */}
            {viewingReport && (
                <ReportModal reportId={viewingReport.id} title={viewingReport.title} onClose={() => setViewingReport(null)} />
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-xl">
                    <Icon name="approved" className="w-4 h-4 text-emerald-400" />
                    {toast}
                </div>
            )}
        </div>
    );
}