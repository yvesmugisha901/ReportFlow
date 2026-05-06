"use client";
import { useState } from "react";

const pendingApprovals = [
    { id: 1, name: "Monthly Finance Report", employee: "Alice Uwimana", dept: "Finance", reviewer: "Eric Nshimiyimana", passedStage1: "May 5, 2026", type: "Monthly" },
    { id: 2, name: "Budget Variance Report", employee: "Diane Mukamana", dept: "Finance", reviewer: "Eric Nshimiyimana", passedStage1: "May 4, 2026", type: "Bi-weekly" },
    { id: 3, name: "Q2 Operations Summary", employee: "Jean Mugisha", dept: "Operations", reviewer: "Solange Uwase", passedStage1: "May 3, 2026", type: "Quarterly" },
    { id: 4, name: "HR Staff Report", employee: "Grace Iradukunda", dept: "Human Resources", reviewer: "Patrick Habimana", passedStage1: "May 2, 2026", type: "Monthly" },
];

const allReports = [
    { name: "Monthly Finance Report", dept: "Finance", status: "Pending Final", date: "May 5" },
    { name: "Q1 Company Overview", dept: "All Depts", status: "Approved", date: "Apr 30" },
    { name: "IT Infrastructure Q1", dept: "IT", status: "Approved", date: "Apr 28" },
    { name: "HR Compliance Report", dept: "HR", status: "Rejected", date: "Apr 25" },
    { name: "Sales Pipeline Apr", dept: "Sales", status: "Approved", date: "Apr 22" },
];

const complianceByDept = [
    { name: "Finance", rate: 90, color: "bg-indigo-500" },
    { name: "Operations", rate: 75, color: "bg-violet-500" },
    { name: "Human Resources", rate: 67, color: "bg-sky-500" },
    { name: "IT", rate: 88, color: "bg-emerald-500" },
    { name: "Sales", rate: 50, color: "bg-amber-500" },
    { name: "Legal", rate: 75, color: "bg-rose-500" },
];

const statusColor = {
    "Pending Final": "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
};

export default function ApproverDashboard() {
    const [selected, setSelected] = useState(null);
    const [comment, setComment] = useState("");
    const [actionDone, setActionDone] = useState({});

    const handleAction = (id, action) => {
        setActionDone((prev) => ({ ...prev, [id]: action }));
        setSelected(null);
        setComment("");
    };

    const remaining = pendingApprovals.filter((r) => !actionDone[r.id]).length;
    const overallCompliance = Math.round(
        complianceByDept.reduce((sum, d) => sum + d.rate, 0) / complianceByDept.length
    );

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full bg-emerald-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Final Stage Approvals ✅</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">COO Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {remaining > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                            )}
                        </button>
                        <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
                            Overall Compliance: <span className="text-emerald-600">{overallCompliance}%</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Awaiting Sign-off", value: remaining, icon: "⏳", color: "text-amber-600" },
                        { label: "Approved Today", value: Object.values(actionDone).filter(a => a === "Approved").length, icon: "✅", color: "text-emerald-600" },
                        { label: "Total Reports", value: 248, icon: "📋", color: "text-indigo-600" },
                        { label: "Compliance Rate", value: `${overallCompliance}%`, icon: "📊", color: "text-violet-600" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="text-xl mb-2">{s.icon}</div>
                            <div className={`text-2xl font-extrabold mb-0.5 ${s.color}`}>{s.value}</div>
                            <div className="text-[11px] text-gray-400 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Stage 2 Approval Queue */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <span className="font-bold text-sm text-gray-800">Stage 2 — Final Approval Queue</span>
                                {remaining > 0 && (
                                    <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full">
                                        {remaining} need your sign-off
                                    </span>
                                )}
                            </div>
                            <div>
                                {pendingApprovals.map((r) => (
                                    <div key={r.id} className={`border-b border-gray-50 last:border-0 transition-all ${actionDone[r.id] ? "opacity-50" : ""}`}>
                                        <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                                                    <span className="text-[9px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">Stage 1 ✓</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {r.employee} · {r.dept} · Reviewed by {r.reviewer} · {r.passedStage1}
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
                                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex-shrink-0"
                                                >
                                                    Sign Off
                                                </button>
                                            )}
                                        </div>

                                        {/* Inline Approval Panel */}
                                        {selected === r.id && (
                                            <div className="px-5 pb-4 bg-emerald-50/40 border-t border-emerald-100">
                                                <p className="text-xs font-semibold text-gray-700 mb-2 pt-3">Final comments (optional)</p>
                                                <textarea
                                                    className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-700 resize-none focus:outline-none focus:border-emerald-400 bg-white"
                                                    rows={2}
                                                    placeholder="Add a note for the record..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                />
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleAction(r.id, "Approved")}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                                                    >
                                                        ✓ Final Approve
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

                        {/* All Reports */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">All Reports Overview</span>
                            </div>
                            <div>
                                {allReports.map((r) => (
                                    <div key={r.name} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                                            <p className="text-xs text-gray-400">{r.dept} · {r.date}</p>
                                        </div>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusColor[r.status]}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Compliance Analytics */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">Dept. Compliance</span>
                            </div>
                            <div className="p-5 space-y-4">
                                {complianceByDept.map((d) => (
                                    <div key={d.name}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-medium text-gray-700">{d.name}</span>
                                            <span className={`text-xs font-bold ${d.rate >= 80 ? "text-emerald-600" : d.rate >= 60 ? "text-amber-600" : "text-rose-500"}`}>
                                                {d.rate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`${d.color} h-2 rounded-full transition-all`}
                                                style={{ width: `${d.rate}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-200">
                            <p className="text-indigo-200 text-xs font-semibold mb-1">Overall Status</p>
                            <p className="text-white text-3xl font-extrabold mb-1">{overallCompliance}%</p>
                            <p className="text-indigo-200 text-xs mb-4">Org compliance this period</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Approved", val: 198, color: "bg-white/20" },
                                    { label: "Pending", val: 17, color: "bg-white/10" },
                                    { label: "Rejected", val: 12, color: "bg-white/10" },
                                    { label: "In Review", val: 21, color: "bg-white/10" },
                                ].map((item) => (
                                    <div key={item.label} className={`${item.color} rounded-xl p-2.5 text-center`}>
                                        <div className="text-white font-extrabold text-sm">{item.val}</div>
                                        <div className="text-indigo-200 text-[9px] font-medium">{item.label}</div>
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