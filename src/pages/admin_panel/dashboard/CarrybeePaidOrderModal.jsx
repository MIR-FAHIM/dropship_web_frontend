import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Truck,
  Building2,
  DollarSign,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAcknowledgePaidOrderMutation } from "../../../redux/features/delivery_company/carrybeeWebhookApi";

export default function CarrybeePaidOrderModal({ orders = [], onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acknowledgePaidOrder, { isLoading }] = useAcknowledgePaidOrderMutation();

  if (!orders || orders.length === 0) return null;

  // Bound index safely
  const activeOrder = orders[Math.min(currentIndex, orders.length - 1)];
  const isVendorAccount = activeOrder?.disbursed_to === "vendor";
  const totalCount = orders.length;

  const handleAcknowledge = async () => {
    try {
      await acknowledgePaidOrder(activeOrder.event_id).unwrap();
      toast.success(
        `অর্ডার #${activeOrder.order_number} এর CarryBee পেমেন্ট নোটিফিকেশন কনফার্ম করা হয়েছে!`
      );
      if (currentIndex >= orders.length - 1) {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else if (onComplete) {
          onComplete();
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "কনফার্ম করতে সমস্যা হয়েছে।");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white ring-2 ring-white/30 animate-bounce">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">CarryBee পেমেন্ট পরিশোধ নোটিফিকেশন</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                  Order.Paid
                </span>
              </div>
              <p className="text-xs text-white/80">
                CarryBee সফলভাবে এই অর্ডারের টাকা অ্যাকাউন্টে ডিসবার্স করেছে
              </p>
            </div>
          </div>

          {totalCount > 1 && (
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-xs font-medium">
              <span>{currentIndex + 1} / {totalCount}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Context Alert Banner: Vendor vs Platform */}
          {isVendorAccount ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-amber-800">
                  ⚠️ টাকা সরাসরি ভেন্ডরের CarryBee অ্যাকাউন্টে জমা হয়েছে!
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  যেহেতু ভেন্ডর <span className="font-semibold">{activeOrder?.vendor?.shop_name || "এই শপ"}</span> এর নিজস্ব CarryBee ডেলিভারি অ্যাকাউন্ট রয়েছে, তাই CarryBee এই অর্ডারের সম্পূর্ণ নিট টাকা সরাসরি ভেন্ডরকে প্রদান করেছে।
                  প্ল্যাটফর্মের কমিশন ও রিসেলার লভ্যাংশ সংগ্রহের জন্য ভেন্ডরকে ইনভয়েস প্রদান করুন।
                </p>
                <div className="pt-1">
                  <Link
                    to="/admin-panel/vendor-invoices"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    ভেন্ডর সেটেলমেন্ট ইনভয়েস ম্যানেজ করুন
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-sm">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-emerald-800">
                  ✅ টাকা সরাসরি প্ল্যাটফর্ম অ্যাডমিনের CarryBee অ্যাকাউন্টে জমা হয়েছে!
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  অর্ডারের টাকা প্ল্যাটফর্মের নিজস্ব CarryBee অ্যাকাউন্টে জমা হয়েছে। ভেন্ডরের পাওনা অর্থ প্ল্যাটফর্ম থেকে সেটেল করা হবে।
                </p>
              </div>
            </div>
          )}

          {/* Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">অর্ডার নাম্বার</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-gray-900">#{activeOrder?.order_number}</span>
                <Link
                  to={`/admin-panel/orders/${activeOrder?.order_id}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  বিস্তারিত <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">CarryBee Invoice ID</span>
              <div className="mt-1">
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                  {activeOrder?.invoice_id || "N/A"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">Consignment ID</span>
              <span className="font-mono text-xs font-semibold text-gray-800 mt-1">
                {activeOrder?.consignment_id || "N/A"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">ভেন্ডর শপ</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {activeOrder?.vendor?.shop_name || "N/A"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">কাস্টমার COD কালেকশন</span>
              <span className="font-semibold text-gray-900 mt-1">
                ৳{Number(activeOrder?.total || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">CarryBee কর্তন (কুরিয়ার + COD ফি)</span>
              <span className="font-semibold text-red-600 mt-1">
                -৳{Number(activeOrder?.actual_courier_cost || (Number(activeOrder?.actual_courier_fee || 0) + Number(activeOrder?.actual_cod_fee || 0))).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Highlight Net Disbursed Amount */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-emerald-800 block">
                CarryBee জমাকৃত নিট টাকা (Net Disbursed)
              </span>
              <span className="text-xs text-gray-500">
                {isVendorAccount ? "ভেন্ডরের অ্যাকাউন্টে ক্রেডিট" : "অ্যাডমিন অ্যাকাউন্টে ক্রেডিট"}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              ৳{Number(activeOrder?.disbursed_amount || 0).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> পেমেন্ট সময়: {formatDateTime(activeOrder?.event_time)}
            </span>
            {activeOrder?.customer_name && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> গ্রাহক: {activeOrder?.customer_name}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {totalCount > 1 && (
              <>
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="পূর্ববর্তী"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentIndex >= totalCount - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="পরবর্তী"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500">
                  {currentIndex + 1} / {totalCount} টি মুলতবি
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Link
              to={`/admin-panel/orders/${activeOrder?.order_id}`}
              className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              অর্ডার বিস্তারিত
            </Link>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleAcknowledge}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {isLoading ? "নিশ্চিত হচ্ছে..." : "ঠিক আছে (Okay)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
