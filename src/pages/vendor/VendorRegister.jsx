import React, { useState } from "react";
import { useGetDivisionsQuery, useGetDistrictsQuery } from "../../redux/features/address";
import { Store, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorRegisterMutation } from "../../redux/features/vendor_api";
import { toast } from "sonner";

const shopTypes = [
  "ইলেকট্রনিক্স",
  "ফ্যাশন ও পোশাক",
  "হোম ও কিচেন",
  "বিউটি ও হেলথ",
  "গ্রোসারি ও ফুড",
  "স্পোর্টস ও আউটডোর",
  "বই ও স্টেশনারি",
  "অন্যান্য",
];

const zones = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

// ✅ Moved OUTSIDE VendorRegister — prevents remount on every keystroke
const InputField = ({ label, name, type = "text", placeholder, required = true, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    />
  </div>
);

// ✅ Moved OUTSIDE VendorRegister — prevents remount on every keystroke
const SelectField = ({ label, name, options, placeholder, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} <span className="text-red-500">*</span>
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const VendorRegister = () => {
  const navigate = useNavigate();
  const [vendorRegister, { isLoading }] = useVendorRegisterMutation();
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    contactPerson: "",
    emergencyContact: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    phone: "",
    address: "",
    divisionId: "",
    districtId: "",
    shopType: "",
  });

  // Fetch divisions
  const { data: divisionsData, isLoading: divisionsLoading } = useGetDivisionsQuery();
  // Fetch districts based on selected division
  const { data: districtsData, isLoading: districtsLoading } = useGetDistrictsQuery(formData.divisionId, { skip: !formData.divisionId });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset district if division changes
    if (name === "divisionId") {
      setFormData({ ...formData, divisionId: value, districtId: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না!");
      return;
    }
    try {
      const payload = {
        name: formData.shopName,
        shop_name: formData.shopName,
        email: formData.email,
        password: formData.password,
        contact_person: formData.contactPerson,
        emergency_contact: formData.emergencyContact,
        address: formData.address,
        state: formData.divisionId, // division id
        city: formData.districtId,  // district id
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        owner_name: formData.ownerName,
        shop_type: formData.shopType,
        description: "",
      };
      const res = await vendorRegister(payload).unwrap();
      toast.success(res?.message || "রেজিস্ট্রেশন সফল হয়েছে!");
      navigate("/vendor-login");
    } catch (err) {
      toast.error(err?.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            ResellerBrain
          </h1>
          <p className="mt-2 text-gray-500 text-sm">ভেন্ডর হিসেবে রেজিস্টার করুন</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">ভেন্ডর রেজিস্ট্রেশন</h2>
              <p className="text-xs text-gray-500">আপনার দোকান ও ব্যক্তিগত তথ্য দিন</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
                দোকানের তথ্য
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="দোকানের নাম"
                  name="shopName"
                  placeholder="আপনার দোকানের নাম"
                  value={formData.shopName}
                  onChange={handleChange}
                />
                <SelectField
                  label="দোকানের ধরন"
                  name="shopType"
                  options={shopTypes}
                  placeholder="ধরন নির্বাচন করুন"
                  value={formData.shopType}
                  onChange={handleChange}
                />
                <div className="sm:col-span-2">
                  <InputField
                    label="ঠিকানা"
                    name="address"
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                {/* Division Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    বিভাগ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="divisionId"
                    value={formData.divisionId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {divisionsLoading ? (
                      <option>লোড হচ্ছে...</option>
                    ) : (
                      divisionsData?.data?.map((div) => (
                        <option key={div.id} value={div.id}>{div.bn_name || div.name}</option>
                      ))
                    )}
                  </select>
                </div>
                {/* District Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    জেলা <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    disabled={!formData.divisionId}
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    {districtsLoading ? (
                      <option>লোড হচ্ছে...</option>
                    ) : (
                      districtsData?.data?.map((dist) => (
                        <option key={dist.id} value={dist.id}>{dist.bn_name || dist.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Owner Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
                মালিকের তথ্য
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="মালিকের নাম"
                  name="ownerName"
                  placeholder="পুরো নাম"
                  value={formData.ownerName}
                  onChange={handleChange}
                />
                <InputField
                  label="যোগাযোগকারী ব্যক্তি"
                  name="contactPerson"
                  placeholder="যোগাযোগকারীর নাম"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
                <InputField
                  label="ফোন নম্বর"
                  name="phone"
                  type="tel"
                  placeholder="০১XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <InputField
                  label="জরুরি যোগাযোগ"
                  name="emergencyContact"
                  type="tel"
                  placeholder="০১XXXXXXXXX"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
                <InputField
                  label="হোয়াটসঅ্যাপ নম্বর"
                  name="whatsapp"
                  type="tel"
                  placeholder="০১XXXXXXXXX"
                  required={false}
                  value={formData.whatsapp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Account Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
                অ্যাকাউন্ট তথ্য
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <InputField
                    label="ইমেইল"
                    name="email"
                    type="email"
                    placeholder="vendor@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <InputField
                  label="পাসওয়ার্ড"
                  name="password"
                  type="password"
                  placeholder="কমপক্ষে ৮ অক্ষর"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputField
                  label="পাসওয়ার্ড নিশ্চিত করুন"
                  name="confirmPassword"
                  type="password"
                  placeholder="পুনরায় পাসওয়ার্ড দিন"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                আমি ResellerBrain-এর{" "}
                <span className="text-blue-600 underline cursor-pointer">সেবার শর্তাবলী</span> এবং{" "}
                <span className="text-blue-600 underline cursor-pointer">গোপনীয়তা নীতি</span> পড়েছি এবং সম্মত আছি।
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  রেজিস্টার করুন <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">অথবা</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login redirect */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">ইতোমধ্যে অ্যাকাউন্ট আছে?</p>
            <button
              onClick={() => navigate("/vendor-login")}
              className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> লগইন করুন
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} ResellerBrain। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    </div>
  );
};

export default VendorRegister;