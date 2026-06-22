"use client";

/**
 * Avatar — initials circle for user display.
 *
 * Props:
 *  name: string           full name, e.g. "Alice Uwimana"
 *  size?: "sm"|"md"|"lg"  default "md"
 *  color?: "indigo"|"violet"|"sky"|"emerald"|"rose"|"amber"
 *          if omitted, color is derived from the name automatically
 */

const COLORS = [
    "bg-indigo-500",
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
];

const SIZES = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
};

function getInitials(name = "") {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return COLORS[hash % COLORS.length];
}

export default function Avatar({ name = "", size = "md", color }) {
    const initials = getInitials(name);
    const bg = color ? `bg-${color}-500` : getColor(name);

    return (
        <div
            title={name}
            className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${bg} ${SIZES[size] ?? SIZES.md}`}
        >
            {initials}
        </div>
    );
}