import api from "@/lib/axios";

/**
 * Reports API
 * Covers FR-06 (submission), FR-07 (Stage 1 review), FR-08 (Stage 2 approval),
 * FR-11 (status tracking), FR-15 (search & filter)
 */

// Employee: get reports visible to the current user
export const getMyReports = async (filters = {}) => {
    const response = await api.get("/reports/my", { params: filters });
    return response.data;
};

// Admin / Final Approver: get all reports with optional filters
// filters: { dept_id, team_id, status, type, start_date, end_date, search }
export const getAllReports = async (filters = {}) => {
    const response = await api.get("/reports", { params: filters });
    return response.data;
};

// Get single report by ID (with full status history)
export const getReportById = async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
};

// Employee: submit a new report (form data or JSON)
// If attaching a file, pass a FormData object
export const submitReport = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post("/reports", data, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
};

// Department Reviewer (Stage 1): review a report
// action: "approve" | "reject" | "request_changes"
export const reviewReport = async (reportId, { action, comment }) => {
    const response = await api.patch(`/reports/${reportId}/review`, {
        action,
        comment,
    });
    return response.data;
};

// Final Approver (Stage 2): final approval action
// action: "approve" | "reject" | "request_changes"
export const approveReport = async (reportId, { action, comment }) => {
    const response = await api.patch(`/reports/${reportId}/approve`, {
        action,
        comment,
    });
    return response.data;
};

// Get status history/audit trail for a report
export const getReportHistory = async (reportId) => {
    const response = await api.get(`/reports/${reportId}/history`);
    return response.data;
};