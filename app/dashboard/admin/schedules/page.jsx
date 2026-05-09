"use client";
import { useState, useEffect } from "react";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getDepartments, getTeams } from "@/lib/api/admin.api";

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

const FREQUENCIES = ["weekly", "bi-weekly", "monthly", "quarterly", "custom"];
const FREQ_LABELS = {
    weekly: "Weekly", "bi-weekly": "Bi-Weekly",
    biweekly: "Bi-Weekly", monthly: "Monthly",
    quarterly: "Quarterly", custom: "Custom",
};

function capitalize(str) {
    if (!str) return "—";
    return FREQ_LABELS[str] ?? (str.charAt(0).toUpperCase() + str.slice(1));
}

const statusColor = (deadline) => {
    if (!deadline) return { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-100", label: "No deadline" };
    const diff = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", label: "Overdue" };
    if (diff <= 3) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Due Soon" };
    return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Active" };
};

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const emptyForm = {
        title: "", report_type: "", frequency: "monthly",
        start_date: "", deadline: "", dept_id: "", team_id: "",
    };
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [sched, depts] = await Promise.all([getSchedules(), getDepartments()]);
            setSchedules(sched.schedules ?? sched ?? []);
            setDepartments(depts.departments ?? depts ?? []);
        } catch {
            setError("Failed to load schedules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (form.dept_id) {
            getTeams(form.dept_id)
                .then(d => setTeams(d.teams ?? d ?? []))
                .catch(() => setTeams([]));
        } else {
            setTeams([]);
            setForm(f => ({ ...f, team_id: "" }));
        }
    }, [form.dept_id]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError("");
        setModalOpen(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({
            title: s.title ?? "",
            report_type: s.report_type ?? "",
            frequency: s.frequency ?? "monthly",
            start_date: s.start_date?.slice(0, 10) ?? "",
            deadline: s.deadline?.slice(0, 10) ?? "",
            dept_id: s.dept_id ?? "",
            team_id: s.team_id ?? "",
        });
        setFormError("");
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { setFormError("Title is required."); return; }
        if (!form.frequency) { setFormError("Frequency is required."); return; }
        if (!form.start_date) { setFormError("Start date is required."); return; }
        if (!form.deadline) { setFormError("Deadline is required."); return; }

        setSaving(true);
        setFormError("");
        try {
            const payload = {
                ...form,
                dept_id: form.dept_id || null,
                team_id: form.team_id || null,
            };
            if (editing) {
                await updateSchedule(editing.schedule_id, payload);
            } else {
                await createSchedule(payload);
            }
            setModalOpen(false);
            load();
        } catch (err) {
            setFormError(err?.response?.data?.error ?? "Save failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteSchedule(deleteModal.schedule_id);
            setDeleteModal(null);
            load();
        } catch (err) {
            alert(err?.response?.data?.error ?? "Delete failed.");
        }
    };

    const setF = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setFormError("");
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Admin / Schedules</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Report Schedules</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Schedules are linked to departments/teams. Employees in those groups will see them on their dashboard.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <span className="text-lg leading-none">+</span> New Schedule
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="text-5xl mb-4">🗓️</div>
                        <p className="font-medium">No schedules defined</p>
                        <p className="text-sm mt-1">Create a schedule and link it to a department or team.</p>
                        <button
                            onClick={openCreate}
                            className="mt-4 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                        >
                            Create First Schedule
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schedules.map(s => {
                            const st = statusColor(s.deadline);
                            return (
                                <div key={s.schedule_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0 flex-1 pr-3">
                                            <h3 className="font-bold text-gray-900 truncate">{s.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{s.report_type || "—"}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${st.bg} ${st.text} ${st.border}`}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                                        <div><span className="font-medium text-gray-700">Frequency:</span> {capitalize(s.frequency)}</div>
                                        <div><span className="font-medium text-gray-700">Dept:</span> {s.department?.name ?? "All"}</div>
                                        <div><span className="font-medium text-gray-700">Start:</span> {s.start_date?.slice(0, 10) ?? "—"}</div>
                                        <div><span className="font-medium text-gray-700">Deadline:</span> {s.deadline?.slice(0, 10) ?? "—"}</div>
                                        {s.team?.name && (
                                            <div className="col-span-2"><span className="font-medium text-gray-700">Team:</span> {s.team.name}</div>
                                        )}
                                        {s.creator?.full_name && (
                                            <div className="col-span-2"><span className="font-medium text-gray-700">Created by:</span> {s.creator.full_name}</div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                                        <button
                                            onClick={() => openEdit(s)}
                                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal(s)}
                                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                    {editing ? "Edit Schedule" : "New Schedule"}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.title}
                            onChange={setF("title")}
                            placeholder="e.g. Monthly Finance Report"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <input
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.report_type}
                            onChange={setF("report_type")}
                            placeholder="e.g. Financial Summary"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                value={form.frequency}
                                onChange={setF("frequency")}
                            >
                                {FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABELS[f] ?? f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                value={form.dept_id}
                                onChange={e => setForm(f => ({ ...f, dept_id: e.target.value, team_id: "" }))}
                            >
                                <option value="">All departments</option>
                                {departments.map(d => (
                                    <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {teams.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team (optional)</label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                value={form.team_id}
                                onChange={setF("team_id")}
                            >
                                <option value="">All teams in dept</option>
                                {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <input
                                type="date"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={form.start_date}
                                onChange={setF("start_date")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                            <input
                                type="date"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={form.deadline}
                                onChange={setF("deadline")}
                            />
                        </div>
                    </div>

                    {formError && (
                        <p className="text-xs text-red-500">{formError}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60"
                    >
                        {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
                <div className="text-center">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Schedule?</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Permanently delete <strong>{deleteModal?.title}</strong>? Reports linked to this schedule will lose their schedule reference.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setDeleteModal(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}