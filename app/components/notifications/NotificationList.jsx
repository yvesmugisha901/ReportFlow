"use client";
import { useState } from "react";
import NotificationItem from "@/components/notifications/NotificationItem";

/**
 * NotificationList — full notifications page list.
 * Goes inside /dashboard/notifications/page.jsx
 *
 * Props:
 *  notifications: Array<notification shape>  — pass from API later
 */

const FILTERS = ["All", "Unread", "Approved", "Rejected", "Changes", "Submitted", "Scheduled"];

const TYPE_MAP = {
    Approved: "approved",
    Rejected: "rejected",
    Changes: "changes",
    Submitted: "submitted",
    Scheduled: "scheduled",
};

// Sample data — replace with API fetch
const SAMPLE = [
    { id: 1, type: "approved", title: "Report Approved", message: "Your Q1 Team Performance report has been approved by the COO.", reportTitle: "Q1 Team Performance", time: "2 hours ago", read: false },
    { id: 2, type: "changes", title: "Changes Requested", message: "Your reviewer has requested changes to your March Summary Report.", reportTitle: "March Summary Report", time: "Yesterday", read: false },
    { id: 3, type: "reviewed", title: "Report Under Review", message: "Your Weekly Progress Update has been picked up by your department reviewer.", reportTitle: "Weekly Progress Update", time: "May 4, 2026", read: false },
    { id: 4, type: "submitted", title: "Submission Confirmed", message: "Your Safety Compliance Report was successfully submitted.", reportTitle: "Safety Compliance Report", time: "May 3, 2026", read: true },
    { id: 5, type: "scheduled", title: "New Report Due", message: "A new Monthly Operations Report is due by May 10, 2026.", reportTitle: "Monthly Operations Report", time: "May 1, 2026", read: true },
    { id: 6, type: "approved", title: "Report Approved", message: "Your Safety Compliance Report passed both review stages.", reportTitle: "Safety Compliance Report", time: "Apr 22, 2026", read: true },
    { id: 7, type: "rejected", title: "Report Rejected", message: "Your HR Compliance Report was rejected. Please contact your reviewer.", reportTitle: "HR Compliance Report", time: "Apr 25, 2026", read: true },
    { id: 8, type: "scheduled", title: "Upcoming Deadline Reminder", message: "Q2 Performance Review is due in 7 days.", reportTitle: "Q2 Performance Review", time: "Apr 20, 2026", read: true },
];

export default function NotificationList({ notifications = SAMPLE }) {
    const [items, setItems] = useState(notifications);
    const [filter, setFilter] = useState("All");

    const unreadCount = items.filter((n) => !n.read).length;

    function markRead(id) {
        setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }

    function markAllRead() {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    function dismiss(id) {
        setItems((prev) => prev.filter((n) => n.id !== id));
    }

    const filtered = items.filter((n) => {
        if (filter === "All") return true;
        if (filter === "Unread") return !n.read;
        return n.type === TYPE_MAP[filter];
    });

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
                        >
                            ✓ Mark all read
                        </button>
                    )}
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
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <div className="text-4xl mb-3">🔔</div>
                            <p className="font-medium text-sm">No notifications here</p>
                            <p className="text-xs mt-1">Check back later or switch filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={markRead}
                                    onDismiss={dismiss}
                                    compact={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-4">
                        {filtered.length} of {items.length} notifications
                    </p>
                )}
            </div>
        </div>
    );
}