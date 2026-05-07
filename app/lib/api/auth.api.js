import api from "@/lib/axios";

/**
 * Auth API
 * Matches backend routes: POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
 */

// Login — returns { token, user }
export const loginUser = async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
};

// Register — admin creates users, or self-registration if enabled
// full_name is required by the backend User model
export const registerUser = async ({ full_name, email, password, role, dept_id, team_id }) => {
    const response = await api.post("/auth/register", {
        full_name,
        email,
        password,
        role,
        dept_id,
        team_id,
    });
    return response.data;
};

// Get current logged-in user profile (requires JWT)
export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

// Logout — client-side only (clears localStorage)
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};