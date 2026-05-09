import api from "@/lib/axios";

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
    // Strips out undefined/empty values so the backend doesn't receive blank params
    const clean = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    );
    const response = await api.get("/users", { params: clean });
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

export const createEmployee = async (userData) => {
    // Backend auto-generates password — only send: full_name, email, role, dept_id, team_id
    const { full_name, email, role, dept_id, team_id } = userData;
    const response = await api.post("/users", {
        full_name,
        email,
        role,
        ...(dept_id && { dept_id }),
        ...(team_id && { team_id }),
    });
    return response.data; // returns { success, user, plainPassword }
};

export const updateUser = async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
};

export const deactivateUser = async (userId) => {
    const response = await api.patch(`/users/${userId}/deactivate`);
    return response.data;
};

export const activateUser = async (userId) => {
    const response = await api.patch(`/users/${userId}/activate`);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

// ── Report Schedules ─────────────────────────────────────────
export const getSchedules = async () => {
    const response = await api.get("/schedules");
    return response.data;
};

export const createSchedule = async (scheduleData) => {
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