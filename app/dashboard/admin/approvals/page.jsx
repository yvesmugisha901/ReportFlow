"use client";
import { useState, useEffect, useCallback } from "react";
import { getPendingUsers, approveUser, getTeams } from "@/lib/api/admin.api";

export default function PendingApprovalsPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [selected, setSelected] = useState(null);
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");
    const [approving, setApproving] = useState(false);
    const [approveError, setApproveError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getPendingUsers();
            setPendingUsers(data.users || []);
        } catch {
            setError("Failed to load pending approvals. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const openModal = async (user) => {
        setSelected(user);
        setSelectedTeam("");
        setApproveError("");
        setTeamsLoading(true);
        try {
            const data = await getTeams(user.dept_id);
            setTeams(data.teams || data.data || data || []);
        } catch {
            setTeams([]);
        } finally {
            setTeamsLoading(false);
        }
    };

    const closeModal = () => {
        setSelected(null);
        setTeams([]);
        setSelectedTeam("");
        setApproveError("");
    };

    const handleApprove = async () => {
        if (!selected) return;
        setApproving(true);
        setApproveError("");
        try {
            await approveUser(selected.user_id, { team_id: selectedTeam || null });
            const name = selected.full_name;
            setPendingUsers((prev) => prev.filter((u) => u.user_id !== selected.user_id));
            closeModal();
            setSuccessMsg(`${name} has been approved and can now log in.`);
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setApproveError(err?.response?.data?.error || "Approval failed. Please try again.");
        } finally {
            setApproving(false);
        }
    };

    const getInitials = (name = "") =>
        name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6">
            {/* ── Header ───────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Pending Approvals
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review registrations, assign teams, and activate accounts.
                        </p>
                    </div>

                    <button
                        onClick={fetchPending}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 text-sm font-medium rounded-xl transition-all shadow-sm">
                        <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* ── Success toast ─────────────────────────────── */}
                {successMsg && (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {successMsg}
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────── */}
                {error && (
                    <div className="mb-6 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {error}
                    </div>
                )}

                {/* ── Stats bar ─────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Awaiting review", value: pendingUsers.length, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                        { label: "With department", value: pendingUsers.filter(u => u.dept_id).length, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
                        { label: "No department", value: pendingUsers.filter(u => !u.dept_id).length, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl px-4 py-4 text-center`}>
                            <p className={`text-2xl font-bold ${stat.color}`}>{loading ? "—" : stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── List ──────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-gray-100 rounded-lg animate-pulse w-40" />
                                        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-56" />
                                    </div>
                                    <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-base font-bold text-gray-800 mb-1">All caught up!</p>
                            <p className="text-sm text-gray-400">No pending registrations at the moment.</p>
                        </div>
                    ) : (
                        <>
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_160px_120px_100px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</p>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-100">
                                {pendingUsers.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="grid grid-cols-[1fr_160px_120px_100px] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors group">

                                        {/* Employee info */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                                                {getInitials(user.full_name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Department */}
                                        <div>
                                            {user.department?.name ? (
                                                <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg">
                                                    {user.department.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 bg-red-50 border border-red-200 text-red-500 text-xs font-semibold rounded-lg">
                                                    Not set
                                                </span>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <p className="text-xs text-gray-400 font-medium">
                                            {formatDate(user.created_at)}
                                        </p>

                                        {/* Action */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-md">
                                                Review →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Approved employees can log in immediately. You can reassign their team anytime from the Users page.
                </p>
            </div>

            {/* ── Approval Modal ───────────────────────────────── */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

                    <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                        {/* Modal header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-gray-900">Approve Registration</h3>
                            <button
                                onClick={closeModal}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 text-xs font-bold">
                                ✕
                            </button>
                        </div>

                        {/* User card */}
                        <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl mb-5">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                                {getInitials(selected.full_name)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">{selected.full_name}</p>
                                <p className="text-xs text-gray-400 truncate">{selected.email}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[11px] text-indigo-500 font-semibold">
                                        {selected.department?.name || "No department"}
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-[11px] text-gray-400 capitalize">{selected.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Team assignment */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Assign Team{" "}
                                <span className="font-normal text-gray-400">(optional)</span>
                            </label>

                            {teamsLoading ? (
                                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Loading teams…
                                </div>
                            ) : teams.length === 0 ? (
                                <div className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600 font-medium">
                                    No teams in this department yet — you can assign one later from the Users page.
                                </div>
                            ) : (
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer">
                                    <option value="">No team — assign later</option>
                                    {teams.map((team) => (
                                        <option key={team.team_id} value={team.team_id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <p className="mt-1.5 text-[11px] text-gray-400">
                                Teams shown are from <strong>{selected.department?.name}</strong>. You can reassign anytime from the Users page.
                            </p>
                        </div>

                        {approveError && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                                {approveError}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={approving}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md">
                                {approving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Approving…
                                    </span>
                                ) : "✓ Approve & activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}