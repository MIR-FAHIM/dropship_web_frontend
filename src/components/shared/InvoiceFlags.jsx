import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FileCheck2, FileClock } from "lucide-react";

// order.invoices from the order list API:
//   { supplier: {invoice_number, status, ...} | null, dropshipper: {...} | null }
// Supplier = vendor settlement invoice, Dropshipper = profit payout invoice.
const KIND_LABELS = { supplier: "Supplier invoice", dropshipper: "Dropshipper invoice" };

const STATUS = {
  paid: { label: "Paid", done: true, cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  approved: { label: "Approved", done: true, cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  pending: { label: "Unpaid", done: false, cls: "border-amber-200 bg-amber-50 text-amber-800" },
};

const statusOf = (s) => STATUS[s] || { label: s || "—", done: false, cls: "border-gray-200 bg-gray-50 text-gray-700" };

/**
 * Small "invoiced" flags for an order row.
 * @param invoices  order.invoices
 * @param kinds     which flags to show, in order
 * @param links     { supplier: (inv) => url, dropshipper: (inv) => url } optional
 * @param labels    override the kind labels
 */
const InvoiceFlags = ({ invoices, kinds = ["dropshipper", "supplier"], links = {}, labels = {}, align = "center" }) => {
  const shown = kinds.filter((k) => invoices?.[k]);
  if (!shown.length) return null;

  return (
    <div className={`mt-1 flex flex-col gap-1 ${align === "start" ? "items-start" : "items-center"}`}>
      {shown.map((kind) => {
        const inv = invoices[kind];
        const st = statusOf(inv.status);
        const Icon = st.done ? FileCheck2 : FileClock;
        const label = labels[kind] || KIND_LABELS[kind];
        const body = (
          <>
            <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{label} · {st.label}</span>
          </>
        );
        const cls = `inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${st.cls}`;
        const title = `${label} ${inv.invoice_number} (${st.label})`;
        const href = links[kind]?.(inv);
        return href ? (
          <Link key={kind} to={href} title={title} onClick={(e) => e.stopPropagation()} className={`${cls} hover:underline`}>{body}</Link>
        ) : (
          <span key={kind} title={title} className={cls}>{body}</span>
        );
      })}
    </div>
  );
};

const invoiceShape = PropTypes.shape({ invoice_number: PropTypes.string, status: PropTypes.string });

InvoiceFlags.propTypes = {
  invoices: PropTypes.shape({ supplier: invoiceShape, dropshipper: invoiceShape }),
  kinds: PropTypes.arrayOf(PropTypes.string),
  links: PropTypes.object,
  labels: PropTypes.object,
  align: PropTypes.oneOf(["center", "start"]),
};

export default InvoiceFlags;
