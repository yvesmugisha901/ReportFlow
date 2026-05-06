"use client";
import { useState } from "react";
import Link from "next/link";

const myReports = [
    { name: "Monthly Operations Report", type: "Monthly", dueDate: "May 10, 2026", status: "Pending", submittedAt: null },
    { name: "Q1 Team Performance", type: "Quarterly", dueDate: "May 5, 2026", status: "Approved", submittedAt: "Apr 30, 2026" },
    { name: "Weekly Progress Update", type: "Weekly", dueDate: "May 3, 2026", status: "Under Review", submittedAt: "May 3, 2026" },
    { name: "March Summary Report", type: "Monthly", dueDate: "Apr 5, 2026", status: "Changes Requested", submittedAt: "Apr 4, 2026" },
    { name: "Safety Compliance Report", type: "Bi-weekly", dueDate: "Apr 20, 2026", status: "Approved", submittedAt: "Apr 19, 2026" },
];

const schedule = [
    { type: "Weekly Progress Update", freq: "Every Monday", nextDue: "May 13, 2026", daysLeft: 7 },
    { type: "Monthly Operations Report", freq: "1st of every month", nextDue: "Jun 1, 2026", daysLeft: 26 },
    { type: "Q2 Performance Review", freq: "Quarterly", nextDue: "Jul 1, 2026", daysLeft: 56 },
];

const statusColor = {
    Approved: "bg-emerald-100 text-emerald-700",
    "Under Review": "bg-amber-100 text-amber-700",
    Pending: "bg-gray-100 text-gray-600",
    "Changes Requested": "bg-rose-100 text-rose-700",
    Rejected: "bg-red-100 text-red-700",
};

const timeline = [
    { event: "Your report was approved by COO", time: "2 hours ago", icon: "✅", color: "bg-emerald-100" },
    { event: "Changes requested on March Summary", time: "Yesterday", icon: "✏️", color: "bg-amber-100" },
    { event: "Weekly Progress submitted successfully", time: "May 3", icon: "📤", color: "bg-sky-100" },
    { event: "New report scheduled: Monthly Operations", time: "May 1", icon: "🗓️", color: "bg-indigo-100" },
];

export default function EmployeeDashboard() {
    const [filter, setFilter] = useState("All");
    const statuses = ["All", "Pending", "Under Review", "Approved", "Changes Requested"];
    const filtered = filter === "All" ? myReports : myReports.filter((r) => r.status === filter);

    const counts = {
        total: myReports.length,
        approved: myReports.filter((r) => r.status === "Approved").length,
        pending: myReports.filter((r) => r.status === "Pending").length,
        changes: myReports.filter((r) => r.status === "Changes Requested").length,
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Welcome back 👋</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Reports</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                        <Link
                            href="/dashboard/employee/reports/new"
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Report
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total Reports", value: counts.total, icon: "📋", color: "text-indigo-600" },
                        { label: "Approved", value: counts.approved, icon: "✅", color: "text-emerald-600" },
                        { label: "Pending", value: counts.pending, icon: "⏳", color: "text-amber-600" },
                        { label: "Needs Changes", value: counts.changes, icon: "✏️", color: "text-rose-500" },
                    ].map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="text-xl mb-2">{s.icon}</div>
                            <div className={`text-2xl font-extrabold mb-0.5 ${s.color}`}>{s.value}</div>
                            <div className="text-[11px] text-gray-400 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Due Soon Banner */}
                {counts.pending > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-800">You have {counts.pending} report{counts.pending > 1 ? "s" : ""} due</p>
                            <p className="text-xs text-amber-600">Monthly Operations Report is due May 10, 2026 — 4 days left</p>
                        </div>
                        <Link
                            href="/dashboard/employee/reports/new"
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            Submit Now
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* My Reports Table */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-sm text-gray-800">My Submissions</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                                {statuses.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter(s)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            {filtered.map((r) => (
                                <div key={r.name} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="text-sm font-semibold text-gray-800 truncate">{r.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {r.type} · Due {r.dueDate}
                                            {r.submittedAt && ` · Submitted ${r.submittedAt}`}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${statusColor[r.status]}`}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">

                        {/* Upcoming Schedule */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">Upcoming Schedule</span>
                            </div>
                            <div className="p-5 space-y-3">
                                {schedule.map((s) => (
                                    <div key={s.type} className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${s.daysLeft <= 7 ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                                            }`}>
                                            {s.daysLeft}d
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">{s.type}</p>
                                            <p className="text-[10px] text-gray-400">{s.freq} · Due {s.nextDue}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">Recent Activity</span>
                            </div>
                            <div className="p-5 space-y-3">
                                {timeline.map((t, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${t.color}`}>
                                            {t.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-700 font-medium">{t.event}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{t.time}</p>
                                        </div>
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