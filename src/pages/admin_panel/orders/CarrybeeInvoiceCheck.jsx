/* eslint-disable react/prop-types */
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, Flag, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import {
  useGetCarrybeeReconcileQuery,
  useSetReturnPenaltyPayerMutation,
  useSyncCarrybeeReconcileMutation,
} from "../../../redux/features/carrybeeInvoices";

/**
 * Vendor settlement invoice → "CarryBee ইনভয়েস যাচাই".
 * Before creating a vendor invoice, check every selected order against CarryBee's final invoice:
 *  - is it on a CarryBee invoice (synced)? which one? CarryBee's cash and fees
 *  - returned parcel: CarryBee's return charge and who pays it (pick here)
 *  - payout flags, and whether the order is already on another vendor invoice
 *  - total check: CarryBee paid − supplier price (+ return charges the vendor carries) = this invoice
 * Calls onStatus({ blockers, expected, matches }) so the modal can stop a wrong invoice.
 */
const bdt = (n) => `৳${Number(Math.abs(n || 0)).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
const errMsg = (e) => e?.data?.message || e?.data?.errors?.error || "Request failed";
const PAYERS = [["", "কে দেবে ঠিক করুন"], ["admin", "অ্যাডমিন দেবে"], ["vendor", "ভেন্ডর দেবে"], ["dropshipper", "ড্রপশিপার দেবে"]];

const hasConsignment = (o) => Boolean(o?.consignment_id || o?.delivery_information?.consignment_id || o?.deliveryInformation?.consignment_id || o?.has_consignment);

export default function CarrybeeInvoiceCheck({ vendor, orders, invoiceAmount, onStatus, onChanged }) {
  const ownAccount = Boolean(vendor?.has_own_delivery_account);
  const account = ownAccount && vendor?.id ? `vendor-${vendor.id}` : "platform";
  const { data, isFetching, isError, error } = useGetCarrybeeReconcileQuery(account);
  const [sync, { isLoading: syncing }] = useSyncCarrybeeReconcileMutation();
  const [savePayer, { isLoading: savingPayer }] = useSetReturnPenaltyPayerMutation();
  const report = data?.data;

  const check = useMemo(() => {
    const byId = new Map((report?.orders || []).map((r) => [Number(r.order_id), r]));
    const rows = orders.map((o) => ({ order: o, cb: byId.get(Number(o.id)) || null }));
    const notSynced = rows.filter((r) => !r.cb && hasConsignment(r.order));
    const noConsignment = rows.filter((r) => !r.cb && !hasConsignment(r.order));
    const undecided = rows.filter((r) => r.cb?.penalty && !r.cb.penalty.payer);
    const onOtherInvoice = rows.filter((r) => r.cb?.vendor_invoice && ["pending", "paid", "approved"].includes(r.cb.vendor_invoice.status));
    const openFlags = rows.reduce((n, r) => n + (r.cb?.flags || []).filter((f) => f.status === "open").length, 0);
    const net = rows.reduce((s, r) => s + Number(r.cb?.carrybee_net || 0), 0);
    const supplier = rows.reduce((s, r) => s + Number(r.cb?.supplier_price || 0), 0);
    const vendorPenalty = rows.reduce((s, r) => s + (r.cb?.penalty?.payer === "vendor" ? Number(r.cb.penalty.amount) : 0), 0);
    const expected = ownAccount ? Math.round((net - supplier + vendorPenalty) * 100) / 100 : null;
    const matches = expected === null ? null : Math.abs(expected - Number(invoiceAmount || 0)) < 0.05;
    const blockers = [
      notSynced.length && `${notSynced.length}টি অর্ডার এখনো CarryBee ইনভয়েসে মেলানো হয়নি — "Sync with CarryBee" চাপুন`,
      undecided.length && `${undecided.length}টি ফেরত অর্ডারের রিটার্ন চার্জ কে দেবে ঠিক করা হয়নি`,
      onOtherInvoice.length && `${onOtherInvoice.length}টি অর্ডার আগেই অন্য ভেন্ডর ইনভয়েসে আছে (${[...new Set(onOtherInvoice.map((r) => r.cb.vendor_invoice.number))].join(", ")})`,
    ].filter(Boolean);
    return { rows, notSynced, noConsignment, undecided, onOtherInvoice, openFlags, net, supplier, vendorPenalty, expected, matches, blockers };
  }, [report, orders, invoiceAmount, ownAccount]);

  useEffect(() => {
    onStatus?.({ loading: isFetching && !report, blockers: check.blockers, expected: check.expected, matches: check.matches });
  }, [check, isFetching, report, onStatus]);

  const onSync = async () => {
    try {
      const res = await sync({ account }).unwrap();
      const s = res.data.sync;
      s.error ? toast.warn(s.error) : toast.success(`CarryBee sync: ${s.orders.length}টি অর্ডার মেলানো হয়েছে`);
      onChanged?.();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const onPayer = async (orderId, payer) => {
    try {
      await savePayer({ orderId, payer: payer || null }).unwrap();
      toast.success("রিটার্ন চার্জ কে দেবে — সেভ হয়েছে");
      onChanged?.();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const ok = check.blockers.length === 0 && check.matches !== false;

  return (
    <section className={`rounded-xl border p-3.5 text-xs ${ok ? "border-emerald-200 bg-emerald-50/50" : "border-amber-300 bg-amber-50/60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <ShieldCheck className="h-4 w-4 text-teal-700" /> CarryBee ইনভয়েস যাচাই (CarryBee invoice check)
          </h3>
          <p className="mt-0.5 text-[11px] text-gray-600">
            {ownAccount ? "ভেন্ডরের নিজস্ব CarryBee অ্যাকাউন্ট" : "প্ল্যাটফর্মের CarryBee অ্যাকাউন্ট"} · প্রতিটি অর্ডার CarryBee-র চূড়ান্ত ইনভয়েসের সাথে মেলানো হয়।
            {report?.synced_at && <> শেষ sync: {new Date(report.synced_at).toLocaleString("en-GB")}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/admin-panel/delivery/carrybee-reconcile?account=${account}`} target="_blank" className="text-[11px] font-semibold text-teal-700 hover:underline">
            Match payouts পেজ
          </Link>
          <button type="button" onClick={onSync} disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync with CarryBee
          </button>
        </div>
      </div>

      {isFetching && !report ? (
        <div className="flex items-center gap-2 py-4 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> CarryBee তথ্য লোড হচ্ছে…</div>
      ) : isError ? (
        <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-rose-800">CarryBee যাচাই লোড হয়নি: {errMsg(error)}</div>
      ) : (
        <>
          {/* Totals check */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
              <div className="text-[10px] text-gray-500">CarryBee দিয়েছে (নিট)</div>
              <div className="font-bold text-teal-700">{check.net < 0 ? "−" : ""}{bdt(check.net)}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
              <div className="text-[10px] text-gray-500">ভেন্ডর রাখবে (পাইকারি মূল্য)</div>
              <div className="font-bold text-gray-900">{bdt(check.supplier)}</div>
            </div>
            {ownAccount && (
              <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
                <div className="text-[10px] text-gray-500">CarryBee অনুযায়ী সঠিক পরিমাণ</div>
                <div className="font-bold text-indigo-700">{bdt(check.expected)}</div>
                <div className="text-[10px] text-gray-500">{check.expected < 0 ? "অ্যাডমিন ভেন্ডরকে দেবে" : "ভেন্ডর অ্যাডমিনকে দেবে"}</div>
              </div>
            )}
            <div className={`rounded-lg border px-2.5 py-1.5 ${check.matches === false ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white"}`}>
              <div className="text-[10px] text-gray-500">এই ইনভয়েসের হিসাব</div>
              <div className="font-bold text-gray-900">{bdt(invoiceAmount)}</div>
              {check.matches === true && <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> CarryBee-র সাথে মিলেছে</div>}
              {check.matches === false && <div className="text-[10px] font-semibold text-rose-700">CarryBee-র সাথে মেলেনি ({bdt((invoiceAmount || 0) - (check.expected || 0))} পার্থক্য)</div>}
            </div>
          </div>

          {/* Per-order rows */}
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-[11px]">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-2 py-1.5 text-left">অর্ডার</th>
                  <th className="px-2 py-1.5 text-left">CarryBee ইনভয়েস</th>
                  <th className="px-2 py-1.5 text-right">CarryBee সংগ্রহ</th>
                  <th className="px-2 py-1.5 text-right">CarryBee ফি</th>
                  <th className="px-2 py-1.5 text-right">CarryBee নিট</th>
                  <th className="px-2 py-1.5 text-left">রিটার্ন চার্জ / সতর্কতা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {check.rows.map(({ order, cb }) => (
                  <tr key={order.id} className={!cb && hasConsignment(order) ? "bg-rose-50/60" : ""}>
                    <td className="px-2 py-1.5">
                      <div className="font-mono font-semibold text-gray-900">#{order.id}</div>
                      <div className="text-[10px] text-gray-500">{order.order_number}</div>
                    </td>
                    <td className="px-2 py-1.5">
                      {cb ? (
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-800"><CheckCircle2 className="h-3 w-3" /> {cb.invoice_ids.join(", ")}</span>
                      ) : hasConsignment(order) ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700"><AlertTriangle className="h-3 w-3" /> CarryBee ইনভয়েসে নেই / sync হয়নি</span>
                      ) : (
                        <span className="text-amber-800">কনসাইনমেন্ট নেই — CarryBee যাচাই সম্ভব নয়</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-right">{cb ? bdt(cb.collected) : "—"}</td>
                    <td className="px-2 py-1.5 text-right text-rose-700">{cb ? `−${bdt(cb.total_fee)}` : "—"}</td>
                    <td className="px-2 py-1.5 text-right font-semibold">{cb ? `${cb.carrybee_net < 0 ? "−" : ""}${bdt(cb.carrybee_net)}` : "—"}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-col gap-1">
                        {cb?.penalty && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-semibold text-rose-700">ফেরত চার্জ {bdt(cb.penalty.amount)}</span>
                            <select value={cb.penalty.payer || ""} disabled={savingPayer} onChange={(e) => onPayer(order.id, e.target.value)}
                              className={`rounded border px-1 py-0.5 text-[11px] text-gray-900 ${cb.penalty.payer ? "border-gray-300 bg-white" : "border-amber-400 bg-amber-50"}`}>
                              {PAYERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          </div>
                        )}
                        {(cb?.flags || []).filter((f) => f.status === "open").map((f) => (
                          <span key={f.id} className="inline-flex items-center gap-1 text-rose-700"><Flag className="h-3 w-3" /> {f.party === "dropshipper" ? "ড্রপশিপার" : "ভেন্ডর"}: {f.flag} {bdt(f.difference)}</span>
                        ))}
                        {cb?.vendor_invoice && ["pending", "paid", "approved"].includes(cb.vendor_invoice.status) && (
                          <span className="font-semibold text-amber-800">আগেই আছে: {cb.vendor_invoice.number} ({cb.vendor_invoice.status})</span>
                        )}
                        {cb && !cb.penalty && !(cb.flags || []).some((f) => f.status === "open") && !(cb.vendor_invoice && ["pending", "paid", "approved"].includes(cb.vendor_invoice.status)) && (
                          <span className="text-emerald-700">ঠিক আছে</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {check.blockers.length > 0 && (
            <ul className="mt-2 space-y-1">
              {check.blockers.map((b) => (
                <li key={b} className="flex items-start gap-1.5 font-semibold text-rose-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {b}</li>
              ))}
            </ul>
          )}
          {check.openFlags > 0 && (
            <p className="mt-1 text-[11px] text-gray-600">{check.openFlags}টি পেআউট ফ্ল্যাগ খোলা আছে (আগে পরিশোধ করা টাকা CarryBee-র সাথে মেলেনি) — ইনভয়েস তৈরি করা যাবে, তবে Match payouts পেজে দেখে নিন।</p>
          )}
        </>
      )}
    </section>
  );
}
