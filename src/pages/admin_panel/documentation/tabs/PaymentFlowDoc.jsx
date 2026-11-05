import React from "react";
import { ShieldCheck, Store, Truck, Package, AlertTriangle, Info, ArrowRight } from "lucide-react";

const money = (n) => `৳${Number(n).toLocaleString()}`;

const STAKEHOLDERS = [
  {
    icon: ShieldCheck,
    color: "bg-red-50 text-red-500",
    title: "ResellerBrain (Platform)",
    desc: "প্রোডাক্ট কমিশন (admin_price − vendor_price) + শিপিং মার্জিন (shipping_fee − courier fee)",
    amount: 65,
  },
  {
    icon: Store,
    color: "bg-orange-50 text-orange-500",
    title: "Vendor (Supplier)",
    desc: "তার প্রোডাক্ট কস্ট (unit_price, \"vendor price\")",
    amount: 1000,
  },
  {
    icon: Truck,
    color: "bg-teal-50 text-teal-500",
    title: "Reseller / Dropshipper",
    desc: "তার প্রফিট (reseller_price − admin_price, শিপিং/COD ফি বাদে)",
    amount: 300,
  },
  {
    icon: Package,
    color: "bg-indigo-50 text-indigo-500",
    title: "Delivery Company (CarryBee)",
    desc: "তার ডেলিভারি ফি + COD ফি, সবার আগে কাটা হয়",
    amount: 135,
  },
];

const EXAMPLE_ROWS = [
  ["প্রোডাক্ট সেলিং প্রাইস (subtotal, reseller_price)", 1350],
  ["কাস্টমার শিপিং চার্জ (shipping_fee)", 150],
  ["কাস্টমার COD টোটাল (total / remaining_cod)", 1500, true],
  ["CarryBee এর আসল ডেলিভারি ফি", 120],
  ["CarryBee এর COD ফি (1,500 এর 1%)", 15],
  ["CarryBee এর মোট কর্তন", 135, true],
  ["CarryBee যা নেট পাঠায় (vendor বা platform এর অ্যাকাউন্টে)", 1365, true],
  ["Vendor এর প্রোডাক্ট কস্ট (unit_price)", 1000],
  ["Platform এর reseller কে দেওয়া দাম (admin_price = vendor price × 1.05)", 1050],
  ["→ Platform এর প্রোডাক্ট কমিশন (admin_price − unit_price)", 50],
  ["→ Platform এর শিপিং মার্জিন (shipping_fee − courier fee)", 15],
  ["→ Reseller এর প্রফিট", 300, true],
];

const FLOW_A_STEPS = [
  "CarryBee কাস্টমার থেকে ৳1,500 COD সংগ্রহ করে।",
  "CarryBee তার ৳135 কর্তন করে, নেট ৳1,365 সরাসরি Vendor এর নিজের CarryBee অ্যাকাউন্টে জমা দেয়।",
  "Vendor টাকা তোলে, তার ৳1,000 প্রোডাক্ট কস্ট রাখে, এবং বাকি ৳365 ResellerBrain কে পাঠায়।",
  "ResellerBrain তার ৳65 (কমিশন + শিপিং মার্জিন) রাখে এবং বাকি ৳300 reseller/dropshipper কে প্রফিট হিসেবে দেয়।",
];

const FLOW_B_STEPS = [
  "CarryBee কাস্টমার থেকে ৳1,500 COD সংগ্রহ করে।",
  "CarryBee তার ৳135 কর্তন করে, নেট ৳1,365 সরাসরি ResellerBrain এর CarryBee অ্যাকাউন্টে জমা দেয়।",
  "ResellerBrain সেই ৳1,365 থেকেই সব দায় মেটায়: Vendor কে ৳1,000, Reseller কে ৳300 প্রফিট দেয়, এবং বাকি ৳65 নিজের আয় হিসেবে রাখে।",
];

