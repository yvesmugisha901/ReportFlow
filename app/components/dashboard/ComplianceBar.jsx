"use client";

/**
 * ComplianceBar — department-level submission progress rows.
 *
 * Props:
 *  departments: Array<{
 *    name: string,
 *    submitted: number,
 *    total: number,
 *    color?: "indigo" | "violet" | "sky" | "emerald" | "rose" | "amber"
 *  }>
 *  title?: string   // section heading (default "Department Compliance")
 */

const barColor = {
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-400",
};

function pct(submitted, total) {
    if (!total) return 0;
    return Math.round((submitted / total) * 100);
}

function complianceLabel(p) {
    if (p === 100) return { text: "Complete", cls: "text-emerald-600 bg-emerald-50" };
    if (p >= 75) return { text: "On Track", cls: "text-sky-600 bg-sky-50" };
    if (p >= 40) return { text: "At Risk", cls: "text-amber-600 bg-amber-50" };
    return { text: "Behind", cls: "text-rose-600 bg-rose-50" };
}

const COLORS = ["indigo", "violet", "sky", "emerald", "rose", "amber"];

export default function ComplianceBar({ departments = [], title = "Department Compliance" }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0f1117] mb-4">{title}</h3>

            <div className="flex flex-col gap-4">
                {departments.map((dept, i) => {
                    const color = dept.color ?? COLORS[i % COLORS.length];
                    const p = pct(dept.submitted, dept.total);
                    const label = complianceLabel(p);

                    return (
                        <div key={dept.name} className="flex flex-col gap-1.5">
                            {/* header row */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-[#0f1117] truncate max-w-[180px]">
                                    {dept.name}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${label.cls}`}>
                                        {label.text}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {dept.submitted}/{dept.total}
                                    </span>
                                    <span className="text-xs font-bold text-[#0f1117] w-9 text-right">
                                        {p}%
                                    </span>
                                </div>
                            </div>

                            {/* bar */}
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor[color]}`}
                                    style={{ width: `${p}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {departments.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">No department data available.</p>
            )}
        </div>
    );
}