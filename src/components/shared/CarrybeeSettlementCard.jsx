import { CreditCard } from "lucide-react";
import { carrybeeSettlementLabels } from "../../utils/carrybeeSettlement";

export default function CarrybeeSettlementCard({ settlement }) {
  const { status, invoice, paidAt, webhook, recipient, amount } = settlement;
  const paid = status === "paid";
  const date = paidAt ? new Date(paidAt) : null;
  const formattedDate = date && Number.isFinite(date.getTime())
    ? date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" })
    : "—";
  const recipientLabel = recipient === "vendor" ? "Vendor’s CarryBee account"
    : recipient === "platform" ? "Platform’s CarryBee account" : "—";

  return (
    <section className={`rounded-xl border p-3.5 ${paid ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <h3 className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <CreditCard className="h-4 w-4 shrink-0 text-indigo-600" /> CarryBee Settlement
        </h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
          {carrybeeSettlementLabels[status]}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-3 text-xs text-gray-800 sm:grid-cols-2">
        <div><dt className="text-gray-600">Settlement invoice</dt><dd className="break-all font-mono font-semibold">{paid ? invoice || "—" : "—"}</dd></div>
        <div><dt className="text-gray-600">Paid at (Dhaka time)</dt><dd>{paid ? formattedDate : "—"}</dd></div>
        <div><dt className="text-gray-600">{paid ? "Disbursed to" : "Expected recipient"}</dt><dd>{recipientLabel}</dd></div>
        <div><dt className="text-gray-600">Payment webhook</dt><dd>{webhook ? "Event received" : "No event on record"}</dd></div>
        {paid && amount != null && amount !== "" && Number.isFinite(Number(amount)) && (
          <div><dt className="text-gray-600">Net settlement</dt><dd className="font-semibold">৳{Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>
        )}
      </dl>
      {status === "review" && <p className="mt-3 text-xs leading-relaxed text-amber-900">The payment records disagree. Check the CarryBee payout statement to verify settlement.</p>}
    </section>
  );
}
