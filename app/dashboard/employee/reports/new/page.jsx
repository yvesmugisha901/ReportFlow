"use client";
import { useRouter } from "next/navigation";
import ReportForm from "@/components/reports/ReportForm";
import api from "@/lib/axios";

export default function NewReportPage() {
    const router = useRouter();

    async function handleSubmit(formData) {
        await api.post("/reports", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        router.push("/dashboard/employee/reports");
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-6">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-sky-100 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Employee</p>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Submit a Report</h1>
                </div>

                {/* Inline form — not a modal */}
                <ReportForm
                    prefill={null}
                    inline={true}
                    onClose={() => router.push("/dashboard/employee/reports")}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}