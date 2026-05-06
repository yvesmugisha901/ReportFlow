"use client";
import { useState } from "react";
import Link from "next/link";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReportTable from "@/components/dashboard/ReportTable";
import ComplianceBar from "@/components/dashboard/ComplianceBar";

const stats = [
    { label: "Total Reports", value: "248", icon: "📋", trend: "12 this month", trendUp: true, color: "indigo" },
    { label: "Pending Review", value: "17", icon: "⏳", trend: "5 overdue", trendUp: false, color: "amber" },
    { label: "Approved", value: "198", icon: "✅", trend: "8 this week", trendUp: true, color: "emerald" },
    { label: "Departments", value: "6", icon: "🏢", trend: "All active", trendUp: true, color: "sky" },
    { label: "Employees", value: "54", icon: "👥", trend: "2 this month", trendUp: true, color: "violet" },
    { label: "Compliance Rate", value: "89%", icon: "📊", trend: "3% vs last month", trendUp: false, color: "rose" },
];

const recentReports = [
    { id: 1, title: "Monthly Finance Report", employee: "Alice Uwimana", department: "Finance", type: "Monthly", submittedAt: "May 5, 2026", status: "Approved" },
    { id: 2, title: "Q2 Operations Summary", employee: "Jean Mugisha", department: "Operations", type: "Quarterly", submittedAt: "May 4, 2026", status: "Under Review" },
    { id: 3, title: "HR Compliance Report", employee: "Grace Iradukunda", department: "Human Resources", type: "Monthly", submittedAt: "May 3, 2026", status: "Pending" },
    { id: 4, title: "IT Infrastructure Report", employee: "Eric Nshimiyimana", department: "IT", type: "Monthly", submittedAt: "May 2, 2026", status: "Changes Requested" },
    { id: 5, title: "Sales Pipeline Summary", employee: "Diane Mukamana", department: "Sales", type: "Monthly", submittedAt: "May 1, 2026", status: "Approved" },
];

const departments = [
    { name: "Finance", submitted: 8, total: 10, color: "indigo" },
    { name: "Operations", submitted: 6, total: 8, color: "violet" },
    { name: "Human Resources", submitted: 4, total: 6, color: "sky" },
    { name: "IT", submitted: 7, total: 8, color: "emerald" },
    { name: "Sales", submitted: 5, total: 10, color: "amber" },
    { name: "Legal", submitted: 3, total: 4, color: "rose" },
];

const quickActions = [
    { label: "Create Department", href: "/dashboard/admin/departments", icon: "🏢", color: "hover:border-indigo-300 hover:bg-indigo-50" },
    { label: "Add Team", href: "/dashboard/admin/teams", icon: "👥", color: "hover:border-violet-300 hover:bg-violet-50" },
    { label: "Define Schedule", href: "/dashboard/admin/schedules", icon: "🗓️", color: "hover:border-sky-300 hover:bg-sky-50" },
    { label: "View All Reports", href: "/dashboard/admin/reports", icon: "📋", color: "hover:border-emerald-300 hover:bg-emerald-50" },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Hey 👋</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                        <Link
                            href="/dashboard/admin/employees/new"
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Employee
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-8 shadow-sm">
                    {["overview", "reports", "departments", "employees"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── StatsGrid ── */}
                <div className="mb-6">
                    <StatsGrid stats={stats} cols={4} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── ReportTable ── */}
                    <div className="lg:col-span-2">
                        <ReportTable
                            reports={recentReports}
                            showEmployee={true}
                            onView={(report) => console.log("View report:", report.id)}
                        />
                    </div>

                    {/* ── ComplianceBar ── */}
                    <ComplianceBar departments={departments} title="Dept. Compliance" />
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((a) => (
                        <Link
                            key={a.label}
                            href={a.href}
                            className={`bg-white border border-gray-200 rounded-2xl p-4 text-center transition-all shadow-sm hover:shadow-md ${a.color} group`}
                        >
                            <div className="text-2xl mb-2">{a.icon}</div>
                            <div className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{a.label}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}