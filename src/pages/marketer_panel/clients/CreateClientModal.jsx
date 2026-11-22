/* eslint-disable react/prop-types */
import { useState } from "react";
import { X, Eye, EyeOff, Copy, Check, User, Phone, Mail, Building, Lock } from "lucide-react";
import { toast } from "sonner";
import { usePartnerPrefs } from "../partnerPrefs";

const CreateClientModal = ({ isOpen, onClose, onCreate, isCreating, error, clearError }) => {
  const { t } = usePartnerPrefs();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    business_name: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createdInfo, setCreatedInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const handleReset = () => {
    setForm({ name: "", phone: "", email: "", business_name: "", password: "" });
    setCreatedInfo(null);
    setCopied(false);
    setLocalError("");
    clearError?.();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError?.();

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const businessName = form.business_name.trim();
    const password = form.password.trim();

    if (!name || !phone || !email) {
      setLocalError(t("Name, phone and email are required.", "নাম, ফোন এবং ইমেইল আবশ্যক।"));
      return;
    }

    // Phone format check (starts with 01 and at least 11 digits)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 11) {
      setLocalError(t("Please provide a valid 11-digit mobile number (e.g. 017XXXXXXXX).", "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।"));
      return;
    }

    const payload = {
      name,
      phone,
      email,
      ...(businessName ? { business_name: businessName } : {}),
      ...(password ? { password } : {}),
    };

    try {
      await onCreate(payload);
      // Auto-generated password fallback logic (same as backend: phone digits or '123456')
      const fallbackPass = cleanPhone.length >= 6 ? cleanPhone : "123456";
      const finalPassword = password || fallbackPass;

      setCreatedInfo({
        name,
        email,
        phone,
        password: finalPassword,
        loginUrl: `${window.location.origin}/login`,
      });
      toast.success(t("Dropshipper added successfully!", "ড্রপশিপার সফলভাবে যুক্ত করা হয়েছে!"));
    } catch {
      // Error handled by parent or displayed via error prop
    }
  };

  const handleCopyShare = () => {
    if (!createdInfo) return;
    const text = t(
      `Congratulations ${createdInfo.name}! Your ResellerBrain Dropshipper account is ready.\n\nEmail: ${createdInfo.email}\nPassword: ${createdInfo.password}\nLogin Link: ${createdInfo.loginUrl}\n\nLogin now and start product dropshipping!`,
      `অভিনন্দন ${createdInfo.name}! আপনার ResellerBrain ড্রপশিপার অ্যাকাউন্ট তৈরি হয়েছে।\n\nইমেইল: ${createdInfo.email}\nপাসওয়ার্ড: ${createdInfo.password}\nলগইন লিংক: ${createdInfo.loginUrl}\n\nএখনই লগইন করে প্রোডাক্ট রিসেলিং শুরু করুন!`
    );
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("Login credentials copied to clipboard!", "লগইন তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!"));
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all partner-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 via-emerald-50/40 to-white dark:border-slate-800 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {createdInfo ? t("Account Created Successfully", "অ্যাকাউন্ট তৈরি সম্পন্ন") : t("Add New Dropshipper", "নতুন ড্রপশিপার যুক্ত করুন")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {createdInfo
                ? t("Share these credentials with the dropshipper", "ড্রপশিপারের সাথে এই লগইন তথ্য শেয়ার করুন")
                : t("Enter details to onboard a new dropshipper", "আপনার কমিউনিটির নতুন সদস্যের তথ্য দিন")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdInfo ? (
          /* Success Credentials View */
          <div className="p-6 space-y-5">
            <div className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl p-4 text-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t("Dropshipper Added Successfully!", "ড্রপশিপার সফলভাবে যুক্ত হয়েছে!")}
              </h3>
              <p className="text-xs text-teal-800 dark:text-teal-200 mt-1">
                {t("The account has been automatically linked as your client.", "অ্যাকাউন্টটি স্বয়ংক্রিয়ভাবে আপনার ক্লায়েন্ট হিসেবে যুক্ত হয়েছে।")}
              </p>
            </div>

            {/* Credential Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t("Name:", "নাম:")}</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdInfo.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t("Email:", "ইমেইল:")}</span>
                <span className="font-mono text-xs text-slate-900 dark:text-white font-bold">{createdInfo.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t("Phone:", "ফোন:")}</span>
                <span className="font-mono text-xs text-slate-900 dark:text-white font-bold">{createdInfo.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t("Password:", "পাসওয়ার্ড:")}</span>
                <span className="font-mono text-xs font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                  {createdInfo.password}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t("Login Link:", "লগইন লিংক:")}</span>
                <span className="text-xs text-teal-600 dark:text-teal-400 underline font-mono truncate max-w-[200px] sm:max-w-[240px]">
                  {createdInfo.loginUrl}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyShare}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> {t("Copied!", "কপি হয়েছে!")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> {t("Copy Login Credentials (to share)", "লগইন তথ্য কপি করুন (হোয়াটসঅ্যাপে পাঠাতে)")}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                {t("Close", "বন্ধ করুন")}
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {(localError || error) && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900/60 dark:text-rose-400 text-xs rounded-xl p-3 font-semibold">
                {localError || error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("Dropshipper Full Name", "ড্রপশিপারের পূর্ণ নাম")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder={t("e.g. Md. Karim Hossain", "যেমন: মোঃ করিম হোসেন")}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-medium"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("Mobile Number", "মোবাইল নম্বর")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-mono font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {t("If left blank, this phone number will be used as password.", "পাসওয়ার্ড না দিলে এই ফোন নম্বরটিই পাসওয়ার্ড হিসেবে ব্যবহৃত হবে।")}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("Email Address", "ইমেইল ঠিকানা")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="dropshipper@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-medium"
                />
              </div>
            </div>

            {/* Business Name (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("Store or Business Name", "স্টোর বা বিজনেস নাম")} <span className="text-slate-400 dark:text-slate-500 font-normal">({t("Optional", "ঐচ্ছিক")})</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  placeholder={t("e.g. Karim Shop / Fashion Zone", "যেমন: করিম শপ / ফ্যাশন জোন")}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-medium"
                />
              </div>
            </div>

            {/* Password (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t("Password", "পাসওয়ার্ড")} <span className="text-slate-400 dark:text-slate-500 font-normal">({t("Optional - defaults to phone number", "ঐচ্ছিক - ফাঁকা রাখলে ফোন নম্বর সেট হবে")})</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={t("At least 4 characters", "কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড")}
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t("Cancel", "বাতিল")}
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isCreating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("Adding...", "যুক্ত হচ্ছে...")}
                  </>
                ) : (
                  t("Add Dropshipper", "যুক্ত করুন")
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateClientModal;
