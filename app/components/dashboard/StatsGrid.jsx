"use client";

const colorMap = {
    indigo: { bg: "bg-indigo-50", icon: "bg-indigo-100  text-indigo-600", value: "text-indigo-700" },
    violet: { bg: "bg-violet-50", icon: "bg-violet-100  text-violet-600", value: "text-violet-700" },
    sky: { bg: "bg-sky-50", icon: "bg-sky-100     text-sky-600", value: "text-sky-700" },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-700" },
    rose: { bg: "bg-rose-50", icon: "bg-rose-100    text-rose-600", value: "text-rose-700" },
    amber: { bg: "bg-amber-50", icon: "bg-amber-100   text-amber-600", value: "text-amber-700" },
    teal: { bg: "bg-teal-50", icon: "bg-teal-100    text-teal-600", value: "text-teal-700" },
};

const S = { fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };

const ICONS = {
    reports: <svg className="w-5 h-5" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    pending: <svg className="w-5 h-5" {...S}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    approved: <svg className="w-5 h-5" {...S}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    departments: <svg className="w-5 h-5" {...S}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" /></svg>,
    employees: <svg className="w-5 h-5" {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    compliance: <svg className="w-5 h-5" {...S}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    hourglass: <svg className="w-5 h-5" {...S}><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" /></svg>,
    chart: <svg className="w-5 h-5" {...S}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    inbox: <svg className="w-5 h-5" {...S}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>,
    rejected: <svg className="w-5 h-5" {...S}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    // ✅ newly added
    eye: <svg className="w-5 h-5" {...S}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    pencil: <svg className="w-5 h-5" {...S}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    check: <svg className="w-5 h-5" {...S}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
};

function resolveIcon(icon) {
    if (!icon) return null;
    if (typeof icon === "string") return ICONS[icon] ?? null;
    return icon;
}

function StatCard({ label, value, icon, trend, trendUp, color = "indigo" }) {
    const c = colorMap[color] ?? colorMap.indigo;
    const renderedIcon = resolveIcon(icon);

    return (
        <div className={`rounded-2xl p-5 ${c.bg} flex flex-col gap-3`}>
            <div className="flex items-start justify-between">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                    {renderedIcon}
                </span>
                {trend !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                        {trendUp ? "▲" : "▼"} {trend}
                    </span>
                )}
            </div>
            <p className={`text-3xl font-extrabold leading-none ${c.value}`}>{value}</p>
            <p className="text-sm font-medium text-[#6b7280]">{label}</p>
        </div>
    );
}

const colsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    8: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-4",
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