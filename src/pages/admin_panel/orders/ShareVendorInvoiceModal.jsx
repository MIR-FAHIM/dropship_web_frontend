import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Receipt,
  Store,
  DollarSign,
  Send,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";
import { formatBDT } from "../../../utils/orderBreakdown.utils";

export default function ShareVendorInvoiceModal({ invoice, isOpen, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen || !invoice) return null;

  const vendorName = invoice.vendor?.shop_name || `Vendor #${invoice.vendor_id}`;
  const vendorPhone =
    invoice.vendor?.phone ||
    invoice.vendor?.user?.phone ||
    invoice.vendor?.contact_number ||
    "";

  // Clean phone number for WhatsApp link (e.g., 017... -> 88017...)
  let cleanPhone = vendorPhone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "88" + cleanPhone;
  } else if (cleanPhone && !cleanPhone.startsWith("880") && cleanPhone.length === 10) {
    cleanPhone = "880" + cleanPhone;
  }

  // Generate Vendor direct payment link
  const origin = window?.location?.origin || "https://resellerbrain.com";
  const vendorInvoiceUrl = `${origin}/vendor-panel/invoices?search=${encodeURIComponent(
    invoice.invoice_number
  )}`;

  // Formatted message for SMS / WhatsApp / Messenger
  const shareMessage = `প্রিয় ${vendorName},
আপনার CarryBee ডেলিভারি অর্ডারের সেটেলমেন্ট ইনভয়েস #${invoice.invoice_number} তৈরি করা হয়েছে।

📊 ইনভয়েস সারসংক্ষেপ:
১. CarryBee থেকে প্রাপ্তি: ${formatBDT(invoice.total_courier_net)}
২. আপনার পণ্যের মূল্য: ${formatBDT(invoice.total_supplier_price)}
৩. ResellerBrain-কে প্রদেয়: ${formatBDT(invoice.total_amount_owed)}

ইনভয়েসের বিস্তারিত দেখতে ও পরিশোধ করতে নিচের লিংকে ক্লিক করুন:
${vendorInvoiceUrl}

ধন্যবাদ,
ResellerBrain`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vendorInvoiceUrl);
    setCopiedLink(true);
    toast.success("ইনভয়েস পেমেন্ট লিংক কপি করা হয়েছে!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedMessage(true);
    toast.success("সম্পূর্ণ ইনভয়েস মেসেজ কপি করা হয়েছে!");
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(shareMessage);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(waUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `সেটেলমেন্ট ইনভয়েস #${invoice.invoice_number}`,
          text: shareMessage,
          url: vendorInvoiceUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("শেয়ার করতে সমস্যা হয়েছে।");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full my-8 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              ভেন্ডরের সাথে ইনভয়েস শেয়ার করুন
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ইনভয়েস: <span className="font-mono font-bold text-gray-800">#{invoice.invoice_number}</span> | ভেন্ডর: <span className="font-semibold text-gray-800">{vendorName}</span>
            </p>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-800 block font-semibold">কুরিয়ার জমা</span>
            <span className="font-mono font-bold text-xs text-emerald-950">
              {formatBDT(invoice.total_courier_net)}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[10px] text-blue-800 block font-semibold">পণ্যের মূল্য</span>
            <span className="font-mono font-bold text-xs text-blue-950">
              {formatBDT(invoice.total_supplier_price)}
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] text-amber-900 block font-bold">প্ল্যাটফর্ম পাবে</span>
            <span className="font-mono font-black text-xs text-amber-950">
              {formatBDT(invoice.total_amount_owed)}
            </span>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2.5 my-4">
          {/* WhatsApp Direct Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Send className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block font-bold">WhatsApp-এ সরাসরি পাঠান</span>
                <span className="text-[11px] text-emerald-100 block">
                  {cleanPhone
                    ? `ভেন্ডর নম্বরে (${vendorPhone}) মেসেজ যাবে`
                    : "হোয়াটসঅ্যাপে ভেন্ডর সিলেক্ট করে মেসেজ পাঠান"}
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-200" />
          </button>

          {/* Copy Direct Link */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
            <input
              type="text"
              readOnly
              value={vendorInvoiceUrl}
              className="flex-1 bg-transparent text-xs text-gray-700 px-2 py-1 outline-none font-mono truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                copiedLink
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "কপি হয়েছে" : "লিংক কপি"}
            </button>
          </div>

          {/* Web Share API (if available on device/browser) */}
          {typeof navigator !== "undefined" && navigator.share && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
              ডিভাইসের অন্যান্য অ্যাপে শেয়ার করুন
            </button>
          )}
        </div>

        {/* Message Preview Box */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
              মেসেজ প্রিভিউ (SMS / WhatsApp):
            </span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
              {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copiedMessage ? "কপি হয়েছে" : "মেসেজ কপি করুন"}
            </button>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
            {shareMessage}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
