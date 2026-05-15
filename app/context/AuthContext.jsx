"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginUser, logoutUser, getMe } from "../lib/api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // stays true until auth is confirmed
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!storedToken || !storedUser) {
            // No session at all — done immediately
            setLoading(false);
            return;
        }

        // Optimistically hydrate from cache so UI has something to render
        try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setLoading(false);
            return;
        }

        // Always re-validate with the server — setLoading(false) ONLY after this settles.
        // This prevents NotificationsContext (and any other consumer) from firing
        // authenticated requests before we know the token is actually valid.
        getMe()
            .then((data) => {
                const fresh = data.user ?? data;
                setUser(fresh);
                localStorage.setItem("user", JSON.stringify(fresh));
            })
            .catch(() => {
                // Token expired or invalid — clear everything
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                // Auth is now settled (valid or cleared) — allow consumers to proceed
                setLoading(false);
            });
    }, []);

    const login = useCallback(async ({ email, password }) => {
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        router.push("/auth/login");
    }, [router]);

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

function redirectByRole(role, router) {
    switch (role) {
        case "admin": router.push("/dashboard/admin"); break;
        case "employee": router.push("/dashboard/employee"); break;
        case "reviewer": router.push("/dashboard/reviewer"); break;
        case "approver": router.push("/dashboard/approver"); break;
        default:
            console.warn("Unknown role:", role);
            router.push("/dashboard/employee");
    }
}