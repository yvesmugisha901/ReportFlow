"use client";
import { useState, useEffect } from "react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getUsers } from "@/lib/api/admin.api";

const BuildingIcon = () => (
    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-4h6v4" />
        <rect x="9" y="10" width="2" height="2" />
        <rect x="13" y="10" width="2" height="2" />
        <rect x="9" y="14" width="2" height="2" />
        <rect x="13" y="14" width="2" height="2" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const TeamIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

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

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", reviewer_id: "" });
    const [formError, setFormError] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [deptData, userData] = await Promise.all([
                getDepartments(),
                getUsers({ role: "reviewer" }),
            ]);
            setDepartments(deptData.departments ?? []);
            setReviewers(userData.users ?? []);
        } catch {
            setError("Failed to load departments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", description: "", reviewer_id: "" });
        setFormError("");
        setModalOpen(true);
    };

    const openEdit = (dept) => {
        setEditing(dept);
        setForm({
            name: dept.name,
            description: dept.description ?? "",
            reviewer_id: dept.reviewer_id ?? "",
        });
        setFormError("");
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setFormError("Name is required."); return; }
        setSaving(true);
        setFormError("");
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                reviewer_id: form.reviewer_id || null,
            };
            if (editing) {
                await updateDepartment(editing.dept_id, payload);
            } else {
                await createDepartment(payload);
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
            await deleteDepartment(deleteModal.dept_id);
            setDeleteModal(null);
            load();
        } catch (err) {
            const msg = err?.response?.data?.error ?? "Delete failed.";
            alert(msg);
        }
    };

    const set = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setFormError("");
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            {/* Background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Admin / Departments</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Departments</h1>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                    >
                        <span className="text-lg leading-none">+</span> New Department
                    </button>
                </div>

                {/* States */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : departments.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <p className="font-medium">No departments yet</p>
                        <p className="text-sm mt-1">Create your first department to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departments.map((dept) => (
                            <div key={dept.dept_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                {/* Card header */}
                                <div className="flex items-start justify-between mb-3">
                                    {/* ✅ SVG icon instead of emoji */}
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <BuildingIcon />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(dept)}
                                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal(dept)}
                                            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Name + description */}
                                <h3 className="font-bold text-gray-900 mb-1">{dept.name}</h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                    {dept.description || "No description"}
                                </p>

                                {/* Meta row */}
                                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                                    {/* ✅ SVG icon for Reviewer */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <UserIcon />
                                        <span>Reviewer:</span>
                                        <span className="font-medium text-gray-700">
                                            {dept.reviewer?.full_name ?? "Not assigned"}
                                        </span>
                                    </div>

                                    {/* ✅ SVG icon for Teams */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <TeamIcon />
                                        <span>Teams:</span>
                                        <span className="font-medium text-gray-700">
                                            {dept.teams?.length
                                                ? dept.teams.map(t => t.name).join(", ")
                                                : "No teams"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                    {editing ? "Edit Department" : "New Department"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${formError && !form.name ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                            value={form.name}
                            onChange={set("name")}
                            placeholder="e.g. Finance"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            rows={3}
                            value={form.description}
                            onChange={set("description")}
                            placeholder="What does this department handle?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign Reviewer</label>
                        <select
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                            value={form.reviewer_id}
                            onChange={set("reviewer_id")}
                        >
                            <option value="">— None —</option>
                            {reviewers.map(r => (
                                <option key={r.user_id} value={r.user_id}>
                                    {r.full_name}
                                </option>
                            ))}
                        </select>
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
                        className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60 transition-colors"
                    >
                        {saving ? "Saving…" : editing ? "Save Changes" : "Create"}
                    </button>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Department?</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        This will permanently delete <strong>{deleteModal?.name}</strong>. This cannot be undone.
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
                            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}