import React from "react";
import {
  ShieldCheck,
  Truck,
  Store,
  AlertOctagon,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const STATES = [
  {
    label: "Projected",
    labelBn: "প্রজেক্টেড",
    desc: "অর্ডার প্লেস হয়েছে, এখনো ডেলিভার হয়নি। প্রফিট/এনটাইটেলমেন্ট শুধু একটি এস্টিমেট — কোনো সেটেলমেন্ট রেকর্ড নেই।",
    color: "bg-gray-100 text-gray-600",
  },
  {
    label: "Settled (Liability)",
    labelBn: "সেটেলড (দায়)",
    desc: "অর্ডার ডেলিভার হয়েছে, order_settlements রেকর্ড তৈরি হয়েছে। ResellerBrain এখন এই টাকা owe করে — এটি একটি দায় (liability), মুনাফা নয়।",
    color: "bg-amber-100 text-amber-700",
  },
  {
    label: "Paid out",
    labelBn: "পরিশোধিত",
    desc: "Reseller withdraw করেছে / vendor invoice পরিশোধ হয়েছে। দায় শেষ, আসল টাকা ResellerBrain থেকে বের হয়ে গেছে।",
    color: "bg-green-100 text-green-700",
  },
];

const ISSUES = [
  {
    severity: "fixed",
    title: "১. ✅ ঠিক হয়েছে — Vendor settlement এর দিক উল্টো ছিল",
    body: "processOrderDelivery() ভেন্ডরের settlement কে \"platform still owes vendor\" হিসেবে গণনা করত, যেখানে সঠিক হওয়া উচিত ছিল \"vendor owes platform the surplus\" (has_own_delivery_account = true এর ক্ষেত্রে)। এখন calculateOrderStakeBreakdown() এর সূত্র পুনর্ব্যবহার করে ঠিক করা হয়েছে, এবং একটি নতুন direction কলাম যুক্ত হয়েছে। মাল্টি-ভেন্ডর কেস এখনও unresolved (দেখুন #৪)।",
  },
  {
    severity: "fixed",
    title: "১খ. ✅ ঠিক হয়েছে — গভীর কারণ: status 10 কলিশন",
    body: "এই বাগটি ঠিক করতে গিয়ে দেখা গেছে: order_statuses id 10 (\"Carrybee Paid\") দুটি ভিন্ন জায়গায় ভুলভাবে cancelled/returned তালিকায় ছিল, যা is_carrybee_paid কে সবসময় false করে রাখত। দুই জায়গা থেকেই 10 বাদ দেওয়া হয়েছে। এখন disbursement নির্দিষ্টভাবে CarryBee এর order.paid webhook এর উপর নির্ভর করে, শুধু \"delivered\" নয়।",
  },
  {
    severity: "fixed",
    title: "২. ✅ ঠিক হয়েছে — মৃত কিন্তু লাইভ ডাবল-পেমেন্ট রুট",
    body: "POST /settle/reseller-profit/{id} সম্পূর্ণভাবে বাদ দেওয়া হয়েছে। এছাড়াও disburseDropshipperProfitDirectly() এখন দ্বিতীয় disbursement প্রত্যাখ্যান করে, এবং reseller_transactions এ একটি unique index যুক্ত হয়েছে।",
  },
  {
    severity: "warning",
    title: "৩. order_accounting_ledgers শুধু লেখা হয়, কখনো পড়া হয় না",
    body: "একটি সম্পূর্ণ ডাবল-এন্ট্রি লেজার তৈরি করা হয় (booking + delivery তে), এখন এন্ট্রিগুলো সঠিক (দেখুন #৪), কিন্তু এখনও কোনো balance বা report এটি sum/aggregate করে না। Plan A এর \"cash-in-hand\" সেকশনের আগে এটি নিয়ে সিদ্ধান্ত নিতে হবে।",
  },
  {
    severity: "fixed",
    title: "৪. ✅ ঠিক হয়েছে — মাল্টি-ভেন্ডর অর্ডারে লেজার ভুল",
    body: "ডেলিভারির সময় vendor_payable লেজার এন্ট্রি আগে পুরো combined vendor entitlement কে order.vendor_id একজনকেই ক্রেডিট করত। এখন প্রতিটি ভেন্ডরের জন্য আলাদা লেজার এন্ট্রি তৈরি হয়, order_settlements এর মতোই।",
  },
  {
    severity: "critical",
    title: "৫. ভেন্ডরের কোনো ওয়ালেট/উইথড্র সিস্টেম নেই",
    body: "Reseller এর জন্য reseller_transactions + withdraw_requests + calculateUserBalances() আছে, কিন্তু vendor এর জন্য সমতুল্য কিছু নেই — তারা admin-তৈরি SettlementInvoice ব্যাচের মাধ্যমে পরিশোধিত হয়। এটিই Plan C এর মূল সিদ্ধান্ত বিন্দু — এখনও unresolved।",
  },
  {
    severity: "info",
    title: "৬. দায় শুধু ডেলিভারির পর থেকে শুরু হয়",
    body: "orders.reseller_profit চেকআউট থেকেই থাকে (এস্টিমেট), কিন্তু আসল দায় তৈরি হয় তখনই যখন processOrderDelivery() চলে। রিপোর্টে \"projected\" বনাম \"settled\" বনাম \"paid\" স্পষ্টভাবে আলাদা দেখাতে হবে।",
  },
  {
    severity: "info",
    title: "৭. withdraw_requests এ কোনো stakeholder-type কলাম নেই",
    body: "নিচু-প্রায়োরিটি, যদি না vendor wallet বানানো হয়। ভবিষ্যতে vendor withdrawal যুক্ত হলে একটি payable_type ('dropshipper' | 'vendor') কলাম যুক্ত করা উচিত।",
  },
];

const SEVERITY_STYLE = {
  fixed: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-100" },
  critical: { icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50 border-red-100" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  info: { icon: Info, color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
};

const PLANS = [
  {
    id: "A",
    title: "Admin Panel Cashflow Report",
    icon: ShieldCheck,
    color: "bg-red-50 text-red-500",
    audience: "অ্যাডমিন",
    purpose: "প্ল্যাটফর্মের সম্পূর্ণ ক্যাশ পজিশন — কী আয় হয়েছে, কাকে কত পাওনা, আসলে ResellerBrain এর অ্যাকাউন্টে কত আছে।",
    sections: [
      "প্ল্যাটফর্মের realized earnings (কমিশন + শিপিং মার্জিন) — আজ/সপ্তাহ/মাস/মোট",
      "Dropshipper দের মোট পাওনা (liability, উইথড্র হয়নি)",
      "Vendor দের মোট পাওনা (liability, সেটেল হয়নি)",
      "Projected vs Settled vs Paid ব্রেকডাউন",
      "দিনওয়ারি আয়/দায় গ্রোথ",
      "Cash-in-hand এস্টিমেট (ইস্যু #৩ সমাধানের পর)",
    ],
  },
  {
    id: "B",
    title: "Dropshipper Panel Cashflow Report",
    icon: Truck,
    color: "bg-teal-50 text-teal-500",
    audience: "রিসেলার/ড্রপশিপার",
    purpose: "\"আমি এখন কত উইথড্র করতে পারি, কত আসছে, কত পেয়েছি\" — নিজের জন্য।",
    sections: [
      "এভেইলেবল ব্যালেন্স (এখনই উইথড্র করা যায়)",
      "পেন্ডিং/রিজার্ভড (খোলা withdraw request এ)",
      "প্রজেক্টেড প্রফিট (এখনো ডেলিভার হয়নি এমন অর্ডার থেকে) — স্পষ্টভাবে \"নিশ্চিত নয়\" লেবেল করা",
      "অর্ডার-ভিত্তিক ব্রেকডাউন",
      "দিনওয়ারি আয় গ্রোথ",
      "উইথড্র হিস্টোরি",
    ],
  },
  {
    id: "C",
    title: "Vendor Panel Cashflow Report",
    icon: Store,
    color: "bg-orange-50 text-orange-500",
    audience: "ভেন্ডর",
    purpose: "ভেন্ডরদের জন্য একই স্বচ্ছতা — কিন্তু ইস্যু #৫ এর সিদ্ধান্তের উপর নির্ভরশীল।",
    sections: [
      "যদি wallet বানানো হয়: Plan B এর মতোই — ব্যালেন্স, পেন্ডিং, প্রজেক্টেড, অর্ডার ব্রেকডাউন, গ্রোথ, উইথড্র হিস্টোরি",
      "যদি invoice-ভিত্তিক থাকে: পেন্ডিং সেটেলমেন্ট (ভেন্ডর-ভিত্তিক গ্রুপ), পরিশোধিত ইনভয়েস হিস্টোরি, একই projected/settled/paid ব্রেকডাউন",
    ],
  },
];

const ReportPlanCard = ({ plan }) => {
  const Icon = plan.icon;
  return (
    <div className="rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${plan.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Plan {plan.id} · {plan.audience}</p>
          <p className="text-sm font-bold text-gray-800">{plan.title}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{plan.purpose}</p>
      <ul className="space-y-1.5">
        {plan.sections.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CashflowReportPlanDoc = () => {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div>
        <h2 className="text-lg font-bold text-gray-800">ক্যাশফ্লো রিপোর্ট — ফ্লো অডিট ও প্ল্যান</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          এখনো কিছু বানানো হয়নি — এটি একটি প্ল্যানিং ডক। সেটেলমেন্ট কোড অডিট করে যা পাওয়া গেছে, এবং তিনটি
          স্টেকহোল্ডার ক্যাশফ্লো রিপোর্টের প্ল্যান। প্রথমে &quot;পেমেন্ট ফ্লো&quot; ট্যাব পড়ুন।
        </p>
      </div>

      {/* Core rule */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
        <p className="text-sm font-bold text-gray-800 mb-1">মূল নিয়ম</p>
        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
          Dropshipper তার প্রফিট <b>উইথড্র করে</b> টাকা পায়। যতক্ষণ উইথড্র না করা হচ্ছে, এই টাকা
          ResellerBrain এর কাছেই থাকে — এটি একটি <b>দায় (liability)</b>, প্ল্যাটফর্মের মুনাফা নয়। Vendor এর
          অপরিশোধিত সেটেলমেন্টের জন্যও একই কথা প্রযোজ্য। শুধু প্ল্যাটফর্মের নিজের কমিশন/মার্জিন ডেলিভারির
          সাথে সাথেই realized — সেটা কখনো ResellerBrain এর বাইরে যায়নি।
        </p>
      </div>

      {/* Three states */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">টাকার তিনটি অবস্থা</h3>
        <div className="flex items-stretch gap-2 flex-wrap">
          {STATES.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="flex-1 min-w-[180px] rounded-xl border border-gray-100 p-4">
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${s.color} mb-2`}>
                  {s.label}
                </span>
                <p className="text-xs font-bold text-gray-700">{s.labelBn}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
              {i < STATES.length - 1 && (
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">পাওয়া ফ্লো ইস্যুগুলো</h3>
        <div className="space-y-3">
          {ISSUES.map((issue) => {
            const sev = SEVERITY_STYLE[issue.severity];
            const Icon = sev.icon;
            return (
              <div key={issue.title} className={`rounded-xl border p-4 ${sev.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${sev.color}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{issue.title}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{issue.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">তিনটি রিপোর্ট প্ল্যান</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <ReportPlanCard key={p.id} plan={p} />
          ))}
        </div>
      </div>

      {/* What needs to change */}
      <div className="rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-bold text-gray-800 mb-3">বানানোর আগে যা ঠিক করতে হবে</p>
        <ol className="space-y-1.5 text-xs text-gray-600 list-decimal list-inside">
          <li>ইস্যু #১ (vendor settlement দিক) ঠিক করা — নইলে Plan A/C ভুল নাম্বার পাবে</li>
          <li>ইস্যু #৩/#৪ নিয়ে সিদ্ধান্ত (ledger বনাম settlement-table কোনটা source of truth হবে)</li>
          <li>ইস্যু #২ (settle/reseller-profit) বাতিল বা সংশোধন করা</li>
          <li>ইস্যু #৫ নিয়ে সিদ্ধান্ত — vendor wallet বানানো হবে, নাকি invoice-ভিত্তিক থাকবে</li>
          <li>Vendor wallet বানানো হলে ইস্যু #৭ এর payable_type কলাম যুক্ত করা</li>
        </ol>
      </div>
    </div>
  );
};

export default CashflowReportPlanDoc;
