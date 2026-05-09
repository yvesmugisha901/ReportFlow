"use client";
import { useState, useEffect } from "react";
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

export default function EmployeesPage() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [togglingId, setTogglingId] = useState(null); // tracks which user is being toggled

    const load = async () => {
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
            // Backend returns { success, count, users }
            setUsers(userData.users ?? []);
            // Backend returns { success, departments } or array
            setDepartments(deptData.departments ?? deptData ?? []);
        } catch (err) {
            console.error("Failed to load employees:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [search, roleFilter, deptFilter]);

    const handleToggleStatus = async (user) => {
        const action = user.is_active ? "Deactivate" : "Activate";
        if (!confirm(`${action} ${user.full_name}?`)) return;

        setTogglingId(user.user_id);
        try {
            if (user.is_active) {
                await deactivateUser(user.user_id);
            } else {
                await activateUser(user.user_id);
            }
            await load();
        } catch {
            alert(`Failed to ${action.toLowerCase()} user.`);
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            {/* Subtle bg blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-sky-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Admin / Employees</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Employees</h1>
                    </div>
                    <Link
                        href="/dashboard/admin/employees/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <span className="text-lg leading-none">+</span> Add Employee
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm w-56"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        {Object.entries(ROLE_STYLES).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <div className="text-5xl mb-4">👥</div>
                            <p className="font-medium">No users found</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((u) => {
                                    const role = ROLE_STYLES[u.role] ?? { bg: "bg-gray-100", text: "text-gray-600", label: u.role };
                                    const avatarColor = AVATAR_COLORS[u.user_id % AVATAR_COLORS.length];
                                    const toggling = togglingId === u.user_id;

                                    return (
                                        <tr key={u.user_id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Name + avatar */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                        {getInitials(u.full_name)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{u.full_name}</span>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-3.5 text-gray-500">{u.email}</td>

                                            {/* Role badge */}
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.bg} ${role.text}`}>
                                                    {role.label}
                                                </span>
                                            </td>

                                            {/* Department — backend returns u.department (lowercase) */}
                                            <td className="px-5 py-3.5 text-gray-500">
                                                {u.department?.name ?? "—"}
                                            </td>

                                            {/* Team — backend returns u.team (lowercase) */}
                                            <td className="px-5 py-3.5 text-gray-500">
                                                {u.team?.name ?? "—"}
                                            </td>

                                            {/* Status badge */}
                                            <td className="px-5 py-3.5">
                                                {u.is_active
                                                    ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                                                    : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                                                }
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/admin/employees/${u.user_id}/edit`}
                                                        className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleStatus(u)}
                                                        disabled={toggling}
                                                        className={`text-xs px-3 py-1 rounded-lg border transition-colors disabled:opacity-50
                                                            ${u.is_active
                                                                ? "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
                                                                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                                                            }`}
                                                    >
                                                        {toggling ? "…" : u.is_active ? "Deactivate" : "Activate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}