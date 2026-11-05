import React from "react";
import {
  ScrollText,
  ShoppingCart,
  BookOpen,
  Truck,
  Wallet,
  ArrowDownCircle,
  Store,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowDown,
  Database,
  Scale,
} from "lucide-react";

const STAGES = [
  {
    n: 1,
    title: "Order placed",
    trigger: "Customer checkout",
    tables: ["orders", "order_items"],
    icon: ShoppingCart,
    color: "bg-gray-100 text-gray-500",
    desc: "The claim is created — who owes what to whom. Nothing is settled yet; every figure is an estimate.",
  },
  {
    n: 2,
    title: "Booking entry",
    trigger: "Order created / advance taken",
    tables: ["order_accounting_ledgers"],
    icon: BookOpen,
    color: "bg-sky-50 text-sky-500",
    desc: "The opening entry in the double-entry ledger (booking). No settlement exists yet — this is provisional.",
  },
  {
    n: 3,
    title: "Delivery confirmed",
    trigger: "CarryBee's order.paid webhook (consignment orders) or a manual status update",
    tables: ["order_settlements", "order_accounting_ledgers", "transactions", "orders"],
    icon: Truck,
    color: "bg-indigo-50 text-indigo-500",
    desc: "The moment a projection becomes a real liability. Before this stage, any figure shown anywhere is a projection — it should never be presented as \"already paid.\"",
    highlight: true,
  },
  {
    n: 4,
    title: "Dropshipper disbursed",
    trigger: "Admin action (disburseDropshipperProfitDirectly)",
    tables: ["reseller_transactions", "order_settlements"],
    icon: Wallet,
    color: "bg-teal-50 text-teal-500",
    desc: "Moves the reseller's profit from \"owed\" to \"available in wallet.\" Money has not yet left ResellerBrain — it's just no longer contested.",
  },
  {
    n: 5,
    title: "Dropshipper withdraws",
    trigger: "Reseller requests + admin transfers",
    tables: ["withdraw_requests", "reseller_transactions"],
    icon: ArrowDownCircle,
    color: "bg-green-50 text-green-600",
    desc: "The only point where money actually leaves ResellerBrain for a dropshipper — the true \"money OUT\" event.",
  },
  {
    n: 6,
    title: "Vendor settled",
    trigger: "Admin batches and approves a settlement_invoice",
    tables: ["settlement_invoices", "order_settlements"],
    icon: Store,
    color: "bg-orange-50 text-orange-500",
    desc: "The true \"money OUT\" event for a vendor — but no ledger or transactions entry is written here (see L4 below). The only proof is the invoice row itself and the trx_id the vendor typed in.",
    highlight: true,
  },
  {
    n: 7,
    title: "Vendor owes the platform",
    trigger: "Vendor owns their own CarryBee account and collectable > product price",
    tables: ["order_settlements (direction=payee_owes_platform)"],
    icon: Scale,
    color: "bg-rose-50 text-rose-500",
    desc: "The journey ends here — there is no action or endpoint anywhere that marks this kind of receivable as \"collected\" (see L1/L6).",
    highlight: true,
  },
];

const TABLES = [
  {
    name: "orders",
    purpose: "The order's core record",
    writes: "Checkout, updateOrder, CarrybeeWebhookService",
    feeds: "calculateOrderStakeBreakdown() — the single source for every live figure",
  },
  {
    name: "order_items",
    purpose: "Per-product cost lines",
    writes: "Checkout, updateOrder (allocateResellerProfitToItems)",
    feeds: "orders.subtotal/reseller_profit, multi-vendor settlement grouping",
  },
  {
    name: "order_settlements",
    purpose: "The stakeholder ledger — the real source of truth",
    writes: "processOrderDelivery, saveBreakdownAdjustments, disburse/invoice actions, processOrderReversal",
    feeds: "getCashflowOverview() (Plan A) — all liabilities/receivables/earnings come from here",
  },
  {
    name: "order_accounting_ledgers",
    purpose: "Double-entry ledger (debit/credit)",
    writes: "processOrderBooking, processOrderDelivery, processOrderReversal",
    feeds: "⚠️ Nothing reads it back — see L2",
  },
  {
    name: "reseller_transactions",
    purpose: "A dropshipper's personal wallet statement",
    writes: "disburseDropshipperProfitDirectly, transferWithdrawal, the advance flow, approveWalletTopup",
    feeds: "calculateUserBalances() — a per-reseller figure, computed by a different path than Plan A (see L3)",
  },
  {
    name: "transactions",
    purpose: "The company's high-level cashbook",
    writes: "processOrderDelivery, approveWalletTopup, transferWithdrawal",
    feeds: "⚠️ Incomplete — vendor payouts never write a row here (see L4)",
  },
  {
    name: "withdraw_requests",
    purpose: "Dropshipper payout requests",
    writes: "reserveWithdrawal, transferWithdrawal, rejectWithdrawal",
    feeds: "Money OUT (dropshipper side) — has no payable_type column",
  },
  {
    name: "settlement_invoices",
    purpose: "Vendor payout/collection batches",
    writes: "createVendorSettlementInvoice, approve/submitVendorInvoicePayment",
    feeds: "Flips linked order_settlements rows to settled — never touches ledger/transactions (see L4/L5)",
  },
  {
    name: "delivery_assigned_info",
    purpose: "CarryBee consignment state",
    writes: "CarrybeeWebhookService, manualOrderPayment",
    feeds: "calculateOrderStakeBreakdown()'s first-priority courier-fee source",
  },
  {
    name: "carrybee_webhook_events",
    purpose: "Raw webhook audit log",
    writes: "Every inbound CarryBee webhook, before any processing happens",
    feeds: "The most trustworthy source — start here when investigating any disputed payment",
  },
];

