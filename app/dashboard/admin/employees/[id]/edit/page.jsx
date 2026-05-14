"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById, updateUser, getDepartments, getTeams } from "@/lib/api/admin.api";

const ROLES = [
    { value: "employee", label: "Employee" },
    { value: "reviewer", label: "Reviewer" },
    { value: "approver", label: "Approver" },
    { value: "admin", label: "Admin" },
];

// ── Icons ────────────────────────────────────────────────────────
const Icon = ({ name, className = "w-4 h-4" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        arrowLeft: <svg className={className} {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
        user: <svg className={className} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        mail: <svg className={className} {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
        briefcase: <svg className={className} {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
        building: <svg className={className} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        users: <svg className={className} {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        save: <svg className={className} {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
        check: <svg className={className} {...p}><polyline points="20 6 9 17 4 12" /></svg>,
        alert: <svg className={className} {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
        chevronDown: <svg className={className} {...p}><polyline points="6 9 12 15 18 9" /></svg>,
    };
    return icons[name] ?? null;
};

// ── Reusable field wrapper ───────────────────────────────────────
function Field({ label, icon, children, error }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <span className="text-gray-400"><Icon name={icon} className="w-3.5 h-3.5" /></span>
                {label}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <Icon name="alert" className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );
}

export default function EditEmployeePage() {
    const { id } = useParams();
    const router = useRouter();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        role: "employee",
        dept_id: "",
        team_id: "",
        is_active: true,
    });
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null); // { type: "success" | "error", message }

    // ── Fetch user + departments + teams on mount ────────────────
    useEffect(() => {
        if (!id) return;
        Promise.all([
            getUserById(id),
            getDepartments(),
            getTeams().catch(() => ({ teams: [] })), // teams may not exist
        ])
            .then(([userData, deptData, teamData]) => {
                const u = userData.user ?? userData;
                setForm({
                    full_name: u.full_name ?? "",
                    email: u.email ?? "",
                    role: u.role ?? "employee",
                    dept_id: u.department?.dept_id ?? u.dept_id ?? "",
                    team_id: u.team?.team_id ?? u.team_id ?? "",
                    is_active: u.is_active ?? true,
                });
                setDepartments(deptData.departments ?? deptData ?? []);
                setTeams(teamData.teams ?? teamData ?? []);
            })
            .catch(() => {
                showToast("error", "Failed to load employee data.");
            })
            .finally(() => setLoadingUser(false));
    }, [id]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const validate = () => {
        const e = {};
        if (!form.full_name.trim()) e.full_name = "Name is required.";
        if (!form.email.trim()) e.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
        if (!form.role) e.role = "Role is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await updateUser(id, {
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                role: form.role,
                dept_id: form.dept_id || null,
                team_id: form.team_id || null,
                is_active: form.is_active,
            });
            showToast("success", "Employee updated successfully.");
            setTimeout(() => router.push("/dashboard/admin/employees"), 1200);
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Failed to save changes.";
            showToast("error", msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Loading skeleton ─────────────────────────────────────────
    if (loadingUser) {
        return (
            <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
                <div className="text-sm text-gray-400 animate-pulse">Loading employee…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6fa] text-[#0f1117]">
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-violet-100/60 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-100/40 blur-[90px]" />
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "success"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-500 text-white"
                    }`}>
                    <Icon name={toast.type === "success" ? "check" : "alert"} className="w-4 h-4" />
                    {toast.message}
                </div>
            )}

            <div className="relative z-10 max-w-2xl mx-auto px-5 py-8">

                {/* ── Header ──────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-7">
                    <Link
                        href="/dashboard/admin/employees"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm"
                    >
                        <Icon name="arrowLeft" className="w-4 h-4" />
                    </Link>
                    <div>
                        <p className="text-xs text-gray-400">Admin / Employees / Edit</p>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Edit Employee</h1>
                    </div>
                </div>

                {/* ── Form card ───────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    {/* Card header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Icon name="user" className="w-4.5 h-4.5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{form.full_name || "Employee"}</p>
                            <p className="text-xs text-gray-400">ID #{id}</p>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

                        {/* Full Name */}
                        <Field label="Full Name" icon="user" error={errors.full_name}>
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={e => handleChange("full_name", e.target.value)}
                                placeholder="e.g. Jane Doe"
                                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.full_name ? "border-red-300" : "border-gray-200"
                                    }`}
                            />
                        </Field>

                        {/* Email */}
                        <Field label="Email" icon="mail" error={errors.email}>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => handleChange("email", e.target.value)}
                                placeholder="e.g. jane@company.com"
                                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.email ? "border-red-300" : "border-gray-200"
                                    }`}
                            />
                        </Field>

                        {/* Role */}
                        <Field label="Role" icon="briefcase" error={errors.role}>
                            <div className="relative">
                                <select
                                    value={form.role}
                                    onChange={e => handleChange("role", e.target.value)}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none ${errors.role ? "border-red-300" : "border-gray-200"
                                        }`}
                                >
                                    {ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Icon name="chevronDown" className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Field>

                        {/* Department */}
                        <Field label="Department" icon="building">
                            <div className="relative">
                                <select
                                    value={form.dept_id}
                                    onChange={e => handleChange("dept_id", e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none"
                                >
                                    <option value="">No Department</option>
                                    {departments.map(d => (
                                        <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Icon name="chevronDown" className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Field>

                        {/* Team */}
                        <Field label="Team" icon="users">
                            <div className="relative">
                                <select
                                    value={form.team_id}
                                    onChange={e => handleChange("team_id", e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none"
                                >
                                    <option value="">No Team</option>
                                    {teams.map(t => (
                                        <option key={t.team_id} value={t.team_id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Icon name="chevronDown" className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </Field>

                        {/* Active status */}
                        <Field label="Status" icon="check">
                            <div className="flex items-center gap-3 h-[38px]">
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={form.is_active}
                                    onClick={() => handleChange("is_active", !form.is_active)}
                                    className={`relative inline-flex w-12 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${form.is_active ? "bg-emerald-500" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${form.is_active ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                                <span className={`text-sm font-medium transition-colors ${form.is_active ? "text-emerald-600" : "text-gray-400"
                                    }`}>
                                    {form.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </Field>
                    </div>

                    {/* Footer actions */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2">
                        <Link
                            href="/dashboard/admin/employees"
                            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
                        >
                            <Icon name="save" className="w-3.5 h-3.5" />
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}