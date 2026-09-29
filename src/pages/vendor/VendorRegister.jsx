import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Loader2, ShieldCheck, UserCheck, UserCog, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetDivisionsQuery, useGetDistrictsQuery, useGetUpazilasQuery } from "../../redux/features/address";
import { useAddKycDocumentMutation, useVendorRegisterMutation } from "../../redux/features/vendor_api";
import { toast } from "sonner";
const maxKycFileSize = 5 * 1024 * 1024;
const allowedKycExtensions = ["jpg", "jpeg", "png", "webp", "pdf"];
const kycAccept = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

const kycDocuments = [
  { type: "nid_front", document_name: "NID Front Side", label: "NID Front Side", required: true },
  { type: "nid_back", document_name: "NID Back Side", label: "NID Back Side", required: true },
  { type: "trade_license", document_name: "Trade License", label: "Trade License", required: false },
  { type: "irc", document_name: "Import Registration Certificate - IRC", label: "Import Registration Certificate - IRC", required: false },
];

const getVendorRegisterUserId = (response) => {
  const data = response?.data?.data || response?.data || response;
  return (
    data?.user_id ||
    data?.user?.id ||
    data?.user?.user_id ||
    data?.vendor?.user_id ||
    data?.vendor?.user?.id ||
    data?.vendor_user_id ||
    data?.id ||
    null
  );
};

const getApiMessage = (error, fallback) => {
  const data = error?.data || error;
  if (data?.message) return data.message;
  const firstError = data?.errors && Object.values(data.errors).flat().find(Boolean);
  return firstError ? String(firstError) : fallback;
};

const getCollection = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const validateKycFile = (file) => {
  if (!file) return "";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!allowedKycExtensions.includes(extension)) {
    return "Only JPG, PNG, WEBP, or PDF files are allowed.";
  }
  if (file.size > maxKycFileSize) {
    return "File size must be 5MB or less.";
  }
  return "";
};

