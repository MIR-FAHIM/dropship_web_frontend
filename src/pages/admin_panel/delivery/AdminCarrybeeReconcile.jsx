/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AlertTriangle, ArrowLeft, CheckCircle2, Flag, Loader2, RefreshCw, Scale } from "lucide-react";
import {
  useGetCarrybeeReconcileQuery,
  useReissueVendorInvoiceMutation,
  useResolvePayoutFlagMutation,
  useSetReturnPenaltyPayerMutation,
  useSyncCarrybeeReconcileMutation,
} from "../../../redux/features/carrybeeInvoices";

/**
 * Admin → Delivery → CarryBee Invoices → Match payouts (?account=platform | vendor-{id}).
 * CarryBee's final invoice lines are the truth per order. Sync copies them onto the orders and fixes
 * unpaid payouts; payouts already made are only flagged. Returned parcels get a penalty whose payer
 * the admin picks. A wrong unpaid vendor invoice can be replaced with a corrected one.
 */
const tk = (n) => (n === null || n === undefined ? "—" : `৳${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`);
const errMsg = (e) => e?.data?.message || e?.data?.errors?.error || "Request failed";
const same = (a, b) => Math.abs(Number(a || 0) - Number(b || 0)) < 0.01;

const FLAG_TEXT = {
  overpaid: "Dropshipper overpaid",
  underpaid: "Dropshipper underpaid",
  overcharged: "Vendor charged too much",
  undercharged: "Vendor charged too little",
};
const PAYERS = [["", "Not decided"], ["vendor", "Vendor pays"], ["admin", "Admin (platform) pays"], ["dropshipper", "Dropshipper pays"]];

const Stat = ({ label, value, tone = "text-gray-900", hint }) => (
  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
    <div className="text-[11px] font-medium text-gray-500">{label}</div>
    <div className={`text-base font-bold ${tone}`}>{value}</div>
    {hint && <div className="text-[11px] text-gray-500">{hint}</div>}
  </div>
);

const Recorded = ({ correct, settlement }) => {
  if (!settlement) return <span className="text-[11px] text-gray-400">no record</span>;
  const ok = same(correct, settlement.amount);
  return (
    <div className={`text-[11px] ${ok ? "text-gray-500" : "font-semibold text-rose-700"}`}>
      recorded {tk(settlement.amount)} · {settlement.status}
    </div>
  );
};

