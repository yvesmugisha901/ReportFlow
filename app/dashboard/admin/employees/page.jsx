"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getUsers, deactivateUser, activateUser, getDepartments } from "@/lib/api/admin.api";

const ROLE_STYLES = {
    admin: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Admin" },
    employee: { bg: "bg-sky-50", text: "text-sky-700", label: "Employee" },
    reviewer: { bg: "bg-violet-50", text: "text-violet-700", label: "Reviewer" },
    approver: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approver" },
};

const AVATAR_COLORS = [
    "bg-indigo-500", "bg-violet-500", "bg-sky-500",
    "bg-emerald-500", "bg-amber-500", "bg-rose-500",
];

function getInitials(name) {
    return name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "??";
}

// ── Minimal icon set ────────────────────────────────────────────
const Icon = ({ name, className = "w-3.5 h-3.5" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        search: <svg className={className} {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
        users: <svg className={className} {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        edit: <svg className={className} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        slash: <svg className={className} {...p}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
        check: <svg className={className} {...p}><polyline points="20 6 9 17 4 12" /></svg>,
        plus: <svg className={className} {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
        chevron: <svg className={className} {...p}><polyline points="6 9 12 15 18 9" /></svg>,
    };
    return icons[name] ?? null;
};

export default function EmployeesPage() {
    const [users, setUsers] = useState([]);
    const [departments, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [togglingId, setTogglingId] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [userData, deptData] = await Promise.all([
                getUsers({
                    search: search || undefined,
                    role: roleFilter || undefined,
                    dept_id: deptFilter || undefined,
                }),
                getDepartments(),
            ]);
            setUsers(userData.users ?? []);
            setDepts(deptData.departments ?? deptData ?? []);
        } catch (err) {
            console.error("Failed to load employees:", err);
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, deptFilter]);

    useEffect(() => { load(); }, [load]);

    const handleToggleStatus = async (user) => {
        const action = user.is_active ? "Deactivate" : "Activate";
        if (!confirm(`${action} ${user.full_name}?`)) return;
        setTogglingId(user.user_id);
        try {
            if (user.is_active) await deactivateUser(user.user_id);
            else await activateUser(user.user_id);
            await load();
        } catch {
            alert(`Failed to ${action.toLowerCase()} user.`);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f6fa] text-[#0f1117]">
            {/* Subtle background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-violet-100/60 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-100/50 blur-[90px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-5 py-6">

                {/* ── Header ─────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Admin / Employees</p>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Employees</h1>
                    </div>
                    <Link
                        href="/dashboard/admin/employees/new"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-200"
                    >
                        <Icon name="plus" />
                        Add Employee
                    </Link>
                </div>

                {/* ── Filters ────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Icon name="search" className="w-3.5 h-3.5" />
                        </span>
                        <input
                            className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm w-52 placeholder:text-gray-400"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Role */}
                    <div className="relative">
                        <select
                            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            {Object.entries(ROLE_STYLES).map(([val, { label }]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Icon name="chevron" className="w-3 h-3" />
                        </span>
                    </div>

                    {/* Department */}
                    <div className="relative">
                        <select
                            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                            value={deptFilter}
                            onChange={e => setDeptFilter(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                            ))}
                        </select>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Icon name="chevron" className="w-3 h-3" />
                        </span>
                    </div>

                    <span className="ml-auto text-xs text-gray-400">
                        {loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""}`}
                    </span>
                </div>

                {/* ── Table ──────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-56 text-sm text-gray-400">Loading…</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                <Icon name="users" className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium">No users found</p>
                            <p className="text-xs mt-1 text-gray-400">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs min-w-[720px]">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/80">
                                        {["Name", "Email", "Role", "Department", "Team", "Status", "Actions"].map(h => (
                                            <th
                                                key={h}
                                                className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((u) => {
                                        const role = ROLE_STYLES[u.role] ?? { bg: "bg-gray-100", text: "text-gray-600", label: u.role };
                                        const avatarColor = AVATAR_COLORS[u.user_id % AVATAR_COLORS.length];
                                        const toggling = togglingId === u.user_id;

                                        return (
                                            <tr key={u.user_id} className="hover:bg-gray-50/60 transition-colors">

                                                {/* Name */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                                            {getInitials(u.full_name)}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{u.full_name}</span>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{u.email}</td>

                                                {/* Role */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.bg} ${role.text}`}>
                                                        {role.label}
                                                    </span>
                                                </td>

                                                {/* Department */}
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.department?.name ?? "—"}</td>

                                                {/* Team */}
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.team?.name ?? "—"}</td>

                                                {/* Status */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {u.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* Edit */}
                                                        <Link
                                                            href={`/dashboard/admin/employees/${u.user_id}/edit`}
                                                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors font-medium"
                                                        >
                                                            <Icon name="edit" className="w-3 h-3" />
                                                            Edit
                                                        </Link>

                                                        {/* Activate / Deactivate */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(u)}
                                                            disabled={toggling}
                                                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors disabled:opacity-40 ${u.is_active
                                                                ? "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50/50"
                                                                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50"
                                                                }`}
                                                        >
                                                            {toggling ? (
                                                                "…"
                                                            ) : u.is_active ? (
                                                                <><Icon name="slash" className="w-3 h-3" /> Deactivate</>
                                                            ) : (
                                                                <><Icon name="check" className="w-3 h-3" /> Activate</>
                                                            )}
                                                        </button>
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
            </div>
        </div>
    );
}