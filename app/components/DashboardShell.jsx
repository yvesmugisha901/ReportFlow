"use client";
import "./shell.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
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
        { label: "Notifications", href: "/dashboard/reviewer/notifications", icon: "bell", badge: true, badgeKey: "notifications" },
        { label: "History", href: "/dashboard/reviewer/history", icon: "clock" },
        { label: "Settings", href: "/dashboard/reviewer/settings", icon: "settings" },
    ],
    approver: [
        { label: "Overview", href: "/dashboard/approver", icon: "grid" },
        { label: "Approvals", href: "/dashboard/approver/approvals", icon: "check-circle", badge: true, badgeKey: "queue" },
        { label: "Notifications", href: "/dashboard/approver/notifications", icon: "bell", badge: true, badgeKey: "notifications" },
        { label: "History", href: "/dashboard/approver/history", icon: "clock" },
        { label: "Settings", href: "/dashboard/approver/settings", icon: "settings" },
    ],
};

const NOTIF_HREF = {
    employee: "/dashboard/employee/notifications",
    reviewer: "/dashboard/reviewer/notifications",
    approver: "/dashboard/approver/notifications",
};

const ROLE_LABELS = { admin: "Admin", employee: "Employee", reviewer: "Reviewer", approver: "Approver" };
const ROLE_COLORS = { admin: "#6366f1", employee: "#0ea5e9", reviewer: "#8b5cf6", approver: "#10b981" };

