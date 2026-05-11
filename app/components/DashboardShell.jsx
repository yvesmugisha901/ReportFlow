"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPendingUsers } from "@/lib/api/admin.api";

const NAV = {
    admin: [
        { label: "Overview", href: "/dashboard/admin", icon: "grid" },
        { label: "Departments", href: "/dashboard/admin/departments", icon: "building" },
        { label: "Teams", href: "/dashboard/admin/teams", icon: "users" },
        { label: "Schedules", href: "/dashboard/admin/schedules", icon: "calendar" },
        { label: "Reports", href: "/dashboard/admin/reports", icon: "file-text" },
        { label: "Employees", href: "/dashboard/admin/employees", icon: "user" },
        { label: "Pending Approvals", href: "/dashboard/admin/approvals", icon: "clock", badge: true },
        { label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: "shield" },
        { label: "Settings", href: "/dashboard/admin/settings", icon: "settings" },
    ],
    employee: [
        { label: "Overview", href: "/dashboard/employee", icon: "grid" },
        { label: "My Reports", href: "/dashboard/employee/reports", icon: "file-text" },
        { label: "Notifications", href: "/dashboard/employee/notifications", icon: "bell", badge: true, badgeKey: "notifications" },
        { label: "Settings", href: "/dashboard/employee/settings", icon: "settings" },
    ],
    reviewer: [
        { label: "Overview", href: "/dashboard/reviewer", icon: "grid" },
        { label: "Review Queue", href: "/dashboard/reviewer/queue", icon: "inbox", badge: true, badgeKey: "queue" },
        { label: "History", href: "/dashboard/reviewer/history", icon: "clock" },
        { label: "Settings", href: "/dashboard/reviewer/settings", icon: "settings" },
    ],
    approver: [
        { label: "Overview", href: "/dashboard/approver", icon: "grid" },
        { label: "Approvals", href: "/dashboard/approver/approvals", icon: "check-circle", badge: true, badgeKey: "queue" },
        { label: "History", href: "/dashboard/approver/history", icon: "clock" },
        { label: "Settings", href: "/dashboard/approver/settings", icon: "settings" },
    ],
};

const ROLE_LABELS = { admin: "Admin", employee: "Employee", reviewer: "Reviewer", approver: "Approver" };
const ROLE_COLORS = { admin: "#6366f1", employee: "#0ea5e9", reviewer: "#8b5cf6", approver: "#10b981" };