const LOOPHOLES = [
  {
    id: "L1",
    severity: "critical",
    title: "L1 — No company-wide reconciliation check",
    body: "getCashflowOverview() computes \"in\", \"out\", and \"earnings\" separately but never sums them into one pass/fail identity. Today, proving the books balance means comparing several numbers on screen by hand — there's no single indicator that says \"yes, every taka is traced.\"",
  },
  {
    id: "L6",
    severity: "critical",
    title: "L6 — Vendor receivables have no collection step",
    body: "When a vendor owns their own CarryBee account and collects more than their product price, a payee_owes_platform row is created — and nothing else happens. There is no button or endpoint anywhere that marks this kind of row as \"collected from the vendor.\" So the receivables figure can only ever grow, never shrink, even though vendors are in fact collected from in real life.",
  },
  {
    id: "L4",
    severity: "critical",
    title: "L4 — Vendor payouts are the least traceable money movement",
    body: "Settling a settlement_invoice flips the linked order_settlements rows to settled — but writes no order_accounting_ledgers or transactions row. Every other outbound payment (withdrawal, wallet topup) leaves at least one audit trail; vendor payouts leave none.",
  },
  {
    id: "L5",
    severity: "warning",
    title: "L5 — settlement_invoices.total_amount_owed is directionally ambiguous",
    body: "The same shape of bug that was fixed on order_settlements.direction exists here, unfixed. This column is only meaningful when vendors.has_own_delivery_account = true; otherwise it's always 0 and the real payable figure lives in total_supplier_price instead — but the row itself never says which column is \"live.\"",
  },
  {
    id: "L3",
    severity: "warning",
    title: "L3 — Two formulas answer the same question, not provably equal",
    body: "calculateUserBalances() (per-reseller) sums reseller_transactions; getCashflowOverview() (company-wide) sums order_settlements. They agree in the normal flow, but no test or constraint guarantees they can never drift — especially after a manual correction.",
  },
  {
    id: "L2",
    severity: "info",
    title: "L2 — order_accounting_ledgers is write-only",
    body: "Every delivery/reversal writes to it correctly, but nothing reads it back. This table was built specifically to prove debits equal credits — but since nothing checks it today, it proves nothing in practice.",
  },
];

