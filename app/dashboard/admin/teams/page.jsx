"use client";
import { useState, useEffect } from "react";
import { getTeams, createTeam, updateTeam, deleteTeam, getDepartments } from "@/lib/api/admin.api";

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                {children}
            </div>
        </div>
    );
}

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filterDept, setFilterDept] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", dept_id: "" });
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [teamData, deptData] = await Promise.all([
                getTeams(filterDept || undefined),
                getDepartments(),
            ]);
            // backend: { success, teams } or just array
            setTeams(teamData.teams ?? teamData ?? []);
            // backend: { success, count, departments }
            setDepartments(deptData.departments ?? deptData ?? []);
        } catch {
            setError("Failed to load teams.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [filterDept]);

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
        setSaving(true);
        setFormError("");
        try {
            if (editing) {
                await updateTeam(editing.team_id, { name: form.name.trim(), dept_id: form.dept_id });
            } else {
                await createTeam({ name: form.name.trim(), dept_id: form.dept_id });
            }
            setModalOpen(false);
            load();
        } catch (err) {
            const msg = err?.response?.data?.error ?? "Save failed. Please try again.";
            setFormError(msg);
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
            const msg = err?.response?.data?.error ?? "Delete failed.";
            alert(msg);
        }
    };

    /**
     * Resolve department name:
     * Backend may include team.department as an association object,
     * or just team.dept_id. Use the association first, fall back to lookup.
     */
    const getDeptName = (team) => {
        if (team.department?.name) return team.department.name;
        return departments.find(d => String(d.dept_id) === String(team.dept_id))?.name ?? "—";
    };

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
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <span className="text-lg leading-none">+</span> New Team
                    </button>
                </div>

                {/* Department filter */}
                <div className="mb-6">
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                        value={filterDept}
                        onChange={e => setFilterDept(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                        ))}
                    </select>
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
                        <div className="text-5xl mb-4">👥</div>
                        <p className="font-medium">No teams found</p>
                        <p className="text-sm mt-1">Create a team and assign it to a department.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => (
                            <div key={team.team_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl">👥</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(team)} className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">Edit</button>
                                        <button onClick={() => setDeleteModal(team)} className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">Delete</button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{team.name}</h3>
                                {/* Members count if backend includes it */}
                                {team.members?.length != null && (
                                    <p className="text-xs text-gray-400 mb-2">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</p>
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
                <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? "Edit Team" : "New Team"}</h2>
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
                            {departments.map(d => (
                                <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    {formError && <p className="text-xs text-red-500">{formError}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60 transition-colors"
                    >
                        {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
                <div className="text-center">
                    <div className="text-4xl mb-3">⚠️</div>
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