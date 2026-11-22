/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ChevronLeft, ChevronRight, Inbox, RefreshCw } from "lucide-react";

import { formatCount, secondary } from "./partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "./partnerPrefs";

// Status pills (high-contrast light + dark).
const badgeStyles = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  moderate: "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  pending: "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  inactive: "bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  expired: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  revoked: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  planned: "bg-teal-50 text-teal-700 border border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800",
};

/**
 * Colour accents (the demo's teal/emerald core + sky, amber, rose, violet).
 * tile = icon square, card = light-tinted card, bar = top accent strip.
 */
export const tones = {
  violet: { tile: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white", card: "border-violet-100 bg-violet-50/70 text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-100", bar: "from-violet-500 to-fuchsia-500" },
  teal: { tile: "bg-gradient-to-br from-teal-500 to-emerald-500 text-white", card: "border-teal-100 bg-teal-50/70 text-teal-950 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-100", bar: "from-teal-500 to-emerald-500" },
  mint: { tile: "bg-gradient-to-br from-emerald-500 to-green-500 text-white", card: "border-emerald-100 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100", bar: "from-emerald-500 to-green-500" },
  sky: { tile: "bg-gradient-to-br from-sky-500 to-blue-500 text-white", card: "border-sky-100 bg-sky-50/70 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100", bar: "from-sky-500 to-blue-500" },
  peach: { tile: "bg-gradient-to-br from-amber-400 to-orange-500 text-white", card: "border-amber-100 bg-amber-50/70 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100", bar: "from-amber-400 to-orange-500" },
  rose: { tile: "bg-gradient-to-br from-rose-500 to-pink-500 text-white", card: "border-rose-100 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100", bar: "from-rose-500 to-pink-500" },
  purple: { tile: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white", card: "border-violet-100 bg-violet-50/70 text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-100", bar: "from-violet-500 to-fuchsia-500" },
};
const tone = (name) => tones[name] || tones.teal;

export function Badge({ status, children }) {
  return <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeStyles[status] || badgeStyles.planned}`}>{children}</span>;
}

/** Page banner: teal → emerald gradient with soft glow circles (the demo's hero colours). */
export function PageHeading({ eyebrow = "Partner Portal", title, description, action, icon: Icon = BriefcaseBusiness, featured = false }) {
  return <header className={`partner-fade-in relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 px-5 text-white sm:px-7 ${featured ? "py-7 sm:py-9" : "py-5 sm:py-6"}`}>
    <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 -z-10 h-56 w-56 rounded-full bg-white/10" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-24 -z-10 h-44 w-44 rounded-full bg-amber-300/20" />
    <div aria-hidden="true" className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 sm:grid h-20 w-20 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
      <Icon className="h-9 w-9 text-white" strokeWidth={1.6} />
    </div>
    <div className="relative min-w-0 sm:mr-28">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-teal-50"><Icon size={14} aria-hidden="true" />{eyebrow}</p>
      <h1 className={`mt-1.5 break-words font-extrabold tracking-tight ${featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>{title}</h1>
      {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-teal-50/95">{description}</p>}
      {action && <div className="mt-4 flex flex-wrap items-center gap-2.5">{action}</div>}
    </div>
  </header>;
}

/** KPI card: white card, coloured gradient icon tile and a thin accent bar on top. */
export function Metric({ icon: Icon, label, value, hint, tone: toneName = "teal" }) {
  const t = tone(toneName);
  const num = useNumber();
  return <article className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 partner-soft-shadow dark:border-slate-800 dark:bg-slate-900 transition-colors">
    <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.bar}`} />
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</h3>
      <span className={`inline-grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.tile}`}><Icon size={18} aria-hidden="true" /></span>
    </div>
    <p className="mt-1 break-words text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white sm:text-3xl">
      {value != null && Number.isFinite(Number(value)) ? num(value) : formatCount(value)}
    </p>
    {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
  </article>;
}

export function SectionHeading({ id, title, description, icon: Icon, tone: toneName = "teal", action }) {
  return <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone(toneName).tile}`}><Icon size={18} aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <h2 id={id} className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">{title}</h2>
        {description && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
    </div>
    {action}
  </div>;
}

export function StateMessage({ title, detail, retry, loading = false, action }) {
  const { t } = usePartnerPrefs();
  return <div className="flex flex-col items-center gap-2 px-4 py-10 text-center" role={loading ? "status" : undefined}>
    <span className="mb-1 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white">{loading ? <RefreshCw size={22} className="motion-safe:animate-spin" aria-hidden="true" /> : <Inbox size={24} aria-hidden="true" />}</span>
    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{title}</p>
    {detail && <p className="max-w-md text-xs sm:text-sm text-slate-600 dark:text-slate-400">{detail}</p>}
    {retry && <button type="button" onClick={retry} className={`${secondary} mt-1`}>{t("Try again", "আবার চেষ্টা করুন")}</button>}
    {action && <div className="mt-2">{action}</div>}
  </div>;
}

export function Pagination({ page, lastPage, onPage }) {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  if (lastPage <= 1 && page <= 1) return null;
  return <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
      {t("Page", "পৃষ্ঠা")} {num(page)} {t("of", "এর")} {num(lastPage)}
    </p>
    <div className="flex gap-2">
      <button type="button" className={secondary} disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} aria-hidden="true" /> {t("Previous", "পূর্ববর্তী")}</button>
      <button type="button" className={secondary} disabled={page >= lastPage} onClick={() => onPage(page + 1)}>{t("Next", "পরবর্তী")} <ChevronRight size={16} aria-hidden="true" /></button>
    </div>
  </footer>;
}

export function SectionLink({ to, children }) {
  return <Link to={to} className="inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-bold text-teal-600 hover:text-teal-700 focus-visible:outline-teal-600 dark:text-teal-400 dark:hover:text-teal-300">{children}<ArrowRight size={15} aria-hidden="true" /></Link>;
}
