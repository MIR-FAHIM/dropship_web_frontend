import { useState } from "react";
import PropTypes from "prop-types";
import { saveAs } from "file-saver";
import { Banknote, FileSpreadsheet, ListChecks, Loader2, Megaphone, Percent, X } from "lucide-react";
import { toast } from "sonner";
import {
  useCancelCommissionPayoutMutation,
  useCreateCommissionPayoutMutation,
  useGetAdminCommissionPayoutQuery,
  useGetAdminCommissionPayoutsQuery,
  useGetAdminMarketerCommissionLinesQuery,
  useGetAdminMarketerCommissionsQuery,
  useLazyGetAdminMarketerCommissionLinesQuery,
  usePayCommissionPayoutMutation,
  useSetMarketerCommissionRateMutation,
} from "../../../redux/features/marketerCommission";
import CommissionPayoutDocument from "../../../components/shared/CommissionPayoutDocument";

/**
 * Admin → Marketer Commissions (Partner Portal phase 1).
 * A marketer earns rate% of (product markup + delivery margin) on each delivered,
 * CarryBee-paid order of their clients. Pay them here; returns are taken off the next payout.
 */
const bdt = (n) => `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const METHODS = [["bkash", "bKash"], ["nagad", "Nagad"], ["rocket", "Rocket"], ["bank_transfer", "Bank transfer"], ["cash", "Cash"]];
const LINE_STATUS = {
  earned: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  reversed: "bg-gray-100 text-gray-600 border-gray-200",
};
const lineStatus = (c) => (c.status === "earned" && c.payout_invoice_id ? "on payout" : c.status === "earned" ? "payable" : c.status);

/* ---------- Rate cell: edit a marketer's % (new orders only) ---------- */
const RateCell = ({ marketer }) => {
  const [value, setValue] = useState(String(marketer.commission_rate));
  const [saveRate, { isLoading }] = useSetMarketerCommissionRateMutation();
  const changed = Number(value) !== Number(marketer.commission_rate);

  const save = async () => {
    try {
      await saveRate({ id: marketer.id, rate: value === "" ? null : Number(value) }).unwrap();
      toast.success("Rate saved. It applies to orders delivered from now on.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not save the rate.");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number" min="0" max="100" step="0.5" value={value} onChange={(e) => setValue(e.target.value)}
        aria-label={`Commission rate for ${marketer.name}`}
        className="w-16 rounded-md border border-gray-300 px-2 py-1 text-right text-xs"
      />
      <span className="text-xs text-gray-500">%</span>
      {changed && (
        <button type="button" onClick={save} disabled={isLoading} className="rounded-md bg-teal-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-teal-700 disabled:opacity-50">
          {isLoading ? "…" : "Save"}
        </button>
      )}
      {!marketer.custom_rate && !changed && <span className="text-[10px] text-gray-400">default</span>}
    </div>
  );
};
RateCell.propTypes = { marketer: PropTypes.object.isRequired };

/* ---------- Commission lines of one marketer ---------- */
const LinesModal = ({ marketer, onClose }) => {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetAdminMarketerCommissionLinesQuery({ id: marketer.id, status, page, per_page: 20 });
  const [fetchAll, { isFetching: exporting }] = useLazyGetAdminMarketerCommissionLinesQuery();
  const rows = data?.data?.data || [];
  const last = data?.data?.last_page || 1;

  const download = async () => {
    try {
      const all = [];
      for (let p = 1, lastPage = 1; p <= lastPage && p <= 200; p++) {
        const res = await fetchAll({ id: marketer.id, status, page: p, per_page: 100 }).unwrap();
        all.push(...(res?.data?.data || []));
        lastPage = res?.data?.last_page || 1;
      }
      const head = ["Date", "Order", "Client", "Type", "Markup", "Delivery margin", "Platform profit", "Rate %", "Commission", "Status", "Payout"];
      const lines = all.map((c) => [
        fmtDate(c.earned_at), c.order?.order_number || `#${c.order_id}`,
        c.client?.dropshipper?.business_name || c.client?.dropshipper?.name || "", c.type,
        c.product_markup, c.delivery_margin, c.base_amount, c.rate, c.amount, lineStatus(c), c.payout_invoice?.invoice_number || "",
      ]);
      const csv = [head, ...lines].map((r) => r.map((v) => {
        const t = String(v ?? "");
        return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
      }).join(",")).join("\r\n");
      saveAs(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), `commissions-m${marketer.id}-c${all.length}-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      toast.error("Could not download the sheet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close"><X className="h-5 w-5" /></button>
        <h2 className="text-lg font-bold text-gray-900">Commission lines · {marketer.business_name || marketer.name}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {["all", "payable", "invoiced", "paid", "reversed"].map((s) => (
            <button key={s} type="button" onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize ${status === s ? "border-teal-600 bg-teal-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {s === "invoiced" ? "on unpaid payout" : s}
            </button>
          ))}
          <button type="button" onClick={download} disabled={exporting} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />} Download sheet
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
          <table className={`w-full min-w-[760px] text-left text-xs ${isFetching ? "opacity-60" : ""}`}>
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2">Date</th><th className="px-3 py-2">Order</th><th className="px-3 py-2">Client</th>
                <th className="px-3 py-2 text-right">Markup</th><th className="px-3 py-2 text-right">Delivery margin</th>
                <th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Commission</th><th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">No commission lines.</td></tr>
              ) : rows.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">{fmtDate(c.earned_at)}</td>
                  <td className="px-3 py-2 font-semibold text-gray-800">{c.order?.order_number || `#${c.order_id}`}{c.type === "clawback" && <span className="ml-1 rounded bg-red-50 px-1 text-[10px] text-red-700">taken back</span>}</td>
                  <td className="px-3 py-2 text-gray-700">{c.client?.dropshipper?.business_name || c.client?.dropshipper?.name || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{bdt(c.product_markup)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{bdt(c.delivery_margin)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.rate}%</td>
                  <td className={`px-3 py-2 text-right font-bold tabular-nums ${c.amount < 0 ? "text-red-600" : "text-teal-700"}`}>{bdt(c.amount)}</td>
                  <td className="px-3 py-2"><span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${LINE_STATUS[c.status] || ""}`}>{lineStatus(c)}</span>
                    {c.payout_invoice?.invoice_number && <span className="ml-1 font-mono text-[10px] text-gray-500">{c.payout_invoice.invoice_number}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {last > 1 && (
          <div className="mt-3 flex items-center justify-end gap-2 text-xs">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button>
            <span>Page {page} / {last}</span>
            <button type="button" disabled={page >= last} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
LinesModal.propTypes = { marketer: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired };

/* ---------- Pay a marketer: pick lines, choose their saved account ---------- */
const PayModal = ({ marketer, onClose }) => {
  const accounts = marketer.payment_accounts || [];
  const first = accounts[0];
  const [method, setMethod] = useState(first?.method || "bkash");
  const [trxId, setTrxId] = useState("");
  const [account, setAccount] = useState(first?.account_no || marketer.phone || "");
  const [note, setNote] = useState("");
  const [unticked, setUnticked] = useState(() => new Set());
  const { data, isFetching } = useGetAdminMarketerCommissionLinesQuery({ id: marketer.id, status: "payable", per_page: 100 });
  const [createPayout, { isLoading }] = useCreateCommissionPayoutMutation();
  const lines = data?.data?.data || [];
  const more = (data?.data?.total || 0) > lines.length;
  const picked = lines.filter((l) => !unticked.has(l.id));
  const total = Math.round(picked.reduce((s, l) => s + Number(l.amount || 0), 0) * 100) / 100;
  const needsTrx = method !== "cash";
  const allPicked = picked.length === lines.length;

  const toggle = (id) => setUnticked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const pickAccount = (a) => { setMethod(a.method); setAccount(a.account_no); };

  const submit = async (status) => {
    try {
      await createPayout({
        id: marketer.id, status, payment_method: method,
        // All lines: let the server take every payable line (also ones beyond the first 100).
        commission_ids: allPicked ? undefined : picked.map((l) => l.id),
        trx_id: trxId.trim() || undefined, receiver_account: account.trim() || undefined, note: note.trim() || undefined,
      }).unwrap();
      toast.success(status === "paid" ? `Paid ${bdt(total)} to ${marketer.name}.` : "Unpaid payout created.");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not create the payout.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close"><X className="h-5 w-5" /></button>
        <h2 className="text-lg font-bold text-gray-900">Pay commission</h2>
        <p className="mt-1 text-sm text-gray-600">{marketer.business_name || marketer.name}</p>

        {/* Lines to pay */}
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs">
            <label className="inline-flex items-center gap-2 font-semibold text-gray-700">
              <input type="checkbox" checked={allPicked && lines.length > 0} onChange={() => setUnticked(allPicked ? new Set(lines.map((l) => l.id)) : new Set())} />
              {picked.length} of {lines.length}{more ? "+" : ""} lines
            </label>
            <span className="text-gray-500">Returned orders show as minus lines and are taken off.</span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {isFetching && !lines.length ? (
              <p className="p-4 text-center text-xs text-gray-500"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></p>
            ) : lines.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-500">Nothing to pay.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-t border-gray-50 first:border-0">
                      <td className="w-8 px-3 py-1.5"><input type="checkbox" checked={!unticked.has(l.id)} onChange={() => toggle(l.id)} aria-label={`Include ${l.order?.order_number || l.order_id}`} /></td>
                      <td className="py-1.5 pr-2 font-semibold text-gray-800">{l.order?.order_number || `#${l.order_id}`}{l.type === "clawback" && <span className="ml-1 rounded bg-red-50 px-1 text-[10px] text-red-700">taken back</span>}</td>
                      <td className="py-1.5 pr-2 text-gray-600">{l.client?.dropshipper?.business_name || l.client?.dropshipper?.name || "—"}</td>
                      <td className="py-1.5 pr-2 text-gray-500">{fmtDate(l.earned_at)}</td>
                      <td className={`py-1.5 pr-3 text-right font-bold tabular-nums ${l.amount < 0 ? "text-red-600" : "text-gray-900"}`}>{bdt(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {more && <p className="border-t border-gray-100 px-3 py-1.5 text-[11px] text-gray-500">Showing the first 100 lines. Keep all ticked to pay every payable line.</p>}
        </div>
        <p className="mt-3 flex items-baseline justify-between rounded-xl bg-teal-50 px-4 py-3">
          <span className="text-sm font-semibold text-teal-900">To pay</span>
          <span className={`text-2xl font-extrabold ${total > 0 ? "text-teal-800" : "text-red-600"}`}>{bdt(total)}</span>
        </p>

        {/* Where to send it */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700">Marketer&apos;s payment accounts</p>
          {accounts.length === 0 ? (
            <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">No account saved yet. Ask the marketer to add one in their panel (Earnings → Payment accounts), or type it below.</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-2">
              {accounts.map((a) => {
                const active = method === a.method && account === a.account_no;
                return (
                  <button key={a.id} type="button" onClick={() => pickAccount(a)}
                    className={`rounded-lg border px-3 py-1.5 text-left text-xs ${active ? "border-teal-600 bg-teal-50 text-teal-900" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                    <span className="block font-bold">{a.method === "bank_transfer" ? a.bank_name : a.method_label}</span>
                    <span className="font-mono">{a.account_no}</span>{a.acc_name && <span className="text-gray-500"> · {a.acc_name}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <label className="font-semibold text-gray-700">Payment method
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal">
              {METHODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="font-semibold text-gray-700">Sent to
            <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Number / account" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal" />
          </label>
          {needsTrx && (
            <label className="font-semibold text-gray-700">Transaction ID *
              <input value={trxId} onChange={(e) => setTrxId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal" />
            </label>
          )}
          <label className="font-semibold text-gray-700">Note
            <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => submit("pending")} disabled={isLoading || total <= 0} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Create unpaid payout</button>
          <button type="button" onClick={() => submit("paid")} disabled={isLoading || total <= 0 || (needsTrx && !trxId.trim())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-200 disabled:text-teal-900">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Mark {bdt(total)} as paid
          </button>
        </div>
      </div>
    </div>
  );
};
PayModal.propTypes = { marketer: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired };

/* ---------- Payout invoice (opened from the payout list) ---------- */
const PayoutDocModal = ({ invoiceId, onClose }) => {
  const { data, isFetching, isError } = useGetAdminCommissionPayoutQuery(invoiceId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-slate-50 p-4 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 print:hidden" aria-label="Close"><X className="h-5 w-5" /></button>
        {isFetching && !data ? <p className="p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></p>
          : isError ? <p className="p-8 text-center text-sm text-red-600">Could not load the payout.</p>
          : <CommissionPayoutDocument doc={data?.data} />}
      </div>
    </div>
  );
};
PayoutDocModal.propTypes = { invoiceId: PropTypes.number.isRequired, onClose: PropTypes.func.isRequired };

/* ---------- Recent payouts ---------- */
const PayoutsList = () => {
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState(null);
  const { data, isFetching } = useGetAdminCommissionPayoutsQuery({ status, per_page: 20 });
  const [pay, { isLoading: paying }] = usePayCommissionPayoutMutation();
  const [cancel] = useCancelCommissionPayoutMutation();
  const rows = data?.data?.data || [];

  const payNow = async (inv) => {
    const trx = window.prompt(`Transaction ID for ${inv.invoice_number} (${bdt(inv.total_amount_owed)}). Leave empty for cash.`, "");
    if (trx === null) return;
    try {
      await pay({ invoiceId: inv.id, payment_method: trx.trim() ? inv.payment_method === "cash" ? "bkash" : inv.payment_method : "cash", trx_id: trx.trim() || undefined }).unwrap();
      toast.success("Payout marked as paid.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not pay.");
    }
  };
  const cancelNow = async (inv) => {
    const reason = window.prompt(`Cancel unpaid payout ${inv.invoice_number}? Its lines become payable again.\n\nReason (optional):`, "");
    if (reason === null) return;
    try {
      await cancel({ invoiceId: inv.id, reason: reason.trim() || undefined }).unwrap();
      toast.success("Payout cancelled.");
    } catch (err) {
      toast.error(err?.data?.message || "Could not cancel.");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">Commission payouts</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">
          <option value="all">All</option><option value="pending">Unpaid</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full min-w-[720px] text-left text-xs ${isFetching ? "opacity-60" : ""}`}>
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="px-4 py-2">Payout</th><th className="px-4 py-2">Marketer</th><th className="px-4 py-2 text-right">Amount</th><th className="px-4 py-2">Payment</th><th className="px-4 py-2">Status</th><th className="px-4 py-2" /></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payouts yet.</td></tr>
            ) : rows.map((inv) => (
              <tr key={inv.id} className="border-t border-gray-100">
                <td className="px-4 py-2"><button type="button" onClick={() => setOpenId(inv.id)} className="font-mono font-semibold text-teal-700 hover:underline">{inv.invoice_number}</button><p className="text-[11px] text-gray-500">{fmtDate(inv.paid_at || inv.created_at)}</p></td>
                <td className="px-4 py-2 text-gray-800">{inv.marketer?.business_name || inv.marketer?.name || `#${inv.marketer_id}`}</td>
                <td className="px-4 py-2 text-right font-bold tabular-nums">{bdt(inv.total_amount_owed)}</td>
                <td className="px-4 py-2 text-gray-700">{inv.status === "paid" ? <>{inv.payment_method}{inv.trx_id && <span className="ml-1 font-mono text-[11px] text-gray-500">{inv.trx_id}</span>}</> : "—"}</td>
                <td className="px-4 py-2"><span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${inv.status === "paid" ? LINE_STATUS.paid : inv.status === "pending" ? LINE_STATUS.earned : LINE_STATUS.reversed}`}>{inv.status === "pending" ? "unpaid" : inv.status}</span></td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  {inv.status === "pending" && (
                    <>
                      <button type="button" onClick={() => payNow(inv)} disabled={paying} className="mr-2 rounded-md bg-teal-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-teal-700">Pay</button>
                      <button type="button" onClick={() => cancelNow(inv)} className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50">Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openId && <PayoutDocModal invoiceId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
};

/* ---------- Page ---------- */
const AdminMarketerCommissions = () => {
  const { data, isLoading, isError } = useGetAdminMarketerCommissionsQuery();
  const [paying, setPaying] = useState(null);
  const [viewing, setViewing] = useState(null);
  const marketers = data?.data?.marketers || [];
  const totals = data?.data?.totals || {};
  const defaultRate = data?.data?.default_rate ?? 20;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Megaphone className="h-5 w-5 text-teal-600" /> Marketer commissions</h1>
        <p className="mt-1 text-xs text-gray-600">
          A marketer earns their rate (default {defaultRate}%) of the platform profit, <b>product markup + delivery margin</b>, on every delivered, CarryBee-paid order of their clients.
          Returned orders are taken off the next payout.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[["Ready to pay", totals.payable, "text-teal-700", Banknote], ["On unpaid payouts", totals.invoiced, "text-amber-700", ListChecks], ["Paid", totals.paid, "text-emerald-700", Percent]].map(([label, value, cls, Icon]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="flex items-center gap-1.5 text-xs text-gray-600"><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}</p>
            <p className={`mt-1 text-xl font-extrabold tabular-nums ${cls}`}>{bdt(value)}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-4 py-3">Marketer</th><th className="px-4 py-3 text-right">Clients</th><th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Ready to pay</th><th className="px-4 py-3 text-right">Unpaid payout</th>
              <th className="px-4 py-3 text-right">Paid</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></td></tr>
            ) : isError ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-red-600">Could not load commissions.</td></tr>
            ) : marketers.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">No marketers yet.</td></tr>
            ) : marketers.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{m.business_name || m.name}</p>
                  <p className="text-[11px] text-gray-500">{m.name}{m.suspended && <span className="ml-1 rounded bg-red-50 px-1 text-red-700">suspended</span>}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{m.active_clients}</td>
                <td className="px-4 py-3 text-right tabular-nums">{m.commissioned_orders}</td>
                <td className="px-4 py-3"><RateCell marketer={m} /></td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-teal-700">{bdt(m.payable)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-amber-700">{bdt(m.invoiced)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{bdt(m.paid)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" onClick={() => setViewing(m)} className="mr-2 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">Lines</button>
                  <button type="button" onClick={() => setPaying(m)} disabled={!(m.payable > 0)}
                    className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">
                    Pay {m.payable > 0 ? bdt(m.payable) : ""}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PayoutsList />

      {paying && <PayModal marketer={paying} onClose={() => setPaying(null)} />}
      {viewing && <LinesModal marketer={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

export default AdminMarketerCommissions;
