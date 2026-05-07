"use client";
import { useState } from "react";
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
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "", department: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleNext = (e) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.role) { setError("Please select a role."); return; }

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
                    department: form.department,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || data.error || "Registration failed. Please try again.");
                return;
            }

            // Save token if returned, then redirect
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            router.push("/auth/login?registered=true");

        } catch (err) {
            setError("Cannot connect to server. Make sure the backend is running on port 5000.");
        } finally {
            setLoading(false);
        }
    };

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

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${s === step ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" :
                                s < step ? "bg-indigo-100 text-indigo-600 border-indigo-300" :
                                    "bg-white text-gray-400 border-gray-200"}`}>
                                {s < step ? "✓" : s}
                            </div>
                            {s === 1 && <div className={`w-16 h-0.5 transition-all ${step > 1 ? "bg-indigo-400" : "bg-gray-200"}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleNext} className="space-y-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 1 — Your details</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">First name</label>
                                    <input type="text" required placeholder="Alice"
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last name</label>
                                    <input type="text" required placeholder="Smith"
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work email</label>
                                <input type="email" required placeholder="alice@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                                <input type="password" required minLength={8} placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5 mt-2">
                                Continue →
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 2 — Role & organization</p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Your role</label>
                                <div className="space-y-2">
                                    {ROLES.map((r) => (
                                        <button key={r.value} type="button"
                                            onClick={() => setForm({ ...form, role: r.value })}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${form.role === r.value
                                                ? `${r.bg} ${r.border}`
                                                : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"}`}>
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
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Department <span className="font-normal text-gray-400">(optional)</span></label>
                                <input type="text" placeholder="e.g. Finance, Operations…"
                                    value={form.department}
                                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5">
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