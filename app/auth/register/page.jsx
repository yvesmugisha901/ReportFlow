"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ROLES = [
    { value: "employee", label: "Employee", desc: "Submit reports for your team", icon: "👤", bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700" },
    { value: "reviewer", label: "Dept. Reviewer", desc: "Review and approve dept. reports", icon: "🔍", bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700" },
    { value: "approver", label: "Final Approver", desc: "Give the last sign-off on reports", icon: "✅", bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "", dept_id: "" });
    const [departments, setDepartments] = useState([]);
    const [deptLoading, setDeptLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Fetch departments when entering step 3
    useEffect(() => {
        if (step !== 3) return;
        const fetchDepts = async () => {
            setDeptLoading(true);
            try {
                const res = await fetch(`${API_URL}/departments`);
                const data = await res.json();
                const list = data.departments ?? data.data ?? data.results ?? data;
                setDepartments(Array.isArray(list) ? list : []);
            } catch {
                setDepartments([]);
            } finally {
                setDeptLoading(false);
            }
        };
        fetchDepts();
    }, [step]);

    // Step 1 → 2
    const handleStep1 = (e) => {
        e.preventDefault();
        setError("");
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setStep(2);
    };

    // Step 2 → 3
    const handleStep2 = (e) => {
        e.preventDefault();
        setError("");
        if (!form.role) {
            setError("Please select a role.");
            return;
        }
        setStep(3);
    };

    // Step 3 → submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.dept_id) {
            setError("Please select your department.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: `${form.firstName} ${form.lastName}`,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    dept_id: form.dept_id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || data.error || "Registration failed. Please try again.");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Cannot connect to server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // ── Success / Pending screen ──────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4 py-12">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-100 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[80px]" />
                </div>
                <div className="relative z-10 w-full max-w-sm text-center">
                    <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
                        <p className="text-sm text-gray-500 mb-1">
                            Your account is <span className="font-semibold text-amber-600">pending admin approval</span>.
                        </p>
                        <p className="text-sm text-gray-400 mb-8">
                            An admin will review your registration and activate your account. You'll be able to log in once approved.
                        </p>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main register form ────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4 py-12">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[80px]" />
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Create your account</h1>
                    <p className="text-sm text-gray-500">Join your organization on ReportFlow</p>
                </div>

                {/* Step indicator — 3 steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${s === step
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                : s < step
                                    ? "bg-indigo-100 text-indigo-600 border-indigo-300"
                                    : "bg-white text-gray-400 border-gray-200"
                                }`}>
                                {s < step ? "✓" : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-12 h-0.5 transition-all ${step > s ? "bg-indigo-400" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}

                    {/* ── Step 1 — Personal details ── */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} className="space-y-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 1 — Your details</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">First name</label>
                                    <input
                                        type="text" required placeholder="Alice"
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last name</label>
                                    <input
                                        type="text" required placeholder="Smith"
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work email</label>
                                <input
                                    type="email" required placeholder="alice@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                                <input
                                    type="password" required minLength={8} placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5 mt-2"
                            >
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* ── Step 2 — Role ── */}
                    {step === 2 && (
                        <form onSubmit={handleStep2} className="space-y-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 2 — Your role</p>
                            <div className="space-y-2">
                                {ROLES.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: r.value })}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${form.role === r.value
                                            ? `${r.bg} ${r.border}`
                                            : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        <span className="text-lg">{r.icon}</span>
                                        <div className="flex-1">
                                            <div className={`text-xs font-bold ${form.role === r.value ? r.text : "text-gray-700"}`}>{r.label}</div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">{r.desc}</div>
                                        </div>
                                        {form.role === r.value && (
                                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setError(""); }}
                                    className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5"
                                >
                                    Continue →
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 3 — Department ── */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 3 — Your department</p>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Department <span className="text-red-400">*</span>
                                </label>
                                {deptLoading ? (
                                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400">
                                        Loading departments…
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={form.dept_id}
                                        onChange={(e) => setForm({ ...form, dept_id: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select your department…</option>
                                        {departments.map((d) => (
                                            <option key={d.dept_id} value={d.dept_id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Pending info text */}
                            <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <span className="flex-shrink-0 mt-0.5">⏳</span>
                                <p className="text-[11px] text-amber-700 leading-relaxed">
                                    Your account will be <strong>inactive</strong> until an admin approves your registration and assigns you to a team.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => { setStep(2); setError(""); }}
                                    className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || deptLoading}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Creating…
                                        </span>
                                    ) : "Create account →"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Sign in</Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[11px] text-gray-400 mt-6">
                    Admin accounts are created by your system administrator
                </p>
            </div>
        </div>
    );
}