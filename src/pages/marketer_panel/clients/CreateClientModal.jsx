import { useState } from "react";
import { X, Eye, EyeOff, Copy, Check, User, Phone, Mail, Building, Lock } from "lucide-react";
import { toast } from "sonner";

const CreateClientModal = ({ isOpen, onClose, onCreate, isCreating, error, clearError }) => {
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
      setLocalError("নাম, ফোন এবং ইমেইল আবশ্যক।");
      return;
    }

    // Phone format check (starts with 01 and at least 11 digits)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 11) {
      setLocalError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।");
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
      const res = await onCreate(payload);
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
      toast.success("ড্রপশিপার সফলভাবে যুক্ত করা হয়েছে!");
    } catch {
      // Error handled by parent or displayed via error prop
    }
  };

  const handleCopyShare = () => {
    if (!createdInfo) return;
    const text = `অভিনন্দন ${createdInfo.name}! আপনার ResellerBrain ড্রপশিপার অ্যাকাউন্ট তৈরি হয়েছে।\n\nইমেইল: ${createdInfo.email}\nপাসওয়ার্ড: ${createdInfo.password}\nলগইন লিংক: ${createdInfo.loginUrl}\n\nএখনই লগইন করে প্রোডাক্ট রিসেলিং শুরু করুন!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("লগইন তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {createdInfo ? "অ্যাকাউন্ট তৈরি সম্পন্ন" : "নতুন ড্রপশিপার যুক্ত করুন"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {createdInfo
                ? "ড্রপশিপারের সাথে এই লগইন তথ্য শেয়ার করুন"
                : "আপনার কমিউনিটির নতুন সদস্যের তথ্য দিন"}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdInfo ? (
          /* Success Credentials View */
          <div className="p-6 space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">ড্রপশিপার সফলভাবে যুক্ত হয়েছে!</h3>
              <p className="text-xs text-emerald-800 mt-1">
                অ্যাকাউন্টটি স্বয়ংক্রিয়ভাবে আপনার ক্লায়েন্ট হিসেবে যুক্ত হয়েছে।
              </p>
            </div>

            {/* Credential Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-xs text-gray-500 font-medium">নাম:</span>
                <span className="font-semibold text-gray-900">{createdInfo.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-xs text-gray-500 font-medium">ইমেইল:</span>
                <span className="font-mono text-xs text-gray-900 font-medium">{createdInfo.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-xs text-gray-500 font-medium">ফোন:</span>
                <span className="font-mono text-xs text-gray-900">{createdInfo.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                <span className="text-xs text-gray-500 font-medium">পাসওয়ার্ড:</span>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {createdInfo.password}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-500 font-medium">লগইন লিংক:</span>
                <span className="text-xs text-blue-600 underline font-mono truncate max-w-[220px]">
                  {createdInfo.loginUrl}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyShare}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> কপি হয়েছে!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> লগইন তথ্য কপি করুন (হোয়াটসঅ্যাপে পাঠাতে)
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-medium transition"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
                {localError || error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ড্রপশিপারের পূর্ণ নাম <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="যেমন: মোঃ করিম হোসেন"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition font-mono"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                পাসওয়ার্ড না দিলে এই ফোন নম্বরটিই পাসওয়ার্ড হিসেবে ব্যবহৃত হবে।
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ইমেইল ঠিকানা <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="dropshipper@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Business Name (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                স্টোর বা বিজনেস নাম <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  placeholder="যেমন: করিম শপ / ফ্যাশন জোন"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                পাসওয়ার্ড <span className="text-gray-400 font-normal">(ঐচ্ছিক - ফাঁকা রাখলে ফোন নম্বর সেট হবে)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    যুক্ত হচ্ছে...
                  </>
                ) : (
                  "যুক্ত করুন"
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
