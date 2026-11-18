import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { imgBaseUrl } from "../../../../config";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Receipt,
  Eye,
  Check,
  X,
  Loader2,
  Building2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
  UserCheck,
  Share2,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useListVendorInvoicesQuery,
  useApproveVendorInvoiceMutation,
  useRejectVendorInvoiceMutation,
  useAdjustVendorInvoiceMutation,
} from "../../../redux/features/orderSettlement";
import { formatBDT } from "../../../utils/orderBreakdown.utils";
import ShareVendorInvoiceModal from "./ShareVendorInvoiceModal";
import FinalAmountField, { finalAmountMissingReason, resolveFinalAmount } from "../../../components/shared/FinalAmountField";
import InvoiceAdjustmentNote from "../../../components/shared/InvoiceAdjustmentNote";


const getProductImgUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  const cleanBase = String(imgBaseUrl || "https://apidropship.resellerbrain.com/storage/app/public").replace(/\/+$/, "");
  const cleanPath = String(thumbnail).replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

const STATUS_CONFIG = {
  pending: {
    label: "অপেক্ষমান (Pending)",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  paid: {
    label: "পরিশোধিত (Paid)",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  approved: {
    label: "অনুমোদিত ও নিষ্পন্ন (Approved)",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "প্রত্যাখ্যাত (Rejected)",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export default function AdminVendorInvoices() {
  const [statusFilter, setStatusFilter] = useState("all");
  // ?search=<invoice no.> (e.g. from an order's "Supplier invoice" badge) pre-fills the search.
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [shareModalInvoice, setShareModalInvoice] = useState(null);
  const [rejectionModalInvoice, setRejectionModalInvoice] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [approveInvoice, { isLoading: isApproving }] =
    useApproveVendorInvoiceMutation();
  const [rejectInvoice, { isLoading: isRejecting }] =
    useRejectVendorInvoiceMutation();

  const queryParams = {
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  };

  const { data, isLoading, refetch } = useListVendorInvoicesQuery(queryParams);
  const invoices = data?.data?.data || [];

  const handleApprove = async (inv) => {
    const confirmed = window.confirm(
      `আপনি কি নিশ্চিত যে ইনভয়েস ${inv.invoice_number} অনুমোদন করবেন? এটি সংশ্লিষ্ট সকল অর্ডার সেটেলমেন্ট সম্পন্ন করবে।`
    );
    if (!confirmed) return;

    try {
      await approveInvoice({
        id: inv.id,
        trx_id: inv.trx_id || undefined,
      }).unwrap();

      toast.success(`ইনভয়েস ${inv.invoice_number} সফলভাবে অনুমোদিত হয়েছে!`);
      refetch();
      if (selectedInvoice?.id === inv.id) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "অনুমোদন ব্যর্থ হয়েছে।");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("প্রত্যাখ্যানের কারণ উল্লেখ করুন");
      return;
    }

    try {
      await rejectInvoice({
        id: rejectionModalInvoice.id,
        rejection_reason: rejectionReason.trim(),
      }).unwrap();

      toast.success(`ইনভয়েস ${rejectionModalInvoice.invoice_number} প্রত্যাখ্যান করা হয়েছে`);
      setRejectionModalInvoice(null);
      setRejectionReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "প্রত্যাখ্যান ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-red-600" />
            ভেন্ডর সেটেলমেন্ট ইনভয়েস ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            সাপ্লায়ারদের নিকট পাওনা ইনভয়েস তালিকা, পেমেন্ট ট্র্যাকিং ও অনুমোদন ব্যবস্থা
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "সকল ইনভয়েস" },
            { id: "pending", label: "অপেক্ষমান (Pending)" },
            { id: "paid", label: "পরিশোধিত (Paid)" },
            { id: "approved", label: "অনুমোদিত (Approved)" },
            { id: "rejected", label: "প্রত্যাখ্যাত (Rejected)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ইনভয়েস নং, ভেন্ডর বা Trx ID খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-red-600 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">ইনভয়েস লোড হচ্ছে...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-semibold text-gray-800">কোনো ইনভয়েস পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500">
              {statusFilter !== "all"
                ? `"${STATUS_CONFIG[statusFilter]?.label || statusFilter}" স্ট্যাটাসের কোনো রেকর্ড নেই।`
                : "অর্ডার তালিকা থেকে একাধিক অর্ডার নির্বাচন করে ভেন্ডর ইনভয়েস তৈরি করুন।"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="py-3 px-3 text-left">ইনভয়েস নম্বর</th>
                  <th className="py-3 px-3 text-left">ভেন্ডর (সাপ্লায়ার)</th>
                  <th className="py-3 px-3 text-center">অর্ডার সংখ্যা</th>
                  <th className="py-3 px-3 text-right">কুরিয়ার জমা (CarryBee)</th>
                  <th className="py-3 px-3 text-right">পাইকারি মূল্য</th>
                  <th className="py-3 px-3 text-right font-bold text-amber-950 bg-amber-50/50">
                    প্ল্যাটফর্ম পাবে
                  </th>
                  <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-left">Trx ID / পেমেন্ট</th>
                  <th className="py-3 px-3 text-center bg-slate-50">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => {
                  const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
                  const isPaid = inv.status === "paid";

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {inv.invoice_number}
                        <span className="text-[10px] text-gray-400 block font-normal">
                          {new Date(inv.created_at).toLocaleDateString("bn-BD")}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 block">
                          {inv.vendor?.shop_name || `Vendor #${inv.vendor_id}`}
                        </span>
                        <span className="text-[10px] text-gray-400">ID: {inv.vendor_id}</span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full font-semibold">
                          {inv.orders_count}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        {formatBDT(inv.total_courier_net)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-blue-700">
                        {formatBDT(inv.total_supplier_price)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-950 bg-amber-50/30">
                        {formatBDT(inv.total_amount_owed)}
                        <InvoiceAdjustmentNote invoice={inv} compact />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {inv.trx_id ? (
                          <div>
                            <span className="font-mono font-bold text-gray-800 block">{inv.trx_id}</span>
                            <span className="text-[10px] text-gray-500 uppercase">{inv.payment_method}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">প্রদান করা হয়নি</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center bg-slate-50/60">
                        <div className="flex min-w-max items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 cursor-pointer"
                            title="বিস্তারিত দেখুন"
                            aria-label="ইনভয়েসের বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2.25} />
                          </button>

                          <button
                            onClick={() => setShareModalInvoice(inv)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 cursor-pointer"
                            title="ভেন্ডরের সাথে ইনভয়েস শেয়ার করুন (Share)"
                            aria-label="ভেন্ডরের সাথে ইনভয়েস শেয়ার করুন"
                          >
                            <Share2 className="w-4 h-4" strokeWidth={2.25} />
                          </button>

                          {isPaid && (
                            <button
                              onClick={() => handleApprove(inv)}
                              disabled={isApproving}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-2.5 py-1.5 text-[11px] font-bold text-emerald-900 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                              title="অনুমোদন করুন"
                              aria-label="ইনভয়েস অনুমোদন করুন"
                            >
                              <Check className="h-4 w-4 shrink-0 text-emerald-800" strokeWidth={2.75} />
                              <span className="whitespace-nowrap">অনুমোদন করুন</span>
                            </button>
                          )}

                          {(inv.status === "pending" || inv.status === "paid") && (
                            <button
                              onClick={() => {
                                setRejectionModalInvoice(inv);
                                setRejectionReason("");
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-100 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 cursor-pointer"
                              title="প্রত্যাখ্যান করুন"
                              aria-label="ইনভয়েস প্রত্যাখ্যান করুন"
                            >
                              <X className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <AdminInvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onApprove={() => handleApprove(selectedInvoice)}
          onReject={() => {
            setRejectionModalInvoice(selectedInvoice);
            setSelectedInvoice(null);
          }}
          onShare={(inv) => setShareModalInvoice(inv)}
          onAdjusted={(updated) => setSelectedInvoice((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* Share Vendor Invoice Modal */}
      {shareModalInvoice && (
        <ShareVendorInvoiceModal
          invoice={shareModalInvoice}
          isOpen={Boolean(shareModalInvoice)}
          onClose={() => setShareModalInvoice(null)}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectionModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setRejectionModalInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-2">
              ইনভয়েস প্রত্যাখ্যান করুন
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              ইনভয়েস #{rejectionModalInvoice.invoice_number} প্রত্যাখ্যানের কারণ উল্লেখ করুন। ভেন্ডর এই কারণটি দেখতে পাবে।
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="যেমন: Trx ID ভুল দেওয়া হয়েছে অথবা সম্পূর্ণ টাকা জমা হয়নি..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs border rounded-lg focus:ring-2 focus:ring-red-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalInvoice(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isRejecting ? "বাতিল হচ্ছে..." : "প্রত্যাখ্যান নিশ্চিত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* Admin changes the final amount of an unpaid invoice (reason required if it differs). */
function AdjustInvoiceAmount({ invoice, onAdjusted }) {
  const calculated = Number(invoice.calculated_amount ?? invoice.total_amount_owed ?? 0);
  const hasAdjustment = Math.abs(Number(invoice.adjustment_amount || 0)) >= 0.01;
  const [value, setValue] = useState(
    hasAdjustment
      ? { enabled: true, amount: String(invoice.total_amount_owed), reason: invoice.adjustment_reason || "" }
      : { enabled: false, amount: "", reason: "" }
  );
  const [adjustInvoice, { isLoading }] = useAdjustVendorInvoiceMutation();
  const final = resolveFinalAmount(calculated, value);
  const unchanged = Math.abs(final - Number(invoice.total_amount_owed || 0)) < 0.01
    && (value.reason || "").trim() === (invoice.adjustment_reason || "").trim();

  const save = async () => {
    try {
      const res = await adjustInvoice({
        id: invoice.id,
        final_amount: final,
        adjustment_reason: (value.reason || "").trim() || undefined,
      }).unwrap();
      toast.success("Invoice amount updated");
      onAdjusted?.(res?.data);
    } catch (err) {
      toast.error(err?.data?.message || "Could not update the amount");
    }
  };

  return (
    <div className="space-y-2">
      <FinalAmountField id={`vendor-inv-adjust-${invoice.id}`} calculated={calculated} value={value} onChange={setValue} label="Vendor owes (invoice total)" />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={isLoading || unchanged || finalAmountMissingReason(calculated, value)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save amount
        </button>
      </div>
    </div>
  );
}

function AdminInvoiceDetailsModal({ invoice, onClose, onApprove, onReject, onShare, onAdjusted }) {
  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
  const isPaid = invoice.status === "paid";
  const isPending = invoice.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 font-mono">
                  {invoice.invoice_number}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                ভেন্ডর: {invoice.vendor?.shop_name} (ID: {invoice.vendor_id}) | তৈরি: {new Date(invoice.created_at).toLocaleString("bn-BD")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onShare?.(invoice)}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-indigo-200 shadow-2xs"
            title="ভেন্ডরের সাথে ইনভয়েস শেয়ার করুন"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            শেয়ার করুন
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 my-4">
          {/* Totals Metric Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">কুরিয়ার সংগৃহীত (মোট):</span>
              <span className="font-mono font-bold text-sm text-gray-900">{formatBDT(invoice.total_collectable)}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">কুরিয়ার ফি কর্তন:</span>
              <span className="font-mono font-bold text-sm text-red-600">
                {formatBDT(Number(invoice.total_delivery_fee || 0) + Number(invoice.total_cod_fee || 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">ভেন্ডরের পাইকারি মূল্য:</span>
              <span className="font-mono font-bold text-sm text-blue-700">{formatBDT(invoice.total_supplier_price)}</span>
            </div>
            <div className="bg-amber-100/60 p-2 rounded-lg border border-amber-200">
              <span className="text-amber-800 block text-[10px] font-bold">প্ল্যাটফর্মের প্রাপ্য নিট:</span>
              <span className="font-mono font-black text-base text-amber-950">{formatBDT(invoice.total_amount_owed)}</span>
            </div>
          </div>

          <InvoiceAdjustmentNote invoice={invoice} />

          {(isPending || invoice.status === "rejected") && (
            <AdjustInvoiceAmount key={`${invoice.id}-${invoice.total_amount_owed}`} invoice={invoice} onAdjusted={onAdjusted} />
          )}

          {/* Payment Submission Details (if submitted) */}
          {invoice.trx_id && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
              <span className="font-bold text-blue-900 block">ভেন্ডরের পেমেন্ট সাবমিশন তথ্য:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-blue-950">
                <div>
                  <span className="text-gray-500 text-[10px] block">মাধ্যম:</span>
                  <span className="font-semibold uppercase">{invoice.payment_method}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Trx ID:</span>
                  <span className="font-mono font-bold">{invoice.trx_id}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">প্রেরক নম্বর:</span>
                  <span className="font-mono">{invoice.sender_account || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">পরিশোধের সময়:</span>
                  <span>{invoice.paid_at ? new Date(invoice.paid_at).toLocaleString("bn-BD") : "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Orders Breakdown */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b text-xs font-semibold text-gray-700">
              অন্তর্ভুক্ত {invoice.orders_count}টি অর্ডারের পূর্ণ আর্থিক ব্রেকডাউন
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 border-b">
                    <th className="py-2 px-3 text-left">অর্ডার</th>
                    <th className="py-2 px-3 text-right">কুরিয়ার জমা (নিট)</th>
                    <th className="py-2 px-3 text-right">পাইকারি মূল্য</th>
                    <th className="py-2 px-3 text-right font-bold text-amber-900">সাপ্লায়ার দেবে</th>
                    <th className="py-2 px-3 text-right text-emerald-800">রিসেলার লাভ</th>
                    <th className="py-2 px-3 text-right text-indigo-800">প্ল্যাটফর্ম লাভ</th>
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
                                    to={`/admin-panel/products/${item.product_id}`}
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
                                    to={`/admin-panel/products/${item.product_id}`}
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
                      <td className="py-2 px-3 text-right font-mono text-emerald-800">
                        {formatBDT(b.dropshipper?.profit)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-indigo-800">
                        {formatBDT(b.platform?.net_profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Note */}
          {invoice.note && (
            <div className="p-3 bg-gray-50 border rounded-xl text-xs text-gray-600">
              <span className="font-semibold block mb-0.5">অডিট নোট:</span>
              <p className="whitespace-pre-line">{invoice.note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={() => onShare?.(invoice)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer border border-indigo-200"
              title="ভেন্ডরের সাথে ইনভয়েস শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              ভেন্ডরকে পাঠান
            </button>
          </div>

          <div className="flex items-center gap-2">
            {(isPaid || isPending) && (
              <button
                type="button"
                onClick={onReject}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                প্রত্যাখ্যান করুন
              </button>
            )}

            {isPaid && (
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-800 bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:border-indigo-900 hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer"
                aria-label="পেমেন্ট অনুমোদন ও সেটেল করুন"
              >
                <Check className="h-4 w-4 text-indigo-100" />
                পেমেন্ট অনুমোদন ও সেটেল করুন
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
