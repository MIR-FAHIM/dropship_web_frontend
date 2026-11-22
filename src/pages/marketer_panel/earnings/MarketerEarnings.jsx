/* eslint-disable react/prop-types */
import { useState } from "react";
import { Banknote, Loader2, Plus, Trash2, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAddMyPaymentAccountMutation,
  useDeleteMyPaymentAccountMutation,
  useGetMarketerOverviewQuery,
  useGetMyCommissionPayoutQuery,
  useGetMyCommissionPayoutsQuery,
  useGetMyCommissionsQuery,
  useGetMyPaymentAccountsQuery,
} from "../../../redux/features/marketerCommission";
import CommissionPayoutDocument from "../../../components/shared/CommissionPayoutDocument";
import { PageHeading, Pagination, StateMessage } from "../partnerWorkspace";
import { field, formatDate, panel, primary, secondary } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";

/**
 * Partner Portal F2 — Earnings: what you've earned, what's being paid, every commission
 * line, your payouts (printable invoice) and where you want to be paid.
 */

const METHODS = [
  ["bkash", "bKash", "বিকাশ"],
  ["nagad", "Nagad", "নগদ"],
  ["rocket", "Rocket", "রকেট"],
  ["bank_transfer", "Bank account", "ব্যাংক অ্যাকাউন্ট"],
];
const lineState = (c) => (c.status === "earned" && c.payout_invoice_id ? "processing" : c.status === "earned" ? "due" : c.status);
const STATE_STYLE = {
  due: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  processing: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  reversed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

/* ---------- money cards ---------- */
const MoneyCard = ({ label, value, accent, tile, icon, valueCls }) => (
  <div className={`relative overflow-hidden p-4 ${panel}`}>
    <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <span aria-hidden="true" className={`grid h-8 w-8 place-items-center rounded-xl text-sm ${tile}`}>{icon}</span>
    </div>
    <p className={`mt-1 text-2xl font-extrabold tracking-tight tabular-nums ${valueCls}`}>{value}</p>
  </div>
);

/* ---------- payout invoice ---------- */
const PayoutModal = ({ id, onClose }) => {
  const { t } = usePartnerPrefs();
  const { data, isFetching, isError } = useGetMyCommissionPayoutQuery(id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-slate-100 p-4 shadow-2xl dark:bg-slate-900">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-lg p-1 text-slate-500 hover:bg-white print:hidden dark:text-slate-300 dark:hover:bg-slate-800" aria-label={t("Close", "বন্ধ করুন")}><X className="h-5 w-5" /></button>
        {isFetching && !data ? <p className="p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-600" /></p>
          : isError ? <p className="p-10 text-center text-sm text-rose-600">{t("Could not load the payout.", "পেমেন্টের তথ্য লোড করা যায়নি।")}</p>
          : <CommissionPayoutDocument doc={data?.data} />}
      </div>
    </div>
  );
};

/* ---------- payment accounts ---------- */
const PaymentAccounts = () => {
  const { t, lang } = usePartnerPrefs();
  const { data, isLoading } = useGetMyPaymentAccountsQuery();
  const [addAccount, { isLoading: adding }] = useAddMyPaymentAccountMutation();
  const [deleteAccount] = useDeleteMyPaymentAccountMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ method: "bkash", account_no: "", acc_name: "", bank_name: "", branch: "", route: "" });
  const [error, setError] = useState("");
  const accounts = data?.data || [];
  const isBank = form.method === "bank_transfer";
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const save = async (e) => {
    e.preventDefault();
    try {
      await addAccount({ ...form, bank_name: isBank ? form.bank_name : undefined }).unwrap();
      toast.success(t("Payment account saved.", "পেমেন্ট অ্যাকাউন্ট সংরক্ষণ হয়েছে।"));
      setForm({ method: "bkash", account_no: "", acc_name: "", bank_name: "", branch: "", route: "" });
      setOpen(false);
    } catch (err) {
      setError(err?.data?.errors ? Object.values(err.data.errors).flat()[0] : err?.data?.message || t("Could not save.", "সংরক্ষণ করা যায়নি।"));
    }
  };
  const remove = async (a) => {
    if (!window.confirm(t(`Remove ${a.method_label} ${a.account_no}?`, `${a.method_label} ${a.account_no} মুছে ফেলবেন?`))) return;
    try {
      await deleteAccount(a.id).unwrap();
      toast.success(t("Removed.", "মুছে ফেলা হয়েছে।"));
    } catch (err) {
      toast.error(err?.data?.message || t("Could not remove.", "মুছে ফেলা যায়নি।"));
    }
  };

  return (
    <section className={`${panel} p-4 sm:p-5`} aria-labelledby="pay-accounts">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="pay-accounts" className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"><Wallet size={16} aria-hidden="true" /></span>
            {t("Payment accounts", "পেমেন্ট অ্যাকাউন্ট")}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t("Admin sends your commission to one of these.", "অ্যাডমিন এর যেকোনো একটিতে আপনার কমিশন পাঠাবেন।")}</p>
        </div>
        {!open && <button type="button" onClick={() => setOpen(true)} className={secondary}><Plus size={15} aria-hidden="true" /> {t("Add account", "অ্যাকাউন্ট যোগ করুন")}</button>}
      </div>

      {isLoading ? <p className="py-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-teal-600" /></p> : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {accounts.length === 0 && !open && (
            <li className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 sm:col-span-2">
              {t("Add a bKash, Nagad, Rocket or bank account so admin knows where to pay you.", "অ্যাডমিন যেন জানেন কোথায় টাকা পাঠাবেন, একটি বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্ট যোগ করুন।")}
            </li>
          )}
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{a.method === "bank_transfer" ? a.bank_name : (METHODS.find((m) => m[0] === a.method)?.[lang === "bn" ? 2 : 1] || a.method_label)}</p>
                <p className="font-mono text-sm text-slate-700 dark:text-slate-200">{a.account_no}</p>
                {(a.acc_name || a.branch) && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{[a.acc_name, a.branch].filter(Boolean).join(" · ")}</p>}
              </div>
              <button type="button" onClick={() => remove(a)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50" aria-label={t("Remove", "মুছুন")}><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form onSubmit={save} className="mt-3 grid gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900/60 dark:bg-teal-950/30 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Method", "মাধ্যম")}
            <select value={form.method} onChange={set("method")} className={`${field} mt-1`}>
              {METHODS.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{isBank ? t("Account number", "অ্যাকাউন্ট নম্বর") : t("Mobile number", "মোবাইল নম্বর")} *
            <input value={form.account_no} onChange={set("account_no")} required inputMode={isBank ? "text" : "tel"} placeholder={isBank ? "" : "017XXXXXXXX"} className={`${field} mt-1 font-mono`} />
          </label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Account holder name", "অ্যাকাউন্টধারীর নাম")}
            <input value={form.acc_name} onChange={set("acc_name")} className={`${field} mt-1`} />
          </label>
          {isBank && (
            <>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Bank name", "ব্যাংকের নাম")} *
                <input value={form.bank_name} onChange={set("bank_name")} required className={`${field} mt-1`} />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Branch", "শাখা")}
                <input value={form.branch} onChange={set("branch")} className={`${field} mt-1`} />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Routing number", "রাউটিং নম্বর")}
                <input value={form.route} onChange={set("route")} className={`${field} mt-1 font-mono`} />
              </label>
            </>
          )}
          {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400 sm:col-span-2">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => { setOpen(false); setError(""); }} className={secondary}>{t("Cancel", "বাতিল")}</button>
            <button type="submit" disabled={adding} className={primary}>{adding && <Loader2 className="h-4 w-4 animate-spin" />}{t("Save account", "সংরক্ষণ করুন")}</button>
          </div>
        </form>
      )}
    </section>
  );
};

