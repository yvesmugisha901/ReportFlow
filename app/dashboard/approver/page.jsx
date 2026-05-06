"use client";
import { useState } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import ComplianceBar from "@/components/dashboard/ComplianceBar";
import ReportTable from "@/components/dashboard/ReportTable";

const pendingItems = [
    { id: 1, title: "Monthly Finance Report", employee: "Alice Uwimana", department: "Finance", type: "Monthly", submittedAt: "May 5, 2026", stage1Reviewer: "Eric Nshimiyimana" },
    { id: 2, title: "Budget Variance Report", employee: "Diane Mukamana", department: "Finance", type: "Bi-Weekly", submittedAt: "May 4, 2026", stage1Reviewer: "Eric Nshimiyimana" },
    { id: 3, title: "Q2 Operations Summary", employee: "Jean Mugisha", department: "Operations", type: "Quarterly", submittedAt: "May 3, 2026", stage1Reviewer: "Solange Uwase" },
    { id: 4, title: "HR Staff Report", employee: "Grace Iradukunda", department: "Human Resources", type: "Monthly", submittedAt: "May 2, 2026", stage1Reviewer: "Patrick Habimana" },
];

const allReports = [
    { id: 10, title: "Monthly Finance Report", employee: "Alice Uwimana", department: "Finance", type: "Monthly", submittedAt: "May 5", status: "Under Review" },
    { id: 11, title: "Q1 Company Overview", employee: "All Depts", department: "All", type: "Quarterly", submittedAt: "Apr 30", status: "Approved" },
    { id: 12, title: "IT Infrastructure Q1", employee: "Eric N.", department: "IT", type: "Quarterly", submittedAt: "Apr 28", status: "Approved" },
    { id: 13, title: "HR Compliance Report", employee: "Grace I.", department: "HR", type: "Monthly", submittedAt: "Apr 25", status: "Rejected" },
    { id: 14, title: "Sales Pipeline Apr", employee: "Diane M.", department: "Sales", type: "Monthly", submittedAt: "Apr 22", status: "Approved" },
];

const departments = [
    { name: "Finance", submitted: 9, total: 10, color: "indigo" },
    { name: "Operations", submitted: 6, total: 8, color: "violet" },
    { name: "Human Resources", submitted: 4, total: 6, color: "sky" },
    { name: "IT", submitted: 7, total: 8, color: "emerald" },
    { name: "Sales", submitted: 5, total: 10, color: "amber" },
    { name: "Legal", submitted: 3, total: 4, color: "rose" },
];

const overallCompliance = Math.round(
    departments.reduce((sum, d) => sum + (d.submitted / d.total) * 100, 0) / departments.length
);

export default function ApproverDashboard() {
    const [actionLog, setActionLog] = useState([]);

    const approvedCount = actionLog.filter((a) => a.action === "approve").length;
    const pendingCount = pendingItems.length - actionLog.length;

    const stats = [
        { label: "Awaiting Sign-off", value: pendingCount, icon: "⏳", color: "amber" },
        { label: "Approved Today", value: approvedCount, icon: "✅", color: "emerald" },
        { label: "Total Reports", value: 248, icon: "📋", color: "indigo" },
        { label: "Compliance Rate", value: `${overallCompliance}%`, icon: "📊", color: "violet" },
    ];

    function handleAction(id, action, comment) {
        setActionLog((prev) => [...prev, { id, action, comment }]);
        console.log("COO action:", { id, action, comment });
        // TODO: call your API here → PATCH /api/reports/:id/approve
    }

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
                            {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
                        </button>
                        <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
                            Overall Compliance: <span className="text-emerald-600">{overallCompliance}%</span>
                        </div>
                    </div>
                </div>

                {/* ── StatsGrid ── */}
                <div className="mb-6">
                    <StatsGrid stats={stats} cols={4} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* ── ReviewQueue (stage 2) ── */}
                        <ReviewQueue
                            items={pendingItems}
                            onAction={handleAction}
                            stage={2}
                            title="Stage 2 — Final Approval Queue"
                        />

                        {/* ── ReportTable — all reports overview ── */}
                        <ReportTable
                            reports={allReports}
                            showEmployee={true}
                            onView={(report) => console.log("View report:", report.id)}
                        />
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {/* ── ComplianceBar ── */}
                        <ComplianceBar departments={departments} title="Dept. Compliance" />

                        {/* Gradient summary card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-200">
                            <p className="text-indigo-200 text-xs font-semibold mb-1">Overall Status</p>
                            <p className="text-white text-3xl font-extrabold mb-1">{overallCompliance}%</p>
                            <p className="text-indigo-200 text-xs mb-4">Org compliance this period</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Approved", val: 198 },
                                    { label: "Pending", val: 17 },
                                    { label: "Rejected", val: 12 },
                                    { label: "In Review", val: 21 },
                                ].map((item) => (
                                    <div key={item.label} className="bg-white/10 rounded-xl p-2.5 text-center">
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