"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, getDepartments, getTeams } from "@/lib/api/admin.api";

const ROLES = [
    { value: "employee", label: "Employee" },
    { value: "reviewer", label: "Reviewer" },
    { value: "approver", label: "Approver" },
    { value: "admin", label: "Admin" },
];

export default function NewEmployeePage() {
    const router = useRouter();
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    // plainPassword is shown after creation so admin can share it
    const [createdPassword, setCreatedPassword] = useState(null);
    const [createdUser, setCreatedUser] = useState(null);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        role: "employee",
        dept_id: "",
        team_id: "",
    });

    useEffect(() => {
        getDepartments()
            .then(d => setDepartments(d.departments ?? d))
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (form.dept_id) {
            getTeams(form.dept_id)
                .then(d => setTeams(d.teams ?? d))
                .catch(() => setTeams([]));
        } else {
            setTeams([]);
            setForm(f => ({ ...f, team_id: "" }));
        }
    }, [form.dept_id]);

    const validate = () => {
        const e = {};
        if (!form.full_name.trim()) e.full_name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        setSaving(true);
        try {
            // Backend auto-generates password and returns it as plainPassword
            const data = await createEmployee(form);
            setCreatedUser(data.user);
            setCreatedPassword(data.plainPassword);
        } catch (err) {
            const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to create employee.";
            setErrors({ submit: msg });
        } finally {
            setSaving(false);
        }
    };

    const set = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setErrors(er => ({ ...er, [key]: undefined }));
    };

    // ── Success state — show the generated password ──────────
    if (createdPassword) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Employee Created</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Share these credentials with <span className="font-semibold text-gray-700">{createdUser?.full_name}</span>. The password cannot be retrieved again.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">{createdUser?.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Temp Password</span>
                            <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">{createdPassword}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setCreatedPassword(null);
                                setCreatedUser(null);
                                setForm({ full_name: "", email: "", role: "employee", dept_id: "", team_id: "" });
                            }}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Add Another
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/admin/employees")}
                            className="flex-1 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Add Employee</h1>
                    <p className="text-sm text-gray-400 mt-1">A temporary password will be auto-generated and shown to you after creation.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.full_name ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                                value={form.full_name}
                                onChange={set("full_name")}
                                placeholder="e.g. Alice Uwimana"
                            />
                            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                                value={form.email}
                                onChange={set("email")}
                                placeholder="e.g. alice@company.com"
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                value={form.role}
                                onChange={set("role")}
                            >
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>

                        {/* Department + Team */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                    value={form.dept_id}
                                    onChange={e => {
                                        setForm(f => ({ ...f, dept_id: e.target.value, team_id: "" }));
                                    }}
                                >
                                    <option value="">— None —</option>
                                    {departments.map(d => (
                                        <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                    value={form.team_id}
                                    onChange={set("team_id")}
                                    disabled={!form.dept_id || teams.length === 0}
                                >
                                    <option value="">— None —</option>
                                    {teams.map(t => (
                                        <option key={t.team_id} value={t.team_id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submit error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                {errors.submit}
                            </div>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60 transition-colors shadow-md shadow-indigo-200"
                        >
                            {saving ? "Creating…" : "Create Employee"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}