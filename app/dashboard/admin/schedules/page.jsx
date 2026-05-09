"use client";
import { useState, useEffect } from "react";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getDepartments, getTeams } from "@/lib/api/admin.api";

function Modal({ open, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

const FREQUENCIES = ["weekly", "biweekly", "monthly", "quarterly", "custom"];
const FREQ_LABELS = { weekly: "Weekly", biweekly: "Bi-Weekly", monthly: "Monthly", quarterly: "Quarterly", custom: "Custom" };

const statusColor = (deadline) => {
    const today = new Date();
    const d = new Date(deadline);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", label: "Overdue" };
    if (diff <= 3) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Due Soon" };
    return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Active" };
};

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const emptyForm = { title: "", report_type: "", frequency: "monthly", start_date: "", deadline: "", dept_id: "", team_id: "" };
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        try {
            setLoading(true);
            const [sched, depts] = await Promise.all([getSchedules(), getDepartments()]);
            setSchedules(sched.schedules ?? sched);
            setDepartments(depts.departments ?? depts);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (form.dept_id) {
            getTeams(form.dept_id).then(d => setTeams(d.teams ?? d)).catch(() => setTeams([]));
        } else {
            setTeams([]);
        }
    }, [form.dept_id]);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
    const openEdit = (s) => {
        setEditing(s);
        setForm({
            title: s.title, report_type: s.report_type, frequency: s.frequency,
            start_date: s.start_date?.slice(0, 10) ?? "",
            deadline: s.deadline?.slice(0, 10) ?? "",
            dept_id: s.dept_id ?? "", team_id: s.team_id ?? "",
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.frequency || !form.deadline || !form.start_date) return;
        setSaving(true);
        try {
            if (editing) await updateSchedule(editing.schedule_id, form);
            else await createSchedule(form);
            setModalOpen(false);
            load();
        } catch { alert("Save failed."); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try { await deleteSchedule(deleteModal.schedule_id); setDeleteModal(null); load(); }
        catch { alert("Delete failed."); }
    };

    const getDeptName = id => departments.find(d => d.dept_id == id)?.name ?? "All";
    const getTeamName = id => teams.find(t => t.team_id == id)?.name ?? null;

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
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200">
                        <span className="text-lg leading-none">+</span> New Schedule
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="text-5xl mb-4">🗓️</div>
                        <p className="font-medium">No schedules defined</p>
                        <p className="text-sm mt-1">Define a reporting schedule to assign to departments or teams.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schedules.map(s => {
                            const st = statusColor(s.deadline);
                            return (
                                <div key={s.schedule_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{s.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{s.report_type}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                                        <div><span className="font-medium text-gray-700">Frequency:</span> {FREQ_LABELS[s.frequency]}</div>
                                        <div><span className="font-medium text-gray-700">Dept:</span> {getDeptName(s.dept_id)}</div>
                                        <div><span className="font-medium text-gray-700">Start:</span> {s.start_date?.slice(0, 10)}</div>
                                        <div><span className="font-medium text-gray-700">Deadline:</span> {s.deadline?.slice(0, 10)}</div>
                                    </div>
                                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                                        <button onClick={() => openEdit(s)} className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">Edit</button>
                                        <button onClick={() => setDeleteModal(s)} className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">Delete</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal open={modalOpen}>
                <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? "Edit Schedule" : "New Schedule"}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Monthly Finance Report" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                        <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.report_type} onChange={e => setForm(f => ({ ...f, report_type: e.target.value }))} placeholder="e.g. Financial Summary" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                                {FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value, team_id: "" }))}>
                                <option value="">All</option>
                                {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                    {teams.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team (optional)</label>
                            <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" value={form.team_id} onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}>
                                <option value="">All teams in dept</option>
                                {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                            <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60">
                        {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={!!deleteModal}>
                <div className="text-center">
                    <div className="text-4xl mb-3">⚠️</div>
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