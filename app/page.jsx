"use client";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#0f1117] overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-100 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-100 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-sky-100 blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">ReportFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-gray-900 transition-colors">Workflow</a>
          <a href="#roles" className="hover:text-gray-900 transition-colors">Roles</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors font-medium">
            Sign in
          </Link>
          <Link href="/auth/register" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-200 font-medium">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <h1 className="text-5xl md:text-[4.5rem] font-extrabold tracking-tight leading-[1.06] max-w-4xl mb-5 text-gray-900">
          Reports that flow
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
            through your organization
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-500 max-w-lg leading-relaxed mb-10">
          Structured submission, two-stage approval, and real-time tracking — all in one system built for how your teams actually work.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link href="/auth/register" className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5">
            Start using ReportFlow →
          </Link>
          <Link href="/auth/login" className="px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
            Sign in to your account
          </Link>
        </div>

        {/* Dashboard preview */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f8f9fc] to-transparent z-10 pointer-events-none rounded-b-2xl" />
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-[11px] text-gray-400 tracking-wide">reportflow.internal / admin / dashboard</span>
            </div>
            <div className="flex">
              <div className="hidden md:flex w-52 flex-col border-r border-gray-100 p-4 gap-1 bg-gray-50/50">
                {["Dashboard", "Reports", "Departments", "Approvals", "Users", "Settings"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${i === 0 ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500"
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-200" : "bg-gray-300"}`} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-5 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Total Reports", value: "248", icon: "📋" },
                    { label: "Pending Review", value: "17", icon: "⏳" },
                    { label: "Approved", value: "198", icon: "✅" },
                    { label: "Departments", value: "6", icon: "🏢" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="text-xs font-semibold text-gray-600">Recent Submissions</span>
                    <span className="text-[11px] text-indigo-600 font-medium">View all →</span>
                  </div>
                  {[
                    { name: "Monthly Finance Report", dept: "Finance", status: "Approved", color: "bg-emerald-100 text-emerald-700" },
                    { name: "Q2 Operations Summary", dept: "Operations", status: "Under Review", color: "bg-amber-100 text-amber-700" },
                    { name: "HR Compliance Report", dept: "Human Resources", status: "Pending", color: "bg-gray-100 text-gray-600" },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-xs font-medium text-gray-800">{r.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{r.dept}</div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${r.color}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-8 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">Everything your org needs</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">From first submission to final sign-off — tracked, notified, and archived.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "🗓️", title: "Scheduled Reporting", desc: "Admins define frequencies — monthly, bi-weekly — and timelines auto-generate for each team and department." },
            { icon: "🔁", title: "Two-Stage Approval", desc: "Department Reviewer then COO/Final Approver. Approve, reject, or request changes at each stage." },
            { icon: "🔔", title: "Smart Notifications", desc: "In-app and email alerts triggered when reports are requested, submitted, reviewed, or approved." },
            { icon: "📊", title: "Role Dashboards", desc: "Tailored views for Admin, Employee, Reviewer, and Approver. Each role sees exactly what they need." },
            { icon: "🔍", title: "Search & Filtering", desc: "Filter reports by department, team, date, report type, and status in seconds." },
            { icon: "🏢", title: "Org Management", desc: "Create departments, build teams inside them, register employees and manage their assignments." },
          ].map((f) => (
            <div key={f.title} className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-200 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative z-10 px-8 py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">The approval journey</h2>
          <p className="text-gray-500 text-sm mb-14">Every report travels a clear, auditable path from submission to archive.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
            {[
              { n: "01", label: "Submit", desc: "Employee uploads or fills the report form on schedule", color: "indigo" },
              { n: "02", label: "Dept. Review", desc: "Department Reviewer approves or requests changes", color: "violet" },
              { n: "03", label: "Final Approval", desc: "COO or Final Approver gives the last sign-off", color: "sky" },
              { n: "04", label: "Archived", desc: "Stored with full status history and timestamps", color: "emerald" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center text-center w-44 px-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold mb-3 border-2 shadow-sm ${s.color === "indigo" ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
                    s.color === "violet" ? "bg-violet-50 text-violet-600 border-violet-200" :
                      s.color === "sky" ? "bg-sky-50 text-sky-600 border-sky-200" :
                        "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}>{s.n}</div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{s.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
                </div>
                {i < 3 && <div className="hidden md:block w-8 h-px bg-gray-200 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative z-10 px-8 py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">Built for every role</h2>
          <p className="text-gray-500 text-sm">Each role has its own dashboard and permissions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: "⚙️", role: "Admin", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", check: "text-indigo-500", perms: ["Create departments & teams", "Register employees", "Define report schedules", "Full system access"] },
            { icon: "👤", role: "Employee", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", check: "text-sky-500", perms: ["Submit scheduled reports", "Upload files or forms", "Track submission status", "Receive notifications"] },
            { icon: "🔍", role: "Dept. Reviewer", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", check: "text-violet-500", perms: ["Review dept. submissions", "Approve / reject / revise", "See dept. progress", "Stage-1 sign-off"] },
            { icon: "✅", role: "Final Approver", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", check: "text-emerald-500", perms: ["Final approval authority", "Cross-dept. visibility", "Compliance tracking", "Stage-2 sign-off"] },
          ].map((r) => (
            <div key={r.role} className={`bg-white border ${r.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center text-xl mb-3`}>{r.icon}</div>
              <div className={`text-sm font-bold mb-3 ${r.text}`}>{r.role}</div>
              <ul className="space-y-1.5">
                {r.perms.map(p => (
                  <li key={p} className="text-[11px] text-gray-500 flex items-start gap-2">
                    <span className={`mt-0.5 font-bold ${r.check}`}>✓</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 py-24 text-center">
        <div className="max-w-lg mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-14 shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl font-bold mb-3 text-white">Ready to get started?</h2>
          <p className="text-indigo-200 text-sm mb-8">Create your account and manage reports with structure.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 text-indigo-600 text-sm font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
            Create your account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 px-8 py-7 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 bg-white">
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-600" />
          <span className="font-medium text-gray-500">ReportFlow — Internal Reporting System</span>
        </div>
        <span>© {new Date().getFullYear()} All rights reserved</span>
      </footer>
    </div>
  );
}