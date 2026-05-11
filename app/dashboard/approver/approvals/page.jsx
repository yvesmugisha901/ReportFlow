"use client";
import { useState, useEffect, useCallback } from "react";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import api from "@/lib/axios";

function normalizePending(r) {
    const stage1Log = (r.reviewLogs ?? []).find(
        l => l.stage === "stage_1" && l.action === "approved"
    );
    return {
        id: r.report_id,
        title: r.title,
        employee: r.employee?.full_name ?? "—",
        department: r.employee?.department?.name ?? "—",
        type: r.schedule?.title ?? r.schedule?.frequency ?? "Report",
        submittedAt: r.submitted_at
            ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
        stage1Reviewer: stage1Log?.reviewer?.full_name ?? null,
        fileUrl: r.file_path ?? null,
    };
}

export default function ApproverApprovalsPage() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/reviews/pending");
            setPending((res.data.reports ?? []).map(normalizePending));
        } catch {
            setError("Failed to load approval queue.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleAction(id, action, comment) {
        try {
            await api.post(`/reviews/${id}`, { action, comment });
            load();
        } catch (err) {
            alert(err?.response?.data?.error ?? "Action failed.");
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-1">Approver · Stage 2</p>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Final Approvals</h1>
                    <p className="text-sm text-gray-500 mt-1">Reports that have passed Stage 1 and await your sign-off.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : (
                    <ReviewQueue
                        items={pending}
                        onAction={handleAction}
                        stage={2}
                        title={`Stage 2 Approval Queue · ${pending.length} pending`}
                    />
                )}
            </div>
        </div>
    );
}