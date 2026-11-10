import React, { useState } from "react";
import { BookOpen, Handshake, Wallet, LineChart, Scale } from "lucide-react";
import PaymentFlowDoc from "./tabs/PaymentFlowDoc";
import CashflowReportPlanDoc from "./tabs/CashflowReportPlanDoc";
import LedgerAndLiabilitiesDoc from "./tabs/LedgerAndLiabilitiesDoc";
import PartnershipPlanDoc from "./tabs/PartnershipPlanDoc";

/* Each future documentation topic is just another entry here. */
const DOC_TABS = [
  {
    id: "payment-flow",
    label: "পেমেন্ট ফ্লো",
    icon: Wallet,
    Component: PaymentFlowDoc,
  },
  {
    id: "cashflow-report-plan",
    label: "ক্যাশফ্লো রিপোর্ট প্ল্যান",
    icon: LineChart,
    Component: CashflowReportPlanDoc,
  },
  {
    id: "ledger-and-liabilities",
    label: "লেজার ও দায়",
    icon: Scale,
    Component: LedgerAndLiabilitiesDoc,
  },
  {
    id: "partnership-plan",
    label: "পার্টনারশিপ পরিকল্পনা",
    icon: Handshake,
    Component: PartnershipPlanDoc,
  },
];

const AdminDocumentation = () => {
  const [activeTab, setActiveTab] = useState(DOC_TABS[0].id);
  const active = DOC_TABS.find((t) => t.id === activeTab) || DOC_TABS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">ডকুমেন্টেশন</h1>
          <p className="text-xs text-gray-400">অভ্যন্তরীণ রেফারেন্স — বিজনেস লজিক ও ডেটা ফ্লো বোঝার জন্য</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100 px-3 overflow-x-auto">
          {DOC_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active tab content */}
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentation;
