import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  FileText,
  DollarSign,
  Building2,
  Store,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import { useManualCarrybeeOrderPaymentMutation } from "../../../redux/features/delivery_company/carrybeeWebhookApi";

export default function ManualCarrybeePaymentModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [manualOrderPayment, { isLoading }] = useManualCarrybeeOrderPaymentMutation();

  const isAlreadyPaid = Boolean(
    order?.is_carrybee_paid ||
    order?.carrybee_invoice_id ||
    order?.carrybee_paid_at
  );

  const vendorHasOwnAccount = Boolean(
    order?.vendor?.has_own_delivery_account ||
    order?.items?.some((i) => i.product?.vendor?.has_own_delivery_account)
  );

  const [activeTab, setActiveTab] = useState(isAlreadyPaid ? "reset" : "mark_paid");
  const [invoiceId, setInvoiceId] = useState(order?.carrybee_invoice_id || "");
  const [disbursedTo, setDisbursedTo] = useState(
    order?.carrybee_disbursed_to || (vendorHasOwnAccount ? "vendor" : "platform")
  );
  const [paidAt, setPaidAt] = useState(
    order?.carrybee_paid_at
      ? new Date(order.carrybee_paid_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [note, setNote] = useState("");

  useEffect(() => {
    if (order) {
      const paid = Boolean(
        order.is_carrybee_paid ||
        order.carrybee_invoice_id ||
        order.carrybee_paid_at
      );
      setActiveTab(paid ? "reset" : "mark_paid");
      setInvoiceId(order.carrybee_invoice_id || "");
      setDisbursedTo(
        order.carrybee_disbursed_to ||
        (order.vendor?.has_own_delivery_account ? "vendor" : "platform")
      );
      setPaidAt(
        order.carrybee_paid_at
          ? new Date(order.carrybee_paid_at).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      );
      setNote("");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const consignmentId =
    order.consignment_id ||
    order.delivery_information?.consignment_id ||
    order.deliveryInformation?.consignment_id ||
    null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: order.id,
        action: activeTab,
        note: note.trim() || undefined,
      };

      if (activeTab === "mark_paid") {
        payload.invoice_id = invoiceId.trim() || undefined;
        payload.disbursed_to = disbursedTo;
        payload.paid_at = paidAt ? new Date(paidAt).toISOString() : undefined;
      }

      const res = await manualOrderPayment(payload).unwrap();
      toast.success(res.message || "CarryBee পেমেন্ট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে।"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <Truck className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                CarryBee পেমেন্ট ম্যানেজমেন্ট
              </h3>
              <p className="text-xs text-indigo-200">
                অর্ডার: <span className="font-mono font-bold text-white">#{order.order_number}</span>
                {consignmentId && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
                    CID: {consignmentId}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className="p-5 bg-slate-50 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>বর্তমান CarryBee স্ট্যাটাস:</span>
            {isAlreadyPaid ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                CarryBee Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                CarryBee Pending (Unpaid)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-400 block text-[11px]">কাস্টমার:</span>
              <span className="font-semibold text-gray-800">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">অর্ডার মোট:</span>
              <span className="font-bold text-indigo-700">৳{Number(order.total || 0).toLocaleString()}</span>
            </div>
            {order.carrybee_invoice_id && (
              <div>
                <span className="text-gray-400 block text-[11px]">বর্তমান ইনভয়েস:</span>
                <span className="font-mono font-bold text-gray-800">{order.carrybee_invoice_id}</span>
              </div>
            )}
            {order.carrybee_disbursed_to && (
              <div>
                <span className="text-gray-400 block text-[11px]">টাকা জমা হয়েছে:</span>
                <span className="font-semibold text-gray-800">
                  {order.carrybee_disbursed_to === "vendor" ? "ভেন্ডর একাউন্টে" : "কোম্পানি প্ল্যাটফর্মে"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("mark_paid")}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "mark_paid"
                  ? "bg-white text-indigo-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {isAlreadyPaid ? "তথ্য আপডেট করুন" : "Mark as CarryBee Paid"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reset")}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "reset"
                  ? "bg-white text-red-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              স্ট্যাটাস রিসেট করুন (Reset)
            </button>
          </div>

          {activeTab === "mark_paid" ? (
            <div className="space-y-3 pt-1">
              {/* CarryBee Invoice ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  CarryBee Invoice ID (কুরিয়ার ইনভয়েস নম্বর)
                </label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  placeholder="e.g. IX212124433 (খালি রাখলে স্বয়ংক্রিয় আইডি তৈরি হবে)"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-0.5">
                  CarryBee পেমেন্ট স্টেটমেন্ট থেকে পাওয়া ইনভয়েস আইডি এখানে লিখুন।
                </p>
              </div>

              {/* Disbursed Destination */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  CarryBee টাকা কার ব্যাংক/বিকাশ একাউন্টে পাঠিয়ে দিয়েছে?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition text-xs ${
                      disbursedTo === "vendor"
                        ? "bg-amber-50/60 border-amber-300 text-amber-950 font-medium"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disbursed_to"
                      value="vendor"
                      checked={disbursedTo === "vendor"}
                      onChange={() => setDisbursedTo("vendor")}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold block flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-amber-600" /> ভেন্ডরের নিজস্ব একাউন্টে
                      </span>
                      <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">
                        ভেন্ডরের নিজস্ব CarryBee মার্চেন্ট একাউন্টে সরাসরি ক্যাশ চলে গেছে।
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition text-xs ${
                      disbursedTo === "platform"
                        ? "bg-indigo-50/60 border-indigo-300 text-indigo-950 font-medium"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disbursed_to"
                      value="platform"
                      checked={disbursedTo === "platform"}
                      onChange={() => setDisbursedTo("platform")}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold block flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" /> প্ল্যাটফর্ম একাউন্টে
                      </span>
                      <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">
                        ResellerBrain কোম্পানির CarryBee একাউন্টে ক্যাশ ঢুকেছে।
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  পেমেন্ট প্রাপ্তির তারিখ ও সময়
                </label>
                <input
                  type="datetime-local"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  মন্তব্য বা রেফারেন্স নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: ম্যানুয়াল ব্যাংক ভেরিফিকেশন সম্পন্ন"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  সতর্কতা: CarryBee Paid স্ট্যাটাস রিসেট
                </div>
                <p className="leading-relaxed text-red-700">
                  আপনি এই অর্ডারের CarryBee Paid স্ট্যাটাস রিসেট করতে চাচ্ছেন। রিসেট করলে:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-red-800">
                  <li>অর্ডারের CarryBee Invoice ID মুছে ফেলা হবে।</li>
                  <li>কুরিয়ার পেআউট স্ট্যাটাস পুনরায় 'pending' অবস্থায় ফিরে যাবে।</li>
                  <li>যদি অর্ডারটি পূর্বে বাতিল হয়ে থাকে, তাহলে পেমেন্ট স্ট্যাটাস 'unpaid' হবে।</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  রিসেট করার কারণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: ভুলবশত মার্ক করা হয়েছিল বা অর্ডার বাতিল হয়েছে"
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-60 ${
                activeTab === "reset"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  প্রসেসিং হচ্ছে...
                </>
              ) : activeTab === "reset" ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  রিসেট নিশ্চিত করুন
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isAlreadyPaid ? "তথ্য আপডেট নিশ্চিত করুন" : "CarryBee Paid মার্ক করুন"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