/* ---------- page ---------- */
export default function MarketerEarnings() {
  const { t, lang } = usePartnerPrefs();
  const num = useNumber();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [openPayout, setOpenPayout] = useState(null);
  const { data: overview } = useGetMarketerOverviewQuery();
  const lines = useGetMyCommissionsQuery({ status, page, per_page: 20 });
  const payouts = useGetMyCommissionPayoutsQuery({ page: payoutPage, per_page: 10 });
  const totals = overview?.data?.totals || {};
  const rate = overview?.data?.commission_rate;
  const rows = lines.currentData?.data?.data || [];
  const payoutRows = payouts.currentData?.data?.data || [];
  const money = (v) => num(v, { money: true });
  const stateLabel = { due: t("Due", "পাওনা"), processing: t("Processing", "প্রক্রিয়াধীন"), paid: t("Paid", "পরিশোধিত"), reversed: t("Returned", "রিটার্ন") };
  const filters = [["all", t("All", "সব")], ["payable", t("Due", "পাওনা")], ["invoiced", t("Processing", "প্রক্রিয়াধীন")], ["paid", t("Paid", "পরিশোধিত")], ["reversed", t("Returned", "রিটার্ন")]];

  return (
    <div className="space-y-6">
      <PageHeading icon={Banknote} eyebrow={t("Partner Portal", "পার্টনার পোর্টাল")} title={t("Earnings", "আয়")}
        description={t(
          `Your ${rate ?? 20}% share of the admin profit (markup + delivery margin) on your clients' delivered orders, and how it's paid.`,
          `আপনার ক্লায়েন্টদের ডেলিভার্ড অর্ডারে অ্যাডমিন প্রফিটের (মার্কআপ + ডেলিভারি মার্জিন) ${num(rate ?? 20)}% শেয়ার এবং তার পেমেন্ট।`
        )} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MoneyCard label={t("Due to you", "আপনার পাওনা")} value={money(totals.payable)} accent="from-amber-400 to-orange-500" tile="bg-amber-50 dark:bg-amber-950" icon="⏳" valueCls="text-amber-600 dark:text-amber-400" />
        <MoneyCard label={t("Being paid", "প্রক্রিয়াধীন")} value={money(totals.invoiced)} accent="from-sky-500 to-blue-500" tile="bg-sky-50 dark:bg-sky-950" icon="🔄" valueCls="text-sky-600 dark:text-sky-400" />
        <MoneyCard label={t("Paid to you", "পেয়েছেন")} value={money(totals.paid)} accent="from-emerald-500 to-green-500" tile="bg-emerald-50 dark:bg-emerald-950" icon="✅" valueCls="text-emerald-600 dark:text-emerald-400" />
        <MoneyCard label={t("Total earned", "মোট আয়")} value={money(totals.earned_total)} accent="from-teal-500 to-emerald-500" tile="bg-teal-50 dark:bg-teal-950" icon="💰" valueCls="text-slate-900 dark:text-white" />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.25fr_1fr]">
        {/* Payouts */}
        <section className={panel} aria-labelledby="my-payouts">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-white p-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 sm:p-5">
            <h2 id="my-payouts" className="text-base font-extrabold text-slate-900 dark:text-white">💸 {t("Payouts", "পেমেন্টসমূহ")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("Open a payout to see the orders it paid and print it.", "কোন অর্ডারের টাকা পেয়েছেন দেখতে ও প্রিন্ট করতে পেমেন্টে ক্লিক করুন।")}</p>
          </div>
          {payouts.isFetching && !payoutRows.length ? <StateMessage loading title={t("Loading payouts…", "লোড হচ্ছে…")} />
            : payoutRows.length === 0 ? <StateMessage title={t("No payouts yet", "এখনো কোনো পেমেন্ট নেই")} detail={t("Admin pays your share regularly. Add a payment account so they know where to send it.", "অ্যাডমিন নিয়মিত আপনার শেয়ার পরিশোধ করেন। কোথায় পাঠাবেন জানাতে একটি পেমেন্ট অ্যাকাউন্ট যোগ করুন।")} />
            : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {payoutRows.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => setOpenPayout(p.id)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-5">
                      <span className="min-w-0">
                        <span className="block font-mono text-xs font-bold text-teal-700 dark:text-teal-400">{p.invoice_number}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(p.paid_at || p.created_at, lang)}{p.status === "paid" && p.payment_method ? ` · ${p.payment_method}` : ""}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">{money(p.total_amount_owed)}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${p.status === "paid" ? STATE_STYLE.paid : p.status === "pending" ? STATE_STYLE.processing : STATE_STYLE.reversed}`}>
                          {p.status === "paid" ? t("Paid", "পরিশোধিত") : p.status === "pending" ? t("Processing", "প্রক্রিয়াধীন") : t("Cancelled", "বাতিল")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          {payouts.currentData?.data && <Pagination page={payoutPage} lastPage={Number(payouts.currentData.data.last_page || 1)} onPage={setPayoutPage} />}
        </section>

        <PaymentAccounts />
      </div>

      {/* Commission lines */}
      <section className={panel} aria-labelledby="my-lines">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-white to-white p-4 dark:border-slate-800 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 sm:p-5">
          <div>
            <h2 id="my-lines" className="text-base font-extrabold text-slate-900 dark:text-white">🧾 {t("Commission by order", "অর্ডার অনুযায়ী কমিশন")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("One line per delivered order. A returned order after payment shows as a minus line.", "প্রতিটি ডেলিভার্ড অর্ডারে একটি লাইন। পেমেন্টের পর রিটার্ন হলে মাইনাস লাইন দেখাবে।")}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map(([v, label]) => (
              <button key={v} type="button" onClick={() => { setStatus(v); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${status === v ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {lines.isFetching && !rows.length ? <StateMessage loading title={t("Loading…", "লোড হচ্ছে…")} />
          : lines.isError ? <StateMessage title={t("Could not load commissions", "কমিশন লোড করা যায়নি")} retry={lines.refetch} />
          : rows.length === 0 ? <StateMessage title={t("No commission here yet", "এখানে এখনো কোনো কমিশন নেই")} detail={t("It appears when your clients' orders are delivered and the courier has paid.", "ক্লায়েন্টের অর্ডার ডেলিভার হয়ে কুরিয়ার পেমেন্ট দিলে এখানে দেখাবে।")} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{t("Order", "অর্ডার")}</th>
                    <th className="px-4 py-3">{t("Client", "ক্লায়েন্ট")}</th>
                    <th className="px-4 py-3 text-right">{t("Markup", "মার্কআপ")}</th>
                    <th className="px-4 py-3 text-right">{t("Delivery margin", "ডেলিভারি মার্জিন")}</th>
                    <th className="px-4 py-3 text-right">{t("Your share", "আপনার শেয়ার")}</th>
                    <th className="px-4 py-3">{t("Status", "অবস্থা")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((c) => {
                    const st = lineState(c);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{c.order?.order_number || `#${c.order_id}`}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatDate(c.earned_at, lang)}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{c.client?.dropshipper?.business_name || c.client?.dropshipper?.name || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">{c.type === "clawback" ? "—" : money(c.product_markup)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">{c.type === "clawback" ? "—" : money(c.delivery_margin)}</td>
                        <td className={`px-4 py-3 text-right font-extrabold tabular-nums ${c.amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {money(c.amount)}<span className="ml-1 text-[10px] font-semibold text-slate-400">{num(c.rate)}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${STATE_STYLE[st] || STATE_STYLE.reversed}`}>
                            {c.type === "clawback" ? t("Taken back", "ফেরত নেওয়া") : stateLabel[st] || st}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        {lines.currentData?.data && <Pagination page={page} lastPage={Number(lines.currentData.data.last_page || 1)} onPage={setPage} />}
      </section>

      {openPayout && <PayoutModal id={openPayout} onClose={() => setOpenPayout(null)} />}
    </div>
  );
}
