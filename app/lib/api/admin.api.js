import api from "@/lib/axios";

/**
 * Admin API
 * Covers FR-01 (departments), FR-02 (teams), FR-03 (employee registration),
 * FR-04 (schedules), FR-12 (admin dashboard analytics)
 */

// ── Departments ──────────────────────────────────────────────
export const getDepartments = async () => {
    const response = await api.get("/departments");
    return response.data;
};

export const createDepartment = async ({ name, description, reviewer_id }) => {
    const response = await api.post("/departments", { name, description, reviewer_id });
    return response.data;
};

export const updateDepartment = async (deptId, data) => {
    const response = await api.put(`/departments/${deptId}`, data);
    return response.data;
};

export const deleteDepartment = async (deptId) => {
    const response = await api.delete(`/departments/${deptId}`);
    return response.data;
};

// ── Teams ────────────────────────────────────────────────────
export const getTeams = async (deptId) => {
    const response = await api.get("/teams", { params: { dept_id: deptId } });
    return response.data;
};

export const createTeam = async ({ name, dept_id }) => {
    const response = await api.post("/teams", { name, dept_id });
    return response.data;
};

export const updateTeam = async (teamId, data) => {
    const response = await api.put(`/teams/${teamId}`, data);
    return response.data;
};

export const deleteTeam = async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
};

// ── Users / Employees ────────────────────────────────────────
export const getUsers = async (filters = {}) => {
    const response = await api.get("/users", { params: filters });
    return response.data;
};

export const createEmployee = async (userData) => {
    // Admin registers: { full_name, email, role, dept_id, team_id }
    const response = await api.post("/users", userData);
    return response.data;
};

export const updateUser = async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
};

export const deactivateUser = async (userId) => {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
};

// ── Report Schedules ─────────────────────────────────────────
export const getSchedules = async () => {
    const response = await api.get("/schedules");
    return response.data;
};

export const createSchedule = async (scheduleData) => {
    // { frequency: 'monthly'|'bi-weekly'|'weekly'|'custom', dept_id, team_id, report_type_id, deadline }
    const response = await api.post("/schedules", scheduleData);
    return response.data;
};

export const updateSchedule = async (scheduleId, data) => {
    const response = await api.put(`/schedules/${scheduleId}`, data);
    return response.data;
};

export const deleteSchedule = async (scheduleId) => {
    const response = await api.delete(`/schedules/${scheduleId}`);
    return response.data;
};

// ── Dashboard Analytics ───────────────────────────────────────
export const getAdminDashboardStats = async () => {
    const response = await api.get("/dashboard/admin");
    return response.data;
};

export const getDeptDashboardStats = async (deptId) => {
    const response = await api.get(`/dashboard/department/${deptId}`);
    return response.data;
};

export const getReviewerDashboardStats = async () => {
    const response = await api.get("/dashboard/reviewer");
    return response.data;
};