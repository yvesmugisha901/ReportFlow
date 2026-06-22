"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ROLES = [
    { value: "employee", label: "Employee", desc: "Submit reports for your team", bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700" },
    { value: "reviewer", label: "Dept. Reviewer", desc: "Review and approve dept. reports", bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-700" },
    { value: "approver", label: "Final Approver", desc: "Give the last sign-off on reports", bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700" },
];

// Role icons as SVG
const RoleIcon = ({ role }) => {
    const p = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", className: "w-5 h-5" };
    if (role === "employee") return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    if (role === "reviewer") return <svg {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    if (role === "approver") return <svg {...p}><polyline points="20 6 9 17 4 12" /></svg>;
    return null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Validators ───────────────────────────────────────────────────
function validateStep1({ firstName, lastName, email, password }) {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    else if (firstName.trim().length < 2) e.firstName = "Must be at least 2 characters.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    else if (lastName.trim().length < 2) e.lastName = "Must be at least 2 characters.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Must be at least 8 characters.";
    else if (!/[A-Z]/.test(password)) e.password = "Include at least one uppercase letter.";
    else if (!/[0-9]/.test(password)) e.password = "Include at least one number.";
    return e;
}

function validateStep2({ role }) {
    const e = {};
    if (!role) e.role = "Please select a role.";
    return e;
}

function validateStep3({ dept_id }) {
    const e = {};
    if (!dept_id) e.dept_id = "Please select your department.";
    return e;
}

// ── Password strength ────────────────────────────────────────────
function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
    if (score <= 2) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
    if (score <= 3) return { label: "Good", color: "bg-indigo-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
}

// ── Field wrapper ────────────────────────────────────────────────
function Field({ label, error, required, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
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

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "", dept_id: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [deptLoading, setDeptLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);

    // Fetch departments when on step 3
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

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            // re-validate that field inline
            const allErrors = step === 1 ? validateStep1({ ...form, [field]: value })
                : step === 2 ? validateStep2({ ...form, [field]: value })
                    : validateStep3({ ...form, [field]: value });
            setErrors(prev => ({ ...prev, [field]: allErrors[field] }));
        }
    };

    const blur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const allErrors = step === 1 ? validateStep1(form)
            : step === 2 ? validateStep2(form)
                : validateStep3(form);
        setErrors(prev => ({ ...prev, [field]: allErrors[field] }));
    };

    // Step 1 → 2
    const handleStep1 = (e) => {
        e.preventDefault();
        setServerError("");
        setTouched({ firstName: true, lastName: true, email: true, password: true });
        const errs = validateStep1(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setStep(2);
    };

    // Step 2 → 3
    const handleStep2 = (e) => {
        e.preventDefault();
        setServerError("");
        setTouched(prev => ({ ...prev, role: true }));
        const errs = validateStep2(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setStep(3);
    };

    // Step 3 → submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setTouched(prev => ({ ...prev, dept_id: true }));
        const errs = validateStep3(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
                    email: form.email.trim(),
                    password: form.password,
                    role: form.role,
                    dept_id: form.dept_id,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setServerError(data.message || data.error || "Registration failed. Please try again.");
                return;
            }
            setSuccess(true);
        } catch {
            setServerError("Cannot connect to server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const strength = form.password ? passwordStrength(form.password) : null;

    // ── Success screen ───────────────────────────────────────────
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
                            An admin will review your registration and activate your account. You&apos;ll be able to log in once approved.
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

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4 py-12">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[80px]" />
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">Create your account</h1>
                    <p className="text-sm text-gray-500">Join your organization on ReportFlow</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${s === step
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                : s < step
                                    ? "bg-indigo-100 text-indigo-600 border-indigo-300"
                                    : "bg-white text-gray-400 border-gray-200"
                                }`}>
                                {s < step ? (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-12 h-0.5 transition-all ${step > s ? "bg-indigo-400" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

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

                    {/* ── Step 1 ── */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} className="space-y-4" noValidate>
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 1 — Your details</p>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="First name" error={touched.firstName && errors.firstName} required>
                                    <Input
                                        type="text"
                                        placeholder="Alice"
                                        value={form.firstName}
                                        onChange={e => set("firstName", e.target.value)}
                                        onBlur={() => blur("firstName")}
                                        hasError={!!(touched.firstName && errors.firstName)}
                                        autoComplete="given-name"
                                    />
                                </Field>
                                <Field label="Last name" error={touched.lastName && errors.lastName} required>
                                    <Input
                                        type="text"
                                        placeholder="Smith"
                                        value={form.lastName}
                                        onChange={e => set("lastName", e.target.value)}
                                        onBlur={() => blur("lastName")}
                                        hasError={!!(touched.lastName && errors.lastName)}
                                        autoComplete="family-name"
                                    />
                                </Field>
                            </div>

                            <Field label="Work email" error={touched.email && errors.email} required>
                                <Input
                                    type="email"
                                    placeholder="alice@company.com"
                                    value={form.email}
                                    onChange={e => set("email", e.target.value)}
                                    onBlur={() => blur("email")}
                                    hasError={!!(touched.email && errors.email)}
                                    autoComplete="email"
                                />
                            </Field>

                            <Field label="Password" error={touched.password && errors.password} required>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={e => set("password", e.target.value)}
                                        onBlur={() => blur("password")}
                                        hasError={!!(touched.password && errors.password)}
                                        autoComplete="new-password"
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
                                {/* Password strength bar */}
                                {form.password && strength && (
                                    <div className="mt-2">
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                        </div>
                                        <p className={`text-[10px] mt-1 font-medium ${strength.label === "Weak" ? "text-red-400"
                                            : strength.label === "Fair" ? "text-amber-500"
                                                : strength.label === "Good" ? "text-indigo-500"
                                                    : "text-emerald-500"
                                            }`}>{strength.label} password</p>
                                    </div>
                                )}
                            </Field>

                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5 mt-2"
                            >
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* ── Step 2 ── */}
                    {step === 2 && (
                        <form onSubmit={handleStep2} className="space-y-4" noValidate>
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 2 — Your role</p>
                            <div className="space-y-2">
                                {ROLES.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => set("role", r.value)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${form.role === r.value
                                            ? `${r.bg} ${r.border}`
                                            : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        <span className={`flex-shrink-0 ${form.role === r.value ? r.text : "text-gray-400"}`}>
                                            <RoleIcon role={r.value} />
                                        </span>
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
                            {touched.role && errors.role && (
                                <p className="text-[11px] text-red-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {errors.role}
                                </p>
                            )}
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => { setStep(1); setServerError(""); }}
                                    className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200 transition-all">
                                    ← Back
                                </button>
                                <button type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 hover:-translate-y-0.5">
                                    Continue →
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 3 ── */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <p className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Step 3 — Your department</p>

                            <Field label="Department" error={touched.dept_id && errors.dept_id} required>
                                {deptLoading ? (
                                    <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400">
                                        Loading departments…
                                    </div>
                                ) : (
                                    <select
                                        value={form.dept_id}
                                        onChange={e => set("dept_id", e.target.value)}
                                        onBlur={() => blur("dept_id")}
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 
                                            focus:outline-none focus:bg-white focus:ring-2 transition-all appearance-none cursor-pointer
                                            ${touched.dept_id && errors.dept_id
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                                            }`}
                                    >
                                        <option value="">Select your department…</option>
                                        {departments.map((d) => (
                                            <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                                        ))}
                                    </select>
                                )}
                            </Field>

                            <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <p className="text-[11px] text-amber-700 leading-relaxed">
                                    Your account will be <strong>inactive</strong> until an admin approves your registration and assigns you to a team.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => { setStep(2); setServerError(""); }}
                                    className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200 transition-all">
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading || deptLoading}
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