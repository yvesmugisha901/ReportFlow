"use client";
import { useState, useEffect } from "react";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/context/NotificationsContext";

const FILTERS = ["All", "Unread", "Approved", "Rejected", "Changes", "Submitted", "Scheduled"];
const PAGE_SIZE = 15;

const TYPE_MAP = {
    Approved: "approved",
    Rejected: "rejected",
    Changes: "changes",
    Submitted: "submitted",
    Scheduled: "scheduled",
};

export default function NotificationList() {
    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
    } = useNotifications();

    const [filter, setFilter] = useState("All");
    const [page, setPage] = useState(1);

    // Refresh the full list when this page is mounted
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Reset to page 1 whenever filter changes
    useEffect(() => {
        setPage(1);
    }, [filter]);

    const filtered = notifications.filter((n) => {
        if (filter === "All") return true;
        if (filter === "Unread") return !(n.is_read ?? n.read ?? false);
        return n.type === TYPE_MAP[filter];
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // Build page number array with ellipsis: [1, '…', 4, 5, 6, '…', 12]
    function getPageNumbers(current, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages = [];
        if (current <= 4) {
            pages.push(1, 2, 3, 4, 5, "…", total);
        } else if (current >= total - 3) {
            pages.push(1, "…", total - 4, total - 3, total - 2, total - 1, total);
        } else {
            pages.push(1, "…", current - 1, current, current + 1, "…", total);
        }
        return pages;
    }

    const pageNumbers = getPageNumbers(safePage, totalPages);

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {loading
                                ? "Loading…"
                                : unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "All caught up!"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {notifications.some(n => n.is_read ?? n.read) && (
                            <button
                                onClick={deleteAllRead}
                                className="px-4 py-2 text-xs font-bold text-gray-500 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                            >
                                Clear read
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                            >
                                ✓ Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                        >
                            {f}
                            {f === "Unread" && unreadCount > 0 && (
                                <span className="ml-1.5 bg-white/30 text-current px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-16 text-gray-400 text-sm">
                            Loading notifications…
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <div className="text-4xl mb-3">🔔</div>
                            <p className="font-medium text-sm">No notifications here</p>
                            <p className="text-xs mt-1">Check back later or switch filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {paginated.map((n) => (
                                <NotificationItem
                                    key={n.notification_id ?? n.id}
                                    notification={n}
                                    onRead={markAsRead}
                                    onDismiss={deleteNotification}
                                    compact={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination + count */}
                {!loading && filtered.length > 0 && (
                    <div className="flex items-center justify-between mt-5">
                        {/* Result count */}
                        <p className="text-xs text-gray-400">
                            {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>

                        {/* Page numbers */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                {/* Prev */}
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous page"
                                >
                                    ‹
                                </button>

                                {pageNumbers.map((p, i) =>
                                    p === "…" ? (
                                        <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${safePage === p
                                                ? "bg-indigo-600 text-white border border-indigo-600"
                                                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                                                }`}
                                            aria-current={safePage === p ? "page" : undefined}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                {/* Next */}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-500 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next page"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}