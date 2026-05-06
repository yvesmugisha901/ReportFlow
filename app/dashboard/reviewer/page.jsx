"use client";
import { useState } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import ComplianceBar from "@/components/dashboard/ComplianceBar";

const pendingItems = [
    { id: 1, title: "Monthly Finance Report", employee: "Alice Uwimana", department: "Finance", type: "Monthly", submittedAt: "May 5, 2026", priority: "high" },
    { id: 2, title: "Weekly Ops Update", employee: "Jean Mugisha", department: "Finance", type: "Weekly", submittedAt: "May 4, 2026", priority: "normal" },
    { id: 3, title: "Budget Variance Report", employee: "Diane Mukamana", department: "Finance", type: "Bi-Weekly", submittedAt: "May 3, 2026", priority: "high" },
    { id: 4, title: "Staff Training Summary", employee: "Grace Iradukunda", department: "Finance", type: "Monthly", submittedAt: "May 2, 2026", priority: "normal" },
];

const deptCompliance = [
    { name: "Finance — Submission Progress", submitted: 11, total: 14, color: "violet" },
];

const recentlyReviewed = [
    { name: "Q1 Finance Overview", employee: "Alice Uwimana", action: "Approved", date: "May 1, 2026" },
    { name: "April Expense Report", employee: "Jean Mugisha", action: "Changes Requested", date: "Apr 29, 2026" },
    { name: "Compliance Checklist", employee: "Diane Mukamana", action: "Approved", date: "Apr 28, 2026" },
];

const ACTION_BADGE = {
    Approved: "bg-emerald-100 text-emerald-700",
    "Changes Requested": "bg-amber-100 text-amber-700",
    Rejected: "bg-rose-100 text-rose-700",
};

export default function ReviewerDashboard() {
    // Stats are derived from ReviewQueue's internal done state via onAction callback
    // We track counts here so the StatsGrid stays reactive
    const [actionLog, setActionLog] = useState([]);

    const reviewedCount = actionLog.length;
    const pendingCount = pendingItems.length - reviewedCount;

    const stats = [
        { label: "Awaiting Review", value: pendingCount, icon: "⏳", color: "amber" },
        { label: "Reviewed Today", value: reviewedCount, icon: "✅", color: "emerald" },
        { label: "Dept. Submitted", value: 11, icon: "📤", color: "indigo" },
        { label: "Dept. Approved", value: 8, icon: "📊", color: "violet" },
    ];

    function handleAction(id, action, comment) {
        setActionLog((prev) => [...prev, { id, action, comment }]);
        console.log("Reviewer action:", { id, action, comment });
        // TODO: call your API here → PATCH /api/reports/:id/review
    }

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

                {/* ── StatsGrid ── */}
                <div className="mb-6">
                    <StatsGrid stats={stats} cols={4} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── ReviewQueue (stage 1) ── */}
                    <div className="lg:col-span-2">
                        <ReviewQueue
                            items={pendingItems}
                            onAction={handleAction}
                            stage={1}
                            title="Pending Review Queue"
                        />
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {/* ── ComplianceBar for this department ── */}
                        <ComplianceBar
                            departments={deptCompliance}
                            title="Finance Department"
                        />

                        {/* Recently Reviewed — simple list, no extra component needed */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <span className="font-bold text-sm text-gray-800">Recently Reviewed</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {recentlyReviewed.map((r) => (
                                    <div key={r.name} className="px-5 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                                            <p className="text-[10px] text-gray-400">{r.employee} · {r.date}</p>
                                        </div>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${ACTION_BADGE[r.action] ?? "bg-gray-100 text-gray-600"}`}>
                                            {r.action}
                                        </span>
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