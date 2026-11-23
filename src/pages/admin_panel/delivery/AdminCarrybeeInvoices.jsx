/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, ChevronRight, HelpCircle, Loader2, ReceiptText, RefreshCw, Scale } from "lucide-react";
import { useGetAllCarrybeeInvoicesQuery, useLazyGetAllCarrybeeInvoicesQuery } from "../../../redux/features/carrybeeInvoices";
import { useGetCarryBeeInvoiceDetailsQuery } from "../../../redux/features/delivery_company/carrybeeStoreApi";
import CarrybeeInvoiceDetails from "../../../components/shared/CarrybeeInvoiceDetails";

/**
 * Admin → Delivery → CarryBee Invoices.
 * One section per CarryBee account (the platform account + every vendor with its own account),
 * each with its sums, and a grand total on top. Data comes live from CarryBee (cached 10 min).
 */
const tk = (n) => `৳${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const MEANINGS = [
  ["Collectable", "collectable_amount", "The COD amount written on the parcels — what the customers were supposed to pay."],
  ["Collected", "collected", "The cash CarryBee actually collected from customers. Lower than Collectable when parcels were returned or partly paid."],
  ["Delivery fee", "delivery_fee", "CarryBee's delivery charge for the parcels in this invoice."],
  ["COD fee", "cod_fee", "CarryBee's charge for handling the cash (cash-on-delivery fee)."],
  ["Total fee", "total_fee", "Delivery fee + COD fee — everything CarryBee kept as its charge."],
  ["Receivable", "receivable", "Collected − Total fee. The money CarryBee pays out to this account. \"Paid\" means it was sent to the wallet/bank shown; \"Unpaid\" means it is still due to us."],
  ["Compensation", "compensation_amount", "Money CarryBee pays back for lost or damaged parcels."],
  ["Payable", "payable_amount", "Money this account will give to CarryBee — happens when fees are more than the cash collected (for example many returns). \"Unpaid\" means we still have to give it."],
];

const STATUS_STYLE = {
  paid: "bg-emerald-100 text-emerald-800",
  received: "bg-emerald-100 text-emerald-800",
  unpaid: "bg-amber-100 text-amber-800",
};
const Badge = ({ v }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLE[String(v).toLowerCase()] || "bg-gray-100 text-gray-700"}`}>{v || "—"}</span>
);

