import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useGetMarketerOverviewQuery, useGetMyCommissionPayoutsQuery } from "../../../redux/features/marketerCommission";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { workspacePath } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";

/**
 * Partner Portal → Overview (layout of the demo's Overview tab, with real data):
 * profile banner, 4 KPI cards, profit formula strip, Connected Dropshippers table, payouts.
 */

// Tour milestones: shown as motivation only for now (no claiming).
const TOURS = [
  { target: 1500, en: "Sajek / Cox's Bazar (Single)", bn: "সাজেক / কক্সবাজার (সিঙ্গেল)" },
  { target: 3000, en: "Sajek / Cox's Bazar (Couple)", bn: "সাজেক / কক্সবাজার (কাপল)" },
  { target: 7000, en: "Darjeeling + Sikkim — 5 Days", bn: "দার্জিলিং + সিকিম — ৫ দিন" },
];

const card = "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900";
const fmtDate = (iso, lang) => (iso ? new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default function MarketerOverview() {
  const { t, lang } = usePartnerPrefs();
  const num = useNumber();
  const user = getFromLocalstorage("user");
  const { data, isLoading, isError, refetch } = useGetMarketerOverviewQuery();
  const { data: payoutData } = useGetMyCommissionPayoutsQuery({ per_page: 5 });
  const o = data?.data;
  const totals = o?.totals || {};
  const rate = o?.commission_rate ?? 20;
  const f = o?.formula;
  const payouts = payoutData?.data?.data || [];

  const delivered = totals.orders_delivered || 0;
  const tour = TOURS.find((x) => delivered < x.target) || TOURS[TOURS.length - 1];
  const tourPct = Math.min(100, Math.round((delivered / tour.target) * 100));
  const name = o?.marketer?.business_name || o?.marketer?.name || user?.name || "Partner";
  const initials = (o?.marketer?.name || user?.name || "RB").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (isError) {
    return (
      <div className={`${card} text-center`}>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("Could not load your overview.", "ওভারভিউ লোড করা যায়নি।")}</p>
        <button type="button" onClick={refetch} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-teal-600">{t("Try again", "আবার চেষ্টা করুন")}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Partner profile banner */}
      <div className={`${card} flex flex-col justify-between gap-4 md:flex-row md:items-center`}>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-teal-500 bg-teal-50 text-lg font-extrabold text-teal-700 dark:bg-teal-950 dark:text-teal-300">{initials}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">{name}</h1>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {t(`${rate}% Profit Share Partner`, `${num(rate)}% প্রফিট শেয়ার পার্টনার`)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{o?.marketer?.business_name ? o.marketer.name : t("Acquisition Partner", "অ্যাকুইজিশন পার্টনার")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to={`${workspacePath}/profile`} className="rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            ⚙️ {t("Profile & Settings", "প্রোফাইল ও সেটিংস")}
          </Link>
          <Link to={`${workspacePath}/invitations#invite-client`} className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">
            ➕ {t("Invite a client", "ক্লায়েন্ট ইনভাইট করুন")}
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("Connected Dropshippers", "সংযুক্ত ড্রপশিপার")}</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{num(totals.active_clients)}</div>
          <span className="mt-1 inline-block text-[11px] font-semibold text-teal-600 dark:text-teal-400">{t("Active Stores", "সক্রিয় স্টোর")}</span>
        </div>
        <div className={card}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("Delivered Orders", "ডেলিভার্ড অর্ডার")}</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{num(delivered)}</div>
          <span className="mt-1 inline-block text-[11px] text-slate-500 dark:text-slate-400">
            {t(`${num(totals.orders_placed)} placed · ${num(totals.sales_volume, { money: true })} sales`, `${num(totals.orders_placed)}টি প্লেসড · ${num(totals.sales_volume, { money: true })} বিক্রি`)}
          </span>
        </div>
        <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:border-teal-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400">{t("Your Profit Share", "আপনার প্রফিট শেয়ার")}</span>
            <span className="rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-extrabold text-white">{t(`${rate}% Admin Profit`, `${num(rate)}% অ্যাডমিন প্রফিট`)}</span>
          </div>
          <div className="mt-1 text-2xl font-extrabold text-teal-600 dark:text-teal-400">{num(totals.earned_total, { money: true })}</div>
          <span className="mt-1 inline-block text-[11px] text-slate-500 dark:text-slate-400">
            {t(`${num(totals.payable, { money: true })} to be paid · ${num(totals.paid, { money: true })} paid`, `${num(totals.payable, { money: true })} পাওনা · ${num(totals.paid, { money: true })} পেয়েছেন`)}
          </span>
        </div>
        <div className={card}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("Active Tour Goal", "সক্রিয় ট্যুর লক্ষ্য")}</span>
          <div className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">{num(delivered)} / {num(tour.target)}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={tourPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${tourPct}%` }} />
          </div>
          <span className="mt-1 inline-block text-[11px] text-slate-500 dark:text-slate-400">{t(tour.en, tour.bn)}</span>
        </div>
      </div>

      {/* Profit formula strip (markup + delivery margin) */}
      {f && (
        <div className={`${card} flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center`}>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            <strong>{t("Formula:", "সূত্র:")}</strong>{" "}
            {t(
              `Supplier ৳${f.supplier_price} → Admin price ৳${f.admin_price} (markup ৳${f.product_markup}) + Delivery ৳${f.delivery_charge} − courier ৳${f.courier_fee} (margin ৳${f.delivery_margin}) → Admin profit ৳${f.platform_profit} → Your `,
              `সাপ্লায়ার ৳${num(f.supplier_price)} → অ্যাডমিন প্রাইস ৳${num(f.admin_price)} (মার্কআপ ৳${num(f.product_markup)}) + ডেলিভারি ৳${num(f.delivery_charge)} − কুরিয়ার ৳${num(f.courier_fee)} (মার্জিন ৳${num(f.delivery_margin)}) → অ্যাডমিন প্রফিট ৳${num(f.platform_profit)} → আপনার `
            )}
            <strong>{t(`${f.rate}% share = ৳${f.commission}/order`, `${num(f.rate)}% শেয়ার = ৳${num(f.commission, { decimals: 2 })}/অর্ডার`)}</strong>.
          </p>
          <span className="shrink-0 rounded-lg bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            {t(`${rate}% Partner : ${100 - rate}% Admin`, `${num(rate)}% পার্টনার : ${num(100 - rate)}% অ্যাডমিন`)}
          </span>
        </div>
      )}

      {/* Connected dropshippers */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">{t("Connected Dropshippers", "সংযুক্ত ড্রপশিপার")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("Contact details stay private, as agreed with your clients", "ক্লায়েন্টদের সম্মতি অনুযায়ী যোগাযোগের তথ্য গোপন থাকে")}</p>
          </div>
          <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">{t("Live Sync", "লাইভ সিঙ্ক")}</span>
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
                <th className="px-4 py-3 text-right text-teal-600 dark:text-teal-400">{t(`Your ${rate}% Share`, `আপনার ${num(rate)}% শেয়ার`)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 sm:text-sm">
              {(o?.clients || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t("No connected dropshippers yet.", "এখনো কোনো ড্রপশিপার যুক্ত হননি।")}{" "}
                    <Link to={`${workspacePath}/invitations#invite-client`} className="font-bold text-teal-700 hover:underline dark:text-teal-400">{t("Invite your first client", "প্রথম ক্লায়েন্ট ইনভাইট করুন")}</Link>
                  </td>
                </tr>
              ) : o.clients.map((c) => (
                <tr key={c.client_id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{c.store || c.name || t("Client", "ক্লায়েন্ট")}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.store ? c.name : ""}{!c.active && <span className="ml-1 rounded bg-slate-100 px-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t("ended", "শেষ")}</span>}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">{fmtDate(c.joined_at, lang)}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">{num(c.orders_delivered)}<span className="font-normal text-slate-500 dark:text-slate-400"> / {num(c.orders_placed)}</span></td>
                  <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{num(c.sales_volume, { money: true })}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-200">{num(c.platform_profit, { money: true })}</td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-teal-600 dark:text-teal-400">{num(c.commission, { money: true })}</td>
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
          <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">{t("Commission payouts", "কমিশন পেমেন্ট")}</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t(`To be paid: ${num(totals.payable, { money: true })}`, `পাওনা: ${num(totals.payable, { money: true })}`)}
            {totals.invoiced > 0 && t(` · Processing: ${num(totals.invoiced, { money: true })}`, ` · প্রক্রিয়াধীন: ${num(totals.invoiced, { money: true })}`)}
          </span>
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
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${p.status === "paid" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : p.status === "pending" ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
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
