"use client";
import { useState } from "react";

const pendingReports = [
    { id: 1, name: "Monthly Finance Report", employee: "Alice Uwimana", dept: "Finance", submitted: "May 5, 2026", type: "Monthly", priority: "high" },
    { id: 2, name: "Weekly Ops Update", employee: "Jean Mugisha", dept: "Finance", submitted: "May 4, 2026", type: "Weekly", priority: "normal" },
    { id: 3, name: "Budget Variance Report", employee: "Diane Mukamana", dept: "Finance", submitted: "May 3, 2026", type: "Bi-weekly", priority: "high" },
    { id: 4, name: "Staff Training Summary", employee: "Grace Iradukunda", dept: "Finance", submitted: "May 2, 2026", type: "Monthly", priority: "normal" },
];

const reviewed = [
    { name: "Q1 Finance Overview", employee: "Alice Uwimana", action: "Approved", date: "May 1, 2026" },
    { name: "April Expense Report", employee: "Jean Mugisha", action: "Changes Requested", date: "Apr 29, 2026" },
    { name: "Compliance Checklist", employee: "Diane Mukamana", action: "Approved", date: "Apr 28, 2026" },
];

const deptProgress = {
    name: "Finance Department",
    submitted: 11,
    total: 14,
    approved: 8,
    underReview: 3,
    pending: 3,
};

export default function ReviewerDashboard() {
    const [selected, setSelected] = useState(null);
    const [comment, setComment] = useState("");
    const [actionDone, setActionDone] = useState({});

    const handleAction = (id, action) => {
        setActionDone((prev) => ({ ...prev, [id]: action }));
        setSelected(null);
        setComment("");
    };

    const pct = Math.round((deptProgress.submitted / deptProgress.total) * 100);

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 left-1/2 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sky-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Stage 1 Review 🔍</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reviewer Dashboard</h1>
                    </div>
                    <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Awaiting Review", value: pendingReports.filter(r => !actionDone[r.id]).length, icon: "⏳", color: "text-amber-600" },
                        { label: "Reviewed Today", value: Object.keys(actionDone).length, icon: "✅", color: "text-emerald-600" },
                        { label: "Dept. Submitted", value: deptProgress.submitted, icon: "📤", color: "text-indigo-600" },
                        { label: "Dept. Approved", value: deptProgress.approved, icon: "📊", color: "text-violet-600" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="text-xl mb-2">{s.icon}</div>
                            <div className={`text-2xl font-extrabold mb-0.5 ${s.color}`}>{s.value}</div>
                            <div className="text-[11px] text-gray-400 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Pending Review Queue */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <span className="font-bold text-sm text-gray-800">Pending Review Queue</span>
                                <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full">
                                    {pendingReports.filter(r => !actionDone[r.id]).length} pending
                                </span>
                            </div>
                            <div>
                                {pendingReports.map((r) => (
                                    <div key={r.id} className={`border-b border-gray-50 last:border-0 transition-all ${actionDone[r.id] ? "opacity-50" : ""}`}>
                                        <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {r.priority === "high" && (
                                                    <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-gray-800 truncate">{r.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {r.employee} · {r.type} · Submitted {r.submitted}
                                                    </div>
                                                </div>
                                            </div>
                                            {actionDone[r.id] ? (
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${actionDone[r.id] === "Approved" ? "bg-emerald-100 text-emerald-700" :
                                                    actionDone[r.id] === "Rejected" ? "bg-red-100 text-red-700" :
                                                        "bg-amber-100 text-amber-700"
                                                    }`}>{actionDone[r.id]}</span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelected(selected === r.id ? null : r.id)}
                                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors flex-shrink-0"
                                                >
                                                    Review
                                                </button>
                                            )}
                                        </div>

                                        {/* Inline Review Panel */}
                                        {selected === r.id && (
                                            <div className="px-5 pb-4 bg-indigo-50/40 border-t border-indigo-100">
                                                <p className="text-xs font-semibold text-gray-700 mb-2 pt-3">Add comment (optional)</p>
                                                <textarea
                                                    className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-700 resize-none focus:outline-none focus:border-indigo-400 bg-white"
                                                    rows={2}
                                                    placeholder="Leave a note for the employee..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleAction(r.id, "Approved")}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(r.id, "Changes Requested")}
                                                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors"
                                                    >
                                                        ✏ Request Changes
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(r.id, "Rejected")}
                                                        className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors"
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">

                        {/* Department Progress */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">{deptProgress.name}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>Submission Progress</span>
                                    <span className="font-bold text-gray-800">{pct}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                                    <div className="bg-violet-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { label: "Submitted", val: deptProgress.submitted, color: "text-indigo-600" },
                                        { label: "Approved", val: deptProgress.approved, color: "text-emerald-600" },
                                        { label: "Pending", val: deptProgress.pending, color: "text-amber-600" },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-gray-50 rounded-xl p-2">
                                            <div className={`text-lg font-extrabold ${item.color}`}>{item.val}</div>
                                            <div className="text-[9px] text-gray-400 font-medium">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recently Reviewed */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">Recently Reviewed</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {reviewed.map((r) => (
                                    <div key={r.name} className="px-5 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                                            <p className="text-[10px] text-gray-400">{r.employee} · {r.date}</p>
                                        </div>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${r.action === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                            }`}>{r.action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}