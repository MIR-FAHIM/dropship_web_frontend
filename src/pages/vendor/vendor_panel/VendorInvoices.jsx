import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { imgBaseUrl } from "../../../../config";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Building2,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Search,
  Receipt,
  ArrowRight,
  Store,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useListVendorInvoicesQuery,
  usePayVendorInvoiceMutation,
} from "../../../redux/features/orderSettlement";
import { useGetVendorIdQuery } from "../../../redux/features/vendor_api";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { formatBDT } from "../../../utils/orderBreakdown.utils";


const getProductImgUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  const cleanBase = String(imgBaseUrl || "https://apidropship.resellerbrain.com/storage/app/public").replace(/\/+$/, "");
  const cleanPath = String(thumbnail).replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

export const STATUS_CONFIG = {
  pending: {
    label: "পরিশোধ অপেক্ষমান",
    subLabel: "Pending Payment",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    badgeColor: "bg-amber-500",
  },
  paid: {
    label: "পরিশোধিত (যাচাইাধীন)",
    subLabel: "Paid (Awaiting Approval)",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    badgeColor: "bg-blue-500",
  },
  approved: {
    label: "অনুমোদিত ও নিষ্পন্ন",
    subLabel: "Approved & Settled",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    badgeColor: "bg-emerald-500",
  },
  rejected: {
    label: "প্রত্যাখ্যাত",
    subLabel: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    badgeColor: "bg-red-500",
  },
};

