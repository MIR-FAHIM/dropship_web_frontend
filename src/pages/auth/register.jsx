import React, { useState } from "react";
import {
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building2,
  Mail,
  Phone,
  Lock,
  Home,
  Sparkles,
  Loader2,
  HelpCircle,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useDropshipperRegisterMutation } from "../../redux/features/auth";
import {
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetUpazilasQuery,
} from "../../redux/features/address";
import { toast } from "sonner";

const DEFAULT_SUPPORT_NUMBER = "01941606310";
const CLEAN_WHATSAPP_NUMBER = "8801941606310";

const getCollection = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const RegisterPage = () => {
  const navigate = useNavigate();
  // Form inputs
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    division_id: "",
    district_id: "",
    upazila_id: "",
    address: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [duplicateAccountAlert, setDuplicateAccountAlert] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  // RTK Query: Register mutation
  const [register, { isLoading }] = useDropshipperRegisterMutation();

  // RTK Query: Cascading address dropdowns
  const { data: divisionsData, isLoading: divisionsLoading } = useGetDivisionsQuery();
  const { data: districtsData, isLoading: districtsLoading } = useGetDistrictsQuery(
    formData.division_id,
    { skip: !formData.division_id }
  );
  const { data: upazilasData, isLoading: upazilasLoading } = useGetUpazilasQuery(
    formData.district_id,
    { skip: !formData.district_id }
  );

  const divisions = getCollection(divisionsData);
  const districts = getCollection(districtsData);
  const upazilas = getCollection(upazilasData);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear specific error when user edits the field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (duplicateAccountAlert && (name === "email" || name === "phone")) {
      setDuplicateAccountAlert(null);
    }

    if (generalError) {
      setGeneralError("");
    }

    // Handle cascading resets
    if (name === "division_id") {
      setFormData((prev) => ({
        ...prev,
        division_id: value,
        district_id: "",
        upazila_id: "",
      }));
    } else if (name === "district_id") {
      setFormData((prev) => ({
        ...prev,
        district_id: value,
        upazila_id: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedBusiness = formData.business_name.trim();
    const trimmedAddress = formData.address.trim();

    // Name: Required, 2-191 characters
    if (!trimmedName) {
      errors.name = "আপনার পুরো নাম আবশ্যক (Full Name is required)";
    } else if (trimmedName.length < 2) {
      errors.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে (Min 2 characters)";
    } else if (trimmedName.length > 191) {
      errors.name = "নাম ১৯১ অক্ষরের মধ্যে হতে হবে (Max 191 characters)";
    }

    // Business Name: Optional, Max 255 characters
    if (trimmedBusiness && trimmedBusiness.length > 255) {
      errors.business_name = "ব্যবসার নাম ২৫৫ অক্ষরের মধ্যে হতে হবে (Max 255 characters)";
    }

    // Email: Required, valid email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = "ইমেইল ঠিকানা আবশ্যক (Email address is required)";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "সঠিক ইমেইল ঠিকানা প্রদান করুন (Enter a valid email address)";
    }

    // Phone: Required, validate Bangladesh phone format
    if (!trimmedPhone) {
      errors.phone = "ফোন নম্বর আবশ্যক (Phone number is required)";
    } else {
      const phoneRegex = /^(?:\+?8801|01)[3-9]\d{8}$/;
      const cleaned = trimmedPhone.replace(/[\s-]/g, "");
      if (!phoneRegex.test(cleaned)) {
        errors.phone = "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)";
      }
    }

    // Password: Optional, min 4 characters if provided
    if (formData.password) {
      if (formData.password.length < 4) {
        errors.password = "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে (Min 4 characters)";
      }
      // Password Confirmation: must match password if password is entered
      if (formData.password_confirmation !== formData.password) {
        errors.password_confirmation = "পাসওয়ার্ড দুটি মেলেনি (Passwords do not match)";
      }
    }

    // Address: Optional, Max 300 characters
    if (trimmedAddress && trimmedAddress.length > 300) {
      errors.address = "ঠিকানা ৩০০ অক্ষরের মধ্যে হতে হবে (Max 300 characters)";
    }

    return errors;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setDuplicateAccountAlert(null);

    // Run client-side validation
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const firstField = Object.keys(clientErrors)[0];
      toast.error(clientErrors[firstField] || "অনুগ্রহ করে ফর্মের ভুলগুলো সংশোধন করুন।");
      return;
    }

    setFieldErrors({});

    // Construct sanitized payload
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim().replace(/[\s-]/g, ""),
    };

    if (formData.business_name.trim()) {
      payload.business_name = formData.business_name.trim();
    }

    // If password provided, send it; otherwise omit so backend auto-generates
    if (formData.password) {
      payload.password = formData.password;
    }

    if (formData.address.trim()) {
      payload.address = formData.address.trim();
    }

    if (formData.division_id) {
      payload.division_id = Number(formData.division_id);
    }

    if (formData.district_id) {
      payload.district_id = Number(formData.district_id);
    }

    if (formData.upazila_id) {
      payload.upazila_id = Number(formData.upazila_id);
    }

    try {
      const res = await register(payload).unwrap();

      // Check success response (HTTP 201)
      if (res?.status === "success" || res?.data) {
        setRegisteredUser(
          res?.data?.user || {
            name: payload.name,
            email: payload.email,
            phone: payload.phone || "—",
            id: res?.data?.user?.id,
          }
        );
        setSuccessModalOpen(true);
        toast.success(res?.message || "রেজিস্ট্রেশনের আবেদন সফলভাবে জমা হয়েছে!");
        return;
      }

      // If backend returned status: "failed" within 200 envelope
      if (res?.status === "failed") {
        handleApiError(res);
      }
    } catch (err) {
      console.error("Dropshipper registration error:", err);
      handleApiError(err);
    }
  };

  // Unified API error handler for HTTP 409, 422, 500
  const handleApiError = (err) => {
    const status = err?.status;
    const errorData = err?.data || err;
    const message = errorData?.message || "";
    const backendErrors = errorData?.errors;

    // 1. HTTP 409 Conflict: Pending or Duplicate Account
    const isDuplicateOrPending =
      status === 409 ||
      message.toLowerCase().includes("already registered") ||
      message.toLowerCase().includes("awaiting admin activation") ||
      message.toLowerCase().includes("pending activation") ||
      (backendErrors?.email &&
        backendErrors.email.some((m) =>
          String(m).toLowerCase().includes("awaiting admin activation")
        ));

    if (isDuplicateOrPending) {
      setDuplicateAccountAlert({
        message:
          message ||
          "An account with this email has already registered and is currently awaiting admin activation.",
        email: formData.email,
      });
      if (backendErrors?.email) {
        setFieldErrors((prev) => ({
          ...prev,
          email: Array.isArray(backendErrors.email)
            ? backendErrors.email[0]
            : backendErrors.email,
        }));
      }
      toast.error(
        message || "এই ইমেইলটি ইতোমধ্যে নিবন্ধিত এবং অ্যাডমিন অনুমোদনের অপেক্ষায় আছে।"
      );
      return;
    }

    // 2. HTTP 422 Unprocessable Content: Field validation errors
    if (backendErrors && typeof backendErrors === "object") {
      const formatted = {};
      Object.entries(backendErrors).forEach(([key, val]) => {
        formatted[key] = Array.isArray(val) ? val[0] : String(val);
      });
      setFieldErrors(formatted);
      toast.error(message || "Validation failed. Please correct the highlighted errors.");
      return;
    }

    // 3. HTTP 500 / Network Error
    if (status === 500 || status === "FETCH_ERROR") {
      setGeneralError(
        "Something went wrong while submitting your application. Please try again or contact support."
      );
      toast.error(
        "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।"
      );
      return;
    }

    // Generic error fallback
    const fallbackMsg = message || "রেজিস্ট্রেশন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।";
    setGeneralError(fallbackMsg);
    toast.error(fallbackMsg);
  };

  // Helper WhatsApp url builder
  const buildWhatsAppSupportUrl = (customMsg) => {
    const text =
      customMsg ||
      `Hello ResellerBrain Support Team,\nI have registered as a dropshipper (${formData.email ? `Email: ${formData.email}` : ""}). Please help review and activate my account.`;
    return `https://wa.me/${CLEAN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-3xl font-extrabold text-[#158E72] hover:opacity-90 transition tracking-tight"
          >
            ResellerBrain
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            ড্রপশিপার রেজিস্ট্রেশন (Dropshipper Registration)
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 max-w-md mx-auto">
            আমাদের প্ল্যাটফর্মে ড্রপশিপার হিসেবে যুক্ত হয়ে শূন্য ইনভেস্টমেন্টে আপনার অনলাইন ব্যবসা শুরু করুন
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-950/5 border border-emerald-100/80 p-6 sm:p-10">
          {/* Form Header Badge */}
          <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-[#158E72] flex items-center justify-center shrink-0 shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                নতুন ড্রপশিপার অ্যাকাউন্ট আবেদন
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                সকল প্রয়োজনীয় তথ্য দিয়ে নিচের ফর্মটি পূরণ করুন
              </p>
            </div>
          </div>

          {/* Alert: HTTP 409 Pending / Duplicate Account */}
          {duplicateAccountAlert && (
            <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-amber-900">
                    অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় আছে (Awaiting Activation)
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {duplicateAccountAlert.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={buildWhatsAppSupportUrl(
                        `Hello ResellerBrain Support,\nMy dropshipper account (${duplicateAccountAlert.email}) is awaiting activation. Could you please review and activate it?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" />
                      <span>সরাসরি WhatsApp-এ জানান</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/login", {
                          state: { email: duplicateAccountAlert.email },
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition cursor-pointer"
                    >
                      <span>লগইন পেজে যান</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDuplicateAccountAlert(null)}
                  className="text-amber-500 hover:text-amber-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Alert: HTTP 500 Server Error */}
          {generalError && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-red-900">রেজিস্ট্রেশন ত্রুটি</h3>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    {generalError}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneralError("")}
                  className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row 1: Name & Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  পুরো নাম (Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="যেমন: ইউনুস মোহাম্মদ"
                  maxLength={191}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                      : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ব্যবসা / পেজের নাম (Business Name)
                  <span className="text-gray-400 font-normal ml-1 text-[11px]">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="যেমন: ইউনিক মার্ট বা আপনার পেজের নাম"
                  maxLength={255}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    fieldErrors.business_name
                      ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                      : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                  }`}
                />
                {fieldErrors.business_name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {fieldErrors.business_name}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ইমেইল ঠিকানা (Email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                      : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                  }`}
                />
                {fieldErrors.email ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {fieldErrors.email}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">
                    লগইন ইউজারনেম হিসেবে ব্যবহার হবে
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ফোন নম্বর (Phone Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="017XXXXXXXX"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    fieldErrors.phone
                      ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                      : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                  }`}
                />
                {fieldErrors.phone ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {fieldErrors.phone}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">
                    অ্যাকাউন্ট অ্যাক্টিভেশন ও বিজ্ঞপ্তির জন্য আবশ্যক
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    পাসওয়ার্ড (Password)
                  </label>
                  <span className="text-[11px] text-gray-400">(ঐচ্ছিক, Min 4)</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="কমপক্ষে ৪ ডিজিট বা পিন"
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                        : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">
                    খালি রাখলে ফোন নম্বর দিয়ে স্বয়ংক্রিয় পাসওয়ার্ড তৈরি হবে
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                    disabled={!formData.password}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      fieldErrors.password_confirmation
                        ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                        : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={!formData.password}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-40 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password_confirmation && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {fieldErrors.password_confirmation}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Cascading Location Dropdowns */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#158E72]" />
                  <span>অবস্থান ও এলাকা (Location)</span>
                </label>
                <span className="text-[11px] text-gray-400">(ঐচ্ছিক)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Division Dropdown */}
                <div>
                  <select
                    name="division_id"
                    value={formData.division_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#158E72] cursor-pointer"
                  >
                    <option value="">
                      {divisionsLoading ? "বিভাগ লোড হচ্ছে..." : "বিভাগ বাছুন (Division)"}
                    </option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.bn_name ? `${div.name} (${div.bn_name})` : div.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.division_id && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      {fieldErrors.division_id}
                    </p>
                  )}
                </div>

                {/* District Dropdown */}
                <div>
                  <select
                    name="district_id"
                    value={formData.district_id}
                    onChange={handleChange}
                    disabled={!formData.division_id}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#158E72] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {districtsLoading
                        ? "জেলা লোড হচ্ছে..."
                        : !formData.division_id
                        ? "আগে বিভাগ বাছুন"
                        : "জেলা বাছুন (District)"}
                    </option>
                    {districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.bn_name ? `${dist.name} (${dist.bn_name})` : dist.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.district_id && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      {fieldErrors.district_id}
                    </p>
                  )}
                </div>

                {/* Upazila / Thana Dropdown */}
                <div>
                  <select
                    name="upazila_id"
                    value={formData.upazila_id}
                    onChange={handleChange}
                    disabled={!formData.district_id}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-[#158E72] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {upazilasLoading
                        ? "উপজেলা লোড হচ্ছে..."
                        : !formData.district_id
                        ? "আগে জেলা বাছুন"
                        : "উপজেলা/থানা (Upazila)"}
                    </option>
                    {upazilas.map((upz) => (
                      <option key={upz.id} value={upz.id}>
                        {upz.bn_name ? `${upz.name} (${upz.bn_name})` : upz.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.upazila_id && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      {fieldErrors.upazila_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 5: Detailed Street Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  বিস্তারিত ঠিকানা (Street / Local Address)
                </label>
                <span className="text-[11px] text-gray-400">
                  {formData.address.length}/300
                </span>
              </div>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                maxLength={300}
                placeholder="রোড, বাড়ি নম্বর, সেক্টর বা এলাকার নাম লিখুন..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 resize-none ${
                  fieldErrors.address
                    ? "border-red-400 focus:ring-red-300 bg-red-50/20"
                    : "border-gray-300 focus:border-[#158E72] focus:ring-emerald-200"
                }`}
              />
              {fieldErrors.address && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {fieldErrors.address}
                </p>
              )}
            </div>

            {/* Terms notice */}
            <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3 text-xs text-gray-600 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#158E72] shrink-0 mt-0.5" />
              <span>
                আবেদন জমা দেওয়ার পর আমাদের টিম পর্যালোচনা করে আপনার ড্রপশিপার অ্যাকাউন্টটি সক্রিয় করে দেবে। অ্যাকাউন্ট সক্রিয় হলে SMS এবং WhatsApp-এর মাধ্যমে জানতে পারবেন।
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#158E72] hover:bg-emerald-700 active:bg-emerald-800 text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>আবেদন জমা দেওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>আবেদন জমা দিন (Submit Application)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">অথবা</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login Option */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              ইতোমধ্যে ড্রপশিপার অ্যাকাউন্ট রয়েছে?
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full border-2 border-[#158E72] text-[#158E72] hover:bg-emerald-50 active:bg-emerald-100 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>লগইন করুন (Go to Login)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} ResellerBrain। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>

      {/* ── Success Confirmation Modal (HTTP 201) ── */}
      {successModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-[#158E72] to-[#25D366]" />

            <div className="p-6 sm:p-8">
              {/* Header Icon & Title */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#158E72] flex items-center justify-center mb-3 shadow-inner">
                  <CheckCircle2 className="w-9 h-9 text-[#158E72]" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>আবেদন গৃহীত হয়েছে</span>
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Registration Received!
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  রেজিস্ট্রেশন সফলভাবে জমা হয়েছে
                </p>
              </div>

              {/* Message Box */}
              <div className="rounded-2xl bg-amber-50/90 border border-amber-200/80 p-4 mb-5">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-sm text-amber-950">
                      Thank you for registering.
                    </p>
                    <p>
                      Your dropshipper account is currently under review by our admin team. You will receive an SMS and WhatsApp notification once your account is activated.
                    </p>
                    <p className="text-amber-800/90 text-[11px] pt-1 border-t border-amber-200/60">
                      (ধন্যবাদ! আপনার অ্যাকাউন্টটি বর্তমানে আমাদের অ্যাডমিন টিমের পর্যালোচনায় রয়েছে। অ্যাকাউন্ট সক্রিয় হওয়া মাত্রই আপনাকে SMS এবং WhatsApp এর মাধ্যমে জানানো হবে।)
                    </p>
                  </div>
                </div>
              </div>

              {/* User Summary Card */}
              {registeredUser && (
                <div className="rounded-2xl bg-gray-50 border border-gray-200/80 p-4 mb-5 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500">নাম (Name):</span>
                    <span className="font-bold text-gray-900">{registeredUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-t border-gray-100">
                    <span className="text-gray-500">ইমেইল (Email):</span>
                    <span className="font-mono font-semibold text-gray-800 truncate max-w-[220px]">
                      {registeredUser.email}
                    </span>
                  </div>
                  {registeredUser.phone && registeredUser.phone !== "—" && (
                    <div className="flex justify-between items-center py-0.5 border-t border-gray-100">
                      <span className="text-gray-500">ফোন (Phone):</span>
                      <span className="font-mono font-semibold text-gray-800">
                        {registeredUser.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-0.5 border-t border-gray-100">
                    <span className="text-gray-500">স্ট্যাটাস (Status):</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>Awaiting Admin Activation</span>
                    </span>
                  </div>
                </div>
              )}

              {/* WhatsApp Support Direct Button */}
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FaWhatsapp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 font-medium">জরুরি অনুমোদনের জন্য</div>
                    <div className="text-xs font-bold text-gray-800">WhatsApp Support ({DEFAULT_SUPPORT_NUMBER})</div>
                  </div>
                </div>
                <a
                  href={buildWhatsAppSupportUrl(
                    `Hello ResellerBrain Support Team,\nI have just registered as a dropshipper.\nName: ${registeredUser?.name || formData.name}\nEmail: ${registeredUser?.email || formData.email}\nPhone: ${registeredUser?.phone || formData.phone}\nPlease review and activate my account.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>মেসেজ দিন</span>
                </a>
              </div>

              {/* Modal Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login", {
                      state: { email: registeredUser?.email || formData.email },
                    })
                  }
                  className="w-full py-3 px-4 rounded-xl bg-[#158E72] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>Return to Homepage</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