const SumCards = ({ t, big }) => {
  const cards = [
    ["Invoices", t.invoices, "text-gray-900", false],
    ["Parcels", t.consignments, "text-gray-900", false],
    ["Collected", t.collected, "text-gray-900", true],
    ["Total fee", t.total_fee, "text-rose-700", true],
    ["Receivable", t.receivable, "text-teal-700", true],
    ["Receivable unpaid", t.receivable_unpaid, "text-amber-700", true],
    ["Compensation", t.compensation_amount, "text-indigo-700", true],
    ["Payable unpaid", t.payable_unpaid, "text-rose-700", true],
  ];
  return (
    <div className={`grid gap-2 ${big ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" : "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8"}`}>
      {cards.map(([label, v, color, money]) => (
        <div key={label} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <div className="text-[11px] font-medium text-gray-500">{label}</div>
          <div className={`${big ? "text-lg" : "text-sm"} font-bold ${color}`}>{money ? tk(v) : Number(v || 0).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

const InvoiceRow = ({ inv, group }) => {
  const [open, setOpen] = useState(false);
  // Platform account → vendorId 0 makes the backend use the platform credentials.
  const vendorId = group.type === "platform" ? 0 : group.vendor_id;
  const { currentData, isFetching, isError, error, refetch } = useGetCarryBeeInvoiceDetailsQuery(
    { vendorId, invoiceId: inv.invoice_id }, { skip: !open }
  );
  return (
    <>
      <tr className="border-t border-gray-100 align-top hover:bg-gray-50">
        <td className="px-3 py-2">
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 font-mono text-xs font-semibold text-teal-700 hover:underline">
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}{inv.invoice_id}
          </button>
          <div className="text-[11px] text-gray-500">{inv.invoice_date}</div>
        </td>
        {group.type === "platform" && (
          <td className="px-3 py-2">
            <div className="flex max-w-[220px] flex-wrap gap-1">
              {(inv.vendors || []).length === 0 && <span className="text-[11px] text-gray-400">Not matched</span>}
              {(inv.vendors || []).map((v) => (
                <span key={v.vendor_id ?? "none"} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">{v.shop_name} · {v.orders}</span>
              ))}
            </div>
          </td>
        )}
        <td className="px-3 py-2 text-right">{inv.total_consignment}</td>
        <td className="px-3 py-2 text-right">{tk(inv.collectable_amount)}</td>
        <td className="px-3 py-2 text-right">{tk(inv.collected)}</td>
        <td className="px-3 py-2 text-right text-gray-600">{tk(inv.delivery_fee)}<div className="text-[11px]">COD {tk(inv.cod_fee)}</div></td>
        <td className="px-3 py-2 text-right text-rose-700">{tk(inv.total_fee)}</td>
        <td className="px-3 py-2 text-right font-semibold text-teal-700">{tk(inv.receivable)}<div className="mt-0.5"><Badge v={inv.receivable_status} /></div></td>
        <td className="px-3 py-2 text-right">{tk(inv.compensation_amount)}</td>
        <td className="px-3 py-2 text-right">{tk(inv.payable_amount)}<div className="mt-0.5"><Badge v={inv.payable_status} /></div></td>
        <td className="px-3 py-2 text-xs text-gray-700">{inv.payment_method || "—"}<div className="text-[11px] text-gray-500">{inv.wallet_name}</div></td>
      </tr>
      {open && (
        <tr className="bg-gray-50">
          <td colSpan={group.type === "platform" ? 11 : 10} className="px-3 py-3">
            <CarrybeeInvoiceDetails invoiceId={inv.invoice_id} response={currentData} isLoading={isFetching} isError={isError} error={error} onRetry={refetch} />
          </td>
        </tr>
      )}
    </>
  );
};

const GroupSection = ({ group }) => {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
          <div>
            <div className="font-semibold text-gray-900">{group.label}</div>
            <div className="text-[11px] text-gray-500">{group.type === "platform" ? "Shared platform account — invoices can hold parcels of several vendors" : "Vendor's own CarryBee account"}</div>
          </div>
        </div>
        {!group.error && <div className="text-right text-xs text-gray-600"><b className="text-teal-700">{tk(group.totals.receivable)}</b> receivable · {group.totals.invoices} invoices</div>}
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-3">
          {!group.error && (
            <Link to={`/admin-panel/delivery/carrybee-reconcile?account=${group.key}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100">
              <Scale className="h-3.5 w-3.5" /> Match payouts with CarryBee
            </Link>
          )}
          {group.error ? (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{group.error}</div>
          ) : (
            <>
              <SumCards t={group.totals} />
              {group.truncated && <div className="text-xs text-amber-700">Only the first 5,000 invoices were read for this account.</div>}
              {group.invoices.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">No invoices for these filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-600">
                      <tr>
                        <th className="px-3 py-2 text-left">Invoice</th>
                        {group.type === "platform" && <th className="px-3 py-2 text-left">Vendors · orders</th>}
                        <th className="px-3 py-2 text-right">Parcels</th>
                        <th className="px-3 py-2 text-right">Collectable</th>
                        <th className="px-3 py-2 text-right">Collected</th>
                        <th className="px-3 py-2 text-right">Delivery / COD fee</th>
                        <th className="px-3 py-2 text-right">Total fee</th>
                        <th className="px-3 py-2 text-right">Receivable</th>
                        <th className="px-3 py-2 text-right">Compensation</th>
                        <th className="px-3 py-2 text-right">Payable</th>
                        <th className="px-3 py-2 text-left">Paid to</th>
                      </tr>
                    </thead>
                    <tbody>{group.invoices.map((inv) => <InvoiceRow key={inv.invoice_id} inv={inv} group={group} />)}</tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};

const AdminCarrybeeInvoices = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [showHelp, setShowHelp] = useState(true);
  const params = useMemo(() => ({ from: from || undefined, to: to || undefined, receivable_status: status }), [from, to, status]);
  const { data, isFetching, isError, error } = useGetAllCarrybeeInvoicesQuery(params);
  const [refresh, { isFetching: refreshing }] = useLazyGetAllCarrybeeInvoicesQuery();
  const [fresh, setFresh] = useState(null);

  // A refresh result wins until the filters change.
  const report = (fresh && fresh.key === JSON.stringify(params) ? fresh.data : null) || data?.data;
  const onRefresh = async () => {
    const res = await refresh({ ...params, refresh: 1 });
    if (res.data?.data) setFresh({ key: JSON.stringify(params), data: res.data.data });
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><ReceiptText className="h-5 w-5 text-teal-600" /> CarryBee invoices</h1>
          <p className="mt-1 text-xs text-gray-600">All CarryBee payout invoices, grouped by CarryBee account, with sums. Live from CarryBee (refreshed every 10 minutes).</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-600">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-0.5 block rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900" /></label>
          <label className="text-xs text-gray-600">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-0.5 block rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900" /></label>
          <label className="text-xs text-gray-600">Receivable
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 block rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900">
              <option value="all">All</option><option value="unpaid">Unpaid</option><option value="paid">Paid</option>
            </select>
          </label>
          <button type="button" onClick={onRefresh} disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-teal-200 bg-teal-50">
        <button type="button" onClick={() => setShowHelp((s) => !s)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-teal-900">
          <HelpCircle className="h-4 w-4" /> What the amounts mean {showHelp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {showHelp && (
          <div className="space-y-2 border-t border-teal-200 px-4 py-3 text-sm text-gray-800">
            <dl className="grid gap-x-6 gap-y-2 md:grid-cols-2">
              {MEANINGS.map(([label, field, text]) => (
                <div key={field}><dt className="font-semibold text-gray-900">{label} <span className="font-mono text-[11px] font-normal text-gray-500">{field}</span></dt><dd className="text-xs text-gray-700">{text}</dd></div>
              ))}
            </dl>
            <p className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700">
              Example: Collected ৳50,000 − Total fee ৳2,050 (Delivery ৳1,250 + COD ৳800) = Receivable ৳47,950.
              Vendors without their own CarryBee account ship on the platform account, so one platform invoice can include several vendors&apos; parcels —
              the <b>Vendors · orders</b> column shows whose orders it paid (from our orders), but CarryBee does not split the amounts per vendor.
            </p>
          </div>
        )}
      </div>

      {isFetching && !report ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading invoices from CarryBee…</div>
      ) : isError && !report ? (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">Could not load invoices: {error?.data?.errors?.error || error?.data?.message || "request failed"}</div>
      ) : report ? (
        <>
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold text-gray-900">All accounts total</h2>
              <span className="text-[11px] text-gray-500">{isFetching ? "Updating…" : `Fetched ${new Date(report.fetched_at).toLocaleString()}`}</span>
            </div>
            <SumCards t={report.totals} big />
          </section>
          <div className="space-y-4">{report.groups.map((g) => <GroupSection key={g.key} group={g} />)}</div>
        </>
      ) : null}
    </div>
  );
};

export default AdminCarrybeeInvoices;
