/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ChevronLeft, ChevronRight, Inbox, RefreshCw } from "lucide-react";

import { formatCount, secondary } from "./partnerWorkspaceData";

const badgeStyles = {
  active: "bg-emerald-100 text-emerald-900", accepted: "bg-emerald-100 text-emerald-900",
  moderate: "bg-orange-100 text-orange-900", pending: "bg-orange-100 text-orange-900",
  inactive: "bg-violet-100 text-violet-900", expired: "bg-slate-100 text-slate-700",
  revoked: "bg-slate-100 text-slate-700", planned: "bg-indigo-100 text-indigo-900",
};

const tones = {
  violet: "border-violet-200/70 bg-[#ece3ff] text-violet-950",
  mint: "border-emerald-200/70 bg-[#d9f8ee] text-emerald-950",
  sky: "border-sky-200/70 bg-[#dceeff] text-sky-950",
  peach: "border-orange-200/70 bg-[#ffe9d6] text-orange-950",
};

export function Badge({ status, children }) {
  return <span className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[status] || badgeStyles.inactive}`}>{children}</span>;
}
export function PageHeading({ eyebrow = "Partner Workspace", title, description, action, icon: Icon = BriefcaseBusiness, featured = false }) {
  return <header className={`relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-[#302080] via-[#5334b3] to-[#7739c0] px-5 text-white shadow-lg shadow-violet-950/15 sm:px-8 ${featured ? "py-7 sm:py-9" : "py-5 sm:py-6"}`}>
    <div aria-hidden="true" className={`pointer-events-none absolute right-0 top-1/2 hidden aspect-square -translate-y-1/2 place-items-center sm:grid ${featured ? "w-60 lg:right-8" : "w-44"}`}>
      <div className="absolute inset-0 rounded-full border border-white/20" />
      <div className="absolute inset-[14%] rounded-full border border-white/25" />
      <div className="absolute inset-[28%] rounded-full border border-white/25 bg-white/10" />
      <span className="absolute right-[17%] top-[17%] size-2.5 rounded-full bg-emerald-200" />
      <span className="absolute bottom-[15%] left-[12%] size-2 rounded-full bg-orange-200" />
      <Icon className="relative size-10 text-violet-100" strokeWidth={1.5} />
    </div>
    <div className={`relative min-w-0 sm:mr-40 ${featured ? "lg:mr-60" : ""}`}>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-100"><Icon size={15} aria-hidden="true" />{eyebrow}</p>
      <h1 className={`mt-2 break-words font-extrabold tracking-tight ${featured ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-violet-50">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  </header>;
}
export function Metric({ icon: Icon, label, value, hint, tone = "violet" }) {
  return <article className={`min-w-0 rounded-2xl border p-3.5 sm:p-4 ${tones[tone]}`}>
    <span className="inline-flex rounded-xl bg-white/65 p-2"><Icon size={18} aria-hidden="true" /></span>
    <p className="mt-2 break-words text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">{formatCount(value)}</p>
    <h3 className="mt-1 text-sm font-semibold">{label}</h3>
    {hint && <p className="mt-1 text-xs leading-relaxed">{hint}</p>}
  </article>;
}
export function SectionHeading({ id, title, description, icon: Icon, tone = "violet", action }) {
  return <div className="flex flex-wrap items-center gap-3">
    <span className={`grid size-10 shrink-0 place-items-center rounded-xl border ${tones[tone]}`}><Icon size={18} aria-hidden="true" /></span>
    <div className="min-w-0 flex-1">
      <h2 id={id} className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="text-sm text-slate-600">{description}</p>}
    </div>
    {action}
  </div>;
}
export function StateMessage({ title, detail, retry, loading = false, action }) {
  return <div className="flex flex-col items-center gap-2 px-4 py-9 text-center" role={loading ? "status" : undefined}>
    <span className="mb-1 grid size-11 place-items-center rounded-xl bg-violet-100 text-violet-800">{loading ? <RefreshCw size={21} className="motion-safe:animate-spin" aria-hidden="true" /> : <Inbox size={22} aria-hidden="true" />}</span>
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    {detail && <p className="max-w-md text-sm text-slate-600">{detail}</p>}
    {retry && <button type="button" onClick={retry} className={secondary}>Try again</button>}
    {action}
  </div>;
}
export function Pagination({ page, lastPage, onPage }) {
  if (lastPage <= 1 && page <= 1) return null;
  return <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 px-4 py-3 sm:px-5">
    <p className="text-sm text-slate-600">Page {page} of {lastPage}</p>
    <div className="flex gap-2">
      <button type="button" className={secondary} disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} aria-hidden="true" /> Previous</button>
      <button type="button" className={secondary} disabled={page >= lastPage} onClick={() => onPage(page + 1)}>Next <ChevronRight size={16} aria-hidden="true" /></button>
    </div>
  </footer>;
}
export function SectionLink({ to, children }) {
  return <Link to={to} className="inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-semibold text-violet-800 hover:underline focus-visible:outline-violet-700">{children}<ArrowRight size={15} aria-hidden="true" /></Link>;
}
