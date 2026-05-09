"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser, getMe } from "../lib/api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // true until we've checked localStorage
    const router = useRouter();

    // On mount: restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                // Corrupted data — clear it
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async ({ email, password }) => {
        // loginUser returns { token, user } from the backend
        const data = await loginUser({ email, password });

        const { token: newToken, user: newUser } = data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);

        // Redirect based on role
        redirectByRole(newUser.role, router);
    }, [router]);

    const logout = useCallback(() => {
        logoutUser();
        setToken(null);
        setUser(null);
        router.push("/auth/login");
    }, [router]);

    // Refresh user data from the backend (e.g. after profile update)
    const refreshUser = useCallback(async () => {
        try {
            const data = await getMe();
            setUser(data.user ?? data);
            localStorage.setItem("user", JSON.stringify(data.user ?? data));
        } catch {
            logout();
        }
    }, [logout]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user?.role ?? null,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}

// Role-based redirect helper
function redirectByRole(role, router) {
    switch (role) {
        case "admin":
            router.push("/dashboard/admin");
            break;
        case "employee":
            router.push("/dashboard/employee");
            break;
        case "reviewer":                          // was "department_reviewer"
            router.push("/dashboard/reviewer");
            break;
        case "approver":                          // was "final_approver"
            router.push("/dashboard/approver");
            break;
        default:
            console.warn("Unknown role:", role);
            router.push("/dashboard/employee");
    }
}