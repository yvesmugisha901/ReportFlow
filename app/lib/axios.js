import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
    },
});

// Attach JWT token + cache-bust timestamp to every request
api.interceptors.request.use(
    (config) => {
        // Attach token
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Cache-bust all GET requests so browser never serves stale 304s
        if (config.method === "get" || config.method === "GET") {
            config.params = {
                ...config.params,
                _t: Date.now(),
            };
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 globally — redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;