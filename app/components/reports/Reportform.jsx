"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const FREQUENCIES = ["weekly", "bi-weekly", "monthly", "quarterly"];

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, "-");
}

export default function ReportForm({ prefill = null, onClose, onSubmit }) {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const fileInputRef = useRef(null);
    const bodyRef = useRef(null);

    const [form, setForm] = useState({
        schedule_id: "",
        title: prefill?.reportType ?? "",
        frequency: prefill?.frequency?.toLowerCase() ?? "",
        periodStart: "",
        periodEnd: "",
        summary: "",
        details: "",
        files: [],
        notes: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/schedules");
                const list = res.data.schedules ?? res.data ?? [];
                setSchedules(list);
                if (prefill?.frequency) {
                    const match = list.find(s =>
                        s.frequency?.toLowerCase() === prefill.frequency?.toLowerCase()
                    );
                    if (match) {
                        setForm(f => ({ ...f, schedule_id: match.schedule_id }));
                    }
                }
            } catch {
                // schedules optional
            } finally {
                setLoadingSchedules(false);
            }
        };
        load();
    }, []);

    function set(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
        setSubmitError("");
    }

    function handleScheduleChange(scheduleId) {
        set("schedule_id", scheduleId);
        if (scheduleId) {
            const s = schedules.find(s => String(s.schedule_id) === String(scheduleId));
            if (s?.frequency) set("frequency", s.frequency);
        }
    }

    function validateStep1() {
        const e = {};
        if (!form.periodStart) e.periodStart = "Enter period start date";
        if (!form.periodEnd) e.periodEnd = "Enter period end date";
        if (!form.frequency) e.frequency = "Select a frequency";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validateStep2() {
        const e = {};
        if (!form.title.trim()) e.title = "Add a report title";
        if (!form.summary.trim()) e.summary = "Write a brief summary";
        if (!form.details.trim()) e.details = "Provide report details";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    // ── Fixed: else if prevents both conditions firing at once ──
    function handleNext() {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2) {
            if (validateStep2()) {
                setStep(3);
            } else {
                bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    }

    function handleFileChange(e) {
        const picked = Array.from(e.target.files);
        set("files", [...form.files, ...picked]);
    }

    function removeFile(i) {
        set("files", form.files.filter((_, idx) => idx !== i));
    }

    async function handleSubmit() {
        setSubmitting(true);
        setSubmitError("");
        try {
            const fd = new FormData();
            fd.append("title", form.title);
            fd.append("content", form.details);
            fd.append("summary", form.summary);
            fd.append("notes", form.notes);
            fd.append("period_start", form.periodStart);
            fd.append("period_end", form.periodEnd);
            if (form.schedule_id) fd.append("schedule_id", form.schedule_id);

            // Use "files[]" to match multer's upload.array('files[]', 10)
            form.files.forEach((file) => {
                fd.append("files[]", file);
            });

            await onSubmit(fd);
            setSubmitted(true);
        } catch (err) {
            const msg = err?.response?.data?.error ?? "Submission failed. Please try again.";
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    const STEPS = ["Details", "Content", "Review & Submit"];
    const selectedSchedule = schedules.find(s => String(s.schedule_id) === String(form.schedule_id));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-extrabold text-[#0f1117]">Submit Report</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in all sections and attach your file</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-sm">✕</button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 py-4 border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-0">
                        {STEPS.map((label, i) => {
                            const n = i + 1;
                            const active = step === n;
                            const done = step > n;
                            return (
                                <div key={label} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-indigo-600 text-white" : active ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-gray-100 text-gray-400"}`}>
                                            {done ? "✓" : n}
                                        </div>
                                        <span className={`text-[10px] mt-1 font-medium ${active || done ? "text-indigo-600" : "text-gray-400"}`}>{label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${done ? "bg-indigo-400" : "bg-gray-200"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Body */}
                <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-5">

                    {/* SUCCESS */}
                    {submitted && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mb-4">✅</div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Report Submitted!</h3>
                            <p className="text-sm text-gray-500">Your report has been sent to your department reviewer.</p>
                        </div>
                    )}

                    {/* STEP 1 — Details */}
                    {!submitted && step === 1 && (
                        <div className="flex flex-col gap-4">
                            <Field label="Report Schedule" hint="Optional — links to a deadline">
                                {loadingSchedules ? (
                                    <div className="text-xs text-gray-400 py-2">Loading schedules…</div>
                                ) : (
                                    <select
                                        value={form.schedule_id}
                                        onChange={(e) => handleScheduleChange(e.target.value)}
                                        className={inputCls()}
                                    >
                                        <option value="">— No schedule —</option>
                                        {schedules.map((s) => (
                                            <option key={s.schedule_id} value={s.schedule_id}>
                                                {s.title ?? `Schedule #${s.schedule_id}`}
                                                {s.deadline ? ` — due ${new Date(s.deadline).toLocaleDateString()}` : ""}
                                                {s.frequency ? ` (${capitalize(s.frequency)})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>

                            {selectedSchedule && (
                                <div className="bg-indigo-50 rounded-xl px-4 py-3 text-xs text-indigo-700 flex flex-wrap gap-x-4 gap-y-1">
                                    {selectedSchedule.department?.name && <span>🏢 {selectedSchedule.department.name}</span>}
                                    {selectedSchedule.team?.name && <span>👥 {selectedSchedule.team.name}</span>}
                                    {selectedSchedule.deadline && <span>📅 Due {new Date(selectedSchedule.deadline).toLocaleDateString()}</span>}
                                </div>
                            )}

                            <Field label="Frequency" error={errors.frequency} required>
                                <div className="flex flex-wrap gap-2">
                                    {FREQUENCIES.map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => set("frequency", f)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.frequency === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}
                                        >
                                            {capitalize(f)}
                                        </button>
                                    ))}
                                </div>
                                {errors.frequency && <p className="text-xs text-rose-500 mt-1">{errors.frequency}</p>}
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Period Start" error={errors.periodStart} required>
                                    <input type="date" value={form.periodStart} onChange={(e) => set("periodStart", e.target.value)} className={inputCls(errors.periodStart)} />
                                </Field>
                                <Field label="Period End" error={errors.periodEnd} required>
                                    <input type="date" value={form.periodEnd} onChange={(e) => set("periodEnd", e.target.value)} className={inputCls(errors.periodEnd)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Content */}
                    {!submitted && step === 2 && (
                        <div className="flex flex-col gap-4">
                            <Field label="Report Title" error={errors.title} required>
                                <input
                                    type="text"
                                    placeholder="e.g. May 2026 Monthly Operations Report"
                                    value={form.title}
                                    onChange={(e) => set("title", e.target.value)}
                                    className={inputCls(errors.title)}
                                />
                            </Field>

                            <Field label="Executive Summary" error={errors.summary} required>
                                <textarea
                                    rows={3}
                                    placeholder="Brief overview of what this report covers…"
                                    value={form.summary}
                                    onChange={(e) => set("summary", e.target.value)}
                                    className={`${inputCls(errors.summary)} resize-none`}
                                />
                            </Field>

                            <Field label="Report Details" error={errors.details} required>
                                <textarea
                                    rows={5}
                                    placeholder="Provide full details, findings, and key metrics…"
                                    value={form.details}
                                    onChange={(e) => set("details", e.target.value)}
                                    className={`${inputCls(errors.details)} resize-none`}
                                />
                            </Field>

                            <Field label="Attachments" hint="PDF, DOCX, XLSX — max 10MB each">
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="text-2xl mb-1">📎</div>
                                    <p className="text-sm font-medium text-gray-600">Click to attach files</p>
                                    <p className="text-xs text-gray-400">PDF, DOCX, XLSX — max 10MB each</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xlsx,.xls"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {form.files.length > 0 && (
                                    <ul className="mt-3 flex flex-col gap-1.5">
                                        {form.files.map((f, i) => (
                                            <li key={i} className="flex items-center justify-between bg-indigo-50 rounded-xl px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-indigo-400">📎</span>
                                                    <span className="text-xs font-medium text-indigo-700 truncate">{f.name}</span>
                                                    <span className="text-[10px] text-gray-400 shrink-0">
                                                        ({(f.size / 1024 / 1024).toFixed(1)} MB)
                                                    </span>
                                                </div>
                                                <button onClick={() => removeFile(i)} className="text-xs text-rose-500 hover:text-rose-700 ml-2 font-bold shrink-0">✕</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Field>

                            <Field label="Additional Notes" hint="Optional">
                                <textarea
                                    rows={2}
                                    placeholder="Anything else the reviewer should know…"
                                    value={form.notes}
                                    onChange={(e) => set("notes", e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                                />
                            </Field>
                        </div>
                    )}

                    {/* STEP 3 — Review */}
                    {!submitted && step === 3 && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-indigo-50 rounded-2xl p-5">
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-3">Report Summary</p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {[
                                        ["Schedule", selectedSchedule?.title ?? "None"],
                                        ["Frequency", capitalize(form.frequency)],
                                        ["Period", form.periodStart && form.periodEnd ? `${form.periodStart} → ${form.periodEnd}` : "—"],
                                        ["Title", form.title],
                                    ].map(([label, val]) => (
                                        <div key={label}>
                                            <dt className="text-[10px] font-semibold text-indigo-500 uppercase">{label}</dt>
                                            <dd className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{val || "—"}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Summary</p>
                                <p className="text-sm text-gray-700">{form.summary || "—"}</p>
                            </div>

                            {form.files.length > 0 && (
                                <div className="bg-gray-50 rounded-2xl p-5">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Attachments ({form.files.length})
                                    </p>
                                    <ul className="flex flex-col gap-1">
                                        {form.files.map((f, i) => (
                                            <li key={i} className="text-sm text-indigo-600 font-medium flex items-center gap-2">
                                                <span>📎</span>
                                                <span className="truncate">{f.name}</span>
                                                <span className="text-xs text-gray-400">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {submitError && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-600">
                                    ⚠️ {submitError}
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                                <span className="text-lg">ℹ️</span>
                                <p className="text-xs text-amber-700">
                                    Once submitted, your report will go to your <strong>department reviewer</strong> for Stage 1 review.
                                    You can track the status from your dashboard.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                        <button
                            onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            {step === 1 ? "Cancel" : "← Back"}
                        </button>

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md shadow-indigo-200"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md shadow-emerald-200 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                                ) : (
                                    <>✓ Submit Report</>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function inputCls(error) {
    return `w-full border ${error ? "border-rose-400 bg-rose-50" : "border-gray-200"} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white`;
}

function Field({ label, children, error, hint, required }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700">
                {label} {required && <span className="text-rose-500">*</span>}
                {hint && <span className="text-gray-400 font-normal ml-1">— {hint}</span>}
            </label>
            {children}
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}