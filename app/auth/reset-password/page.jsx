"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!token) setServerError("Missing or invalid reset token. Please request a new link.");
    }, [token]);

    const validate = (pwd, con) => {
        const e = {};
        if (!pwd) e.password = "Password is required.";
        else if (pwd.length < 8) e.password = "Must be at least 8 characters.";
        if (!con) e.confirm = "Please confirm your password.";
        else if (pwd !== con) e.confirm = "Passwords do not match.";
        return e;
    };

    const handleBlur = (field) => {
        setTouched((t) => ({ ...t, [field]: true }));
        setErrors(validate(password, confirm));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setTouched({ password: true, confirm: true });
        const errs = validate(password, confirm);
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setServerError(data.message || "Something went wrong. Please try again.");
                return;
            }
            setDone(true);
        } catch {
            setServerError("Cannot connect to server.");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Password updated!</h2>
                        <p className="text-sm text-gray-500 mb-8">Your password has been reset. You can now sign in with your new password.</p>
                        <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200">
                            Go to Login →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[80px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900">ReportFlow</span>
                    </Link>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Set new password</h1>
                    <p className="text-sm text-gray-500 text-center max-w-xs">Choose a strong password you haven't used before.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    {serverError && (
                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* New password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                New password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(validate(e.target.value, confirm)); }}
                                onBlur={() => handleBlur("password")}
                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${touched.password && errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"}`}
                            />
                            {touched.password && errors.password && (
                                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Confirm password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Repeat your password"
                                value={confirm}
                                onChange={e => { setConfirm(e.target.value); if (touched.confirm) setErrors(validate(password, e.target.value)); }}
                                onBlur={() => handleBlur("confirm")}
                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${touched.confirm && errors.confirm ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"}`}
                            />
                            {touched.confirm && errors.confirm && (
                                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {errors.confirm}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating…
                                </span>
                            ) : "Update password →"}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                                ← Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><p className="text-sm text-gray-400">Loading…</p></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}