export default function VendorInvoices() {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || searchParams.get("invoice_number") || "";

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [querySearch]);

  const user = getFromLocalstorage("user");
  const userId = getFromLocalstorage("userId") || user?.id;
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
  const vendorId = vendorIdData?.data?.vendor_id || vendorIdData?.data?.id || user?.vendor_id;

  const queryParams = {
    search: searchTerm || undefined,
    status: activeTab !== "all" ? activeTab : undefined,
    vendor_id: vendorId || undefined,
  };

  const { data, isLoading, refetch } = useListVendorInvoicesQuery(queryParams);
  const invoices = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  // If URL has search query and invoices load, automatically open matching invoice
  useEffect(() => {
    if (querySearch && invoices.length > 0 && !selectedInvoice) {
      const exact = invoices.find(
        (inv) => inv.invoice_number?.toLowerCase() === querySearch.toLowerCase()
      );
      if (exact) {
        setSelectedInvoice(exact);
      } else if (invoices.length === 1) {
        setSelectedInvoice(invoices[0]);
      }
    }
  }, [querySearch, invoices]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-600" />
            সেটেলমেন্ট ইনভয়েস (Settlement Invoices)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            আপনার নিজস্ব CarryBee ডেলিভারি অ্যাকাউন্ট থেকে প্ল্যাটফর্মের প্রাপ্য অর্থ পরিশোধ ও ইনভয়েস ইতিহাস
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "সকল ইনভয়েস" },
            { id: "pending", label: "পরিশোধ অপেক্ষমান" },
            { id: "paid", label: "পরিশোধিত" },
            { id: "approved", label: "অনুমোদিত" },
            { id: "rejected", label: "প্রত্যাখ্যাত" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ইনভয়েস বা Trx ID খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Invoice List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-indigo-600 gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">ইনভয়েস লোড হচ্ছে...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-semibold text-gray-800">কোনো ইনভয়েস পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {activeTab !== "all"
              ? `"${STATUS_CONFIG[activeTab]?.label || activeTab}" স্ট্যাটাসের কোনো ইনভয়েস নেই।`
              : "অ্যাডমিন এখনও আপনার অর্ডারের জন্য কোনো সেটেলমেন্ট ইনভয়েস জারি করেনি।"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv) => {
            const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
            const isPending = inv.status === "pending" || inv.status === "rejected";

            return (
              <div
                key={inv.id}
                className={`bg-white rounded-xl border shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between ${
                  isPending ? "border-amber-200 bg-amber-50/20" : "border-gray-200"
                }`}
              >
                <div className="p-4 space-y-3">
                  {/* Top: Invoice No & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-gray-900 block">
                        {inv.invoice_number}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(inv.created_at).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* 3 Key Metrics Summary */}
                  <div className="space-y-2 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-gray-200">
                      <span className="text-gray-500">অন্তর্ভুক্ত অর্ডার:</span>
                      <span className="font-bold text-gray-800 font-mono">{inv.orders_count} টি</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                      <div className="p-2 bg-emerald-50/60 rounded-md border border-emerald-100">
                        <span className="text-[10px] font-semibold text-emerald-800 block truncate">১. কুরিয়ার জমা</span>
                        <span className="text-xs font-bold text-emerald-900 font-mono block mt-1 truncate">
                          {formatBDT(inv.total_courier_net)}
                        </span>
                        <span className="text-[9px] text-emerald-600 block truncate">CarryBee প্রাপ্তি</span>
                      </div>

                      <div className="p-2 bg-blue-50/60 rounded-md border border-blue-100">
                        <span className="text-[10px] font-semibold text-blue-800 block truncate">২. পণ্যের মূল্য</span>
                        <span className="text-xs font-bold text-blue-900 font-mono block mt-1 truncate">
                          {formatBDT(inv.total_supplier_price)}
                        </span>
                        <span className="text-[9px] text-blue-600 block truncate">আপনার নিজের</span>
                      </div>

                      <div className="p-2 bg-amber-50 rounded-md border-2 border-amber-300">
                        <span className="text-[10px] font-bold text-amber-900 block truncate">৩. ফেরত দিতে হবে</span>
                        <span className="text-xs font-extrabold text-amber-950 font-mono block mt-1 truncate">
                          {formatBDT(inv.total_amount_owed)}
                        </span>
                        <span className="text-[9px] text-amber-800 font-medium block truncate">ResellerBrain-কে</span>
                      </div>
                    </div>

                    {inv.trx_id && (
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-gray-100 text-gray-500">
                        <span>Trx ID:</span>
                        <span className="font-mono font-semibold text-gray-800">{inv.trx_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    {isPending ? "⚠️ পেমেন্ট বাকি আছে" : "✓ হিসাব পর্যালোচিত"}
                  </span>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isPending
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                        : "bg-white hover:bg-gray-100 text-indigo-700 border border-indigo-200"
                    }`}
                  >
                    {isPending ? "পরিশোধ করুন" : "ইনভয়েস দেখুন"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Details & Payment Modal */}
      {selectedInvoice && (
        <InvoicePaymentModal
          invoice={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null);
            refetch();
          }}
          onSuccess={() => {
            setSelectedInvoice(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

export function InvoicePaymentModal({ invoice, onClose, onSuccess }) {
  const [payInvoice, { isLoading: isSubmitting }] = usePayVendorInvoiceMutation();
  const [copiedId, setCopiedId] = useState(null);
  const [showOrdersBreakdown, setShowOrdersBreakdown] = useState(false);

  const isPending = invoice.status === "pending" || invoice.status === "rejected";
  const isPaid = invoice.status === "paid" || invoice.status === "approved";

  const adminAccounts = invoice.admin_payment_details || [
    {
      id: 1,
      type: "MFS",
      provider: "bKash (Personal / Merchant)",
      account_number: "01782084390",
      account_name: "ResellerBrain Admin (Mir Fahim)",
    },
    {
      id: 2,
      type: "MFS",
      provider: "Nagad (Personal)",
      account_number: "01782084390",
      account_name: "ResellerBrain Admin (Mir Fahim)",
    },
    {
      id: 3,
      type: "Bank",
      provider: "UCB (United Commercial Bank)",
      account_number: "4534563001",
      account_name: "ResellerBrain Technologies Ltd.",
      branch: "Bongshal Branch, Dhaka",
      routing: "5636501",
    },
  ];

  const [form, setForm] = useState({
    payment_method: invoice.payment_method || "bkash",
    trx_id: invoice.trx_id || "",
    sender_account: invoice.sender_account || "",
    paid_amount: invoice.paid_amount || invoice.total_amount_owed,
    note: "",
  });

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("অ্যাকাউন্ট নম্বর কপি করা হয়েছে!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!form.trx_id.trim()) {
      toast.error("ট্রানজেকশন আইডি (Trx ID) আবশ্যক");
      return;
    }

    try {
      await payInvoice({
        id: invoice.id,
        payment_method: form.payment_method,
        trx_id: form.trx_id.trim(),
        sender_account: form.sender_account.trim(),
        paid_amount: Number(form.paid_amount),
        note: form.note,
      }).unwrap();

      toast.success("পেমেন্ট তথ্য সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন করবেন।");
      onSuccess?.();
    } catch (err) {
      toast.error(err?.data?.message || "পেমেন্ট সাবমিট ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    }
  };

  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 font-mono">
                {invoice.invoice_number}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              তারিখ: {new Date(invoice.created_at).toLocaleString("bn-BD")} | {invoice.orders_count} টি অর্ডারের সমন্বয়
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5 my-4">
          {/* 3 Key Amounts Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Received from CarryBee */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                  ১. CarryBee থেকে প্রাপ্তি
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  কুরিয়ার নিট আপনার একাউন্টে জমা করেছে
                </p>
              </div>
              <div className="mt-2 text-right sm:text-left">
                <span className="text-xl font-black text-emerald-950 font-mono">
                  {formatBDT(invoice.total_courier_net)}
                </span>
              </div>
            </div>

            {/* 2. Product Wholesale Price */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide block">
                  ২. পণ্যের পাইকারি মূল্য
                </span>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  আপনার পণ্যের নির্ধারিত দাম (আপনার নিজের)
                </p>
              </div>
              <div className="mt-2 text-right sm:text-left">
                <span className="text-xl font-black text-blue-950 font-mono">
                  {formatBDT(invoice.total_supplier_price)}
                </span>
              </div>
            </div>

            {/* 3. Send to ResellerBrain */}
            <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wide flex items-center justify-between">
                  <span>৩. ResellerBrain-কে প্রদেয়</span>
                  <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">ফেরত</span>
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  ইনভয়েস অনুযায়ী এডমিনকে পাঠাতে হবে
                </p>
              </div>
              <div className="mt-2 text-right sm:text-left">
                <span className="text-2xl font-black text-amber-950 font-mono">
                  {formatBDT(invoice.total_amount_owed)}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Bank & bKash Payment Accounts Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                অ্যাডমিন পেমেন্ট অ্যাকাউন্ট তালিকা (টাকা পাঠানোর মাধ্যম):
              </span>
              <span className="text-[11px] text-slate-500">
                নিচের যেকোনো একাউন্টে টাকা পাঠিয়ে Trx ID প্রদান করুন
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {adminAccounts.map((acc, idx) => (
                <div
                  key={acc.id || idx}
                  className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs relative group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      {acc.type === "Bank" ? (
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-pink-600" />
                      )}
                      {acc.provider}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.account_number, acc.id || idx)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                      title="কপি করুন"
                    >
                      {copiedId === (acc.id || idx) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block">অ্যাকাউন্ট নম্বর:</span>
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {acc.account_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block">অ্যাকাউন্ট নাম:</span>
                    <span className="font-medium text-gray-700">{acc.account_name}</span>
                  </div>

                  {acc.branch && (
                    <div className="text-[10px] text-gray-500 pt-1 border-t border-slate-100">
                      শাখা: {acc.branch} {acc.routing ? `| রাউটিং: ${acc.routing}` : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* If already paid, show payment status */}
          {isPaid && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>পেমেন্ট তথ্য সফলভাবে জমা দেওয়া হয়েছে</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-100 text-emerald-800">
                <div>
                  <span className="text-gray-500 text-[10px] block">পেমেন্ট মাধ্যম:</span>
                  <span className="font-semibold uppercase">{invoice.payment_method}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">ট্রানজেকশন আইডি:</span>
                  <span className="font-mono font-bold">{invoice.trx_id}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">প্রেরক অ্যাকাউন্ট:</span>
                  <span className="font-mono">{invoice.sender_account || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">পরিশোধের তারিখ:</span>
                  <span>{invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString("bn-BD") : "—"}</span>
                </div>
              </div>
              {invoice.rejection_reason && (
                <p className="text-red-700 font-medium pt-1">
                  প্রত্যাখ্যান কারণ: {invoice.rejection_reason}
                </p>
              )}
            </div>
          )}

          {/* Payment Form (if pending or rejected) */}
          {isPending && (
            <form id="vendor-pay-form" onSubmit={handleSubmitPayment} className="p-4 bg-white border border-gray-200 rounded-xl space-y-4">
              <div className="font-bold text-xs text-gray-800 border-b pb-2">
                পেমেন্ট সম্পন্ন করে নিচের তথ্য সাবমিট করুন:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    পেমেন্টের মাধ্যম (Payment Method) *
                  </label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="bank">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ট্রানজেকশন আইডি (Trx ID) *আবশ্যক
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9J87HG65"
                    value={form.trx_id}
                    onChange={(e) => setForm((p) => ({ ...p, trx_id: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    আপনার প্রেরক অ্যাকাউন্ট / মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যে নম্বর/অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন"
                    value={form.sender_account}
                    onChange={(e) => setForm((p) => ({ ...p, sender_account: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    পরিশোধকৃত পরিমাণ (টাকা)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.paid_amount}
                    onChange={(e) => setForm((p) => ({ ...p, paid_amount: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  নোট / মন্তব্য (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিকাশ থেকে পাঠানো হয়েছে"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </form>
          )}

          {/* Orders Breakdown Collapsible */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOrdersBreakdown((p) => !p)}
              className="w-full px-4 py-2.5 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <span>অন্তর্ভুক্ত {invoice.orders_count}টি অর্ডারের বিস্তারিত ব্রেকডাউন</span>
              {showOrdersBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOrdersBreakdown && (
              <div className="overflow-x-auto p-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 border-b">
                      <th className="py-2 px-3 text-left">অর্ডার নম্বর</th>
                      <th className="py-2 px-3 text-right">কুরিয়ার জমা (নিট)</th>
                      <th className="py-2 px-3 text-right">পণ্যের পাইকারি মূল্য</th>
                      <th className="py-2 px-3 text-right font-bold text-amber-900">প্ল্যাটফর্মকে প্রদেয়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(invoice.orders_breakdown || []).map((b, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {Array.isArray(b.items) && b.items.length > 0 ? (
                              <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                                {b.items.map((item, iIdx) => {
                                  const imgSrc = getProductImgUrl(item.product_thumbnail);
                                  return (
                                    <Link
                                      key={item.id || iIdx}
                                      to={`/vendor-panel/products/${item.product_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`${item.product_name || "Product"} (ID: ${item.product_id})`}
                                      className="relative inline-block hover:z-10 transition-transform hover:scale-105"
                                    >
                                      {imgSrc ? (
                                        <img
                                          src={imgSrc}
                                          alt={item.product_name || "Product"}
                                          className="w-8 h-8 rounded-lg object-cover border border-gray-200 shadow-xs bg-gray-50"
                                          onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                            if (e.currentTarget.nextSibling) {
                                              e.currentTarget.nextSibling.style.display = "flex";
                                            }
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`w-8 h-8 rounded-lg bg-indigo-50 border border-gray-200 shadow-xs items-center justify-center text-indigo-400 text-xs ${
                                          imgSrc ? "hidden" : "flex"
                                        }`}
                                      >
                                        <Package className="w-3.5 h-3.5" />
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                <Package className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-mono font-semibold text-gray-800 leading-tight">
                                {b.order_number || `#${invoice.order_ids?.[idx] || ""}`}
                              </div>
                              {Array.isArray(b.items) && b.items.length > 0 && (
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  {b.items.map((item, iIdx) => (
                                    <Link
                                      key={item.id || iIdx}
                                      to={`/vendor-panel/products/${item.product_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-gray-500 hover:text-indigo-600 truncate max-w-[170px] sm:max-w-[220px] leading-tight flex items-center gap-1"
                                      title={item.product_name}
                                    >
                                      <span className="truncate">{item.product_name || `Product #${item.product_id}`}</span>
                                      {item.qty > 1 && (
                                        <span className="text-[10px] text-gray-400 font-medium shrink-0">×{item.qty}</span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatBDT(b.courier?.net_received_by_supplier || b.courier?.net_to_supplier)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-blue-700">
                          {formatBDT(b.supplier?.vendor_price)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-900">
                          {formatBDT(b.supplier?.supplier_owes_platform)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            বন্ধ করুন
          </button>

          {isPending && (
            <button
              type="submit"
              form="vendor-pay-form"
              disabled={isSubmitting || !form.trx_id.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              পেমেন্ট নিশ্চিত করুন (Submit Trx ID)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
