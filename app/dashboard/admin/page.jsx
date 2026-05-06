"use client";
import { useState } from "react";
import Link from "next/link";

const stats = [
    { label: "Total Reports", value: "248", icon: "📋", change: "+12 this month", up: true },
    { label: "Pending Review", value: "17", icon: "⏳", change: "5 overdue", up: false },
    { label: "Approved", value: "198", icon: "✅", change: "+8 this week", up: true },
    { label: "Departments", value: "6", icon: "🏢", change: "All active", up: true },
    { label: "Employees", value: "54", icon: "👥", change: "+2 this month", up: true },
    { label: "Compliance Rate", value: "89%", icon: "📊", change: "-3% vs last month", up: false },
];

const recentReports = [
    { name: "Monthly Finance Report", dept: "Finance", employee: "Alice Uwimana", status: "Approved", date: "May 5, 2026" },
    { name: "Q2 Operations Summary", dept: "Operations", employee: "Jean Mugisha", status: "Under Review", date: "May 4, 2026" },
    { name: "HR Compliance Report", dept: "Human Resources", employee: "Grace Iradukunda", status: "Pending", date: "May 3, 2026" },
    { name: "IT Infrastructure Report", dept: "IT", employee: "Eric Nshimiyimana", status: "Changes Requested", date: "May 2, 2026" },
    { name: "Sales Pipeline Summary", dept: "Sales", employee: "Diane Mukamana", status: "Approved", date: "May 1, 2026" },
];

const departments = [
    { name: "Finance", submitted: 8, total: 10, color: "bg-indigo-500" },
    { name: "Operations", submitted: 6, total: 8, color: "bg-violet-500" },
    { name: "Human Resources", submitted: 4, total: 6, color: "bg-sky-500" },
    { name: "IT", submitted: 7, total: 8, color: "bg-emerald-500" },
    { name: "Sales", submitted: 5, total: 10, color: "bg-amber-500" },
    { name: "Legal", submitted: 3, total: 4, color: "bg-rose-500" },
];

const statusColor = {
    Approved: "bg-emerald-100 text-emerald-700",
    "Under Review": "bg-amber-100 text-amber-700",
    Pending: "bg-gray-100 text-gray-600",
    "Changes Requested": "bg-rose-100 text-rose-700",
    Rejected: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            {/* Ambient */}
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
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="text-xl mb-2">{s.icon}</div>
                            <div className="text-2xl font-extrabold text-gray-900 mb-0.5">{s.value}</div>
                            <div className="text-[10px] text-gray-400 font-medium mb-1">{s.label}</div>
                            <div className={`text-[10px] font-semibold ${s.up ? "text-emerald-600" : "text-rose-500"}`}>
                                {s.up ? "↑" : "↓"} {s.change}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Reports */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <span className="font-bold text-sm text-gray-800">Recent Submissions</span>
                            <Link href="/dashboard/admin/reports" className="text-xs text-indigo-600 font-semibold hover:underline">
                                View all →
                            </Link>
                        </div>
                        <div>
                            {recentReports.map((r) => (
                                <div key={r.name} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="text-sm font-semibold text-gray-800 truncate">{r.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{r.dept} · {r.employee} · {r.date}</div>
                                    </div>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${statusColor[r.status]}`}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Compliance */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                            <span className="font-bold text-sm text-gray-800">Dept. Compliance</span>
                        </div>
                        <div className="p-5 space-y-4">
                            {departments.map((d) => {
                                const pct = Math.round((d.submitted / d.total) * 100);
                                return (
                                    <div key={d.name}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-xs font-medium text-gray-700">{d.name}</span>
                                            <span className="text-xs text-gray-500">{d.submitted}/{d.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`${d.color} h-2 rounded-full transition-all`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Create Department", href: "/dashboard/admin/departments", icon: "🏢", color: "hover:border-indigo-300 hover:bg-indigo-50" },
                        { label: "Add Team", href: "/dashboard/admin/teams", icon: "👥", color: "hover:border-violet-300 hover:bg-violet-50" },
                        { label: "Define Schedule", href: "/dashboard/admin/schedules", icon: "🗓️", color: "hover:border-sky-300 hover:bg-sky-50" },
                        { label: "View All Reports", href: "/dashboard/admin/reports", icon: "📋", color: "hover:border-emerald-300 hover:bg-emerald-50" },
                    ].map((a) => (
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