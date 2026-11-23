/* eslint-disable react/prop-types */
import { Banknote, CheckCircle2, CircleDashed, Clock, PackageCheck, Scale, Truck, Undo2, XCircle } from "lucide-react";

/**
 * Order details → আর্থিক অংশীদারিত্ব ও সেটেলমেন্ট: the order's money story, step by step, following CarryBee.
 *  1 Delivery (customer pays CarryBee) → 2 CarryBee pays the account → 3 Who gets what →
 *  4 Settlements (vendor invoice, dropshipper payout) → 5 Admin's final income.
 * Money direction is always "X will give to Y" (never "owe").
 */
const tk = (n) => `৳${Number(Math.abs(n || 0)).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const DELIVERED = [6, 10, 13, 9];
const CANCELLED = [7];
const RETURNED = [8, 11];
const RETURNING = [12];

const STATE = {
  done: { icon: CheckCircle2, ring: "border-emerald-300 bg-emerald-50", dot: "bg-emerald-500", text: "text-emerald-800", label: "সম্পন্ন" },
  now: { icon: Clock, ring: "border-amber-300 bg-amber-50", dot: "bg-amber-500", text: "text-amber-900", label: "এখন এখানে" },
  wait: { icon: CircleDashed, ring: "border-gray-200 bg-gray-50", dot: "bg-gray-300", text: "text-gray-500", label: "অপেক্ষায়" },
  stop: { icon: XCircle, ring: "border-rose-300 bg-rose-50", dot: "bg-rose-500", text: "text-rose-800", label: "বন্ধ" },
};

const Step = ({ n, title, state, icon: Icon, children }) => {
  const s = STATE[state];
  return (
    <li className="relative pl-9">
      <span className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${s.dot}`}>{n}</span>
      <div className={`rounded-xl border p-3 ${s.ring}`}>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900"><Icon className="h-4 w-4 text-gray-700" /> {title}</span>
          <span className={`inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold ${s.text}`}>
            <s.icon className="h-3 w-3" /> {s.label}
          </span>
        </div>
        <div className="space-y-1 text-[11px] text-gray-700">{children}</div>
      </div>
    </li>
  );
};