const CODE_REFERENCE = [
  ["কাস্টমার COD টোটাল", "orders.total, orders.remaining_cod"],
  ["কাস্টমার শিপিং চার্জ", "orders.shipping_fee"],
  ["Vendor এর প্রোডাক্ট কস্ট", "order_items.unit_price"],
  ["Platform এর reseller কে দেওয়া দাম", "order_items.admin_price"],
  ["Reseller এর সেলিং প্রাইস", "order_items.reseller_price"],
  ["Reseller এর প্রফিট (authoritative)", "orders.reseller_profit"],
  ["কার CarryBee অ্যাকাউন্ট ব্যবহৃত হচ্ছে", "vendors.has_own_delivery_account → orders.courier_account_owner"],
  ["আসল লজিস্টিক শুরু হয়েছে কিনা", "Order::hasConsignment(), orders.consignment_id"],
  ["CarryBee এর আসল ফি (কনসাইনমেন্ট + ডেলিভারি সম্পন্ন হওয়ার পরই থাকে)", "orders.actual_courier_fee, orders.actual_cod_fee"],
  ["লাইভ ব্রেকডাউন (admin দেখে)", "OrderAccountingService::calculateOrderStakeBreakdown()"],
  ["ডেলিভারি সম্পন্ন হলে সেটেলমেন্ট তৈরি", "OrderAccountingService::processOrderDelivery()"],
];

