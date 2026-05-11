"use client";
import { useState, useEffect, useCallback } from "react";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import ComplianceBar from "@/components/dashboard/ComplianceBar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const STATUS_MAP = {
    pending: "Pending",
    submitted: "Submitted",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
};

function normalizeReport(r) {
    return {
        id: r.report_id,
        title: r.title,
        employee: r.employee?.full_name ?? "—",
        department: r.employee?.department?.name ?? "—",
        type: r.schedule?.title ?? r.schedule?.frequency ?? "Report",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
        fileUrl: r.file_path ?? null,
    };
}

const ACTION_BADGE = {
    approved: "bg-emerald-100 text-emerald-700",
    changes_requested: "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700",
};

const ACTION_LABEL = {
    approved: "Approved",
    changes_requested: "Changes Requested",
    rejected: "Rejected",
};

export default function ReviewerDashboard() {
    const { user } = useAuth();
    const [pendingReports, setPending] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actioning, setActioning] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [pendingRes, allRes] = await Promise.all([
                api.get("/reviews/pending"),
                api.get("/reports"),
            ]);

            setPending((pendingRes.data.reports ?? []).map(normalizeReport));

            const reviewed = (allRes.data.reports ?? [])
                .filter(r => ['under_review', 'approved', 'rejected', 'changes_requested'].includes(r.status))
                .slice(0, 5)
                .map(r => ({
                    name: r.title,
                    employee: r.employee?.full_name ?? "—",
                    action: r.status,
                    date: r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—",
                }));
            setRecentLogs(reviewed);
        } catch {
            setError("Failed to load review queue.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleAction(id, action, comment) {
        setActioning(id);
        try {
            await api.post(`/reviews/${id}`, { action, comment });
            setPending(prev => prev.filter(r => r.id !== id));
            load();
        } catch (err) {
            const msg = err?.response?.data?.error ?? "Action failed. Please try again.";
            alert(msg);
        } finally {
            setActioning(null);
        }
    }

    const stats = [
        { label: "Awaiting Review", value: pendingReports.length, icon: "hourglass", color: "amber" },
        { label: "Reviewed", value: recentLogs.length, icon: "approved", color: "emerald" },
        { label: "Dept. Submitted", value: pendingReports.length + recentLogs.length, icon: "inbox", color: "indigo" },
        { label: "Dept. Approved", value: recentLogs.filter(r => r.action === "approved").length, icon: "chart", color: "violet" },
    ];

    const deptName = user?.department?.name ?? "Your Department";
    const total = pendingReports.length + recentLogs.length;
    const submitted = recentLogs.length;
    const deptCompliance = [{ name: deptName, submitted, total: total || 1, color: "violet" }];

    const firstName = user?.full_name?.split(" ")[0] ?? "Reviewer";

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 left-1/2 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sky-100 blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Stage 1 Review 🔍 — {deptName}</p>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Hey {firstName}, here&apos;s your queue
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <StatsGrid stats={stats} cols={4} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Review queue */}
                            <div className="lg:col-span-2">
                                <ReviewQueue
                                    items={pendingReports}
                                    onAction={handleAction}
                                    stage={1}
                                    title="Pending Review Queue"
                                />
                            </div>

                            {/* Right column */}
                            <div className="flex flex-col gap-6">
                                <ComplianceBar departments={deptCompliance} title={`${deptName} Progress`} />

                                {/* Recently reviewed */}
                                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <span className="font-bold text-sm text-gray-800">Recently Reviewed</span>
                                    </div>
                                    {recentLogs.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-8">No reviews yet this period.</p>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {recentLogs.map((r, i) => (
                                                <div key={i} className="px-5 py-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">{r.name}</p>
                                                        <p className="text-[10px] text-gray-400">{r.employee} · {r.date}</p>
                                                    </div>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${ACTION_BADGE[r.action] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {ACTION_LABEL[r.action] ?? r.action}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}