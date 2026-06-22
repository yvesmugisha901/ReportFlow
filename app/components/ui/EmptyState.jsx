"use client";

/**
 * EmptyState — placeholder shown when a list/table has no data.
 *
 * Props:
 *  icon?: string          emoji icon, default "📭"
 *  title?: string         main message
 *  message?: string       sub message
 *  action?: {
 *    label: string,
 *    onClick: () => void
 *  }
 */

export default function EmptyState({
    icon = "📭",
    title = "Nothing here yet",
    message = "Check back later or adjust your filters.",
    action,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-base font-bold text-gray-700 mb-1">{title}</h3>
            <p className="text-sm text-gray-400 max-w-xs">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-200"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}