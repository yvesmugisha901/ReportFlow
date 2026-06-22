"use client";
import { useEffect } from "react";

/**
 * Modal — reusable modal wrapper.
 * Handles backdrop, close on outside click, close on Escape key.
 *
 * Props:
 *  open: boolean
 *  onClose: () => void
 *  title?: string
 *  size?: "sm" | "md" | "lg" | "xl"   default "md"
 *  children: ReactNode
 */

const SIZES = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export default function Modal({ open, onClose, title, size = "md", children }) {
    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        function handler(e) { if (e.key === "Escape") onClose(); }
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`w-full ${SIZES[size] ?? SIZES.md} bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                        <h2 className="text-lg font-extrabold text-[#0f1117]">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-sm"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}