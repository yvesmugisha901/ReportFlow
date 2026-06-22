"use client";
import { useState, useEffect, useCallback } from "react";
import { getTeams, createTeam, updateTeam, deleteTeam, getDepartments } from "@/lib/api/admin.api";

// ── SVG Icons ─────────────────────────────────────────────────
const Icon = ({ name, className = "w-5 h-5" }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
    const icons = {
        team: <svg className={className} {...p}><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3M20 21c0-2.21-1.79-4-4-4M1 21c0-2.761 2.239-5 5-5h6c2.761 0 5 2.239 5 5" /><circle cx="9" cy="7" r="4" /></svg>,
        warning: <svg className={className} {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
        close: <svg className={className} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>,
        filter: <svg className={className} {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    };
    return icons[name] ?? null;
};

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">{children}</div>
        </div>
    );
}

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [departments, setDepts] = useState([]);
    const [filterDept, setFilterDept] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", dept_id: "" });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    // FIX: load is wrapped in useCallback so filterDept changes re-trigger correctly
    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [teamData, deptData] = await Promise.all([
                // getTeams accepts a plain deptId string (or undefined for all)
                getTeams(filterDept || undefined),
                getDepartments(),
            ]);
            setTeams(teamData.teams ?? teamData ?? []);
            setDepts(deptData.departments ?? deptData ?? []);
        } catch {
            setError("Failed to load teams.");
        } finally {
            setLoading(false);
        }
    }, [filterDept]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", dept_id: filterDept || "" });
        setFormError("");
        setModalOpen(true);
    };

    const openEdit = (team) => {
        setEditing(team);
        setForm({ name: team.name, dept_id: String(team.dept_id) });
        setFormError("");
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setFormError("Team name is required."); return; }
        if (!form.dept_id) { setFormError("Please select a department."); return; }
        setSaving(true); setFormError("");
        try {
            if (editing) {
                await updateTeam(editing.team_id, { name: form.name.trim(), dept_id: form.dept_id });
            } else {
                await createTeam({ name: form.name.trim(), dept_id: form.dept_id });
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
        if (!deleteModal) return;
        try {
            await deleteTeam(deleteModal.team_id);
            setDeleteModal(null);
            load();
        } catch (err) {
            alert(err?.response?.data?.error ?? "Delete failed.");
        }
    };

    const getDeptName = (team) => {
        if (team.department?.name) return team.department.name;
        return departments.find(d => String(d.dept_id) === String(team.dept_id))?.name ?? "—";
    };

    const AVATAR_COLORS = ["bg-indigo-500", "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Admin / Teams</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Teams</h1>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 4v16m8-8H4" />
                        </svg>
                        New Team
                    </button>
                </div>

                {/* Department filter — FIX: now correctly triggers re-fetch via useCallback */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Filter
                    </div>
                    <select

                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        value={filterDept}
                        onChange={e => setFilterDept(e.target.value)}
                    >
                        <Icon name="filter" className="w-3.5 h-3.5" />
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                        ))}
                    </select>
                    {filterDept && (
                        <button onClick={() => setFilterDept("")}
                            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors">
                            <Icon name="close" className="w-3.5 h-3.5" /> Clear
                        </button>
                    )}
                    <span className="ml-auto text-xs text-gray-400">{teams.length} team{teams.length !== 1 ? "s" : ""}</span>
                </div>

                {/* States */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Icon name="team" className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-medium">No teams found</p>
                        <p className="text-sm mt-1">
                            {filterDept ? "No teams in this department." : "Create a team and assign it to a department."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team, i) => (
                            <div key={team.team_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center`}>
                                        <Icon name="team" className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(team)}
                                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                                            Edit
                                        </button>
                                        <button onClick={() => setDeleteModal(team)}
                                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{team.name}</h3>
                                {team.members?.length != null && (
                                    <p className="text-xs text-gray-400 mb-3">
                                        {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                                    </p>
                                )}
                                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {getDeptName(team)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Team" : "New Team"}</h2>
                    <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <Icon name="close" className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                        <input
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${formError && !form.name ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Accounts"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white ${formError && !form.dept_id ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            value={form.dept_id}
                            onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}
                        >
                            <option value="">— Select Department —</option>
                            {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                        </select>
                    </div>
                    {formError && <p className="text-xs text-red-500">{formError}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60 transition-colors">
                        {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
                <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                        <Icon name="warning" className="w-7 h-7 text-rose-500" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Team?</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        This will permanently delete <strong>{deleteModal?.name}</strong>.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}