import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  Store,
  ClipboardList,
  RotateCcw,
  FileText,
  StickyNote,
  Phone,
  Mail,
  BadgeCheck,
  BadgeX,
  Wallet,
  KeyRound,
} from "lucide-react";
import { useListDeliveryCompaniesQuery } from "../../../../redux/features/delivery_company";
import TabStore from "../TabStore";
import TabOrders from "./components/order/TabOrders";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "store",     label: "Store",     icon: <Store className="w-4 h-4" /> },
  { key: "orders",    label: "Orders",    icon: <ClipboardList className="w-4 h-4" /> },
  { key: "return",    label: "Return",    icon: <RotateCcw className="w-4 h-4" /> },
  { key: "doc",       label: "Doc",       icon: <FileText className="w-4 h-4" /> },
  { key: "notes",     label: "Notes",     icon: <StickyNote className="w-4 h-4" /> },
];

const TabReturn  = ({ company }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center text-gray-400 text-sm">
    রিটার্ন তথ্য শীঘ্রই আসছে।
  </div>
);
const TabDoc     = ({ company }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center text-gray-400 text-sm">
    ডকুমেন্ট শীঘ্রই আসছে।
  </div>
);
const TabNotes   = ({ company }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center text-gray-400 text-sm">
    নোট শীঘ্রই আসছে।
  </div>
);

/* ── Dashboard tab ── */
const TabDashboard = ({ company }) => (
  <div className="space-y-6">
    {/* Info cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InfoCard
        icon={<Phone className="w-5 h-5" />}
        color="bg-blue-500"
        label="সাপোর্ট নম্বর"
        value={company.support_number ?? "—"}
      />
      <InfoCard
        icon={<Phone className="w-5 h-5" />}
        color="bg-indigo-500"
        label="সেকেন্ডারি নম্বর"
        value={company.secondary_number ?? "—"}
      />
      <InfoCard
        icon={<Mail className="w-5 h-5" />}
        color="bg-purple-500"
        label="ইমেইল"
        value={company.email ?? "—"}
      />
      <InfoCard
        icon={<Wallet className="w-5 h-5" />}
        color="bg-green-500"
        label="ব্যালেন্স"
        value={`৳${Number(company.balance || 0).toFixed(2)}`}
      />
      <InfoCard
        icon={company.is_active ? <BadgeCheck className="w-5 h-5" /> : <BadgeX className="w-5 h-5" />}
        color={company.is_active ? "bg-green-500" : "bg-red-500"}
        label="স্ট্যাটাস"
        value={company.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
      />
      <InfoCard
        icon={<Building2 className="w-5 h-5" />}
        color="bg-orange-500"
        label="যোগাযোগ ব্যক্তি"
        value={company.contact_person_name ?? "—"}
      />
    </div>

    {/* API credentials */}
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-gray-500" /> API Credentials
      </h3>
      <div className="space-y-3">
        <CredRow label="API Key"        value={company.api_key} />
        <CredRow label="Secret Key"     value={company.secret_key} />
        <CredRow label="Client Context" value={company.client_context} />
      </div>
    </div>
  </div>
);

const InfoCard = ({ icon, color, label, value }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

const CredRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
    <span className="text-xs text-gray-500 w-32 shrink-0">{label}</span>
    <code className="text-xs bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-gray-700 break-all">
      {value ?? "—"}
    </code>
  </div>
);

/* ── Main component ── */
const AdminDeliveryCompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data, isLoading } = useListDeliveryCompaniesQuery();
  const companies = Array.isArray(data?.data?.data) ? data.data.data : [];
  const company = companies.find((c) => String(c.id) === String(id));

  const renderTab = () => {
    if (!company) return null;
    switch (activeTab) {
      case "dashboard": return <TabDashboard company={company} />;
      case "store":     return <TabStore     company={company} />;
      case "orders":    return <TabOrders    company={company} />;
      case "return":    return <TabReturn    company={company} />;
      case "doc":       return <TabDoc       company={company} />;
      case "notes":     return <TabNotes     company={company} />;
      default:          return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin-panel/delivery/companies")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            {isLoading ? (
              <div className="h-5 w-40 bg-gray-200 animate-pulse rounded" />
            ) : (
              <h1 className="text-xl font-bold text-gray-800">
                {company?.company_name ?? `Company #${id}`}
              </h1>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {company?.email ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !company ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          কোম্পানি পাওয়া যায়নি।
        </div>
      ) : (
        renderTab()
      )}
    </div>
  );
};

export default AdminDeliveryCompanyDetails;
