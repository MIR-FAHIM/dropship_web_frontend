import PropTypes from "prop-types";
import { Printer } from "lucide-react";

/**
 * Marketer commission payout invoice (Partner Portal F2), shared by the admin page and
 * the marketer's Earnings page. `doc` = response of GET …/commission-payouts/{id}:
 * { invoice, marketer, lines[], totals, created_by, paid_by }.
 */
const bdt = (n) => `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (iso) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const METHOD = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket", bank_transfer: "Bank transfer", cash: "Cash" };
const STATUS = {
  paid: ["Paid", "bg-emerald-100 text-emerald-800"],
  pending: ["Unpaid", "bg-amber-100 text-amber-800"],
  cancelled: ["Cancelled", "bg-slate-200 text-slate-700"],
};

const CommissionPayoutDocument = ({ doc }) => {
  const { invoice = {}, marketer = {}, lines = [], totals = {} } = doc || {};
  const [statusLabel, statusCls] = STATUS[invoice.status] || [invoice.status, "bg-slate-100 text-slate-700"];

  return (
    // Light document in both themes so it prints the same way it looks.
    <article id="commission-payout-doc" className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm print:border-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Reseller Brain · Commission payout</p>
          <h2 className="mt-1 font-mono text-lg font-extrabold">{invoice.invoice_number}</h2>
          <p className="text-xs text-slate-600">Issued {fmt(invoice.created_at)}{doc?.created_by ? ` by ${doc.created_by}` : ""}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusCls}`}>{statusLabel}</span>
          <p className="mt-2 text-2xl font-extrabold text-teal-700">{bdt(totals.payout ?? invoice.total_amount_owed)}</p>
        </div>
      </header>

      <div className="grid gap-4 border-b border-slate-200 py-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Paid to</p>
          <p className="font-bold">{marketer.business_name || marketer.name}</p>
          {marketer.business_name && <p className="text-slate-700">{marketer.name}</p>}
          {marketer.phone && <p className="text-slate-600">{marketer.phone}</p>}
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase text-slate-500">Payment</p>
          {invoice.status === "paid" ? (
            <>
              <p className="font-bold">{METHOD[invoice.payment_method] || invoice.payment_method}{invoice.receiver_account ? ` · ${invoice.receiver_account}` : ""}</p>
              {invoice.trx_id && <p className="font-mono text-slate-700">Trx: {invoice.trx_id}</p>}
              <p className="text-slate-600">{fmt(invoice.paid_at)}{doc?.paid_by ? ` · by ${doc.paid_by}` : ""}</p>
            </>
          ) : invoice.status === "cancelled" ? (
            <p className="text-slate-700">Cancelled {fmt(invoice.rejected_at)}{invoice.rejection_reason ? ` — ${invoice.rejection_reason}` : ""}</p>
          ) : (
            <p className="text-amber-700">Not paid yet{invoice.payment_method ? ` (planned: ${METHOD[invoice.payment_method] || invoice.payment_method})` : ""}</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto py-4">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-2 pr-3">Order</th><th className="py-2 pr-3">Client</th>
              <th className="py-2 pr-3 text-right">Markup</th><th className="py-2 pr-3 text-right">Delivery margin</th>
              <th className="py-2 pr-3 text-right">Rate</th><th className="py-2 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((l) => (
              <tr key={l.id}>
                <td className="py-2 pr-3 font-semibold">{l.order_number}{l.type === "clawback" && <span className="ml-1 rounded bg-rose-100 px-1 text-[10px] text-rose-700">returned · taken back</span>}</td>
                <td className="py-2 pr-3 text-slate-700">{l.client || "—"}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{l.type === "clawback" ? "—" : bdt(l.product_markup)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{l.type === "clawback" ? "—" : bdt(l.delivery_margin)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{l.rate}%</td>
                <td className={`py-2 text-right font-bold tabular-nums ${l.amount < 0 ? "text-rose-600" : "text-slate-900"}`}>{bdt(l.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 text-sm">
            {Number(totals.taken_back) !== 0 && (
              <>
                <tr><td colSpan={5} className="pt-2 text-right text-slate-600">Commission</td><td className="pt-2 text-right tabular-nums">{bdt(totals.commission)}</td></tr>
                <tr><td colSpan={5} className="text-right text-slate-600">Taken back (returned orders)</td><td className="text-right tabular-nums text-rose-600">{bdt(totals.taken_back)}</td></tr>
              </>
            )}
            <tr><td colSpan={5} className="pt-2 text-right font-extrabold">Total payout</td><td className="pt-2 text-right font-extrabold tabular-nums text-teal-700">{bdt(totals.payout ?? invoice.total_amount_owed)}</td></tr>
          </tfoot>
        </table>
      </div>

      {invoice.note && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">Note: {invoice.note}</p>}
      <p className="mt-3 text-[11px] text-slate-500">Commission = rate × (product markup + delivery margin) on delivered orders the courier has paid.</p>

      <div className="mt-4 flex justify-end print:hidden">
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
          <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Print / save PDF
        </button>
      </div>
    </article>
  );
};

CommissionPayoutDocument.propTypes = { doc: PropTypes.object };

export default CommissionPayoutDocument;
