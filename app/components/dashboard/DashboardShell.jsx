"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV = {
    admin: [
        { label: "Overview", href: "/dashboard/admin", icon: "grid" },
        { label: "Departments", href: "/dashboard/admin/departments", icon: "building" },
        { label: "Teams", href: "/dashboard/admin/teams", icon: "users" },
        { label: "Schedules", href: "/dashboard/admin/schedules", icon: "calendar" },
        { label: "Reports", href: "/dashboard/admin/reports", icon: "file-text" },
        { label: "Employees", href: "/dashboard/admin/employees", icon: "user" },
    ],
    employee: [
        { label: "Overview", href: "/dashboard/employee", icon: "grid" },
        { label: "My Reports", href: "/dashboard/employee/reports", icon: "file-text" },
        { label: "Submit Report", href: "/dashboard/employee/reports/new", icon: "plus-circle" },
    ],
    reviewer: [
        { label: "Overview", href: "/dashboard/reviewer", icon: "grid" },
        { label: "Review Queue", href: "/dashboard/reviewer/queue", icon: "inbox" },
        { label: "History", href: "/dashboard/reviewer/history", icon: "clock" },
    ],
    approver: [
        { label: "Overview", href: "/dashboard/approver", icon: "grid" },
        { label: "Approvals", href: "/dashboard/approver/approvals", icon: "check-circle" },
        { label: "History", href: "/dashboard/approver/history", icon: "clock" },
    ],
};

const ROLE_LABELS = { admin: "Admin", employee: "Employee", reviewer: "Reviewer", approver: "Approver" };

function getInitials(name) {
    return (name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const Icon = ({ name }) => {
    const S = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" };
    switch (name) {
        case "grid": return <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
        case "building": return <svg {...S}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg>;
        case "users": return <svg {...S}><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3M20 21c0-2.21-1.79-4-4-4M1 21c0-2.761 2.239-5 5-5h6c2.761 0 5 2.239 5 5" /><circle cx="9" cy="7" r="4" /></svg>;
        case "calendar": return <svg {...S}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
        case "file-text": return <svg {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
        case "user": return <svg {...S}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
        case "plus-circle": return <svg {...S}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
        case "inbox": return <svg {...S}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
        case "clock": return <svg {...S}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
        case "check-circle": return <svg {...S}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
        default: return <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    }
};

export default function DashboardShell({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = user?.role ?? "employee";
    const navItems = NAV[role] ?? NAV.employee;

    const isActive = (href) => {
        if (href === `/dashboard/${role}`) return pathname === href;
        return pathname.startsWith(href);
    };

    const NavLinks = ({ onNavigate }) => (
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${active
                                ? "bg-white/20 text-white shadow-sm"
                                : "text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        <span className="flex-shrink-0 w-4 flex items-center justify-center">
                            <Icon name={item.icon} />
                        </span>
                        {!collapsed && <span>{item.label}</span>}
                        {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                );
            })}
        </nav>
    );

    const SidebarInner = ({ onNavigate }) => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">R</div>
                {!collapsed && <span className="text-white font-bold text-base tracking-tight">ReportFlow</span>}
            </div>

            {/* Role label */}
            {!collapsed && (
                <div className="px-4 pt-4 pb-1">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                        {ROLE_LABELS[role]} Portal
                    </span>
                </div>
            )}

            <NavLinks onNavigate={onNavigate} />

            {/* User + logout */}
            <div className={`border-t border-white/10 p-3 ${collapsed ? "flex justify-center" : ""}`}>
                {collapsed ? (
                    <button onClick={logout} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(user?.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? "User"}</p>
                            <p className="text-white/40 text-xs truncate">{ROLE_LABELS[role]}</p>
                        </div>
                        <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors flex-shrink-0" title="Logout">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">

            {/* Desktop sidebar */}
            <aside
                className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
                style={{ background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%)" }}
            >
                <SidebarInner onNavigate={undefined} />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-56 flex flex-col md:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%)" }}
            >
                <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar */}
                <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">
                            {navItems.find(n => isActive(n.href))?.label ?? "Dashboard"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(user?.full_name)}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}