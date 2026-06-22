"use client";
import { useState, useEffect } from "react";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getDepartments, getTeams } from "@/lib/api/admin.api";

// ── Icons ────────────────────────────────────────────────────────
const Icon = ({ name, className = "w-4 h-4" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        grid: <svg className={className} {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
        list: <svg className={className} {...p}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
        edit: <svg className={className} {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
        trash: <svg className={className} {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    };
    return icons[name] ?? null;
};

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">{children}</div>
        </div>
    );
}

const FREQUENCIES = ["weekly", "bi-weekly", "monthly", "quarterly", "custom"];
const FREQ_LABELS = { weekly: "Weekly", "bi-weekly": "Bi-Weekly", biweekly: "Bi-Weekly", monthly: "Monthly", quarterly: "Quarterly", custom: "Custom" };

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
    const [viewMode, setViewMode] = useState("grid");
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

    const emptyForm = { title: "", report_type: "", frequency: "monthly", start_date: "", deadline: "", dept_id: "", team_id: "" };
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
            getTeams(form.dept_id).then(d => setTeams(d.teams ?? d ?? [])).catch(() => setTeams([]));
        } else {
            setTeams([]);
            setForm(f => ({ ...f, team_id: "" }));
        }
    }, [form.dept_id]);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(""); setModalOpen(true); };
    const openEdit = (s) => {
        setEditing(s);
        setForm({
            title: s.title ?? "", report_type: s.report_type ?? "", frequency: s.frequency ?? "monthly",
            start_date: s.start_date?.slice(0, 10) ?? "", deadline: s.deadline?.slice(0, 10) ?? "",
            dept_id: s.dept_id ?? "", team_id: s.team_id ?? "",
        });
        setFormError(""); setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { setFormError("Title is required."); return; }
        setSaving(true);
        try {
            const payload = { ...form, dept_id: form.dept_id || null, team_id: form.team_id || null };
            if (editing) await updateSchedule(editing.schedule_id, payload);
            else await createSchedule(payload);
            setModalOpen(false); load();
        } catch (err) {
            setFormError(err?.response?.data?.error ?? "Save failed.");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await deleteSchedule(deleteModal.schedule_id);
            setDeleteModal(null); load();
        } catch (err) { alert("Delete failed."); }
    };

    const setF = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setFormError(""); };

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Admin / Schedules</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Report Schedules</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                title="Grid View"
                            >
                                <Icon name="grid" />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                title="Table View"
                            >
                                <Icon name="list" />
                            </button>
                        </div>

                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            + New Schedule
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="text-5xl mb-4">🗓️</div>
                        <p className="font-medium">No schedules defined</p>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map(s => {
                            const st = statusColor(s.deadline);
                            return (
                                <div key={s.schedule_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0 flex-1 pr-3">
                                            <h3 className="font-bold text-gray-900 truncate">{s.title}</h3>
                                            <p className="text-[11px] text-gray-400 uppercase font-semibold">{s.report_type || "Standard Report"}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${st.bg} ${st.text} ${st.border}`}>
                                            {st.label}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs"><span className="text-gray-400">Frequency</span> <span className="font-medium">{capitalize(s.frequency)}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-400">Department</span> <span className="font-medium">{s.department?.name ?? "Global"}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-400">Deadline</span> <span className="font-medium text-gray-700">{s.deadline?.slice(0, 10) ?? "—"}</span></div>
                                    </div>
                                    <div className="flex gap-2 border-t border-gray-50 pt-3">
                                        <button onClick={() => openEdit(s)} className="flex-1 text-xs py-1.5 rounded-lg border border-gray-100 text-gray-600 hover:bg-gray-50">Edit</button>
                                        <button onClick={() => setDeleteModal(s)} className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50">Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Title & Type</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Frequency</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Deadline</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {schedules.map(s => {
                                        const st = statusColor(s.deadline);
                                        return (
                                            <tr key={s.schedule_id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{s.title}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase">{s.report_type || "—"}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{capitalize(s.frequency)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-700">{s.department?.name ?? "All Depts"}</div>
                                                    {s.team?.name && <div className="text-[10px] text-indigo-500 font-medium">Team: {s.team.name}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-600">{s.deadline?.slice(0, 10)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
                                                        <span className={`w-1 h-1 rounded-full ${st.text.replace('text', 'bg')}`} />
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                            <Icon name="edit" className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteModal(s)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Icon name="trash" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? "Edit Schedule" : "New Schedule"}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.title} onChange={setF("title")} placeholder="e.g. Monthly Finance Report" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={form.frequency} onChange={setF("frequency")}>
                                {FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABELS[f] ?? f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value, team_id: "" }))}>
                                <option value="">All departments</option>
                                {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                    {teams.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team (optional)</label>
                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={form.team_id} onChange={setF("team_id")}>
                                <option value="">All teams in dept</option>
                                {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.start_date} onChange={setF("start_date")} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.deadline} onChange={setF("deadline")} />
                        </div>
                    </div>
                    {formError && <p className="text-xs text-red-500">{formError}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60">
                        {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </Modal>

            <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Schedule?</h2>
                    <p className="text-sm text-gray-500 mb-6">Permanently delete <strong>{deleteModal?.title}</strong>?</p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}