import { Check, Circle, Minus } from "lucide-react";

// Payment column on the admin order list. Reads order.payment_progress from
// GET /orders/all/orders (OrderPaymentProgressService on the API):
// one main status + three steps (CarryBee -> Dropshipper -> Supplier).

export const PAYMENT_STAGES = {
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
  returning: { label: "Returning", className: "bg-gray-100 text-gray-600 border-gray-200" },
  not_delivered: { label: "Not delivered", className: "bg-gray-100 text-gray-600 border-gray-200" },
  carrybee_pending: { label: "CarryBee pending", className: "bg-amber-50 text-amber-800 border-amber-200" },
  both_pending: { label: "Dropshipper + Supplier pending", className: "bg-amber-50 text-amber-800 border-amber-200" },
  dropshipper_pending: { label: "Dropshipper pending", className: "bg-amber-50 text-amber-800 border-amber-200" },
  supplier_pending: { label: "Supplier pending", className: "bg-amber-50 text-amber-800 border-amber-200" },
  // Dark text on a light fill: no white text anywhere (it vanished on white backgrounds).
  completed: { label: "✓ Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-400" },
};

// Options for the server-side ?payment_stage= filter.
export const PAYMENT_STAGE_FILTERS = [
  { value: "all", label: "All payment stages" },
  { value: "not_delivered", label: "Not delivered" },
  { value: "carrybee_pending", label: "CarryBee pending" },
  { value: "dropshipper_pending", label: "Dropshipper pending" },
  { value: "supplier_pending", label: "Supplier pending" },
  { value: "completed", label: "Completed" },
  { value: "returning", label: "Returning" },
];

const taka = (n) => `৳${Number(n || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const when = (value) => {
  if (!value) return "";
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const Step = ({ label, state, title, onClick }) => {
  // state: done | pending | na
  const styles = {
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-gray-200 bg-white text-gray-400",
    na: "border-dashed border-gray-200 bg-white text-gray-300",
  };
  const Icon = state === "done" ? Check : state === "na" ? Minus : Circle;
  const content = (
    <>
      <Icon className="h-3 w-3 shrink-0" strokeWidth={state === "done" ? 3 : 2} aria-hidden="true" />
      <span>{label}</span>
    </>
  );
  const className = `inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${styles[state]}`;
  const srState = state === "done" ? "done" : state === "na" ? "not applicable" : "pending";

  if (!onClick) {
    return <span className={className} title={title} aria-label={`${label}: ${srState}`}>{content}</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      aria-label={`${label}: ${srState}`}
      className={`${className} cursor-pointer hover:opacity-80`}
    >
      {content}
    </button>
  );
};

/**
 * @param {object} props
 * @param {object} props.progress  order.payment_progress
 * @param {() => void} [props.onCarrybeeClick]  open the manual CarryBee payment window
 * @param {() => void} [props.onSettlementClick] open the order's settlement section
 */
const PaymentProgressCell = ({ progress, onCarrybeeClick, onSettlementClick }) => {
  const stage = PAYMENT_STAGES[progress?.stage] || PAYMENT_STAGES.not_delivered;
  const { carrybee = {}, dropshipper = {}, supplier = {} } = progress || {};

  if (progress?.stage === "cancelled") {
    return (
      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stage.className}`}>
        {stage.label}
      </span>
    );
  }

  const weReceive = supplier.direction === "we_receive";

  const carrybeeTitle = !carrybee.applicable
    ? "No courier consignment for this order"
    : carrybee.paid
      ? [
          "CarryBee paid",
          carrybee.invoice_id && `Invoice ${carrybee.invoice_id}`,
          carrybee.paid_to && `Paid to ${carrybee.paid_to} account`,
          carrybee.paid_at && when(carrybee.paid_at),
        ].filter(Boolean).join(" · ")
      : "CarryBee has not paid yet";

  const dropshipperTitle = !dropshipper.applicable
    ? "No dropshipper on this order"
    : dropshipper.paid
      ? `Dropshipper profit ${taka(dropshipper.amount)} paid${dropshipper.paid_at ? ` · ${when(dropshipper.paid_at)}` : ""}`
      : `Dropshipper profit ${taka(dropshipper.amount)} not paid yet`;

  const supplierTitle = !supplier.applicable
    ? "No supplier on this order"
    : weReceive
      ? supplier.paid
        ? `Received ${taka(supplier.amount)} from the supplier${supplier.paid_at ? ` · ${when(supplier.paid_at)}` : ""}`
        : `We will get ${taka(supplier.amount)} from the supplier (paid to their own CarryBee account)`
      : supplier.paid
        ? `Supplier paid ${taka(supplier.amount)}${supplier.paid_at ? ` · ${when(supplier.paid_at)}` : ""}`
        : `Supplier payment ${taka(supplier.amount)} not settled yet`;

  const stepState = (s) => (!s.applicable ? "na" : s.paid ? "done" : "pending");

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${stage.className}`}>
        {stage.label}
      </span>
      <div className="flex flex-wrap justify-center gap-1">
        <Step
          label={carrybee.applicable ? "CarryBee" : "No courier"}
          state={stepState(carrybee)}
          title={carrybeeTitle}
          onClick={carrybee.applicable ? onCarrybeeClick : undefined}
        />
        <Step label="Dropshipper" state={stepState(dropshipper)} title={dropshipperTitle} onClick={onSettlementClick} />
        <Step label="Supplier" state={stepState(supplier)} title={supplierTitle} onClick={onSettlementClick} />
      </div>
      {carrybee.paid && (carrybee.invoice_id || carrybee.paid_to) && (
        <span className="max-w-[200px] truncate text-[10px] text-gray-500" title={carrybeeTitle}>
          {[carrybee.invoice_id, carrybee.paid_to && `Paid to ${carrybee.paid_to} account`].filter(Boolean).join(" · ")}
        </span>
      )}
      {weReceive && supplier.applicable && !supplier.paid && (
        <span className="text-[10px] font-medium text-amber-700">We will get from supplier</span>
      )}
    </div>
  );
};

export default PaymentProgressCell;
