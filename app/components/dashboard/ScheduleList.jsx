"use client";

/**
 * ScheduleList — upcoming report deadlines with days-left countdown.
 * Used on the Employee dashboard.
 *
 * Props:
 *  schedules: Array<{
 *    id: number | string,
 *    reportType: string,
 *    department: string,
 *    dueDate: string,         // ISO date string: "2025-06-15"
 *    frequency: string,       // "Monthly" | "Bi-Weekly" | "Weekly" | "Quarterly"
 *    submitted?: boolean,     // has the employee already submitted?
 *  }>
 *  onSubmit?: (schedule) => void   // CTA handler
 *  title?: string
 */

const FREQ_COLORS = {
    Monthly: "bg-indigo-100 text-indigo-700",
    "Bi-Weekly": "bg-violet-100 text-violet-700",
    Weekly: "bg-sky-100 text-sky-700",
    Quarterly: "bg-amber-100 text-amber-700",
};

function daysLeft(dueDateStr) {
    const due = new Date(dueDateStr);
    const now = new Date();
    // strip time
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.round((due - now) / (1000 * 60 * 60 * 24));
}

function urgencyStyle(days, submitted) {
    if (submitted) return { bar: "bg-emerald-500", label: "Submitted", cls: "text-emerald-600 bg-emerald-50" };
    if (days < 0) return { bar: "bg-rose-500", label: "Overdue", cls: "text-rose-600 bg-rose-50" };
    if (days === 0) return { bar: "bg-rose-500", label: "Due Today", cls: "text-rose-600 bg-rose-50" };
    if (days <= 3) return { bar: "bg-amber-400", label: `${days}d left`, cls: "text-amber-700 bg-amber-50" };
    if (days <= 7) return { bar: "bg-sky-500", label: `${days}d left`, cls: "text-sky-700 bg-sky-50" };
    return { bar: "bg-indigo-400", label: `${days}d left`, cls: "text-indigo-700 bg-indigo-50" };
}

export default function ScheduleList({
    schedules = [],
    onSubmit,
    title = "Upcoming Deadlines",
}) {
    const sorted = [...schedules].sort((a, b) => {
        if (a.submitted && !b.submitted) return 1;
        if (!a.submitted && b.submitted) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0f1117] mb-4">{title}</h3>

            {sorted.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">No upcoming deadlines.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {sorted.map((s) => {
                        const days = daysLeft(s.dueDate);
                        const style = urgencyStyle(days, s.submitted);
                        const freqCl = FREQ_COLORS[s.frequency] ?? "bg-gray-100 text-gray-600";

                        return (
                            <li
                                key={s.id}
                                className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${s.submitted ? "border-emerald-100 bg-emerald-50/30" : "border-gray-100"
                                    }`}
                            >
                                {/* left: urgency bar */}
                                <div className={`w-1 self-stretch rounded-full shrink-0 ${style.bar}`} />

                                {/* middle: info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-sm text-[#0f1117] truncate">
                                            {s.reportType}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${freqCl}`}>
                                            {s.frequency}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {s.department} · Due {new Date(s.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>

                                {/* right: badge + CTA */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.cls}`}>
                                        {style.label}
                                    </span>
                                    {!s.submitted && onSubmit && (
                                        <button
                                            onClick={() => onSubmit(s)}
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                                        >
                                            Submit
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}