function getInitials(name) {
    return (name ?? "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * Derive the role from the URL path as a fallback.
 * /dashboard/approver/... → "approver"
 * This prevents the employee-nav flash when the cached user object
 * hasn't loaded yet but the URL already tells us the role.
 */
function roleFromPath(pathname) {
    const seg = pathname?.split("/")?.[2];
    return ["admin", "employee", "reviewer", "approver"].includes(seg) ? seg : null;
}

const Icon = ({ name, size = 16 }) => {
    const S = {
        width: size, height: size, viewBox: "0 0 24 24",
        fill: "none", stroke: "currentColor",
        strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round",
    };
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
        case "sidebarCollapse": return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9l-3 3 3 3" /></svg>;
        case "sidebarExpand": return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M12 9l3 3-3 3" /></svg>;
        case "notif-submitted": return <svg {...S}><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>;
        case "notif-reviewed": return <svg {...S}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
        case "notif-approved": return <svg {...S}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
        case "notif-rejected": return <svg {...S}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
        case "notif-changes": return <svg {...S}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
        case "notif-scheduled": return <svg {...S}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
        case "notif-info": return <svg {...S}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
        case "notif-empty": return <svg {...S}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
        default: return <svg {...S}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    }
};

// Maps event_type (DB column) → icon + colors
// Also handles legacy `type` field just in case
const TYPE_ICON_MAP = {
    submitted: { icon: "notif-submitted", color: "#6366f1", bg: "#eef2ff" },
    reviewed: { icon: "notif-reviewed", color: "#0ea5e9", bg: "#e0f2fe" },
    approved: { icon: "notif-approved", color: "#10b981", bg: "#d1fae5" },
    rejected: { icon: "notif-rejected", color: "#ef4444", bg: "#fee2e2" },
    changes_requested: { icon: "notif-changes", color: "#f59e0b", bg: "#fef3c7" },
    changes: { icon: "notif-changes", color: "#f59e0b", bg: "#fef3c7" },
    final_approved: { icon: "notif-approved", color: "#10b981", bg: "#d1fae5" },
    under_review: { icon: "notif-reviewed", color: "#0ea5e9", bg: "#e0f2fe" },
    report_due: { icon: "notif-scheduled", color: "#8b5cf6", bg: "#ede9fe" },
    scheduled: { icon: "notif-scheduled", color: "#8b5cf6", bg: "#ede9fe" },
    info: { icon: "notif-info", color: "#6b7280", bg: "#f3f4f6" },
};

function getTypeIcon(n) {
    // DB returns event_type; fall back to type for safety
    const key = n.event_type ?? n.type;
    return TYPE_ICON_MAP[key] ?? TYPE_ICON_MAP.info;
}

export default function DashboardShell({ children }) {
    const { user, logout, refreshUser } = useAuth();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [adminDropOpen, setAdminDropOpen] = useState(false);
    const adminDropRef = useRef(null);

    const {
        unreadCount: notifCount,
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // ── Role resolution ───────────────────────────────────────────────────────
    // Use the URL path as the primary source so the correct nav renders
    // immediately on load, even before getMe() resolves and updates user.role.
    const pathRole = roleFromPath(pathname);
    const role = pathRole ?? user?.role ?? "employee";
    // ─────────────────────────────────────────────────────────────────────────

    const navItems = NAV[role] ?? NAV.employee;
    const roleColor = ROLE_COLORS[role] ?? "#6366f1";
    const initials = getInitials(user?.full_name);
    const bellHref = NOTIF_HREF[role] ?? "/dashboard/employee/notifications";

    // Sync user object when URL role doesn't match stored role
    useEffect(() => {
        if (!user) return;
        if (pathRole && pathRole !== user.role) refreshUser();
    }, [user, pathRole, refreshUser]);

    // Close mobile sidebar on navigation
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Fetch pending counts for queue badge
    useEffect(() => {
        if (role === "admin") {
            const run = async () => {
                try {
                    const data = await getPendingUsers();
                    setPendingCount(data.count ?? (data.users ?? []).length);
                } catch { }
            };
            run();
            const t = setInterval(run, 60_000);
            return () => clearInterval(t);
        }
        if (role === "reviewer" || role === "approver") {
            const run = async () => {
                try {
                    const { default: api } = await import("@/lib/axios");
                    const res = await api.get("/reviews/pending");
                    setPendingCount((res.data.reports ?? []).length);
                } catch { }
            };
            run();
            const t = setInterval(run, 60_000);
            return () => clearInterval(t);
        }
    }, [role]);

    // Close admin notif dropdown on outside click
    useEffect(() => {
        if (role !== "admin") return;
        const handler = (e) => {
            if (adminDropRef.current && !adminDropRef.current.contains(e.target))
                setAdminDropOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [role]);

    const isActive = (href) => {
        if (href === `/dashboard/${role}`) return pathname === href;
        return pathname === href || pathname.startsWith(href + "/");
    };

    const getBadgeCount = (item) => {
        if (!item.badge) return 0;
        if (item.badgeKey === "notifications") return notifCount;
        if (item.badgeKey === "queue") return pendingCount;
        return pendingCount;
    };

    const activeLabel = [...navItems].reverse().find(n => isActive(n.href))?.label ?? "Dashboard";
    const shouldDivide = (idx) => navItems[idx]?.icon === "settings" && idx > 0;

    // ── Shared sidebar body ──────────────────────────────────────────────────
    const SidebarContent = ({ onNavigate, isCollapsed, onToggleCollapse }) => (
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

            {onToggleCollapse && (
                <div className="rf-sidebar-collapse-row">
                    <span className="rf-collapse-label">Collapse sidebar</span>
                    <button
                        onClick={onToggleCollapse}
                        className="rf-collapse-btn"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <Icon name={isCollapsed ? "sidebarExpand" : "sidebarCollapse"} />
                    </button>
                </div>
            )}

            <div className="rf-user-footer">
                <div className="rf-user-card">
                    <div className="rf-avatar" style={{ background: roleColor }}>{initials}</div>
                    <div className="rf-user-info">
                        <p className="rf-user-name">{user?.full_name ?? "User"}</p>
                        <p className="rf-user-role">{ROLE_LABELS[role]}</p>
                    </div>
                    <button onClick={logout} className="rf-logout-btn" title="Sign out" aria-label="Sign out">
                        <Icon name="logout" />
                    </button>
                </div>
            </div>
        </>
    );

    // ── Admin notification dropdown ──────────────────────────────────────────
    const AdminNotifDropdown = () => {
        const preview = notifications.slice(0, 6);
        return (
            <div ref={adminDropRef} style={{ position: "relative" }}>
                <button
                    onClick={() => setAdminDropOpen(o => !o)}
                    className="rf-icon-btn"
                    aria-label={notifCount > 0 ? `${notifCount} unread notifications` : "Notifications"}
                >
                    <Icon name="bell" />
                    {notifCount > 0 && <span className="rf-badge-dot-top" aria-hidden="true" />}
                </button>

                {adminDropOpen && (
                    <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        width: "320px", background: "#fff", borderRadius: "14px",
                        boxShadow: "0 8px 30px rgba(0,0,0,.12)", border: "1px solid #f0f0f0",
                        zIndex: 999, overflow: "hidden",
                    }}>
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>Notifications</span>
                                {notifCount > 0 && (
                                    <span style={{ background: "#eef2ff", color: "#4338ca", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px" }}>
                                        {notifCount} new
                                    </span>
                                )}
                            </div>
                            {notifCount > 0 && (
                                <button onClick={markAllAsRead} style={{ fontSize: "11px", color: "#4f46e5", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Items */}
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {loading ? (
                                <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: "13px" }}>Loading…</div>
                            ) : preview.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: "#9ca3af" }}>
                                        <Icon name="notif-empty" size={20} />
                                    </div>
                                    <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>No notifications yet</p>
                                </div>
                            ) : preview.map((n) => {
                                const isRead = n.is_read ?? false;
                                const nid = n.notification_id ?? n.notif_id ?? n.id;
                                // ← Fixed: use event_type (DB column), not n.type
                                const { icon: iconName, color: iconColor, bg: iconBg } = getTypeIcon(n);
                                const time = n.created_at ? (() => {
                                    const diff = Date.now() - new Date(n.created_at).getTime();
                                    const mins = Math.floor(diff / 60000);
                                    if (mins < 1) return "Just now";
                                    if (mins < 60) return `${mins}m ago`;
                                    const hrs = Math.floor(mins / 60);
                                    if (hrs < 24) return `${hrs}h ago`;
                                    return `${Math.floor(hrs / 24)}d ago`;
                                })() : "";

                                return (
                                    <div
                                        key={nid}
                                        onClick={() => !isRead && markAsRead(nid)}
                                        style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 16px", cursor: "pointer", background: isRead ? "#fff" : "#f5f7ff", borderBottom: "1px solid #f9fafb", transition: "background 150ms" }}
                                        onMouseEnter={e => e.currentTarget.style.background = isRead ? "#f9fafb" : "#eef2ff"}
                                        onMouseLeave={e => e.currentTarget.style.background = isRead ? "#fff" : "#f5f7ff"}
                                    >
                                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: iconBg, color: iconColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
                                            <Icon name={iconName} size={14} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: "12px", fontWeight: isRead ? 400 : 600, color: isRead ? "#6b7280" : "#111827", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {n.title ?? n.message}
                                            </p>
                                            {n.title && n.message && (
                                                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {n.message}
                                                </p>
                                            )}
                                            <p style={{ fontSize: "10px", color: "#d1d5db", margin: 0 }}>{time}</p>
                                        </div>
                                        {!isRead && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4f46e5", flexShrink: 0, marginTop: "5px" }} />}
                                    </div>
                                );
                            })}
                        </div>

                        {notifications.length > 6 && (
                            <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
                                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{notifications.length - 6} more — showing latest 6</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="rf-shell">

            {/* Desktop sidebar */}
            <aside className={`rf-sidebar rf-sidebar-base${collapsed ? " collapsed" : ""}`} aria-label="Sidebar">
                <SidebarContent
                    onNavigate={undefined}
                    isCollapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(c => !c)}
                />
            </aside>

            {/* Mobile overlay */}
            <div
                className={`rf-mobile-overlay${mobileOpen ? " visible" : ""}`}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile sidebar */}
            <aside
                className={`rf-mobile-sidebar${mobileOpen ? " open" : ""}`}
                aria-label="Mobile navigation"
                aria-modal={mobileOpen}
            >
                <SidebarContent
                    onNavigate={() => setMobileOpen(false)}
                    isCollapsed={false}
                    onToggleCollapse={null}
                />
            </aside>

            {/* Main content */}
            <div className="rf-main">
                <header className="rf-topbar">
                    <div className="rf-topbar-left">
                        <button
                            className="rf-hamburger"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={mobileOpen}
                        >
                            <Icon name="menu" />
                        </button>
                        <div className="rf-breadcrumb">
                            <span className="rf-breadcrumb-page">{activeLabel}</span>
                        </div>
                    </div>

                    <div className="rf-topbar-right">
                        {role === "admin" ? (
                            <AdminNotifDropdown />
                        ) : (
                            <Link
                                href={bellHref}
                                className="rf-icon-btn"
                                aria-label={notifCount > 0 ? `${notifCount} unread notification${notifCount !== 1 ? "s" : ""}` : "Notifications"}
                            >
                                <Icon name="bell" />
                                {notifCount > 0 && <span className="rf-badge-dot-top" aria-hidden="true" />}
                            </Link>
                        )}
                        <div className="rf-topbar-avatar" style={{ background: roleColor }} title={user?.full_name ?? "User"}>
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