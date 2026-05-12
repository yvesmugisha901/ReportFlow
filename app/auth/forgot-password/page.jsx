"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function validateEmail(email) {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return null;
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [sent, setSent] = useState(false);

    const handleChange = (val) => {
        setEmail(val);
        if (touched) setEmailError(validateEmail(val) ?? "");
    };

    const handleBlur = () => {
        setTouched(true);
        setEmailError(validateEmail(email) ?? "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setTouched(true);
        const err = validateEmail(email);
        if (err) { setEmailError(err); return; }
        setEmailError("");

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setServerError(data.message || data.error || "Something went wrong. Please try again.");
                return;
            }
            setSent(true);
        } catch {
            setServerError("Cannot connect to server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // ── Success / Email sent screen ──────────────────────────────
    if (sent) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[80px]" />
                </div>
                <div className="relative z-10 w-full max-w-sm text-center">
                    <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
                        {/* Mail icon */}
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                        <p className="text-sm text-gray-500 mb-1">
                            We sent a password reset link to
                        </p>
                        <p className="text-sm font-semibold text-indigo-600 mb-6 break-all">{email}</p>
                        <p className="text-xs text-gray-400 mb-8">
                            Didn&apos;t receive it? Check your spam folder, or{" "}
                            <button
                                onClick={() => setSent(false)}
                                className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 transition-colors"
                            >
                                try again
                            </button>
                            .
                        </p>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main form ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100 blur-[80px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900">ReportFlow</span>
                    </Link>

                    {/* Lock icon */}
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Forgot your password?</h1>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        No worries. Enter your work email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    {/* Server error */}
                    {serverError && (
                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Work email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => handleChange(e.target.value)}
                                onBlur={handleBlur}
                                autoComplete="email"
                                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400
                                    focus:outline-none focus:bg-white focus:ring-2 transition-all
                                    ${touched && emailError
                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                                    }`}
                            />
                            {touched && emailError && (
                                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending…
                                </span>
                            ) : "Send reset link →"}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            Remember your password?{" "}
                            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[11px] text-gray-400 mt-6">
                    Contact your system administrator if you need further help.
                </p>
            </div>
        </div>
    );
}