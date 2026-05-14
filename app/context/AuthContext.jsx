"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser, getMe } from "../lib/api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // On mount: restore session from localStorage, then always re-fetch
    // fresh user data (so nested department/team is never stale)
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                // Optimistically set from cache so the UI renders immediately
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // ✅ Always re-fetch to get fresh nested data (department.name, team.name)
                getMe()
                    .then((data) => {
                        const fresh = data.user ?? data;
                        setUser(fresh);
                        localStorage.setItem("user", JSON.stringify(fresh));
                    })
                    .catch(() => {
                        // Token is invalid / expired — clear session
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setToken(null);
                        setUser(null);
                    });
            } catch {
                // Corrupted localStorage data — clear it
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        setLoading(false);
    }, []);

    const login = useCallback(async ({ email, password }) => {
        // loginUser returns { token, user } — user now includes nested department
        const data = await loginUser({ email, password });

        const { token: newToken, user: newUser } = data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);

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
            const fresh = data.user ?? data;
            setUser(fresh);
            localStorage.setItem("user", JSON.stringify(fresh));
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

// ─── Role-based redirect helper ───────────────────────────────
function redirectByRole(role, router) {
    switch (role) {
        case "admin":
            router.push("/dashboard/admin");
            break;
        case "employee":
            router.push("/dashboard/employee");
            break;
        case "reviewer":
            router.push("/dashboard/reviewer");
            break;
        case "approver":
            router.push("/dashboard/approver");
            break;
        default:
            console.warn("Unknown role:", role);
            router.push("/dashboard/employee");
    }
}