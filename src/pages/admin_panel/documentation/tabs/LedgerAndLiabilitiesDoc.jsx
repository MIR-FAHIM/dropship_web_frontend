import { useState } from "react";
import { ArrowDownUp, ChevronDown, ClipboardCheck, ExternalLink, FileText, ShieldAlert, Wallet } from "lucide-react";
import { findings, movementDocs } from "./ledgerAuditData";

const filters = [
  { value: "all", label: "সব findings" },
  { value: "P0", label: "P0 · আগে ঠিক করুন" },
  { value: "P1", label: "P1 · পরের ধাপ" },
];

const dataSources = [
  ["orders / order_items / delivery_assigned_info", "অর্ডার, দাম, আইটেম ও consignment। Expected COD/fee আলাদা; যাচাইকৃত bank receipt নয়।"],
  ["carrybee_webhook_events", "Courier event evidence; signature, processing status ও payout statement দিয়ে যাচাই দরকার।"],
  ["order_settlements", "Stakeholder claim, direction ও operational status। Settled মানেই external টাকা পেয়েছে ধরে নেওয়া যাবে না।"],
  ["order_accounting_ledgers", "Booking, delivery, courier payout ও reversal journal rows। Actual balance prove করতে batch-level validation/reconciliation দরকার।"],
  ["reseller_transactions / withdraw_requests", "Wallet credit/debit ও withdrawal request; wallet available/hold এবং external transfer আলাদা।"],
  ["transactions / settlement_invoices", "কিছু cashbook/margin postings ও vendor invoice batch। পূর্ণ cash register বা সব receiver-এর payment document নয়।"],
];

const rollout = [
  ["১ · ভুল payout বন্ধ করুন", "Backend: role/ownership, withdrawal hold ও verified reference, amount/direction/remaining checks, vendor submission বনাম finance verification, একই idempotent posting path। Frontend: misleading Paid/Balance label বদলান।"],
  ["২ · পোস্টিং ও invoice একসঙ্গে", "Money movement, journal, allocation ও document identity একটি DB transaction-এ commit। PDF render ও notification outbox worker-এ; PDF retry করলে নতুন invoice বা payout হবে না। Vendor, courier ও reseller-এর documents tab দিন।"],
  ["৩ · হিসাব মেলান ও পুরোনো রেকর্ড পরিষ্কার করুন", "Statement import, duplicate/unmatched queue, maker-checker review, dry-run backfill। Existing transfer-এর জন্য matched evidence থাকলে শুধু missing document issue; দ্বিতীয় cash posting নয়। Finance sign-off নিয়ে তারপর cashflow dashboard switch করুন।"],
];

const acceptance = [
  "Vendor, reseller ও staff token দিয়ে অন্যের invoice, withdrawal, proof file বা payout action → 403/404; নিজস্ব document দেখা যাবে।",
  "একই provider reference, webhook retry, concurrent click বা re-upload → একটিই movement, journal ও receiver document। Statement match না হলে Paid invoice নয়।",
  "৳১০০ wallet-এ ৳১০০ pending/approved/in-flight withdrawal → available ৳০; insufficient balance-এ দ্বিতীয় transfer বন্ধ। Reject hold release করে; transferred state আর pending হয় না।",
  "৳১০০ vendor due-তে ৳০ → Paid নয়; ৳৪০ verified → ৳৬০ due ও ৳৪০-এর payment document। Wrong party/account/currency বা reused reference finance review-তে।",
  "Platform account, vendor direct surplus, exact cover, vendor shortage, multi-vendor split ও partial COD/return-এ amounts tie out; অনির্ধারিত split auto-post নয়।",
  "Return after payout, repeated reversal ও old event after cancellation → original evidence অক্ষত, correction একবার, recoverable/refund আলাদা।",
  "প্রতি posted external movement বা verified fee net-off-এ recipient document; wallet credit/draft-এ external payment invoice নয়। PDF/notification fail হলেও retry-তে একই নম্বর।",
  "Journal debits = credits, statement closing cash = book cash after identified in-transit differences, এবং প্রতি party-এর subledger total = সংশ্লিষ্ট control account।",
];