const VendorRegister = () => {
  const navigate = useNavigate();
  const [vendorRegister, { isLoading }] = useVendorRegisterMutation();
  const [addKycDocument, { isLoading: isUploadingKyc }] = useAddKycDocumentMutation();
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [kycFiles, setKycFiles] = useState({});
  const [kycErrors, setKycErrors] = useState({});
  const [uploadFailures, setUploadFailures] = useState([]);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: "",
    business_name: "",
    phone: "",
    contactPerson: "",
    emergencyContact: "",
    email: "",
    division_id: "",
    district_id: "",
    upazila_id: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch address API dropdowns
  const { data: divisionsData, isLoading: divisionsLoading } = useGetDivisionsQuery();
  const { data: districtsData, isLoading: districtsLoading } = useGetDistrictsQuery(formData.division_id, {
    skip: !formData.division_id,
  });
  const { data: upazilasData, isLoading: upazilasLoading } = useGetUpazilasQuery(formData.district_id, {
    skip: !formData.district_id,
  });

  const divisions = getCollection(divisionsData);
  const districts = getCollection(districtsData);
  const upazilas = getCollection(upazilasData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "division_id") {
      setFormData({ ...formData, division_id: value, district_id: "", upazila_id: "" });
    } else if (name === "district_id") {
      setFormData({ ...formData, district_id: value, upazila_id: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleKycFileSelect = (type, file) => {
    if (!file) return;
    const error = validateKycFile(file);
    setKycErrors((prev) => ({ ...prev, [type]: error }));

    if (error) {
      setKycFiles((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
      return;
    }

    setKycFiles((prev) => ({ ...prev, [type]: file }));
    setUploadFailures((prev) => prev.filter((item) => item.type !== type));
  };

  const handleKycFileRemove = (type) => {
    setKycFiles((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
    setKycErrors((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
    setUploadFailures((prev) => prev.filter((item) => item.type !== type));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (registeredUserId) {
      await uploadSelectedKycDocuments(registeredUserId, true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না!");
      return;
    }

    try {
      const payload = {
        name: formData.ownerName,
        shop_name: formData.business_name || formData.ownerName,
        business_name: formData.business_name,
        email: formData.email,
        password: formData.password,
        contact_person: formData.contactPerson,
        emergency_contact: formData.emergencyContact,
        address: formData.address,
        division_id: formData.division_id ? Number(formData.division_id) : null,
        district_id: formData.district_id ? Number(formData.district_id) : null,
        upazila_id: formData.upazila_id ? Number(formData.upazila_id) : null,
        state: formData.division_id,
        city: formData.district_id,
        phone: formData.phone,
        whatsapp: formData.phone,
        owner_name: formData.ownerName,
        shop_type: "Supplier",
        description: "",
      };

      const res = await vendorRegister(payload).unwrap();
      const userId = getVendorRegisterUserId(res);
      toast.success(res?.message || "রেজিস্ট্রেশন সফল হয়েছে!");
      setRegisteredUserId(userId);
      setRegisteredEmail(formData.email);
      setRegistrationCompleted(true);

      if (!userId) {
        toast.warning("Registration completed, but user id was not found for KYC upload.");
        return;
      }
      await uploadSelectedKycDocuments(userId, true);
    } catch (err) {
      toast.error(err?.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে!");
    }
  };

  const uploadSelectedKycDocuments = async (userId, redirectWhenDone = false) => {
    const selectedDocuments = kycDocuments.filter((doc) => kycFiles[doc.type]);

    if (selectedDocuments.length === 0) {
      toast.success("Registration completed successfully.");
      if (redirectWhenDone) {
        navigate("/vendor-login", {
          state: { email: formData.email || registeredEmail },
        });
      }
      return true;
    }

    if (!userId) {
      toast.error("User id was not found. Could not upload KYC documents.");
      return false;
    }

    const currentErrors = {};
    selectedDocuments.forEach((doc) => {
      const error = validateKycFile(kycFiles[doc.type]);
      if (error) currentErrors[doc.type] = error;
    });

    if (Object.keys(currentErrors).length > 0) {
      setKycErrors((prev) => ({ ...prev, ...currentErrors }));
      toast.error("Please fix selected file errors before uploading.");
      return false;
    }

    const failures = [];
    let successCount = 0;
    const successTypes = [];

    for (const doc of selectedDocuments) {
      const formDataPayload = new FormData();
      formDataPayload.append("user_id", userId);
      formDataPayload.append("type", doc.type);
      formDataPayload.append("document_name", doc.document_name);
      formDataPayload.append("document_file", kycFiles[doc.type]);

      try {
        await addKycDocument(formDataPayload).unwrap();
        successCount += 1;
        successTypes.push(doc.type);
      } catch (err) {
        failures.push({
          type: doc.type,
          name: doc.document_name,
          message: getApiMessage(err, "Upload failed"),
        });
      }
    }

    setUploadFailures(failures);

    if (successTypes.length > 0) {
      setKycFiles((prev) => {
        const next = { ...prev };
        successTypes.forEach((type) => delete next[type]);
        return next;
      });
    }

    if (successCount > 0) {
      toast.success(`${successCount} document${successCount > 1 ? "s" : ""} uploaded successfully.`);
    }

    if (failures.length > 0) {
      toast.error(`${failures.map((failure) => failure.name).join(", ")} failed to upload.`);
      return false;
    }

    toast.success("All selected KYC documents uploaded successfully.");
    if (redirectWhenDone) {
      navigate("/vendor-login", {
        state: { email: formData.email || registeredEmail },
      });
    }
    return true;
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-10 px-4 flex items-center justify-center font-supplier-portal">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#0f172a] p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-1">Supplier Registration</h2>
          <p className="text-slate-400 text-sm">
            আমাদের সাপ্লায়ার নেটওয়ার্কে যুক্ত হতে নিচের ফরমটি সঠিক তথ্য দিয়ে পূরণ করুন
          </p>
        </div>

        {/* Single Step Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {registrationCompleted && (
            <div className="bg-[#ecfdf5] border-l-4 border-[#10b981] p-3.5 rounded-r-lg flex items-center space-x-2.5">
              <ShieldCheck className="h-5 w-5 text-[#059669] shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Registration completed successfully</p>
                <p className="text-xs text-emerald-800">
                  User ID: <span className="font-bold">{registeredUserId || "Not found"}</span>
                  {registeredEmail ? <span> · {registeredEmail}</span> : null}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: Account & Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center tracking-wide uppercase">
              <UserCog className="text-[#059669] mr-2 h-5 w-5" /> 1. ACCOUNT & CONTACT INFORMATION
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier / Owner Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Supplier / Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>

              {/* Business / Company Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Business / Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  required
                  placeholder="আপনার কোম্পানির / প্রতিষ্ঠানের নাম লিখুন"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>

              {/* Primary Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Primary Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>

              {/* Operational / Moderator Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Operational / Moderator Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  required
                  placeholder="মডারেটর বা প্রতিনিধির নাম"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>

              {/* Moderator Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Moderator Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  required
                  placeholder="018XXXXXXXX"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
              />
            </div>

            {/* Division, District & Upazila Select */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Division Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  name="division_id"
                  value={formData.division_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="">Select Division</option>
                  {divisionsLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.bn_name || div.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* District Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.division_id}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] outline-none text-sm bg-white cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select District</option>
                  {districtsLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.bn_name || dist.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Upazila Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Upazila / Thana <span className="text-red-500">*</span>
                </label>
                <select
                  name="upazila_id"
                  value={formData.upazila_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.district_id}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] outline-none text-sm bg-white cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Upazila / Thana</option>
                  {upazilasLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    upazilas.map((up) => (
                      <option key={up.id} value={up.id}>
                        {up.bn_name || up.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Business Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Business Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                rows={2}
                required
                placeholder="হাউজ/রোড নম্বর, ব্লক, এলাকা বা বিস্তারিত ঠিকানা লিখুন..."
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="পাসওয়ার্ড দিন"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#059669] focus:border-[#059669] outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Document Verification */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center tracking-wide uppercase">
              <ShieldCheck className="text-[#059669] mr-2 h-5 w-5" /> 2. DOCUMENT VERIFICATION
            </h3>

            {/* Compact Verified Badge Note */}
            <div className="bg-[#ecfdf5] border-l-4 border-[#10b981] p-3.5 rounded-r-lg flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="text-[#059669] text-lg h-5 w-5 shrink-0" />
                <p className="text-xs text-emerald-800 font-medium">
                  <strong>Trade License</strong> & <strong>IRC</strong> দিলে আপনার প্রোফাইলে <strong>Verified Seller Badge</strong> যুক্ত হবে।
                </p>
              </div>
              <span className="inline-flex items-center gap-1 bg-[#059669] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                <CheckCircle2 className="text-white h-3.5 w-3.5" /> Verified Seller
              </span>
            </div>

            {/* Mandatory NID Upload */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                National ID Card (NID) <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NID Front */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      NID Front Side <span className="text-red-500">*</span>
                    </label>
                    {kycFiles["nid_front"] && (
                      <button
                        type="button"
                        onClick={() => handleKycFileRemove("nid_front")}
                        className="text-red-500 hover:text-red-700"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    required
                    accept={kycAccept}
                    onChange={(e) => handleKycFileSelect("nid_front", e.target.files?.[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#0f172a] cursor-pointer"
                  />
                  {kycFiles["nid_front"] && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-medium truncate flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 shrink-0" /> {kycFiles["nid_front"].name}
                    </p>
                  )}
                  {kycErrors["nid_front"] && <p className="mt-1 text-xs text-red-600">{kycErrors["nid_front"]}</p>}
                </div>

                {/* NID Back */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      NID Back Side <span className="text-red-500">*</span>
                    </label>
                    {kycFiles["nid_back"] && (
                      <button
                        type="button"
                        onClick={() => handleKycFileRemove("nid_back")}
                        className="text-red-500 hover:text-red-700"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    required
                    accept={kycAccept}
                    onChange={(e) => handleKycFileSelect("nid_back", e.target.files?.[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#0f172a] cursor-pointer"
                  />
                  {kycFiles["nid_back"] && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-medium truncate flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 shrink-0" /> {kycFiles["nid_back"].name}
                    </p>
                  )}
                  {kycErrors["nid_back"] && <p className="mt-1 text-xs text-red-600">{kycErrors["nid_back"]}</p>}
                </div>
              </div>
            </div>

            {/* Optional Trade License */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Trade License <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                {kycFiles["trade_license"] && (
                  <button
                    type="button"
                    onClick={() => handleKycFileRemove("trade_license")}
                    className="text-red-500 hover:text-red-700"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                type="file"
                accept={kycAccept}
                onChange={(e) => handleKycFileSelect("trade_license", e.target.files?.[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#0f172a] cursor-pointer"
              />
              {kycFiles["trade_license"] && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium truncate flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 shrink-0" /> {kycFiles["trade_license"].name}
                </p>
              )}
              {kycErrors["trade_license"] && <p className="mt-1 text-xs text-red-600">{kycErrors["trade_license"]}</p>}
            </div>

            {/* Optional IRC Document */}
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Import Registration Certificate - IRC <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                {kycFiles["irc"] && (
                  <button
                    type="button"
                    onClick={() => handleKycFileRemove("irc")}
                    className="text-red-500 hover:text-red-700"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                type="file"
                accept={kycAccept}
                onChange={(e) => handleKycFileSelect("irc", e.target.files?.[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#1e293b] file:text-white hover:file:bg-[#0f172a] cursor-pointer"
              />
              {kycFiles["irc"] && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium truncate flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 shrink-0" /> {kycFiles["irc"].name}
                </p>
              )}
              {kycErrors["irc"] && <p className="mt-1 text-xs text-red-600">{kycErrors["irc"]}</p>}
            </div>

            {uploadFailures.length > 0 && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-700">Some documents failed to upload:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-700">
                  {uploadFailures.map((failure) => (
                    <li key={failure.type}>
                      {failure.name}: {failure.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start space-x-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 mt-0.5 text-[#059669] border-slate-300 rounded focus:ring-[#059669] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer leading-normal">
              আমি প্ল্যাটফর্মের{" "}
              <Link to="/supplier-terms-and-conditions" target="_blank" className="text-[#059669] font-semibold underline">
                Terms & Conditions
              </Link>{" "}
              এবং{" "}
              <Link to="/privacy-policy" className="text-[#059669] font-semibold underline">
                Privacy Policy
              </Link>{" "}
              পড়েছি এবং তাতে সম্মত আছি। <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || isUploadingKyc}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-base flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading || isUploadingKyc ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLoading ? "Registering..." : "Uploading documents..."}</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Login Redirect Footer */}
        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">অথবা</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="text-center">
            <p className="mb-3 text-sm text-slate-600">ইতোমধ্যে অ্যাকাউন্ট আছে?</p>
            <button
              type="button"
              onClick={() => navigate("/vendor-login")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#059669] py-3 text-sm font-semibold text-[#059669] transition hover:bg-[#ecfdf5] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> লগইন করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
