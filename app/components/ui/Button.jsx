"use client";

/**
 * Button — reusable button with variants and sizes.
 *
 * Props:
 *  variant?: "primary" | "secondary" | "danger" | "ghost"   default "primary"
 *  size?: "sm" | "md" | "lg"                                default "md"
 *  icon?: ReactNode       left icon
 *  loading?: boolean      shows spinner, disables button
 *  disabled?: boolean
 *  onClick?: () => void
 *  children: ReactNode
 *  className?: string     extra classes
 */

const VARIANTS = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
};

const SIZES = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
};

export default function Button({
    variant = "primary",
    size = "md",
    icon,
    loading = false,
    disabled = false,
    onClick,
    children,
    className = "",
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2 font-semibold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size] ?? SIZES.md}
        ${className}
      `}
        >
            {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon ? (
                <span className="text-base leading-none">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}