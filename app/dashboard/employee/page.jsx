"use client";
import { useState } from "react";
import Link from "next/link";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReportTable from "@/components/dashboard/ReportTable";
import ScheduleList from "@/components/dashboard/ScheduleList";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ReportForm from "@/components/reports/ReportForm";

const myReports = [
    { id: 1, title: "Monthly Operations Report", employee: "Me", department: "Operations", type: "Monthly", submittedAt: null, status: "Pending" },
    { id: 2, title: "Q1 Team Performance", employee: "Me", department: "Operations", type: "Quarterly", submittedAt: "Apr 30, 2026", status: "Approved" },
    { id: 3, title: "Weekly Progress Update", employee: "Me", department: "Operations", type: "Weekly", submittedAt: "May 3, 2026", status: "Under Review" },
    { id: 4, title: "March Summary Report", employee: "Me", department: "Operations", type: "Monthly", submittedAt: "Apr 4, 2026", status: "Changes Requested" },
    { id: 5, title: "Safety Compliance Report", employee: "Me", department: "Operations", type: "Bi-Weekly", submittedAt: "Apr 19, 2026", status: "Approved" },
];

const schedules = [
    { id: 1, reportType: "Weekly Progress Update", department: "Operations", dueDate: "2026-05-13", frequency: "Weekly", submitted: false },
    { id: 2, reportType: "Monthly Operations Report", department: "Operations", dueDate: "2026-06-01", frequency: "Monthly", submitted: false },
    { id: 3, reportType: "Q2 Performance Review", department: "Operations", dueDate: "2026-07-01", frequency: "Quarterly", submitted: false },
];

const activities = [
    { id: 1, type: "approved", message: "Your report was approved by COO", reportTitle: "Q1 Team Performance", time: "2 hours ago" },
    { id: 2, type: "changes", message: "Changes requested on", reportTitle: "March Summary Report", time: "Yesterday" },
    { id: 3, type: "submitted", message: "You submitted", reportTitle: "Weekly Progress Update", time: "May 3" },
    { id: 4, type: "scheduled", message: "New report scheduled:", reportTitle: "Monthly Operations", time: "May 1" },
];

export default function EmployeeDashboard() {
    const [showForm, setShowForm] = useState(false);
    const [prefilledSchedule, setPrefilledSchedule] = useState(null);

    const pendingCount = myReports.filter((r) => r.status === "Pending").length;
    const approvedCount = myReports.filter((r) => r.status === "Approved").length;
    const changesCount = myReports.filter((r) => r.status === "Changes Requested").length;

    const stats = [
        { label: "Total Reports", value: myReports.length, icon: "📋", color: "indigo" },
        { label: "Approved", value: approvedCount, icon: "✅", color: "emerald" },
        { label: "Pending", value: pendingCount, icon: "⏳", color: "amber" },
        { label: "Needs Changes", value: changesCount, icon: "✏️", color: "rose" },
    ];

    function handleSubmitFromSchedule(schedule) {
        setPrefilledSchedule(schedule);
        setShowForm(true);
    }

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
                        {/* ── Submit Report button opens ReportForm modal ── */}
                        <button
                            onClick={() => { setPrefilledSchedule(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Report
                        </button>
                    </div>
                </div>

                {/* ── StatsGrid ── */}
                <div className="mb-6">
                    <StatsGrid stats={stats} cols={4} />
                </div>

                {/* Overdue banner */}
                {pendingCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-800">
                                You have {pendingCount} report{pendingCount > 1 ? "s" : ""} due
                            </p>
                            <p className="text-xs text-amber-600">
                                Monthly Operations Report is due May 10, 2026 — 4 days left
                            </p>
                        </div>
                        <button
                            onClick={() => { setPrefilledSchedule(null); setShowForm(true); }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            Submit Now
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── ReportTable (my own reports, hide employee column) ── */}
                    <div className="lg:col-span-2">
                        <ReportTable
                            reports={myReports}
                            showEmployee={false}
                            onView={(report) => console.log("View report:", report.id)}
                        />
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {/* ── ScheduleList — Submit button opens ReportForm ── */}
                        <ScheduleList
                            schedules={schedules}
                            onSubmit={handleSubmitFromSchedule}
                            title="Upcoming Schedule"
                        />

                        {/* ── ActivityFeed ── */}
                        <ActivityFeed
                            activities={activities}
                            title="Recent Activity"
                            maxItems={4}
                        />
                    </div>
                </div>
            </div>

            {/* ── ReportForm modal ── */}
            {showForm && (
                <ReportForm
                    prefill={prefilledSchedule}
                    onClose={() => setShowForm(false)}
                    onSubmit={(data) => {
                        console.log("Report submitted:", data);
                        setShowForm(false);
                    }}
                />
            )}
        </div>
    );
}