const SEVERITY_STYLE = {
  critical: { icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50 border-red-100" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  info: { icon: Info, color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
  fixed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-100" },
};

const RUNBOOK = [
  {
    title: "First, identify which table is actually missing the entry",
    body: "In order of likelihood: 1) Is the order_settlements row missing/wrong? 2) Is the settlement correct but the real payout was never recorded anywhere? 3) Is everything else correct, and only the order_accounting_ledgers audit trail is missing?",
  },
  {
    title: "If a settlement row is missing or wrong",
    body: "Re-run calculateOrderStakeBreakdown($order) and compare it against order_settlements. If the order was already delivered and settlements were never created, call processOrderDelivery($order) directly instead of hand-inserting rows — it already knows the correct direction and per-vendor split.",
  },
  {
    title: "If the settlement is correct but the real-world payout wasn't recorded",
    body: "Dropshipper: call disburseDropshipperProfitDirectly() if not yet settled — never bypass its double-payment guard. Vendor: use createVendorSettlementInvoice / approveVendorInvoice rather than inserting into settlement_invoices directly — order_ids and order_settlements need to stay in lock-step.",
  },
  {
    title: "If only the ledger trail is missing",
    body: "Add a row using the same account_code/entry_type conventions as processOrderDelivery, and write a description stating plainly that it's a backfill — date and reason. Never backdate it to look automatic.",
  },
  {
    title: "To correct a mistake, never edit or delete a row — add a reversing entry",
    body: "Follow the processOrderReversal pattern — flip debit/credit, or mark the settlement cancelled with a note — then add the new, correct entry. \"No payment should be traceless\" means the full history of what was believed and when, not just the final number.",
  },
  {
    title: "After any manual entry, re-check the 100/100 identity for that order",
    body: "If it doesn't balance, the backfill itself is wrong — stop and recheck before touching any other order.",
  },
];

const StageRow = ({ stage }) => {
  const Icon = stage.icon;
  return (
    <div
      className={`rounded-xl border p-4 ${
        stage.highlight ? "border-amber-200 bg-amber-50/40" : "border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${stage.color} flex items-center justify-center shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black text-gray-400">#{stage.n}</span>
            <p className="text-sm font-bold text-gray-800">{stage.title}</p>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{stage.trigger}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            {stage.tables.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-900 text-white text-[10px] font-mono"
              >
                <Database className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">{stage.desc}</p>
        </div>
      </div>
    </div>
  );
};

const LedgerAndLiabilitiesDoc = () => {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">Ledger &amp; Liabilities — Table Map, Reconciliation &amp; Manual-Entry Runbook</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl leading-relaxed">
          The &quot;Payment Flow&quot; and &quot;Cashflow Report Plan&quot; tabs tell the stakeholder story. This tab
          answers a more operational question — as admin, how do you prove the books are right, and what do you do when they aren&apos;t?
        </p>
      </div>

      {/* 100/100 rule */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-indigo-600" />
          <p className="text-sm font-bold text-gray-800">The 100/100 rule</p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl mb-3">
          For every delivered order, this identity must hold exactly —
        </p>
        <div className="rounded-lg bg-white border border-indigo-100 p-3 font-mono text-[11px] text-gray-700 leading-relaxed overflow-x-auto">
          Vendor&apos;s product price + Dropshipper&apos;s profit + Platform&apos;s product cut + Platform&apos;s shipping cut
          <br />+ CarryBee&apos;s delivery/COD fee (cut at source, never stored in a settlement)
          <br />= orders.total (the full COD the customer paid)
        </div>
        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl mt-3">
          calculateOrderStakeBreakdown() already checks this per order (is_balanced). The same identity company-wide —
          <b> total COD collected = total paid out + total still owed + total realized platform earnings + CarryBee&apos;s fees</b> —
          is not summed into one number anywhere today (see L1 below).
        </p>
      </div>

      {/* Money journey */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">The money journey — stage by stage</h3>
        <div className="space-y-2">
          {STAGES.map((s, i) => (
            <React.Fragment key={s.n}>
              <StageRow stage={s} />
              {i < STAGES.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Table reference */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Table reference — what affects what</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {TABLES.map((t) => (
            <div key={t.name} className="rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-mono font-bold text-gray-900 bg-gray-50 inline-block px-2 py-0.5 rounded mb-2">
                {t.name}
              </p>
              <p className="text-xs text-gray-600 mb-2">{t.purpose}</p>
              <p className="text-[11px] text-gray-400">
                <span className="font-semibold text-gray-500">Written by:</span> {t.writes}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                <span className="font-semibold text-gray-500">Feeds:</span> {t.feeds}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Loopholes */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Loopholes — still open</h3>
        <div className="space-y-3">
          {LOOPHOLES.map((l) => {
            const sev = SEVERITY_STYLE[l.severity];
            const Icon = sev.icon;
            return (
              <div key={l.id} className={`rounded-xl border p-4 ${sev.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${sev.color}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{l.title}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{l.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
          None of these touch the delivery-time flow itself — they&apos;re all on the reporting/closing side
          (reconciliation, collection, audit-trail completeness), which is why they went unnoticed while the delivery-time
          math was being fixed. Suggested order: L1 and L6 first (pure gaps, nothing to break by adding them), then L5
          (same shape of data-model fix as the earlier direction migration), then L4 (a behavior change — deciding
          whether vendor payouts should start writing ledger/transactions rows), and L2/L3 last.
        </p>
      </div>

      {/* Manual entry runbook */}
      <div className="rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText className="w-4 h-4 text-gray-700" />
          <p className="text-sm font-bold text-gray-800">Manual-entry runbook — when the ledger is missing historical data</p>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Never hand-write SQL for these tables — always go through the existing service methods, since they&apos;re what keep
          direction/status/cross-table relationships consistent. A raw INSERT is exactly how the vendor-direction bug and
          the multi-vendor ledger bug happened before.
        </p>
        <ol className="space-y-3">
          {RUNBOOK.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="text-xs font-bold text-gray-700">{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default LedgerAndLiabilitiesDoc;
