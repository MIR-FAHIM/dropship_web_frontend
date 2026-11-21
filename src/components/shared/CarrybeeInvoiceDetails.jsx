import { FileText, Loader2 } from "lucide-react";

const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n)
    ? `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : String(value);
};

const statusClass = (status) =>
  ["paid", "received"].includes(String(status).toLowerCase())
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-amber-100 text-amber-900 border-amber-200";

// Our API wraps CarryBee's body: { data: { error, message, data: { ...invoice } } }.
export const getCarrybeeInvoice = (response) => {
  const body = response?.data;
  const invoice = body?.data ?? body;
  return invoice && typeof invoice === "object" && invoice.invoice_id ? invoice : null;
};

export const isManualInvoiceId = (id) => /^MANUAL-/i.test(String(id ?? ""));

const Row = ({ label, value, strong }) => (
  <div className="flex justify-between gap-3">
    <span className="text-gray-500">{label}</span>
    <span className={strong ? "font-semibold text-gray-900" : "text-gray-800"}>{value}</span>
  </div>
);

export default function CarrybeeInvoiceDetails({ invoiceId, response, isLoading, isError, error, onRetry, consignmentId }) {
  if (!invoiceId) return null;

  const header = (
    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-800">
      <FileText className="h-4 w-4 shrink-0 text-indigo-600" />
      CarryBee Invoice <span className="font-mono">#{invoiceId}</span>
    </h3>
  );

  if (isManualInvoiceId(invoiceId)) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
        {header}
        <p className="text-xs text-gray-600">
          This payment was marked paid by hand, so CarryBee has no invoice details for it.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-3.5 space-y-2">
        {header}
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading invoice from CarryBee…
        </p>
      </section>
    );
  }

  const invoice = getCarrybeeInvoice(response);

  if (isError || !invoice) {
    const message = error?.data?.data?.message || error?.data?.message || "Could not load the invoice from CarryBee.";
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-2">
        {header}
        <div className="flex items-center justify-between gap-3 text-xs text-red-700">
          <span>{message}</span>
          {onRetry && (
            <button onClick={onRetry} className="shrink-0 underline cursor-pointer">Retry</button>
          )}
        </div>
      </section>
    );
  }

  const consignments = Array.isArray(invoice.consignments) ? invoice.consignments : [];
  const thisOrder = consignments.find((c) => c.consignment_id === consignmentId);

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
        {header}
        <span className="text-xs text-gray-500">{invoice.invoiced_date ?? invoice.invoice_date ?? ""}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className={`rounded-full border px-2 py-0.5 ${statusClass(invoice.receivable_status)}`}>
          Receivable: {invoice.receivable_status || "—"}
        </span>
        <span className={`rounded-full border px-2 py-0.5 ${statusClass(invoice.payable_status)}`}>
          Payable: {invoice.payable_status || "—"}
        </span>
        {invoice.receivable_wallet_name && (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-700">
            Paid to: {invoice.receivable_wallet_name}
          </span>
        )}
      </div>

      {thisOrder && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 space-y-1 text-xs">
          <p className="font-semibold text-emerald-900">This order ({thisOrder.consignment_id})</p>
          <Row label="Collected" value={money(thisOrder.collected_amount)} />
          <Row label="Delivery fee" value={money(thisOrder.delivery_fee)} />
          <Row label="COD fee" value={money(thisOrder.cod_fee)} />
          <Row label="Total fee" value={money(thisOrder.total_fee)} />
          <Row label="Delivery status" value={thisOrder.delivery_status ?? "—"} />
        </div>
      )}

      <div className="space-y-1 text-xs">
        <p className="font-semibold text-gray-700">Invoice totals ({invoice.total_consignment ?? consignments.length} consignments)</p>
        <Row label="Collected from customers" value={money(invoice.collected_amount)} />
        <Row label="Delivery charge" value={money(invoice.delivery_charge)} />
        <Row label="COD fee" value={money(invoice.cod_fee)} />
        <Row label="Total charge" value={money(invoice.total_charge)} />
        {Number(invoice.compensation_amount) > 0 && <Row label="Compensation" value={money(invoice.compensation_amount)} />}
        {Number(invoice.paid_amount) > 0 && <Row label="Paid by business" value={money(invoice.paid_amount)} />}
        <Row label="Received by business" value={money(invoice.received_amount)} strong />
      </div>

      {consignments.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-indigo-700">All consignments in this invoice</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-1 pr-2 font-medium">Consignment</th>
                  <th className="py-1 pr-2 font-medium">Order</th>
                  <th className="py-1 pr-2 font-medium text-right">Collected</th>
                  <th className="py-1 pr-2 font-medium text-right">Fee</th>
                  <th className="py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {consignments.map((c) => (
                  <tr
                    key={c.consignment_id}
                    className={`border-t border-gray-100 ${c.consignment_id === consignmentId ? "bg-emerald-50 font-semibold" : ""}`}
                  >
                    <td className="py-1 pr-2 font-mono">{c.consignment_id}</td>
                    <td className="py-1 pr-2">{c.merchant_order_id ?? "—"}</td>
                    <td className="py-1 pr-2 text-right">{money(c.collected_amount)}</td>
                    <td className="py-1 pr-2 text-right">{money(c.total_fee)}</td>
                    <td className="py-1">{c.delivery_status ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