const PenaltyCell = ({ row }) => {
  const [save, { isLoading }] = useSetReturnPenaltyPayerMutation();
  if (!row.penalty) return <span className="text-gray-400">—</span>;
  const onChange = async (e) => {
    try {
      await save({ orderId: row.order_id, payer: e.target.value || null }).unwrap();
      toast.success("Return charge payer saved");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  return (
    <div className="space-y-1">
      <div className="font-semibold text-rose-700">{tk(row.penalty.amount)}</div>
      <select value={row.penalty.payer || ""} onChange={onChange} disabled={isLoading}
        className={`rounded border px-1.5 py-1 text-xs text-gray-900 ${row.penalty.payer ? "border-gray-300 bg-white" : "border-amber-400 bg-amber-50"}`}>
        {PAYERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
};

const FlagChip = ({ flag }) => {
  const [resolve, { isLoading }] = useResolvePayoutFlagMutation();
  const open = flag.status === "open";
  const onResolve = async () => {
    const note = window.prompt("Note (e.g. recovered on next payout / written off):", "");
    if (note === null) return;
    try {
      await resolve({ id: flag.id, note }).unwrap();
      toast.success("Flag resolved");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  return (
    <div className={`rounded-md border px-2 py-1 text-[11px] ${open ? "border-rose-200 bg-rose-50 text-rose-800" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
      <div className="flex items-center gap-1 font-semibold"><Flag className="h-3 w-3" /> {FLAG_TEXT[flag.flag] || flag.flag} {tk(Math.abs(flag.difference))}</div>
      <div>paid {tk(flag.recorded)} · correct {tk(flag.correct)}</div>
      {open ? (
        <button type="button" onClick={onResolve} disabled={isLoading} className="mt-0.5 font-semibold text-teal-700 hover:underline">Mark resolved</button>
      ) : (
        <div>Resolved{flag.note ? `: ${flag.note}` : ""}</div>
      )}
    </div>
  );
};

const AdminCarrybeeReconcile = () => {
  const [params] = useSearchParams();
  const account = params.get("account") || "platform";
  const { data, isFetching, isError, error } = useGetCarrybeeReconcileQuery(account);
  const [sync, { isLoading: syncing }] = useSyncCarrybeeReconcileMutation();
  const [reissue, { isLoading: reissuing }] = useReissueVendorInvoiceMutation();
  const [lastSync, setLastSync] = useState(null);
  const report = data?.data;
  const t = report?.totals;
  const isVendor = report?.account?.type === "vendor";

  const onSync = async (refresh) => {
    try {
      const res = await sync({ account, refresh }).unwrap();
      const s = res.data.sync;
      const changed = s.orders.filter((o) => Object.keys(o.changes || {}).length).length;
      const flags = s.orders.reduce((n, o) => n + (o.flags?.length || 0), 0);
      setLastSync({ ...s, changed, flags });
      s.error ? toast.warn(s.error) : toast.success(`Synced: ${s.orders.length} orders checked, ${changed} corrected, ${flags} flagged`);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const onReissue = async (inv) => {
    if (!window.confirm(`Replace ${inv.number} with a corrected invoice from CarryBee's figures? The old one is rejected and kept for history.`)) return;
    try {
      const res = await reissue(inv.id).unwrap();
      const c = res.data.carrybee_check;
      toast.success(`Created ${res.data.new.invoice_number}: ${tk(res.data.new.total_amount_owed)}${c.matches ? " — matches CarryBee" : ` — CarryBee expects ${tk(c.expected)}`}`);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <Link to="/admin-panel/delivery/carrybee-invoices" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> CarryBee invoices
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Scale className="h-5 w-5 text-teal-600" /> Match payouts with CarryBee</h1>
          <p className="mt-1 text-xs text-gray-600">
            {report?.account?.label || account}. CarryBee&apos;s final invoice is the truth for every order: sync copies its cash and fees onto the orders and fixes payouts not paid yet.
            Payouts already made are never changed — they get a flag. Dropshipper payouts never go below ৳0.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onSync(false)} disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sync with CarryBee
          </button>
          <button type="button" onClick={() => onSync(true)} disabled={syncing}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">Re-read all</button>
        </div>
      </div>

      {lastSync && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-gray-800">
          Last sync: {lastSync.invoices} CarryBee invoices, {lastSync.lines} parcel lines read, {lastSync.orders.length} orders checked, <b>{lastSync.changed} corrected</b>, <b>{lastSync.flags} flagged</b>.
          {lastSync.error && <span className="ml-1 text-rose-700">{lastSync.error}</span>}
        </div>
      )}

      {isFetching && !report ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
      ) : isError ? (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{errMsg(error)}</div>
      ) : report && report.orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-600">Nothing synced for this account yet. Press <b>Sync with CarryBee</b>.</div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="CarryBee paid (net)" value={tk(t.carrybee_net)} tone="text-teal-700" hint={`${t.orders} orders`} />
            <Stat label="Supplier price (delivered)" value={tk(t.supplier_price)} />
            {isVendor && <Stat label="Vendor owes (CarryBee check)" value={tk(t.expected_vendor_owes)} tone="text-indigo-700" hint="CarryBee paid − supplier price" />}
            <Stat label="Vendor owes (by orders)" value={tk(t.vendor_owes)} tone={isVendor && !same(t.vendor_owes, t.expected_vendor_owes) ? "text-rose-700" : "text-gray-900"}
              hint={isVendor ? (same(t.vendor_owes, t.expected_vendor_owes) ? "Matches CarryBee" : "Decide return charges to match") : undefined} />
            <Stat label="Return charges" value={tk(t.penalties)} tone="text-rose-700" hint={t.penalties_undecided ? `${t.penalties_undecided} not decided` : "All decided"} />
            <Stat label="Open payout flags" value={t.open_flags} tone={t.open_flags ? "text-rose-700" : "text-gray-900"} />
          </div>

          {report.vendor_invoices.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900">Vendor invoices</h2>
              <div className="mt-2 space-y-2">
                {report.vendor_invoices.map((inv) => {
                  const wrong = isVendor && inv.status === "pending" && !same(inv.final, t.expected_vendor_owes);
                  return (
                    <div key={inv.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${wrong ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
                      <div>
                        <span className="font-mono font-semibold text-gray-900">{inv.number}</span>
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] capitalize text-gray-700">{inv.status}</span>
                        <span className="ml-2 text-xs text-gray-600">{inv.orders} orders · calculated {tk(inv.calculated)} · final <b>{tk(inv.final)}</b></span>
                        {wrong && <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> CarryBee says the vendor owes {tk(t.expected_vendor_owes)}</div>}
                      </div>
                      {inv.status === "pending" && (
                        <button type="button" onClick={() => onReissue(inv)} disabled={reissuing}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">Replace with corrected invoice</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-right">CarryBee collected</th>
                  <th className="px-3 py-2 text-right">Delivery / COD fee</th>
                  <th className="px-3 py-2 text-right">CarryBee net</th>
                  <th className="px-3 py-2 text-right">{isVendor ? "Vendor keeps" : "Supplier price"}</th>
                  <th className="px-3 py-2 text-right">Vendor owes</th>
                  <th className="px-3 py-2 text-right">Dropshipper profit</th>
                  <th className="px-3 py-2 text-left">Return charge</th>
                  <th className="px-3 py-2 text-left">Flags</th>
                </tr>
              </thead>
              <tbody>
                {report.orders.map((r) => (
                  <tr key={r.order_id} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-2">
                      <Link to={`/admin-panel/orders/${r.order_id}`} className="font-semibold text-teal-700 hover:underline">#{r.order_id}</Link>
                      <div className="font-mono text-[11px] text-gray-500">{r.order_number}</div>
                      <div className="text-[11px] text-gray-600">{r.status} · {r.invoice_ids.join(", ")}</div>
                      {r.vendor_invoice && <div className="text-[11px] text-gray-500">{r.vendor_invoice.number} ({r.vendor_invoice.status})</div>}
                    </td>
                    <td className="px-3 py-2 text-right">{tk(r.collected)}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{tk(r.delivery_fee)}<div className="text-[11px]">COD {tk(r.cod_fee)}</div></td>
                    <td className="px-3 py-2 text-right font-semibold">{tk(r.carrybee_net)}</td>
                    <td className="px-3 py-2 text-right">
                      {r.returned ? <span className="text-gray-400">—</span> : (
                        <>
                          <div className="font-semibold text-gray-900">{tk(r.supplier_price)}</div>
                          <div className="text-[11px] text-gray-500">{isVendor ? "supplier price" : "admin pays vendor"}</div>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="font-semibold text-gray-900">{tk(r.vendor_owes)}</div>
                      <Recorded correct={r.vendor_owes} settlement={r.vendor_settlement} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="font-semibold text-gray-900">{r.returned ? "—" : tk(r.dropshipper_profit)}</div>
                      {!r.returned && <Recorded correct={r.dropshipper_profit} settlement={r.dropshipper_settlement} />}
                    </td>
                    <td className="px-3 py-2"><PenaltyCell row={r} /></td>
                    <td className="px-3 py-2">
                      <div className="flex max-w-[220px] flex-col gap-1">
                        {r.flags.length === 0 ? <span className="flex items-center gap-1 text-[11px] text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>
                          : r.flags.map((f) => <FlagChip key={f.id} flag={f} />)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {report.unmatched_lines.length > 0 && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <h2 className="font-bold">CarryBee parcels not matched to any order</h2>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {report.unmatched_lines.map((l) => <li key={l.invoice_id + l.consignment_id}>{l.consignment_id} ({l.merchant_order_id || "no order no."}) on {l.invoice_id}: collected {tk(l.collected)}, fee {tk(l.total_fee)}</li>)}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-700">
            <h2 className="mb-1 text-sm font-bold text-gray-900">How it is worked out</h2>
            <p><b>CarryBee net</b> = collected − delivery fee − COD fee (what CarryBee paid into the account). <b>Vendor keeps</b> = the supplier price of the order. <b>Vendor owes</b> (own CarryBee account) = CarryBee net − what the vendor keeps.
              <b> Dropshipper profit</b> = collected − admin price − customer delivery charge − COD fee, never below ৳0 (the platform absorbs the rest).</p>
            <p className="mt-1"><b>Return charge</b>: what CarryBee charged for a returned parcel (return delivery + return fee − any cash). Pick who pays: <b>Vendor</b> keeps the loss;
              <b> Admin</b> or <b>Dropshipper</b> — the vendor is credited, and with Dropshipper the dropshipper owes it (taken from their return deposit).</p>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default AdminCarrybeeReconcile;
