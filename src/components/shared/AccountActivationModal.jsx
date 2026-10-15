import React from "react";
import { X, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const DEFAULT_SUPPORT_NUMBER = "01941606310";
const CLEAN_WHATSAPP_NUMBER = "8801941606310";

/**
 * Modal shown when the backend returns:
 * {"status":"failed","message":"You need to activate your account","errors":null}
 */
const AccountActivationModal = ({
  isOpen,
  onClose,
  message = "You need to activate your account",
  userEmail = "",
  supportNumber = DEFAULT_SUPPORT_NUMBER,
}) => {
  // Format WhatsApp Link
  const buildWhatsAppUrl = () => {
    const greeting = "Hello ResellerBrain Support Team,";
    const emailText = userEmail ? `\nEmail: ${userEmail}` : "";
    const requestText = `\nI received the message: "${message}". Please help activate my account.`;
    const fullText = `${greeting}${emailText}${requestText}`;
    return `https://wa.me/${CLEAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(fullText)}`;
  };

  const handleOpenWhatsApp = () => {
    const url = buildWhatsAppUrl();
    window.open(url, "_blank", "noopener,noreferrer");
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative gradient bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-[#158E72] to-[#25D366]" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header & Icon */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-green-100 flex items-center justify-center shadow-inner">
                <FaWhatsapp className="w-9 h-9 text-[#25D366]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#158E72] text-white flex items-center justify-center shadow">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              আসসালামু আলাইকুম!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Welcome to ResellerBrain
            </p>
          </div>

          {/* Server Message Box */}
          <div className="mb-5 rounded-2xl bg-amber-50/80 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900 leading-snug">
                  {message}
                </h3>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  আপনার অ্যাকাউন্টটি সক্রিয় করতে অনুগ্রহ করে আমাদের অফিসিয়াল WhatsApp সাপোর্টে যোগাযোগ করুন। আমাদের সাপোর্ট টিম দ্রুত আপনার অ্যাকাউন্ট সক্রিয় করে দেবে।
                </p>
              </div>
            </div>
          </div>

          {/* Account Details if present */}
          {userEmail && (
            <div className="mb-5 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">অ্যাকাউন্ট ইমেইল:</span>
              <span className="text-gray-800 font-semibold font-mono truncate max-w-[210px]">
                {userEmail}
              </span>
            </div>
          )}

          {/* Support Number Card */}
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                <FaWhatsapp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 font-medium">WhatsApp Support</div>
                <div className="text-sm font-bold text-gray-800 tracking-wide font-mono">
                  {supportNumber}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              অনলাইন সহায়তা
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            {/* Primary WhatsApp Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/25 hover:shadow-green-500/35 transition-all duration-200 active:scale-[0.99] cursor-pointer"
            >
              <FaWhatsapp className="w-5 h-5" />
              <span>WhatsApp-এ যোগাযোগ করুন</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            {/* Close / Later Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              পরে যোগাযোগ করব / বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActivationModal;
