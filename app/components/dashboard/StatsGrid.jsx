"use client";

/**
 * StatsGrid — wraps 4-6 stat cards in a responsive grid.
 *
 * Props:
 *  stats: Array<{
 *    label: string,
 *    value: string | number,
 *    icon: ReactNode,
 *    trend?: string,          // e.g. "+12%" — omit to hide trend
 *    trendUp?: boolean,       // true = green, false = red
 *    color?: "indigo" | "violet" | "sky" | "emerald" | "rose" | "amber"
 *  }>
 *  cols?: 2 | 3 | 4          // default 4
 */

const colorMap = {
    indigo: {
        bg: "bg-indigo-50",
        icon: "bg-indigo-100 text-indigo-600",
        value: "text-indigo-700",
    },
    violet: {
        bg: "bg-violet-50",
        icon: "bg-violet-100 text-violet-600",
        value: "text-violet-700",
    },
    sky: {
        bg: "bg-sky-50",
        icon: "bg-sky-100 text-sky-600",
        value: "text-sky-700",
    },
    emerald: {
        bg: "bg-emerald-50",
        icon: "bg-emerald-100 text-emerald-600",
        value: "text-emerald-700",
    },
    rose: {
        bg: "bg-rose-50",
        icon: "bg-rose-100 text-rose-600",
        value: "text-rose-700",
    },
    amber: {
        bg: "bg-amber-50",
        icon: "bg-amber-100 text-amber-600",
        value: "text-amber-700",
    },
};

function StatCard({ label, value, icon, trend, trendUp, color = "indigo" }) {
    const c = colorMap[color] ?? colorMap.indigo;

    return (
        <div className={`rounded-2xl p-5 ${c.bg} flex flex-col gap-3`}>
            {/* top row: icon + trend */}
            <div className="flex items-start justify-between">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.icon}`}>
                    {icon}
                </span>
                {trend !== undefined && (
                    <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-600"
                            }`}
                    >
                        {trendUp ? "▲" : "▼"} {trend}
                    </span>
                )}
            </div>

            {/* value */}
            <p className={`text-3xl font-extrabold leading-none ${c.value}`}>{value}</p>

            {/* label */}
            <p className="text-sm font-medium text-[#6b7280]">{label}</p>
        </div>
    );
}

const colsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export default function StatsGrid({ stats = [], cols = 4 }) {
    return (
        <div className={`grid gap-4 ${colsClass[cols] ?? colsClass[4]}`}>
            {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
            ))}
        </div>
    );
}