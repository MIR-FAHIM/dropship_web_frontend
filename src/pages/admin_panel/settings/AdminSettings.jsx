import React, { useState } from "react";
import { Save } from "lucide-react";

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    siteName: "Bebsha360",
    siteEmail: "",
    sitePhone: "",
    address: "",
    currency: "৳ (BDT)",
    commissionRate: "",
    deliveryCharge: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admin settings:", formData);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">সেটিংস</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
            সাধারণ সেটিংস
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">সাইটের নাম</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">সাইটের ইমেইল</label>
              <input
                type="email"
                name="siteEmail"
                value={formData.siteEmail}
                onChange={handleChange}
                placeholder="admin@bebsha360.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন নম্বর</label>
              <input
                type="tel"
                name="sitePhone"
                value={formData.sitePhone}
                onChange={handleChange}
                placeholder="০১XXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ঠিকানা</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="অফিসের ঠিকানা"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Business */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
            ব্যবসায়িক সেটিংস
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">মুদ্রা</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">কমিশন হার (%)</label>
              <input
                type="number"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
                placeholder="যেমন: ১০"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ডেলিভারি চার্জ (৳)</label>
              <input
                type="number"
                name="deliveryCharge"
                value={formData.deliveryCharge}
                onChange={handleChange}
                placeholder="যেমন: ৬০"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
            পাসওয়ার্ড পরিবর্তন
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">বর্তমান পাসওয়ার্ড</label>
              <input
                type="password"
                placeholder="বর্তমান পাসওয়ার্ড"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">নতুন পাসওয়ার্ড</label>
              <input
                type="password"
                placeholder="নতুন পাসওয়ার্ড"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
          >
            <Save className="w-4 h-4" />
            সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