const references = [
  { title: "NBR · VAT Rules (official English text)", url: "https://nbr.gov.bd/uploads/rules/Authentic_English_Text_VAT_Rules_2016.pdf", note: "Tax invoice ও correction form আলাদা রাখার রেফারেন্স।" },
  { title: "IFRS · Principal versus agent (IFRS 15)", url: "https://www.ifrs.org/news-and-events/updates/ifric/2021/ifric-update-november-2021/", note: "Gross COD-কে platform revenue ধরার আগে supply-তে platform-এর ভূমিকা যাচাই।" },
  { title: "OWASP · Object-level authorization", url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/", note: "ID-ভিত্তিক read/write-এ server-side ownership check।" },
  { title: "Stripe · Payout reconciliation", url: "https://docs.stripe.com/reports/payout-reconciliation", note: "Statement payout থেকে individual payment/fee/refund match করার উদাহরণ; CarryBee-এর চুক্তি নয়।" },
  { title: "Stripe · Webhook delivery and retries", url: "https://docs.stripe.com/webhooks", note: "Signature, repeat event ও asynchronous processing-এর engineering reference; CarryBee config আলাদা যাচাই করতে হবে।" },
];

export default function LedgerAndLiabilitiesDoc() {
  const [filter, setFilter] = useState("all");
  const visibleFindings = filter === "all" ? findings : findings.filter(item => item.priority === filter);
  const urgentCount = findings.filter(item => item.priority === "P0").length;

  return (
    <div lang="bn" className="space-y-8 text-slate-800">
      <header className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Finance flow audit · Backend + Frontend</p>
        <h2 className="mt-2 text-xl font-bold">লেজার ও দায়: টাকা কোথায় গেল, প্রমাণ কোথায়?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">
          মূল নিয়ম: <strong>যে stakeholder বাস্তবে টাকা পাবে, তার নামে ResellerBrain-এর নম্বরযুক্ত payment invoice বা receipt থাকবে।</strong> কুরিয়ারের ফি verified net-off হলে তারও settlement document থাকবে। Order confirmed, payable, wallet credit ও bank transfer আলাদা ঘটনা।
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-lg bg-white px-3 py-1.5">{findings.length}টি finding</span>
          <span className="rounded-lg bg-red-100 px-3 py-1.5 text-red-900">{urgentCount}টি P0 · জরুরি</span>
          <span className="rounded-lg bg-white px-3 py-1.5">২টি courier payout route</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          ভিত্তি: dropship_api-এর local Laravel routes/services/models/tests, এবং frontend-এর checkout, breakdown, cashflow, vendor invoices, withdrawal ও CarryBee panels। ২৭টি বিদ্যমান backend test পাস করেছে; আলাদা SQLite পরীক্ষায় ৩টি ঝুঁকি পুনরুৎপাদন হয়েছে। Production ব্যাংক, কুরিয়ার statement বা payout data audit করা হয়নি। নিচের নকশা প্রস্তাবিত।
        </p>
      </header>

      <section aria-labelledby="ledger-money-flow" className="space-y-3">
        <h3 id="ledger-money-flow" className="flex items-center gap-2 text-lg font-bold"><ArrowDownUp size={19} aria-hidden="true" /> টাকা চলার প্রস্তাবিত ধাপ</h3>
        <ol className="grid gap-2 sm:grid-cols-2">
          {[
            ["অর্ডার ও বুকিং", "অ্যাডমিন যাচাই → ভেন্ডরকে assign → consignment book। Entitlement, expected COD/fee ও courier account snapshot রাখুন। তখনো cash paid নয়।"],
            ["ডেলিভারি ও সংগ্রহ", "কুরিয়ার কাস্টমারের কাছ থেকে actual COD সংগ্রহ করে। Delivered/collected record এবং refund/partial return আলাদা; payout এখনো বাকি থাকতে পারে।"],
            ["কুরিয়ারের টাকা যাচাই", "Webhook থেকে reported payout নিন। Consignment ও payout batch statement-এ gross COD, fee/adjustments, account ও net মিললে confirmed movement post করুন।"],
            ["দায় ভাগ ও টাকা দেওয়া", "Vendor পাওনা বা platform receivable আলাদা। Reseller-এর লাভ আগে payable, পরে wallet credit হতে পারে। External withdrawal/direct transfer নিশ্চিত হলেই টাকা দেওয়া ও invoice issue।"],
          ].map(([title, body], index) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold"><span className="mr-2 text-emerald-700">{(index + 1).toLocaleString("bn-BD")}.</span>{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{body}</p>
            </li>
          ))}
        </ol>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed">
            <strong>কুরিয়ার → ResellerBrain</strong>
            <p className="mt-1">Verified net ResellerBrain-এর ব্যাংক/clearing account-এ। ভেন্ডর ও reseller-এর দায় খোলা থাকবে যতক্ষণ না তাদের অংশ paid/allocated হয়।</p>
          </div>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-relaxed">
            <strong>কুরিয়ার → ভেন্ডর</strong>
            <p className="mt-1">ভেন্ডর সরাসরি টাকা পেয়েছেন; platform cash বাড়ে না। Net বেশি হলে surplus receivable, কম হলে vendor payable, সমান হলে শূন্য balance; তবু verified direct receipt-এর document থাকবে।</p>
          </div>
        </div>
        <p className="rounded-xl bg-slate-100 p-4 text-sm leading-relaxed">
          <strong>উদাহরণ:</strong> কাস্টমারের ৳১,১০০ COD − ৳১৩৬ courier fee = ৳৯৬৪ net। ভেন্ডরের পাওনা ৳৭০০, reseller ৳১৬০, platform margin ৳১০৪ ধরলে ভাগ মেলে। ভেন্ডর সরাসরি ৳৯৬৪ পেলে ResellerBrain-এর ৳২৬৪ receivable; ওই ৳২৬৪ সত্যিই জমা হলে তবেই ResellerBrain-এর cash বাড়বে। Reseller-এর ৳১৬০ wallet-এ credit হলে cash নড়বে না; withdrawal transfer-এ cash কমবে।
        </p>
      </section>

      <section aria-labelledby="ledger-documents" className="space-y-3">
        <h3 id="ledger-documents" className="flex items-center gap-2 text-lg font-bold"><FileText size={19} aria-hidden="true" /> কে টাকা পাবে, কার নামে কোন invoice হবে</h3>
        <p className="text-sm leading-relaxed text-slate-700">Verified money movement প্রতি receiver-এর জন্য document দিন; এক payout-এ একাধিক order থাকলে একই receiver-এর একটি invoice-এ আলাদা allocation line থাকবে। ভিন্ন receiver বা দিক হলে আলাদা invoice। Payer প্রয়োজনে কপি পাবে।</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label="Payment document matrix">
          <table className="w-full min-w-[660px] border-collapse text-left text-sm">
            <thead className="bg-slate-100"><tr><th scope="col" className="p-3">টাকা চলার দিক</th><th scope="col" className="p-3">প্রাপক</th><th scope="col" className="p-3">ResellerBrain document</th></tr></thead>
            <tbody>{movementDocs.map(([movement, receiver, document]) => (
              <tr key={movement} className="border-t border-slate-200 align-top">
                <th scope="row" className="p-3 font-semibold">{movement}</th><td className="p-3">{receiver}</td><td className="p-3 leading-relaxed text-slate-700">{document}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-sm leading-relaxed">
          <p><strong>Invoice-এ থাকবে:</strong> server-issued unique number, issuer, payer ও recipient, direction, status, BDT amount, order/consignment ও allocation lines, gross/fee/net, verified payment reference ও date, journal ID, এবং correction হলে original document link। Account number mask করুন।</p>
          <p className="mt-2"><strong>Due invoice ≠ Paid receipt ≠ VAT tax invoice:</strong> দাবি তোলার invoice আগেই দেওয়া যায়; Paid payment document কেবল verified posting-এর পর। প্রযোজ্য কর চালান, supplier/issuer, BIN ও মূসক ৬.৩-এর নিয়ম finance/tax owner যাচাই করবেন। ResellerBrain-এর settlement receipt দিয়ে supplier-এর কর চালান প্রতিস্থাপন করবেন না।</p>
        </div>
      </section>

      <section aria-labelledby="ledger-findings" className="space-y-3">
        <h3 id="ledger-findings" className="flex items-center gap-2 text-lg font-bold"><ShieldAlert size={19} aria-hidden="true" /> Findings ও প্রস্তাবিত fixes</h3>
        <p className="text-sm text-slate-700">P0: ভুল payout, অসম্পূর্ণ হিসাব বা অননুমোদিত access-এর ঝুঁকি। P1: reconciliation ও invoice চালুর আগে সমাধান করুন। বিস্তারিত দেখতে finding খুলুন।</p>
        <div className="flex flex-wrap gap-2" aria-label="Finding priority">
          {filters.map(({ value, label }) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${filter === value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>{label}</button>
          ))}
        </div>
        <div className="space-y-2">
          {visibleFindings.map(({ id, priority, area, title, evidence, backend, frontend }) => (
            <details key={id} className="group rounded-xl border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-start gap-2 rounded-xl px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold ${priority === "P0" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"}`}>{priority}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-500">{id} · {area}</span>
                  <span className="block text-sm font-bold leading-relaxed">{title}</span>
                </span>
                <ChevronDown size={17} className="mt-1 shrink-0 text-slate-500 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-2 border-t border-slate-100 p-4 text-sm leading-relaxed text-slate-700">
                <p><strong className="text-slate-900">কোডে যা দেখা গেছে:</strong> {evidence}</p>
                <p><strong className="text-slate-900">Backend:</strong> {backend}</p>
                <p><strong className="text-slate-900">Frontend:</strong> {frontend}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="ledger-controls" className="space-y-3">
        <h3 id="ledger-controls" className="flex items-center gap-2 text-lg font-bold"><Wallet size={19} aria-hidden="true" /> কীভাবে প্রতিদিন হিসাব মিলবে</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 text-sm leading-relaxed">
            <strong>প্রস্তাবিত data model</strong>
            <p className="mt-1">money_movements + payment_allocations + journal_batches/entries + payment_documents/lines। Invoice বা statement line একাধিক order মেটাতে পারে; allocation ছাড়া total থেকে payment অনুমান নয়। Evidence store-এ provider/account/reference/date ও access-scoped attachment রাখুন।</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 text-sm leading-relaxed">
            <strong>তিনটি মিল</strong>
            <p className="mt-1">১. Collected COD − courier fees ± verified adjustments = statement net। ২. Opening cash + verified receipts − verified payouts = closing cash; account statement-এ মিলবে। ৩. প্রতি party-এর opening due + নতুন claim − allocated payments ± corrections = closing due। Wallet top-up, refunds ও holds আলাদা।</p>
          </div>
        </div>
        <p className="rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"><strong>Mismatch হলে:</strong> Order/consignment এবং statement ref দিয়ে খুঁজুন। আগে evidence মিলিয়ে দেখুন টাকা সত্যিই নড়েছে কি না। Duplicate payout বা hand-written ledger row দিয়ে অঙ্ক মেলাবেন না। Backfill হলে dry run, reviewer approval, linked correction ও audit reason রাখুন; statement না মিললে suspense queue-তে রাখুন।</p>
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-bold">বর্তমান data sources</summary>
          <dl className="mt-3 grid gap-3 md:grid-cols-2">
            {dataSources.map(([table, description]) => (
              <div key={table} className="rounded-lg bg-slate-50 p-3">
                <dt className="break-words font-mono text-xs font-semibold">{table}</dt><dd className="mt-1 text-xs leading-relaxed text-slate-700">{description}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>

      <section aria-labelledby="ledger-release" className="space-y-3">
        <h3 id="ledger-release" className="flex items-center gap-2 text-lg font-bold"><ClipboardCheck size={19} aria-hidden="true" /> বাস্তবায়নের ক্রম ও acceptance checks</h3>
        <ol className="grid gap-2 md:grid-cols-3">
          {rollout.map(([title, body]) => <li key={title} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed"><strong>{title}</strong><p className="mt-1">{body}</p></li>)}
        </ol>
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-bold">রিলিজের আগে যা যাচাই করতে হবে</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">{acceptance.map(check => <li key={check}>{check}</li>)}</ul>
        </details>
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-bold">বাহ্যিক রেফারেন্স</summary>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">{references.map(({ title, url, note }) => (
            <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-800 underline">{title}<ExternalLink size={13} aria-hidden="true" /></a> — {note}</li>
          ))}</ul>
        </details>
      </section>
    </div>
  );
}