const StepList = ({ steps, accent }) => (
  <ol className="relative pl-6">
    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100 rounded-full" />
    {steps.map((step, i) => (
      <li key={i} className="relative pb-5 last:pb-0">
        <span
          className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${accent}`}
        >
          {i + 1}
        </span>
        <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
      </li>
    ))}
  </ol>
);

const PaymentFlowDoc = () => {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">পেমেন্ট / সেটেলমেন্ট ফ্লো</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          একটি ডেলিভার হওয়া অর্ডারে চার পক্ষের মধ্যে টাকা কীভাবে চলাচল করে, এবং প্রতিটি সংখ্যা
          কোডে কোথায় থাকে — এটি একটি রেফারেন্স ডক, এখনো কোনো রিপোর্ট বা UI এই তথ্যের উপর নির্ভর
          করে না। ভবিষ্যতের cashflow রিপোর্ট বানানোর আগে একটি লিখিত, শেয়ার করা বোঝাপড়া তৈরির জন্য
          এটি রাখা হয়েছে।
        </p>
      </div>

      {/* Stakeholders */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">চার পক্ষ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAKEHOLDERS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-xl border border-gray-100 p-4">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                <p className="text-base font-black text-gray-800 mt-2">{money(s.amount)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Worked example */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
          উদাহরণ — অর্ডার টোটাল ৳1,500
        </h3>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {EXAMPLE_ROWS.map(([label, value, bold], i) => (
                <tr key={i} className={`border-b border-gray-50 last:border-0 ${bold ? "bg-gray-50" : ""}`}>
                  <td className={`px-4 py-2.5 ${bold ? "font-bold text-gray-800" : "text-gray-600"}`}>{label}</td>
                  <td className={`px-4 py-2.5 text-right ${bold ? "font-black text-gray-800" : "text-gray-700"}`}>
                    {money(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Vendor ৳1,000 · ResellerBrain ৳65 · Reseller ৳300 · CarryBee ৳135 = ৳1,500 — ডেলিভারি যেভাবেই
          সম্পন্ন হোক, এই ভাগ একই থাকে।
        </p>
      </div>

      {/* Estimate vs actual delivery charge */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-sky-900">
              Estimate বনাম Actual ডেলিভারি চার্জ — আরেকটি প্রফিট সোর্স
            </p>
            <p className="text-xs text-sky-800 mt-1.5 leading-relaxed max-w-3xl">
              যতক্ষণ না <code className="bg-sky-100 px-1 rounded">consignment_id</code> তৈরি হয়, ততক্ষণ
              আসল লজিস্টিক শুরুই হয়নি — <code className="bg-sky-100 px-1 rounded">shipping_fee</code> এবং
              1% COD ফি তখন পর্যন্ত শুধু একটি এস্টিমেট, আসল খরচ না। কনসাইনমেন্ট তৈরি হয়ে ডেলিভারি সম্পন্ন
              হওয়ার পর CarryBee যে আসল চার্জ রিপোর্ট করে তা সাধারণত এস্টিমেটের চেয়ে কম হয় — সেই পার্থক্যটুকু
              ResellerBrain এর অতিরিক্ত প্রফিট, যা dropshipper, vendor বা CarryBee কাউকেই ফেরত দেওয়া হয় না।
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-[10px] text-gray-400">গ্রাহক থেকে সংগৃহীত/এস্টিমেট</p>
                <p className="text-sm font-black text-gray-800">{money(135)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400" />
              <div className="bg-white rounded-lg border border-sky-200 px-3 py-2">
                <p className="text-[10px] text-gray-400">CarryBee এর আসল চার্জ (consignment রিপোর্ট)</p>
                <p className="text-sm font-black text-gray-800">{money(105)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400" />
              <div className="bg-sky-600 rounded-lg px-3 py-2">
                <p className="text-[10px] text-sky-100">অতিরিক্ত ResellerBrain প্রফিট</p>
                <p className="text-sm font-black text-white">{money(30)}</p>
              </div>
            </div>
            <p className="text-[11px] text-sky-700 mt-3">
              কেন dropshipper এই ৳30 পায় না: তার প্রফিট থেকে সবসময় গ্রাহককে চার্জ করা পূর্ণ{" "}
              <code className="bg-sky-100 px-1 rounded">shipping_fee</code> বাদ দেওয়া হয় — আসল CarryBee
              ডেলিভারি ফি নয়। শুধু COD ফি অংশটুকু আসল কনফার্মড অ্যামাউন্টে মিলানো হয়
              (<code className="bg-sky-100 px-1 rounded">actual_cod_fee</code>)। ডেলিভারি-ফি মার্জিন
              (<code className="bg-sky-100 px-1 rounded">shipping_fee − actual_courier_fee</code>) ডিজাইন
              অনুযায়ী সবসময় ResellerBrain এর।
            </p>
          </div>
        </div>
      </div>

      {/* Two flows */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">দুটি ডেলিভারি ফ্লো</h3>
        <p className="text-xs text-gray-500 mb-4">
          কোনটি প্রযোজ্য তা নির্ধারণ করে <code className="bg-gray-100 px-1 rounded text-[11px]">vendors.has_own_delivery_account</code>
          {" "}(অর্ডারে <code className="bg-gray-100 px-1 rounded text-[11px]">orders.courier_account_owner</code> হিসেবে কপি হয়)।
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">A. Vendor এর নিজের CarryBee অ্যাকাউন্ট</p>
            <p className="text-[11px] text-gray-400 mb-4">has_own_delivery_account = true</p>
            <StepList steps={FLOW_A_STEPS} accent="bg-orange-500" />
            <p className="text-[11px] font-semibold text-orange-600 mt-3">টাকার দিক: Vendor → ResellerBrain (surplus)</p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5">
            <p className="text-sm font-bold text-gray-800 mb-1">B. ResellerBrain এর CarryBee অ্যাকাউন্ট</p>
            <p className="text-[11px] text-gray-400 mb-4">has_own_delivery_account = false</p>
            <StepList steps={FLOW_B_STEPS} accent="bg-indigo-500" />
            <p className="text-[11px] font-semibold text-indigo-600 mt-3">টাকার দিক: ResellerBrain → Vendor (owed cost)</p>
          </div>
        </div>
      </div>

      {/* Code reference */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">কোডে রেফারেন্স</h3>
        <div className="rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-left font-bold text-gray-500">বিষয়</th>
                <th className="px-4 py-2 text-left font-bold text-gray-500">ফিল্ড / মেথড</th>
              </tr>
            </thead>
            <tbody>
              {CODE_REFERENCE.map(([label, ref], i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-2 text-gray-600">{label}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-indigo-700">{ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Known issue */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              জানা অসঙ্গতি — Cashflow রিপোর্ট বানানোর আগে সমাধান করতে হবে
            </p>
            <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
              <code className="bg-amber-100 px-1 rounded">calculateOrderStakeBreakdown()</code> (admin যা লাইভ দেখে)
              সঠিকভাবে ফ্লো A কে &quot;vendor owes platform&quot; হিসেবে গণনা করে। কিন্তু{" "}
              <code className="bg-amber-100 px-1 rounded">processOrderDelivery()</code> — যা ডেলিভারি সম্পন্ন হলে
              আসল settlement row তৈরি করে — ভেন্ডরের settlement টি উল্টো দিকে (&quot;platform still owes
              vendor the shortage&quot;) গণনা করে। অর্থাৎ আজকের <code className="bg-amber-100 px-1 rounded">order_settlements</code>{" "}
              টেবিলের আসল ডেটা, ফ্লো A এর জন্য উপরের বর্ণনার সাথে মেলে না। Cashflow রিপোর্ট এই টেবিলের উপর
              বানানোর আগে এটি ঠিক করা জরুরি।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlowDoc;
