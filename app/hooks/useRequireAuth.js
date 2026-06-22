import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * useRequireAuth — redirects unauthenticated users to /auth/login
 * Optionally restrict by allowed roles.
 *
 * Usage in a page:
 *   const { user, loading } = useRequireAuth(["admin"]);
 *   if (loading) return <Spinner />;
 */
export function useRequireAuth(allowedRoles = []) {
    const { user, loading, isAuthenticated, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            router.replace("/auth/login");
            return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            // Authenticated but wrong role — send to their dashboard
            router.replace("/dashboard");
        }
    }, [loading, isAuthenticated, role, allowedRoles, router]);

    return { user, loading };
}