"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPendingUsers } from "@/lib/api/admin.api";

const NAV = {
    admin: [
        { label: "Overview", href: "/dashboard/admin", icon: "⊞" },
        { label: "Departments", href: "/dashboard/admin/departments", icon: "🏢" },
        { label: "Teams", href: "/dashboard/admin/teams", icon: "👥" },
        { label: "Schedules", href: "/dashboard/admin/schedules", icon: "🗓️" },
        { label: "Reports", href: "/dashboard/admin/reports", icon: "📋" },
        { label: "Employees", href: "/dashboard/admin/employees", icon: "👤" },
        { label: "Pending Approvals", href: "/dashboard/admin/approvals", icon: "⏳", badge: true },
    ],
    employee: [
        { label: "Overview", href: "/dashboard/employee", icon: "⊞" },
        { label: "My Reports", href: "/dashboard/employee/reports", icon: "📋" },
        { label: "Submit Report", href: "/dashboard/employee/reports/new", icon: "➕" },
    ],
    reviewer: [
        { label: "Overview", href: "/dashboard/reviewer", icon: "⊞" },
        { label: "Review Queue", href: "/dashboard/reviewer/queue", icon: "📥" },
        { label: "History", href: "/dashboard/reviewer/history", icon: "🕓" },
    ],
    approver: [
        { label: "Overview", href: "/dashboard/approver", icon: "⊞" },
        { label: "Approvals", href: "/dashboard/approver/approvals", icon: "✅" },
        { label: "History", href: "/dashboard/approver/history", icon: "🕓" },
    ],
};

const ROLE_LABELS = { admin: "Admin", employee: "Employee", reviewer: "Reviewer", approver: "Approver" };

function getInitials(name) {
    return (name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function DashboardShell({ children }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const role = user?.role ?? "employee";
    const navItems = NAV[role] ?? NAV.employee;

    // Poll pending count every 60s for admin
    useEffect(() => {
        if (role !== "admin") return;

        const fetch = async () => {
            try {
                const data = await getPendingUsers();
                setPendingCount(data.count ?? (data.users ?? []).length ?? 0);
            } catch {
                // silently fail — badge just won't show
            }
        };

        fetch();
        const interval = setInterval(fetch, 60000);
        return () => clearInterval(interval);
    }, [role]);

    const isActive = (href) => {
        if (href === `/dashboard/${role}`) return pathname === href;
        return pathname.startsWith(href);
    };

    const NavLinks = ({ onNavigate }) => (
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
                const active = isActive(item.href);
                const count = item.badge ? pendingCount : 0;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${active
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                    >
                        <span className="text-base flex-shrink-0 w-5 text-center">{item.icon}</span>
                        {!collapsed && <span className="flex-1">{item.label}</span>}

                        {/* Pending badge */}
                        {!collapsed && count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                                {count > 99 ? "99+" : count}
                            </span>
                        )}

                        {/* Collapsed badge dot */}
                        {collapsed && count > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                        )}

                        {active && !collapsed && count === 0 && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );

    const SidebarInner = ({ onNavigate }) => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? "justify-center" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">R</div>
                {!collapsed && <span className="text-gray-900 font-bold text-base tracking-tight">ReportFlow</span>}
            </div>

            {/* Role label */}
            {!collapsed && (
                <div className="px-4 pt-4 pb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        {ROLE_LABELS[role]} Portal
                    </span>
                </div>
            )}

            <NavLinks onNavigate={onNavigate} />

            {/* User + logout */}
            <div className={`border-t border-gray-100 p-3 ${collapsed ? "flex justify-center" : ""}`}>
                {collapsed ? (
                    <button
                        onClick={logout}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                            {getInitials(user?.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-xs font-semibold truncate">{user?.full_name ?? "User"}</p>
                            <p className="text-gray-400 text-xs truncate">{ROLE_LABELS[role]}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                            title="Logout"
                        >
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
                className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-200 ${collapsed ? "w-16" : "w-56"}`}
            >
                <SidebarInner onNavigate={undefined} />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-56 flex flex-col md:hidden bg-white border-r border-gray-200 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar */}
                <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
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
                        {/* Pending approvals bell for admin */}
                        {role === "admin" && pendingCount > 0 && (
                            <Link
                                href="/dashboard/admin/approvals"
                                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                title={`${pendingCount} pending approval${pendingCount !== 1 ? "s" : ""}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                            </Link>
                        )}
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