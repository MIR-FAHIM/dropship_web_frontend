/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetMarketerOverviewQuery, useGetMyCommissionPayoutsQuery } from "../../../redux/features/marketerCommission";
import { useGetMarketerToursQuery } from "../../../redux/features/marketerTours";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { workspacePath } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";

/**
 * Partner Portal → Overview (the demo's Overview tab, with real data and more colour):
 * gradient profile banner, 4 colour-coded KPI cards, profit formula as coloured steps,
 * Connected Dropshippers table and commission payouts.
 */

// Tour milestones: motivation only for now (no claiming).
const TOURS = [
  { target: 1500, en: "Sajek / Cox's Bazar (Single)", bn: "সাজেক / কক্সবাজার (সিঙ্গেল)" },
  { target: 3000, en: "Sajek / Cox's Bazar (Couple)", bn: "সাজেক / কক্সবাজার (কাপল)" },
  { target: 7000, en: "Darjeeling + Sikkim — 5 Days", bn: "দার্জিলিং + সিকিম — ৫ দিন" },
];

const card = "rounded-2xl border border-slate-200/80 bg-white p-5 partner-soft-shadow dark:border-slate-800 dark:bg-slate-900 transition-colors";
const fmtDate = (iso, lang) => (iso ? new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

/** Colour-coded KPI card (accent bar + emoji tile). */
const Kpi = ({ accent, tile, icon, label, value, valueClass = "text-slate-900 dark:text-white", children }) => (
  <div className={`relative overflow-hidden ${card}`}>
    <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ${tile}`}>{icon}</span>
    </div>
    <div className={`mt-1.5 text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl ${valueClass}`}>{value}</div>
    {children}
  </div>
);

/** One step of the profit formula. */
const Step = ({ cls, label, value }) => (
  <span className={`inline-flex flex-col rounded-xl px-3 py-1.5 text-center border transition-all ${cls}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{label}</span>
    <span className="text-sm font-extrabold tabular-nums mt-0.5">{value}</span>
  </span>
);
const Op = ({ children }) => <span aria-hidden="true" className="text-sm font-extrabold text-slate-400 dark:text-slate-500 select-none">{children}</span>;

export default function MarketerOverview() {
  const { t, lang } = usePartnerPrefs();
  const num = useNumber();
  const user = getFromLocalstorage("user");
  const [period, setPeriod] = useState("all");
  // Live Sync: refresh every minute and when the marketer comes back to the tab.
  const { data, isLoading, isError, isFetching, refetch } = useGetMarketerOverviewQuery(
    { period },
    { pollingInterval: 60000, refetchOnFocus: true, refetchOnReconnect: true }
  );
  // F7: the tour goal comes from the server's milestones (same as the Tour Milestones tab).
  const { data: toursData } = useGetMarketerToursQuery(undefined, { refetchOnFocus: true });
  const { data: payoutData } = useGetMyCommissionPayoutsQuery({ per_page: 5 }, { pollingInterval: 60000 });
  const o = data?.data;
  const totals = o?.totals || {};
  const rate = o?.commission_rate ?? 20;
  const f = o?.formula;
  const payouts = payoutData?.data?.data || [];
  const refCode = o?.ref_code;
  const refLink = refCode ? `${window.location.origin}/app/marketer-partnership?ref=${encodeURIComponent(refCode)}` : "";
  const updatedAt = o?.generated_at ? new Date(o.generated_at).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
  const PERIODS = [["7d", t("7 days", "৭ দিন")], ["30d", t("30 days", "৩০ দিন")], ["90d", t("90 days", "৯০ দিন")], ["all", t("All time", "সর্বমোট")]];

  const copy = async (text, what) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(what);
    } catch {
      toast.error(t("Could not copy. Select and copy it manually.", "কপি করা যায়নি। নিজে সিলেক্ট করে কপি করুন।"));
    }
  };

  const delivered = totals.orders_delivered || 0;
  // The tour goal always counts every delivered order, whatever period is selected.
  const tourApi = toursData?.data;
  const tourDelivered = tourApi?.delivered_orders ?? totals.orders_delivered_all_time ?? delivered;
  const tourList = tourApi?.milestones?.length ? tourApi.milestones : TOURS;
  const tour = tourApi?.current || tourList.find((x) => tourDelivered < x.target) || tourList[tourList.length - 1];
  const tourPct = Math.min(100, Math.round((tourDelivered / tour.target) * 100));
  const name = o?.marketer?.business_name || o?.marketer?.name || user?.name || "Partner";
  const initials = (o?.marketer?.name || user?.name || "RB").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-teal-600"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  }
  if (isError) {
    return (
      <div className={`${card} text-center`}>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("Could not load your overview.", "ওভারভিউ লোড করা যায়নি।")}</p>
        <button type="button" onClick={refetch} className="mt-3 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-all active:scale-95 cursor-pointer">{t("Try again", "আবার চেষ্টা করুন")}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Partner profile banner */}
      <div className="relative isolate flex flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 p-5 text-white md:flex-row md:items-center sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 -z-10 h-60 w-60 rounded-full bg-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-52 w-52 rounded-full bg-amber-300/20" />
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-lg font-extrabold text-teal-700 ring-4 ring-white/30">{initials}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-teal-50">{t("Welcome back", "আবার স্বাগতম")} 👋</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-extrabold sm:text-xl">{name}</h1>
              {/* F8 level badge (demo: "Upper Level (Pro)") */}
              {o?.level && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-teal-700">
                  {o.level === "pro" ? t("🏆 Upper Level (Pro)", "🏆 আপার লেভেল (প্রো)") : t("⭐ Mid Level", "⭐ মিড লেভেল")}
                </span>
              )}
              <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-950">
                {t(`${rate}% Profit Share`, `${num(rate)}% প্রফিট শেয়ার`)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-teal-50">{o?.marketer?.business_name ? o.marketer.name : t("Acquisition Partner", "অ্যাকুইজিশন পার্টনার")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Referral code (demo: "Ref: RB-… Copy") — clients enter it on Marketer Partnership */}
          {refCode && (
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 ring-1 ring-white/30">
              <span className="text-xs text-teal-50">{t("Ref:", "রেফ:")}</span>
              <code className="text-xs font-extrabold tracking-wide text-white">{refCode}</code>
              <button type="button" onClick={() => copy(refCode, t("Referral code copied!", "রেফারেল কোড কপি হয়েছে!"))}
                className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-teal-700 hover:bg-teal-50">{t("Copy", "কপি")}</button>
              <button type="button" onClick={() => copy(refLink, t("Invite link copied! Send it to your client.", "ইনভাইট লিংক কপি হয়েছে! ক্লায়েন্টকে পাঠান।"))}
                title={refLink} className="rounded-md bg-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-950 hover:bg-amber-200">🔗 {t("Link", "লিংক")}</button>
            </div>
          )}
          <Link to={`${workspacePath}/profile`} className="rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white ring-1 ring-white/30 hover:bg-white/25 transition-all">
            ⚙️ {t("Profile & Settings", "প্রোফাইল ও সেটিংস")}
          </Link>
          <Link to={`${workspacePath}/invitations#invite-client`} className="rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-teal-700 border border-teal-100 hover:bg-teal-50 transition-all active:scale-95">
            ➕ {t("Invite a client", "ক্লায়েন্ট ইনভাইট করুন")}
          </Link>
        </div>
      </div>

      {/* Period + live sync status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("Period", "সময়কাল")}>
          {PERIODS.map(([v, label]) => (
            <button key={v} type="button" onClick={() => setPeriod(v)} aria-pressed={period === v}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${period === v ? "bg-teal-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"}`}>
              {label}
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400" aria-live="polite">
          <span className={`h-2 w-2 rounded-full ${isFetching ? "animate-ping bg-amber-400" : "bg-emerald-500"}`} aria-hidden="true" />
          {isFetching ? t("Updating…", "আপডেট হচ্ছে…") : updatedAt ? t(`Live · updated ${updatedAt}`, `লাইভ · আপডেট ${updatedAt}`) : ""}
        </span>
      </div>

      {/* KPI cards */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity ${isFetching ? "opacity-80" : ""}`}>
        <Kpi accent="from-teal-500 to-emerald-500" tile="bg-teal-50 dark:bg-teal-950" icon="🏪" label={t("Connected Dropshippers", "সংযুক্ত ড্রপশিপার")} value={num(totals.active_clients)}>
          <span className="mt-1 inline-block text-[11px] font-bold text-teal-600 dark:text-teal-400">{t("Active Stores", "সক্রিয় স্টোর")}</span>
        </Kpi>
        <Kpi accent="from-sky-500 to-blue-500" tile="bg-sky-50 dark:bg-sky-950" icon="📦" label={t("Delivered Orders", "ডেলিভার্ড অর্ডার")} value={num(delivered)}>
          <span className="mt-1 inline-block text-[11px] text-slate-500 dark:text-slate-400">
            {t(`${num(totals.orders_placed)} placed · ${num(totals.sales_volume, { money: true })} sales`, `${num(totals.orders_placed)}টি প্লেসড · ${num(totals.sales_volume, { money: true })} বিক্রি`)}
          </span>
        </Kpi>
        <Kpi accent="from-emerald-500 to-green-500" tile="bg-emerald-50 dark:bg-emerald-950" icon="💰" label={t("Your Profit Share", "আপনার প্রফিট শেয়ার")}
          value={num(totals.earned_total, { money: true })} valueClass="text-emerald-600 dark:text-emerald-400">
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-bold">
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{t("Due", "পাওনা")} {num(totals.payable, { money: true })}</span>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{t("Paid", "পেয়েছেন")} {num(totals.paid, { money: true })}</span>
            {period !== "all" && (
              <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                {t("This period", "এই সময়ে")} {num(totals.period_commission, { money: true })}
              </span>
            )}
          </div>
        </Kpi>
        <Kpi accent="from-amber-400 to-orange-500" tile="bg-amber-50 dark:bg-amber-950" icon="✈️" label={t("Active Tour Goal", "সক্রিয় ট্যুর লক্ষ্য")}
          value={`${num(tourDelivered)} / ${num(tour.target)}`} valueClass="text-amber-600 dark:text-amber-400">
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100 dark:bg-slate-800" role="progressbar" aria-valuenow={tourPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${tourPct}%` }} />
          </div>
          <span className="mt-1 inline-block text-[11px] text-slate-500 dark:text-slate-400">{t(tour.en, tour.bn)}</span>
          <Link to={`${workspacePath}/tours`} className="mt-1 block text-[11px] font-bold text-amber-700 hover:underline dark:text-amber-400">
            {t("See all tour milestones →", "সব ট্যুর মাইলস্টোন দেখুন →")}
          </Link>
        </Kpi>
      </div>

      {/* Profit formula as coloured steps (markup + delivery margin) */}
      {f && (
        <div className={card}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">🧾 {t("How your share is calculated", "আপনার শেয়ার যেভাবে হিসাব হয়")}</h2>
            <span className="rounded-lg bg-teal-600 px-3 py-1 text-xs font-extrabold text-white">
              {t(`${rate}% Partner : ${100 - rate}% Admin`, `${num(rate)}% পার্টনার : ${num(100 - rate)}% অ্যাডমিন`)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Step cls="bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200" label={t("Markup", "মার্কআপ")} value={`৳${num(f.product_markup)}`} />
            <Op>+</Op>
            <Step cls="bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200" label={t("Delivery margin", "ডেলিভারি মার্জিন")} value={`৳${num(f.delivery_margin)}`} />
            <Op>=</Op>
            <Step cls="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200" label={t("Admin profit", "অ্যাডমিন প্রফিট")} value={`৳${num(f.platform_profit)}`} />
            <Op>×</Op>
            <Step cls="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200" label={t("Your rate", "আপনার রেট")} value={`${num(f.rate)}%`} />
            <Op>=</Op>
            <Step cls="bg-emerald-600 text-white" label={t("Your share / order", "আপনার শেয়ার / অর্ডার")} value={`৳${num(f.commission, { decimals: 2 })}`} />
          </div>
          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            {t(
              `Example: supplier ৳${f.supplier_price} → admin price ৳${f.admin_price}; delivery ৳${f.delivery_charge} − courier ৳${f.courier_fee}. Counted when the order is delivered and the courier has paid.`,
              `উদাহরণ: সাপ্লায়ার ৳${num(f.supplier_price)} → অ্যাডমিন প্রাইস ৳${num(f.admin_price)}; ডেলিভারি ৳${num(f.delivery_charge)} − কুরিয়ার ৳${num(f.courier_fee)}। অর্ডার ডেলিভার হয়ে কুরিয়ার পেমেন্ট দিলে যোগ হয়।`
            )}
          </p>
        </div>
      )}

      {/* Connected dropshippers */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white partner-soft-shadow dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-white p-4 dark:border-slate-800 dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900 sm:p-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">👥 {t("Connected Dropshippers", "সংযুক্ত ড্রপশিপার")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("Contact details stay private, as agreed with your clients", "ক্লায়েন্টদের সম্মতি অনুযায়ী যোগাযোগের তথ্য গোপন থাকে")}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />{t("Live Sync", "লাইভ সিঙ্ক")}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
                <th className="px-4 py-3">{t("Dropshipper & Store", "ড্রপশিপার ও স্টোর")}</th>
                <th className="px-4 py-3">{t("Joined", "যুক্ত হয়েছেন")}</th>
                <th className="px-4 py-3 text-right">{t("Orders", "অর্ডার")}</th>
                <th className="px-4 py-3 text-right">{t("Sales", "বিক্রি")}</th>
                <th className="px-4 py-3 text-right">{t("Admin Profit", "অ্যাডমিন প্রফিট")}</th>
                <th className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{t(`Your ${rate}% Share`, `আপনার ${num(rate)}% শেয়ার`)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 sm:text-sm">
              {(o?.clients || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-3xl" aria-hidden="true">🤝</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("No connected dropshippers yet.", "এখনো কোনো ড্রপশিপার যুক্ত হননি।")}</p>
                    <Link to={`${workspacePath}/invitations#invite-client`} className="mt-3 inline-block rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-all active:scale-95 cursor-pointer">{t("Invite your first client", "প্রথম ক্লায়েন্ট ইনভাইট করুন")}</Link>
                  </td>
                </tr>
              ) : o.clients.map((c, i) => (
                <tr key={c.client_id} className="transition-colors hover:bg-teal-50/40 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold text-white ${["bg-teal-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"][i % 5]}`}>
                        {(c.store || c.name || "C").trim().slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-slate-900 dark:text-white">{c.store || c.name || t("Client", "ক্লায়েন্ট")}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.store ? c.name : ""}{!c.active && <span className="ml-1 rounded bg-slate-100 px-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t("ended", "শেষ")}</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">{fmtDate(c.joined_at, lang)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">{num(c.orders_delivered)}<span className="font-normal text-slate-500 dark:text-slate-400"> / {num(c.orders_placed)}</span></td>
                  <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{num(c.sales_volume, { money: true })}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-amber-700 dark:text-amber-300">{num(c.platform_profit, { money: true })}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{num(c.commission, { money: true })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {t("Orders: delivered / placed. Your share counts when an order is delivered and the courier has paid.", "অর্ডার: ডেলিভার্ড / প্লেসড। অর্ডার ডেলিভার হয়ে কুরিয়ার পেমেন্ট দিলে আপনার শেয়ার যোগ হয়।")}
        </p>
      </div>

      {/* Commission payouts */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">💸 {t("Commission payouts", "কমিশন পেমেন্ট")}</h2>
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{t("To be paid", "পাওনা")} {num(totals.payable, { money: true })}</span>
            {totals.invoiced > 0 && <span className="rounded-lg bg-sky-50 px-2 py-1 text-sky-700 dark:bg-sky-950 dark:text-sky-300">{t("Processing", "প্রক্রিয়াধীন")} {num(totals.invoiced, { money: true })}</span>}
          </div>
        </div>
        {payouts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t("No payouts yet. Admin pays your share regularly.", "এখনো কোনো পেমেন্ট হয়নি। অ্যাডমিন নিয়মিত আপনার শেয়ার পরিশোধ করবেন।")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span>
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">{p.invoice_number}</span>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{fmtDate(p.paid_at || p.created_at, lang)}{p.status === "paid" && p.payment_method ? ` · ${p.payment_method}` : ""}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">{num(p.total_amount_owed, { money: true })}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${p.status === "paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : p.status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {p.status === "paid" ? t("Paid", "পরিশোধিত") : p.status === "pending" ? t("Processing", "প্রক্রিয়াধীন") : t("Cancelled", "বাতিল")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