const Flow = ({ from, to, amount, done, note }) => (
  <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 ${done ? "border-emerald-200 bg-white" : "border-gray-200 bg-white"}`}>
    <span className="text-[11px] text-gray-800">
      <b>{from}</b> → <b>{to}</b> দেবে {note && <span className="text-gray-500">({note})</span>}
    </span>
    <span className="flex items-center gap-1.5">
      <span className="font-mono text-xs font-bold text-gray-900">{tk(amount)}</span>
      {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Clock className="h-3.5 w-3.5 text-amber-600" />}
    </span>
  </div>
);

export default function OrderMoneyStory({ order, b, server }) {
  const status = Number(order?.status?.id ?? order?.status);
  const own = Boolean(b?.supplier?.has_own_delivery_account ?? b?.has_own_delivery_account);
  const vendorName = b?.supplier?.shop_name || b?.vendor_name || order?.vendor?.shop_name || "ভেন্ডর";
  const accountName = own ? `${vendorName}-এর নিজস্ব CarryBee অ্যাকাউন্ট` : "প্ল্যাটফর্মের CarryBee অ্যাকাউন্ট";

  const collected = Number(b?.courier?.collectable_amount || 0);
  const delFee = Number(b?.courier?.delivery_fee || 0);
  const codFee = Number(b?.courier?.cod_fee || 0);
  const fees = Math.round((delFee + codFee) * 100) / 100;
  const net = Math.round((collected - fees) * 100) / 100;
  const vendorKeeps = Number(b?.supplier?.vendor_price || 0);
  const dropProfit = Math.max(0, Number(b?.dropshipper?.profit || 0));
  const vendorGives = Number(server?.supplier?.supplier_owes_platform ?? b?.supplier?.supplier_owes_platform ?? 0);
  const adminIncome = own ? vendorGives - dropProfit : net - vendorKeeps - dropProfit;

  const settlements = order?.settlements || [];
  const supSet = settlements.find((s) => s.settlement_type === "supplier_product_price");
  const dropSet = settlements.find((s) => s.settlement_type === "reseller_profit");
  const vendorSettled = supSet?.status === "settled" || Boolean(b?.supplier?.is_settled);
  const dropSettled = dropSet?.status === "settled" || Boolean(b?.dropshipper?.is_settled);
  const vendorInvoiceNo = (supSet?.admin_note || "").match(/INV-[A-Z0-9-]+/)?.[0] || null;

  const carrybeePaid = Boolean(order?.is_carrybee_paid || order?.carrybee_paid_at || order?.carrybee_invoice_id);
  const reconciled = Boolean(server?.carrybee?.reconciled);
  const cbInvoice = server?.carrybee?.invoice_id || order?.carrybee_invoice_id;
  const penalty = server?.return_penalty;
  const advance = b?.advance || server?.advance || {};
  const advanceApproved = advance?.status === "approved" && Number(advance?.amount) > 0;

  const delivered = DELIVERED.includes(status);
  const cancelled = CANCELLED.includes(status);
  const returned = RETURNED.includes(status);
  const returning = RETURNING.includes(status);
  const completed = status === 9 || (carrybeePaid && vendorSettled && dropSettled);

  // One-line headline of where the money is right now.
  let headline;
  if (cancelled) headline = "অর্ডার বাতিল — কোনো টাকার লেনদেন নেই।";
  else if (returned) headline = penalty ? `পার্সেল ফেরত এসেছে — CarryBee রিটার্ন চার্জ ${tk(penalty.amount)} কেটেছে${penalty.payer ? "" : " (কে দেবে ঠিক হয়নি)"}।` : "পার্সেল ফেরত এসেছে — CarryBee-র রিটার্ন চার্জ CarryBee ইনভয়েস আসলে দেখা যাবে।";
  else if (returning) headline = "পার্সেল ফেরত আসছে — টাকা সংগ্রহ হয়নি।";
  else if (!delivered) headline = "এখনো ডেলিভারি হয়নি — কাস্টমার এখনো টাকা দেয়নি।";
  else if (!carrybeePaid) headline = `ডেলিভারি হয়েছে, কাস্টমার ${tk(collected)} দিয়েছে — কিন্তু CarryBee এখনো টাকা দেয়নি। টাকা এখন CarryBee-র কাছে, তাই সেটেলমেন্ট অপেক্ষায়।`;
  else if (completed) headline = `সব সেটেলমেন্ট শেষ — অ্যাডমিনের চূড়ান্ত আয় ${adminIncome < 0 ? "−" : ""}${tk(adminIncome)}।`;
  else headline = `CarryBee টাকা দিয়েছে ${accountName}-এ — এখন ${[!vendorSettled && "ভেন্ডর ইনভয়েস", !dropSettled && "ড্রপশিপার পেআউট"].filter(Boolean).join(" ও ")} বাকি।`;

  const deliveryState = cancelled ? "stop" : delivered || returned ? "done" : "now";
  const carrybeeState = cancelled ? "stop" : !delivered && !returned ? "wait" : carrybeePaid || returned ? "done" : "now";
  const settleState = cancelled ? "stop" : !carrybeePaid ? "wait" : vendorSettled && dropSettled ? "done" : "now";
  const finalState = cancelled ? "stop" : completed ? "done" : "wait";

  return (
    <div className="mx-5 my-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">টাকার গল্প — CarryBee সেটেলমেন্ট অনুযায়ী</h3>
          <p className="text-[11px] text-gray-500">{accountName} · CarryBee যেখানে টাকা দেয়, সেখান থেকেই ভাগাভাগি শুরু হয়</p>
        </div>
        {reconciled ? (
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">CarryBee ইনভয়েসের সাথে মেলানো ✓ {cbInvoice}</span>
        ) : carrybeePaid ? (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">CarryBee ইনভয়েসের সাথে এখনো মেলানো হয়নি — হিসাব আনুমানিক</span>
        ) : null}
      </div>

      <div className={`mb-3 rounded-lg border px-3 py-2 text-xs font-semibold ${completed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : cancelled || returned ? "border-rose-200 bg-rose-50 text-rose-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {headline}
      </div>

      <ol className="space-y-2.5">
        <Step n={1} title="ডেলিভারি — কাস্টমার CarryBee-কে টাকা দেয়" state={deliveryState} icon={returned || returning ? Undo2 : Truck}>
          {delivered ? (
            <p>কাস্টমার CarryBee রাইডারকে <b>{tk(collected)}</b> ক্যাশ দিয়েছেন (COD)।</p>
          ) : returned || returning ? (
            <p>পার্সেল ফেরত — কাস্টমার টাকা দেননি।</p>
          ) : cancelled ? (
            <p>অর্ডার বাতিল।</p>
          ) : (
            <p>পার্সেল এখনো পথে — ডেলিভারি হলে কাস্টমার <b>{tk(collected)}</b> দেবেন।</p>
          )}
          {advanceApproved && (
            <p className="text-gray-600">ড্রপশিপার আগেই <b>{tk(advance.amount)}</b> জামানত (advance, {advance.payment_method || "—"}) প্ল্যাটফর্মকে দিয়েছেন — ডেলিভারি সম্পন্ন হলে এটা তাকে ফেরত দেওয়া হয়।</p>
          )}
        </Step>

        <Step n={2} title="CarryBee পেমেন্ট — CarryBee ফি কেটে অ্যাকাউন্টে টাকা দেয়" state={carrybeeState} icon={Banknote}>
          {returned ? (
            penalty ? (
              <p>CarryBee রিটার্ন চার্জ <b className="text-rose-700">{tk(penalty.amount)}</b> {accountName} থেকে কেটেছে। কে দেবে: <b>{penalty.payer === "admin" ? "অ্যাডমিন" : penalty.payer === "vendor" ? "ভেন্ডর" : penalty.payer === "dropshipper" ? "ড্রপশিপার" : "ঠিক হয়নি — Match payouts পেজে ঠিক করুন"}</b></p>
            ) : <p>রিটার্ন চার্জ CarryBee ইনভয়েস sync হলে দেখা যাবে।</p>
          ) : carrybeePaid ? (
            <p>CarryBee {cbInvoice ? <>ইনভয়েস <b className="font-mono">{cbInvoice}</b>-এ</> : ""} <b>{tk(collected)}</b> থেকে ফি <b className="text-rose-700">{tk(fees)}</b> (ডেলিভারি {tk(delFee)} + COD {tk(codFee)}) কেটে <b className="text-emerald-700">{tk(net)}</b> {accountName}-এ দিয়েছে।</p>
          ) : delivered ? (
            <p>টাকা এখন <b>CarryBee-র কাছে</b>। CarryBee ফি আনুমানিক <b className="text-rose-700">{tk(fees)}</b> (ডেলিভারি {tk(delFee)} + COD {tk(codFee)}) কেটে প্রায় <b>{tk(net)}</b> {accountName}-এ দেবে। চূড়ান্ত ফি CarryBee ইনভয়েসে আসবে।</p>
          ) : (
            <p>ডেলিভারির পরে CarryBee পেমেন্ট করবে।</p>
          )}
        </Step>

        {!cancelled && !returned && !returning && (
          <Step n={3} title="ভাগাভাগি — কে কত পাবে" state={carrybeePaid ? "done" : delivered ? "now" : "wait"} icon={Scale}>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white px-2 py-1"><div className="text-[10px] text-gray-500">ভেন্ডর রাখবে (পাইকারি)</div><div className="font-bold text-gray-900">{tk(vendorKeeps)}</div></div>
              <div className="rounded-lg border border-gray-200 bg-white px-2 py-1"><div className="text-[10px] text-gray-500">CarryBee ফি</div><div className="font-bold text-rose-700">{tk(fees)}</div></div>
              <div className="rounded-lg border border-gray-200 bg-white px-2 py-1"><div className="text-[10px] text-gray-500">ড্রপশিপার লাভ</div><div className="font-bold text-emerald-700">{tk(dropProfit)}</div></div>
              <div className="rounded-lg border border-gray-200 bg-white px-2 py-1"><div className="text-[10px] text-gray-500">অ্যাডমিন আয়</div><div className={`font-bold ${adminIncome < 0 ? "text-rose-700" : "text-indigo-700"}`}>{adminIncome < 0 ? "−" : ""}{tk(adminIncome)}</div></div>
            </div>
            <p className="text-[10px] text-gray-500">যোগফল = কাস্টমারের {tk(collected)}। {carrybeePaid ? "" : "CarryBee ইনভয়েস আসলে ফি বদলাতে পারে, তখন হিসাব নিজে থেকে ঠিক হবে।"}</p>
          </Step>
        )}

        {!cancelled && (
          <Step n={returned || returning ? 3 : 4} title="সেটেলমেন্ট — কে কাকে দেবে" state={settleState} icon={PackageCheck}>
            {!carrybeePaid && !returned && <p className="text-gray-600">CarryBee টাকা দেওয়ার পর এই লেনদেনগুলো শুরু হবে:</p>}
            {returned ? (
              penalty?.payer && penalty.payer !== "vendor" && own ? (
                <Flow from={penalty.payer === "admin" ? "অ্যাডমিন" : "অ্যাডমিন (ড্রপশিপার থেকে নিয়ে)"} to="ভেন্ডর" amount={penalty.amount} done={vendorSettled} note="CarryBee রিটার্ন চার্জ ভেন্ডরের অ্যাকাউন্ট থেকে কেটেছে" />
              ) : <p>{penalty?.payer === "vendor" ? "ভেন্ডর নিজেই রিটার্ন চার্জ বহন করবে — কোনো লেনদেন নেই।" : "রিটার্ন চার্জ কে দেবে ঠিক হলে লেনদেন দেখা যাবে।"}</p>
            ) : own ? (
              <Flow from="ভেন্ডর" to="অ্যাডমিন" amount={vendorGives} done={vendorSettled}
                note={vendorInvoiceNo ? `ইনভয়েস ${vendorInvoiceNo}` : `CarryBee-র ${tk(net)} থেকে পাইকারি ${tk(vendorKeeps)} রেখে বাকিটা`} />
            ) : (
              <Flow from="অ্যাডমিন" to="ভেন্ডর" amount={vendorKeeps} done={vendorSettled} note={vendorInvoiceNo ? `ইনভয়েস ${vendorInvoiceNo}` : "পাইকারি মূল্য"} />
            )}
            {!returned && dropProfit > 0 && (
              <Flow from="অ্যাডমিন" to="ড্রপশিপার" amount={dropSet?.status === "settled" ? Number(dropSet.settleable_amount) : dropProfit} done={dropSettled}
                note={dropSettled ? "লাভ পরিশোধ হয়েছে" : "লাভ"} />
            )}
            {!returned && advanceApproved && (
              <Flow from="অ্যাডমিন" to="ড্রপশিপার" amount={advance.amount} done={carrybeePaid} note="জামানত ফেরত — ওয়ালেটে" />
            )}
            {!returned && dropProfit === 0 && (
              <p className="text-gray-600">ড্রপশিপারের এই অর্ডারে কোনো লাভ নেই (কাস্টমারের দাম = অ্যাডমিন মূল্য + ডেলিভারি চার্জ)।</p>
            )}
          </Step>
        )}

        {!cancelled && !returning && (
          <Step n={returned ? 4 : 5} title="অ্যাডমিনের চূড়ান্ত আয়" state={finalState} icon={CheckCircle2}>
            {returned ? (
              <p>এই অর্ডারে আয় নেই{penalty?.payer === "admin" ? <> — অ্যাডমিন রিটার্ন চার্জ <b className="text-rose-700">{tk(penalty.amount)}</b> বহন করছে।</> : "।"}</p>
            ) : (
              <p>
                অ্যাডমিন আয় <b className={adminIncome < 0 ? "text-rose-700" : "text-indigo-700"}>{adminIncome < 0 ? "−" : ""}{tk(adminIncome)}</b>{" "}
                {completed ? "— চূড়ান্ত (ভেন্ডর ও ড্রপশিপার দুজনেরই সেটেলমেন্ট শেষ)।" : "— এখনো চূড়ান্ত নয়; CarryBee পেমেন্ট, ভেন্ডর ইনভয়েস ও ড্রপশিপার পেআউট শেষ হলে চূড়ান্ত হবে।"}
              </p>
            )}
          </Step>
        )}
      </ol>
    </div>
  );
}
