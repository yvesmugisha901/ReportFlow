"use client";

/**
 * StatCard — single stat card with icon, value, label and optional trend.
 * Used individually or wrapped in a grid.
 *
 * Props:
 *  label: string
 *  value: string | number
 *  icon: string | ReactNode
 *  trend?: string          e.g. "12 this month"
 *  trendUp?: boolean       true = green, false = red
 *  color?: "indigo" | "violet" | "sky" | "emerald" | "rose" | "amber"
 */

const COLOR_MAP = {
    indigo: { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", value: "text-indigo-700" },
    violet: { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600", value: "text-violet-700" },
    sky: { bg: "bg-sky-50", icon: "bg-sky-100 text-sky-600", value: "text-sky-700" },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    rose: { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", value: "text-rose-700" },
    amber: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", value: "text-amber-700" },
};

export default function StatCard({ label, value, icon, trend, trendUp, color = "indigo" }) {
    const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;

    return (
        <div className={`rounded-2xl p-5 flex flex-col gap-3 ${c.bg}`}>
            <div className="flex items-start justify-between">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.icon}`}>
                    {icon}
                </span>
                {trend !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
                        }`}>
                        {trendUp ? "▲" : "▼"} {trend}
                    </span>
                )}
            </div>
            <p className={`text-3xl font-extrabold leading-none ${c.value}`}>{value}</p>
            <p className="text-sm font-medium text-[#6b7280]">{label}</p>
        </div>
    );
}