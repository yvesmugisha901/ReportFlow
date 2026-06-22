import { useState, useEffect, useCallback } from "react";
import {
    getMyReports,
    getAllReports,
    getReportById,
    submitReport,
    reviewReport,
    approveReport,
    getReportHistory,
} from "@/lib/api/reports.api";
import { useAuth } from "@/hooks/useAuth";

/**
 * useReports — fetch and manage report data
 * @param {Object} options
 * @param {"mine"|"all"} options.scope - "mine" for employee, "all" for admin/approver
 * @param {Object} options.filters - filter params (status, dept_id, etc.)
 * @param {boolean} options.autoFetch - fetch on mount (default true)
 */
export function useReports({ scope = "mine", filters = {}, autoFetch = true } = {}) {
    const { role } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReports = useCallback(async (overrideFilters) => {
        setLoading(true);
        setError(null);
        try {
            const params = overrideFilters ?? filters;
            const data =
                scope === "all"
                    ? await getAllReports(params)
                    : await getMyReports(params);
            setReports(data.reports ?? data);
        } catch (err) {
            setError(err.response?.data?.message ?? "Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    }, [scope, filters]);

    useEffect(() => {
        if (autoFetch) fetchReports();
    }, [autoFetch, fetchReports]);

    return { reports, loading, error, refetch: fetchReports };
}

/**
 * useReport — fetch a single report with its history
 */
export function useReport(reportId) {
    const [report, setReport] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!reportId) return;
        setLoading(true);
        setError(null);
        try {
            const [reportData, historyData] = await Promise.all([
                getReportById(reportId),
                getReportHistory(reportId),
            ]);
            setReport(reportData.report ?? reportData);
            setHistory(historyData.history ?? historyData);
        } catch (err) {
            setError(err.response?.data?.message ?? "Failed to fetch report");
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { report, history, loading, error, refetch: fetch };
}

/**
 * useReportActions — submit / review / approve with loading state per action
 */
export function useReportActions() {
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState(null);

    const submit = async (data) => {
        setSubmitting(true);
        setActionError(null);
        try {
            return await submitReport(data);
        } catch (err) {
            const msg = err.response?.data?.message ?? "Submission failed";
            setActionError(msg);
            throw new Error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const review = async (reportId, payload) => {
        setSubmitting(true);
        setActionError(null);
        try {
            return await reviewReport(reportId, payload);
        } catch (err) {
            const msg = err.response?.data?.message ?? "Review action failed";
            setActionError(msg);
            throw new Error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const approve = async (reportId, payload) => {
        setSubmitting(true);
        setActionError(null);
        try {
            return await approveReport(reportId, payload);
        } catch (err) {
            const msg = err.response?.data?.message ?? "Approval action failed";
            setActionError(msg);
            throw new Error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return { submit, review, approve, submitting, actionError };
}