function getInitials(name) {
    return (name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const Icon = ({ name }) => {
    const S = { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" };
    switch (name) {
        case "grid": return <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
        case "building": return <svg {...S}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg>;
        case "users": return <svg {...S}><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3M20 21c0-2.21-1.79-4-4-4M1 21c0-2.761 2.239-5 5-5h6c2.761 0 5 2.239 5 5" /><circle cx="9" cy="7" r="4" /></svg>;
        case "calendar": return <svg {...S}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
        case "file-text": return <svg {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
        case "user": return <svg {...S}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
        case "clock": return <svg {...S}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
        case "shield": return <svg {...S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
        case "settings": return <svg {...S}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
        case "bell": return <svg {...S}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
        case "inbox": return <svg {...S}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
        case "check-circle": return <svg {...S}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
        case "logout": return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
        case "menu": return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
        case "chevronLeft": return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
        case "chevronRight": return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
        default: return <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    }
};

const GLOBAL_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

.rf-shell, .rf-shell *, .rf-shell *::before, .rf-shell *::after {
    box-sizing: border-box;
}
.rf-shell {
    --rf-sidebar-w: 220px;
    --rf-sidebar-collapsed: 60px;
    --rf-topbar-h: 56px;
    --rf-brand: #4f46e5;
    --rf-text-primary: #111827;
    --rf-text-secondary: #6b7280;
    --rf-text-muted: #9ca3af;
    --rf-bg-page: #f9fafb;
    --rf-bg-white: #ffffff;
    --rf-border: #e5e7eb;
    --rf-border-light: #f3f4f6;
    --rf-hover: #f9fafb;
    --rf-active-bg: #eef2ff;
    --rf-active-text: #4338ca;
    --rf-badge-red: #ef4444;
    --rf-radius-sm: 6px;
    --rf-radius-md: 10px;
    --rf-transition: 200ms cubic-bezier(.4,0,.2,1);
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.rf-sidebar nav::-webkit-scrollbar { display: none; }
.rf-sidebar nav { scrollbar-width: none; -ms-overflow-style: none; }
.rf-shell { display: flex; height: 100vh; background: var(--rf-bg-page); overflow: hidden; }
.rf-sidebar {
    display: flex; flex-direction: column; flex-shrink: 0;
    width: var(--rf-sidebar-w);
    background: var(--rf-bg-white);
    border-right: 1px solid var(--rf-border-light);
    transition: width var(--rf-transition);
    overflow: hidden; z-index: 30;
}
.rf-sidebar.collapsed { width: var(--rf-sidebar-collapsed); }
.rf-brand {
    display: flex; align-items: center; gap: 10px;
    padding: 0 14px; height: var(--rf-topbar-h);
    border-bottom: 1px solid var(--rf-border-light);
    flex-shrink: 0; overflow: hidden; white-space: nowrap;
}
.rf-brand-icon {
    width: 30px; height: 30px; border-radius: var(--rf-radius-sm);
    background: var(--rf-brand); display: flex; align-items: center;
    justify-content: center; color: #fff; font-weight: 700; font-size: 13px;
    flex-shrink: 0; letter-spacing: -.5px;
}
.rf-brand-name {
    font-size: 14.5px; font-weight: 600; color: var(--rf-text-primary);
    letter-spacing: -.3px; opacity: 1; transition: opacity var(--rf-transition);
}
.rf-sidebar.collapsed .rf-brand-name { opacity: 0; pointer-events: none; }
.rf-nav {
    flex: 1; padding: 10px 8px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 4px;
}
.rf-nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px;
    border-radius: var(--rf-radius-md); font-size: 13.5px; font-weight: 450;
    color: var(--rf-text-secondary); text-decoration: none;
    transition: background var(--rf-transition), color var(--rf-transition);
    white-space: nowrap; overflow: hidden; position: relative; cursor: pointer;
}
.rf-nav-item:hover { background: var(--rf-hover); color: var(--rf-text-primary); }
.rf-nav-item.active { background: var(--rf-active-bg); color: var(--rf-active-text); font-weight: 500; }
.rf-nav-item .rf-nav-icon { flex-shrink: 0; width: 16px; display: flex; align-items: center; justify-content: center; }
.rf-nav-label { flex: 1; transition: opacity var(--rf-transition), width var(--rf-transition); }
.rf-sidebar.collapsed .rf-nav-label { opacity: 0; width: 0; pointer-events: none; }
.rf-badge {
    min-width: 18px; height: 18px; padding: 0 5px;
    background: var(--rf-badge-red); color: #fff; font-size: 10px; font-weight: 700;
    border-radius: 20px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: opacity var(--rf-transition);
}
.rf-sidebar.collapsed .rf-badge { opacity: 0; pointer-events: none; }
.rf-badge-dot {
    position: absolute; top: 7px; right: 7px; width: 7px; height: 7px;
    background: var(--rf-badge-red); border-radius: 50%; border: 1.5px solid #fff;
    opacity: 0; transition: opacity var(--rf-transition);
}
.rf-sidebar.collapsed .rf-badge-dot { opacity: 1; }
.rf-active-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--rf-active-text); flex-shrink: 0;
    transition: opacity var(--rf-transition);
}
.rf-sidebar.collapsed .rf-active-dot { opacity: 0; }
.rf-nav-divider { height: 1px; background: var(--rf-border-light); margin: 6px 2px; flex-shrink: 0; }
.rf-user-footer { padding: 10px 8px; border-top: 1px solid var(--rf-border-light); flex-shrink: 0; }
.rf-user-card {
    display: flex; align-items: center; gap: 9px; padding: 8px 10px;
    border-radius: var(--rf-radius-md); overflow: hidden; white-space: nowrap;
    transition: background var(--rf-transition);
}
.rf-user-card:hover { background: var(--rf-hover); }
.rf-avatar {
    width: 30px; height: 30px; border-radius: 8px; display: flex;
    align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
    flex-shrink: 0; color: #fff; letter-spacing: .3px;
}
.rf-user-info { flex: 1; min-width: 0; transition: opacity var(--rf-transition); }
.rf-sidebar.collapsed .rf-user-info { opacity: 0; pointer-events: none; width: 0; }
.rf-user-name { font-size: 12.5px; font-weight: 500; color: var(--rf-text-primary); overflow: hidden; white-space: nowrap; }
.rf-user-role { font-size: 11px; color: var(--rf-text-muted); overflow: hidden; white-space: nowrap; }
.rf-logout-btn {
    width: 28px; height: 28px; border-radius: var(--rf-radius-sm); border: none;
    background: transparent; color: var(--rf-text-muted);
    display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
    transition: background var(--rf-transition), color var(--rf-transition), opacity var(--rf-transition);
}
.rf-logout-btn:hover { background: #fee2e2; color: #dc2626; }
.rf-sidebar.collapsed .rf-logout-btn { opacity: 0; pointer-events: none; }
.rf-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.rf-topbar {
    display: flex; align-items: center; justify-content: space-between;
    height: var(--rf-topbar-h); padding: 0 20px 0 16px;
    background: var(--rf-bg-white); border-bottom: 1px solid var(--rf-border-light);
    flex-shrink: 0; gap: 12px;
}
.rf-topbar-left { display: flex; align-items: center; gap: 8px; }
.rf-topbar-right { display: flex; align-items: center; gap: 6px; }
.rf-breadcrumb { display: flex; align-items: center; gap: 5px; }
.rf-breadcrumb-sep { color: var(--rf-text-muted); font-size: 13px; }
.rf-breadcrumb-page { font-size: 13.5px; font-weight: 500; color: var(--rf-text-primary); letter-spacing: -.1px; }
.rf-toggle-btn {
    width: 30px; height: 30px; border-radius: var(--rf-radius-sm); border: none;
    background: transparent; color: var(--rf-text-muted);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: background var(--rf-transition), color var(--rf-transition);
}
.rf-toggle-btn:hover { background: var(--rf-hover); color: var(--rf-text-primary); }
.rf-hamburger {
    width: 32px; height: 32px; border-radius: var(--rf-radius-sm); border: none;
    background: transparent; display: flex; align-items: center; justify-content: center;
    color: var(--rf-text-secondary); cursor: pointer;
}
.rf-icon-btn {
    position: relative; width: 32px; height: 32px; border-radius: var(--rf-radius-sm);
    border: none; background: transparent; display: flex; align-items: center;
    justify-content: center; color: var(--rf-text-secondary); cursor: pointer;
    transition: background var(--rf-transition), color var(--rf-transition); text-decoration: none;
}
.rf-icon-btn:hover { background: var(--rf-hover); color: var(--rf-text-primary); }
.rf-badge-dot-top {
    position: absolute; top: 5px; right: 5px; width: 7px; height: 7px;
    background: var(--rf-badge-red); border-radius: 50%; border: 1.5px solid #fff;
}
.rf-topbar-avatar {
    width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-size: 11px; font-weight: 700; color: #fff;
    cursor: default; letter-spacing: .3px;
}
.rf-content { flex: 1; overflow-y: auto; }
.rf-content::-webkit-scrollbar { width: 4px; }
.rf-content::-webkit-scrollbar-track { background: transparent; }
.rf-content::-webkit-scrollbar-thumb { background: var(--rf-border); border-radius: 4px; }
.rf-mobile-overlay {
    position: fixed; inset: 0; z-index: 40;
    background: rgba(0,0,0,.15); backdrop-filter: blur(2px);
}
.rf-mobile-sidebar {
    position: fixed; inset-y: 0; left: 0; z-index: 50;
    --rf-sidebar-w: 220px; --rf-bg-white: #ffffff; --rf-border-light: #f3f4f6;
    --rf-text-primary: #111827; --rf-text-secondary: #6b7280; --rf-text-muted: #9ca3af;
    --rf-hover: #f9fafb; --rf-active-bg: #eef2ff; --rf-active-text: #4338ca;
    --rf-badge-red: #ef4444; --rf-radius-sm: 6px; --rf-radius-md: 10px;
    --rf-transition: 200ms cubic-bezier(.4,0,.2,1);
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    width: var(--rf-sidebar-w); display: flex; flex-direction: column;
    background: var(--rf-bg-white); border-right: 1px solid var(--rf-border-light);
    transform: translateX(-100%); transition: transform 280ms cubic-bezier(.4,0,.2,1); overflow: hidden;
}
.rf-mobile-sidebar.open { transform: translateX(0); }
@media (max-width: 768px) { .rf-sidebar { display: none; } .rf-desktop-only { display: none !important; } }
@media (min-width: 769px) { .rf-mobile-only { display: none !important; } }
`;

let styleInjected = false;
function injectStyles() {
    if (styleInjected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
    styleInjected = true;
}

export default function DashboardShell({ children }) {
    injectStyles();

    const { user, logout, refreshUser } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);

    const role = user?.role ?? "employee";
    const navItems = NAV[role] ?? NAV.employee;
    const roleColor = ROLE_COLORS[role] ?? "#6366f1";

    /* stale-role guard */
    useEffect(() => {
        if (!user) return;
        const urlRole = pathname.split("/")[2];
        if (urlRole && urlRole !== user.role) refreshUser();
    }, [user, pathname, refreshUser]);

    /* ── Notification count fetcher (memoized so we can call it on demand) ── */
    const fetchNotifCount = useCallback(async () => {
        try {
            const { default: api } = await import("@/lib/axios");
            const res = await api.get("/notifications/unread-count");
            setNotifCount(res.data.count ?? 0);
        } catch { }
    }, []);

    /* ── Badge counts ── */
    useEffect(() => {
        if (role === "admin") {
            const fetchPending = async () => {
                try {
                    const data = await getPendingUsers();
                    setPendingCount(data.count ?? (data.users ?? []).length);
                } catch { }
            };
            fetchPending();
            const t = setInterval(fetchPending, 60000);
            return () => clearInterval(t);
        }

        if (role === "reviewer" || role === "approver") {
            const fetchQueue = async () => {
                try {
                    const { default: api } = await import("@/lib/axios");
                    const res = await api.get("/reviews/pending");
                    setPendingCount((res.data.reports ?? []).length);
                } catch { }
            };
            fetchQueue();
            const t = setInterval(fetchQueue, 60000);
            return () => clearInterval(t);
        }

        if (role === "employee") {
            // Fetch immediately on mount
            fetchNotifCount();
            // Then poll every 30s
            const t = setInterval(fetchNotifCount, 30000);
            return () => clearInterval(t);
        }
    }, [role, fetchNotifCount]);

    /* ── Re-fetch count whenever user navigates away FROM notifications page ──
       This ensures badge clears after user reads notifications without
       waiting for the next 30s poll cycle                                    */
    useEffect(() => {
        if (role === "employee" && pathname !== "/dashboard/employee/notifications") {
            fetchNotifCount();
        }
    }, [pathname, role, fetchNotifCount]);

    /* ── isActive: exact for root, prefix for sections ── */
    const isActive = (href) => {
        if (href === `/dashboard/${role}`) return pathname === href;
        return pathname === href || pathname.startsWith(href + "/");
    };

    function getBadgeCount(item) {
        if (!item.badge) return 0;
        if (item.badgeKey === "notifications") return notifCount;
        if (item.badgeKey === "queue") return pendingCount;
        return pendingCount;
    }

    const activeLabel = [...navItems]
        .reverse()
        .find(n => isActive(n.href))?.label ?? "Dashboard";

    const initials = getInitials(user?.full_name);
    const shouldDivide = (idx) => navItems[idx]?.icon === "settings" && idx > 0;

    // Bell href — always visible for employee, shown for others when count > 0
    const bellHref = role === "employee"
        ? "/dashboard/employee/notifications"
        : role === "admin"
            ? "/dashboard/admin/approvals"
            : "#";

    const notifTotal = role === "employee" ? notifCount : pendingCount;

    const SidebarContent = ({ onNavigate }) => (
        <>
            <div className="rf-brand">
                <div className="rf-brand-icon">RF</div>
                <span className="rf-brand-name">ReportFlow</span>
            </div>

            <nav className="rf-nav" role="navigation" aria-label="Main navigation">
                {navItems.map((item, idx) => {
                    const active = isActive(item.href);
                    const count = getBadgeCount(item);
                    return (
                        <div key={item.href}>
                            {shouldDivide(idx) && <div className="rf-nav-divider" />}
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                className={`rf-nav-item${active ? " active" : ""}`}
                                aria-current={active ? "page" : undefined}
                            >
                                <span className="rf-nav-icon" aria-hidden="true">
                                    <Icon name={item.icon} />
                                </span>
                                <span className="rf-nav-label">{item.label}</span>
                                {count > 0 && (
                                    <>
                                        <span className="rf-badge" aria-label={`${count} pending`}>
                                            {count > 99 ? "99+" : count}
                                        </span>
                                        <span className="rf-badge-dot" aria-hidden="true" />
                                    </>
                                )}
                                {active && count === 0 && (
                                    <span className="rf-active-dot" aria-hidden="true" />
                                )}
                            </Link>
                        </div>
                    );
                })}
            </nav>

            <div className="rf-user-footer">
                <div className="rf-user-card">
                    <div className="rf-avatar" style={{ background: roleColor }}>
                        {initials}
                    </div>
                    <div className="rf-user-info">
                        <p className="rf-user-name">{user?.full_name ?? "User"}</p>
                        <p className="rf-user-role">{ROLE_LABELS[role]}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="rf-logout-btn"
                        title="Sign out"
                        aria-label="Sign out"
                    >
                        <Icon name="logout" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="rf-shell">
            {/* Desktop sidebar */}
            <aside className={`rf-sidebar rf-desktop-only${collapsed ? " collapsed" : ""}`} aria-label="Sidebar">
                <SidebarContent onNavigate={undefined} />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="rf-mobile-overlay rf-mobile-only"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`rf-mobile-sidebar rf-mobile-only${mobileOpen ? " open" : ""}`}
                aria-label="Mobile sidebar"
            >
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>

            {/* Main */}
            <div className="rf-main">
                <header className="rf-topbar">
                    <div className="rf-topbar-left">
                        <button
                            className="rf-hamburger rf-mobile-only"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <Icon name="menu" />
                        </button>

                        <button
                            className="rf-toggle-btn rf-desktop-only"
                            onClick={() => setCollapsed(c => !c)}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <Icon name="chevronRight" /> : <Icon name="chevronLeft" />}
                        </button>

                        <div className="rf-breadcrumb">
                            <span className="rf-breadcrumb-sep" aria-hidden="true">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                            <span className="rf-breadcrumb-page">{activeLabel}</span>
                        </div>
                    </div>

                    <div className="rf-topbar-right">
                        {/* Bell — always shown for employee, shown for others when count > 0 */}
                        {(role === "employee" || notifTotal > 0) && (
                            <Link
                                href={bellHref}
                                className="rf-icon-btn"
                                aria-label={notifTotal > 0
                                    ? `${notifTotal} unread notification${notifTotal !== 1 ? "s" : ""}`
                                    : "Notifications"}
                            >
                                <Icon name="bell" />
                                {notifTotal > 0 && (
                                    <span className="rf-badge-dot-top" aria-hidden="true" />
                                )}
                            </Link>
                        )}

                        <div
                            className="rf-topbar-avatar"
                            style={{ background: roleColor }}
                            title={user?.full_name ?? "User"}
                        >
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="rf-content" id="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}