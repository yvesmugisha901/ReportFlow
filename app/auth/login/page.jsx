"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";

// ── Validation ───────────────────────────────────────────────────
function validateLogin({ email, password }) {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    return errors;
}

// ── Field ────────────────────────────────────────────────────────
function Field({ label, error, right, children }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">{label}</label>
                {right}
            </div>
            {children}
            {error && (
                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Input ────────────────────────────────────────────────────────
function Input({ hasError, ...props }) {
    return (
        <input
            {...props}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 
                focus:outline-none focus:bg-white focus:ring-2 transition-all
                ${hasError
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                }`}
        />
    );
}

export default function LoginPage() {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // clear field error on change if already touched
        if (touched[field]) {
            const next = validateLogin({ ...form, [field]: value });
            setErrors(prev => ({ ...prev, [field]: next[field] }));
        }
    };

    const blur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const next = validateLogin(form);
        setErrors(prev => ({ ...prev, [field]: next[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        const allTouched = { email: true, password: true };
        setTouched(allTouched);
        const errs = validateLogin(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            await login({ email: form.email, password: form.password });
        } catch (err) {
            setServerError(err.response?.data?.error ?? err.response?.data?.message ?? "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Welcome back</h1>
                    <p className="text-sm text-gray-500">Sign in to your account to continue</p>
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
                        <Field
                            label="Email address"
                            error={touched.email && errors.email}
                        >
                            <Input
                                type="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={e => set("email", e.target.value)}
                                onBlur={() => blur("email")}
                                hasError={!!(touched.email && errors.email)}
                                autoComplete="email"
                            />
                        </Field>

                        <Field
                            label="Password"
                            error={touched.password && errors.password}
                            right={
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            }
                        >
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => set("password", e.target.value)}
                                    onBlur={() => blur("password")}
                                    hasError={!!(touched.password && errors.password)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </Field>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : "Sign in →"}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[11px] text-gray-400 mt-6">
                    Access is role-based — Admin · Employee · Reviewer · Approver
                </p>
            </div>
        </div>
    );
}