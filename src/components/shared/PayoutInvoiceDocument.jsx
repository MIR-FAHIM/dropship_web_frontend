import { useRef } from "react";
import PropTypes from "prop-types";
import { Printer } from "lucide-react";

export const bdt = (n) =>
  `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric" });
};

export const METHOD_LABELS = {
  wallet: "ResellerBrain wallet",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank transfer",
  cash: "Cash",
};

export const PAYOUT_STATUS = {
  paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  pending: { label: "Unpaid", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

export const PayoutStatusPill = ({ status }) => {
  const cfg = PAYOUT_STATUS[status] || { label: status || "—", cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>{cfg.label}</span>;
};
PayoutStatusPill.propTypes = { status: PropTypes.string };

/**
 * The payout invoice as a document: who was paid, how, and the profit of each
 * order (collected − admin price − delivery charge − COD fee). Used by admins
 * and by the dropshipper. "Print" opens it alone in a new window.
 */
const PayoutInvoiceDocument = ({ invoice }) => {
  const ref = useRef(null);
  if (!invoice) return null;

  const rows = Array.isArray(invoice.orders_breakdown) ? invoice.orders_breakdown : [];
  const d = invoice.dropshipper || {};
  const isWallet = invoice.payment_method === "wallet";

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win || !ref.current) return;
    // Copy the app's styles so the invoice prints exactly as shown.
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((n) => n.outerHTML).join("");
    win.document.write(
      `<!doctype html><html><head><title>${invoice.invoice_number}</title>${styles}<style>@page{margin:14mm}body{background:#fff;padding:16px}.no-print{display:none!important}</style></head><body>${ref.current.outerHTML}</body></html>`
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Printer className="h-3.5 w-3.5" /> Print / Save PDF
        </button>
      </div>

      <div ref={ref} className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-lg font-bold text-gray-900">ResellerBrain</p>
            <p className="text-xs text-gray-500">Dropshipper profit payout invoice</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-bold text-gray-900">{invoice.invoice_number}</p>
            <p className="text-xs text-gray-500">Issued {fmtDateTime(invoice.created_at)}</p>
            <div className="mt-1"><PayoutStatusPill status={invoice.status} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-gray-200 py-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Paid to</p>
            <p className="font-semibold text-gray-900">{d.name || `Dropshipper #${invoice.dropshipper_id}`}</p>
            {d.phone && <p className="text-xs text-gray-600">{d.phone}</p>}
            {d.email && <p className="text-xs text-gray-600">{d.email}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Payment</p>
            <p className="font-semibold text-gray-900">{METHOD_LABELS[invoice.payment_method] || invoice.payment_method || "—"}</p>
            {invoice.status === "paid" ? (
              <>
                {!isWallet && invoice.trx_id && <p className="font-mono text-xs text-gray-600">Trx: {invoice.trx_id}</p>}
                {invoice.receiver_account && <p className="font-mono text-xs text-gray-600">To: {invoice.receiver_account}</p>}
                <p className="text-xs text-gray-600">Paid {fmtDateTime(invoice.paid_at)}{invoice.payer?.name ? ` by ${invoice.payer.name}` : ""}</p>
              </>
            ) : invoice.status === "cancelled" ? (
              <p className="text-xs text-gray-600">Cancelled{invoice.rejection_reason ? `: ${invoice.rejection_reason}` : ""}</p>
            ) : (
              <p className="text-xs text-amber-700">Not paid yet</p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto py-4">
          <table className="w-full min-w-[640px] text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wide text-gray-400">
                <th className="py-2 pr-2 font-semibold">#</th>
                <th className="py-2 pr-2 font-semibold">Order</th>
                <th className="py-2 pr-2 font-semibold">Customer</th>
                <th className="py-2 pr-2 text-right font-semibold">Collected</th>
                <th className="py-2 pr-2 text-right font-semibold">Admin price</th>
                <th className="py-2 pr-2 text-right font-semibold">Delivery</th>
                <th className="py-2 pr-2 text-right font-semibold">COD fee</th>
                <th className="py-2 text-right font-semibold">Your profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.order_id} className="border-b border-gray-100">
                  <td className="py-2 pr-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-2">
                    <p className="font-semibold text-gray-900">{r.order_number}</p>
                    <p className="text-[10px] text-gray-400">{fmtDate(r.ordered_at)}</p>
                  </td>
                  <td className="py-2 pr-2 text-gray-600">{r.customer_name || "—"}</td>
                  <td className="py-2 pr-2 text-right">{bdt(r.collected)}</td>
                  <td className="py-2 pr-2 text-right text-gray-600">−{bdt(r.admin_price)}</td>
                  <td className="py-2 pr-2 text-right text-gray-600">−{bdt(r.delivery_charge)}</td>
                  <td className="py-2 pr-2 text-right text-gray-600">−{bdt(r.cod_fee)}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{bdt(r.profit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="pt-3 text-right text-sm font-semibold text-gray-700">
                  Total payout ({rows.length} order{rows.length === 1 ? "" : "s"})
                </td>
                <td className="pt-3 text-right text-base font-extrabold text-emerald-700">{bdt(invoice.total_dropshipper_payout)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {invoice.note && (
          <p className="border-t border-gray-200 pt-3 text-xs text-gray-600"><span className="font-semibold">Note:</span> {invoice.note}</p>
        )}
        <p className="mt-3 text-[10px] text-gray-400">Profit = amount collected from the customer − admin price − delivery charge − COD fee.</p>
      </div>
    </div>
  );
};

PayoutInvoiceDocument.propTypes = { invoice: PropTypes.object };

export default PayoutInvoiceDocument;
