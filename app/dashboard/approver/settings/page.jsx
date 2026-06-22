"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

function Section({ title, description, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
                <h2 className="text-sm font-bold text-gray-900">{title}</h2>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();

    const [profile, setProfile] = useState({ full_name: user?.full_name ?? "", email: user?.email ?? "" });
    const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
    const [profileMsg, setProfileMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [profileErr, setProfileErr] = useState("");
    const [passwordErr, setPasswordErr] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const roleLabel = { admin: "Admin", employee: "Employee", reviewer: "Reviewer", approver: "Approver" }[user?.role] ?? "User";

    async function saveProfile() {
        if (!profile.full_name.trim()) return setProfileErr("Name is required.");
        setSavingProfile(true); setProfileErr(""); setProfileMsg("");
        try {
            await api.patch("/auth/profile", { full_name: profile.full_name });
            await refreshUser();
            setProfileMsg("Profile updated successfully.");
        } catch (e) {
            setProfileErr(e?.response?.data?.error ?? "Failed to update profile.");
        } finally { setSavingProfile(false); }
    }

    async function savePassword() {
        if (!password.current || !password.next) return setPasswordErr("Fill in all fields.");
        if (password.next !== password.confirm) return setPasswordErr("Passwords do not match.");
        if (password.next.length < 8) return setPasswordErr("Password must be at least 8 characters.");
        setSavingPassword(true); setPasswordErr(""); setPasswordMsg("");
        try {
            await api.patch("/auth/password", { current_password: password.current, new_password: password.next });
            setPasswordMsg("Password changed successfully.");
            setPassword({ current: "", next: "", confirm: "" });
        } catch (e) {
            setPasswordErr(e?.response?.data?.error ?? "Failed to change password.");
        } finally { setSavingPassword(false); }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

                <div className="mb-2">
                    <p className="text-sm text-gray-500 mb-1">{roleLabel} · Account</p>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                </div>

                {/* Profile */}
                <Section title="Profile" description="Update your display name.">
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
                            <input
                                value={profile.full_name}
                                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                            <input value={profile.email} disabled className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                        </div>
                        {profileErr && <p className="text-xs text-rose-500">{profileErr}</p>}
                        {profileMsg && <p className="text-xs text-emerald-600">{profileMsg}</p>}
                        <button onClick={saveProfile} disabled={savingProfile}
                            className="self-start px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                            {savingProfile ? "Saving…" : "Save Profile"}
                        </button>
                    </div>
                </Section>

                {/* Password */}
                <Section title="Change Password" description="Use a strong password of at least 8 characters.">
                    <div className="flex flex-col gap-3">
                        {[
                            ["Current Password", "current"],
                            ["New Password", "next"],
                            ["Confirm New Password", "confirm"],
                        ].map(([label, key]) => (
                            <div key={key}>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                                <input
                                    type="password"
                                    value={password[key]}
                                    onChange={e => setPassword(p => ({ ...p, [key]: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                            </div>
                        ))}
                        {passwordErr && <p className="text-xs text-rose-500">{passwordErr}</p>}
                        {passwordMsg && <p className="text-xs text-emerald-600">{passwordMsg}</p>}
                        <button onClick={savePassword} disabled={savingPassword}
                            className="self-start px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                            {savingPassword ? "Saving…" : "Change Password"}
                        </button>
                    </div>
                </Section>

                {/* Account info */}
                <Section title="Account Info" description="Read-only details about your account.">
                    <dl className="grid grid-cols-2 gap-3">
                        {[
                            ["Role", roleLabel],
                            ["User ID", user?.user_id ?? "—"],
                            ["Department", user?.department?.name ?? "—"],
                            ["Member Since", user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"],
                        ].map(([label, val]) => (
                            <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-gray-800">{val}</p>
                            </div>
                        ))}
                    </dl>
                </Section>
            </div>
        </div>
    );
}