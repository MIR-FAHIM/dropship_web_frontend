import PropTypes from "prop-types";

const bdt = (n) =>
  `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * "Calculated ৳X · Adjustment −৳Y (reason)" under an invoice total, shown only
 * when an admin changed the final amount. Used on vendor and admin invoice views.
 */
const InvoiceAdjustmentNote = ({ invoice, compact = false }) => {
  const adjustment = Number(invoice?.adjustment_amount || 0);
  if (!invoice || Math.abs(adjustment) < 0.01) return null;

  const sign = adjustment > 0 ? "+" : "−";
  const tone = adjustment < 0 ? "text-red-700" : "text-emerald-700";

  if (compact) {
    return (
      <span className="block text-[10px] font-medium text-amber-700" title={invoice.adjustment_reason || ""}>
        Adjusted {sign}{bdt(Math.abs(adjustment))}
      </span>
    );
  }

  return (
    <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-900">
      <span>Calculated {bdt(invoice.calculated_amount)}</span>
      <span className="mx-1.5 text-amber-400">·</span>
      <span>Adjustment <b className={tone}>{sign}{bdt(Math.abs(adjustment))}</b></span>
      {invoice.adjustment_reason && <p className="mt-0.5 break-words text-amber-800">Reason: {invoice.adjustment_reason}</p>}
    </div>
  );
};

InvoiceAdjustmentNote.propTypes = {
  invoice: PropTypes.shape({
    adjustment_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    calculated_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    adjustment_reason: PropTypes.string,
  }),
  compact: PropTypes.bool,
};

export default InvoiceAdjustmentNote;
