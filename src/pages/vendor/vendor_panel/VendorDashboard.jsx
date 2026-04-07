import React from "react";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useGetVendorProfileQuery } from "../../../redux/features/vendor_api";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";

const statCards = [
  {
    label: "মোট বিক্রয়",
    value: "৳০",
    icon: <DollarSign className="w-6 h-6" />,
    color: "bg-green-500",
    bgLight: "bg-green-50",
  },
  {
    label: "মোট অর্ডার",
    value: "০",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
  },
  {
    label: "মোট পণ্য",
    value: "০",
    icon: <Package className="w-6 h-6" />,
    color: "bg-purple-500",
    bgLight: "bg-purple-50",
  },
  {
    label: "এই মাসের আয়",
    value: "৳০",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-orange-500",
    bgLight: "bg-orange-50",
  },
];

const recentOrders = [
  // Placeholder empty state
];

const VendorDashboard = () => {
  const userId = getFromLocalstorage("userId");
  const { data: profileData, isLoading: profileLoading } = useGetVendorProfileQuery(userId, {
    skip: !userId,
  });
  const vendor = profileData?.data;
  const vendorUser = vendor?.user;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold">
          স্বাগতম, {vendor?.shop_name || "ভেন্ডর"}!
        </h1>
        <p className="mt-1 text-blue-100 text-sm">
          আপনার ড্যাশবোর্ডে সকল তথ্য এক নজরে দেখুন।
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Order Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">অর্ডার সারসংক্ষেপ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">০</p>
              <p className="text-xs text-gray-500 mt-1">পেন্ডিং</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <ClipboardList className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">০</p>
              <p className="text-xs text-gray-500 mt-1">প্রসেসিং</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">০</p>
              <p className="text-xs text-gray-500 mt-1">সম্পন্ন</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">০</p>
              <p className="text-xs text-gray-500 mt-1">বাতিল</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">দ্রুত কার্যক্রম</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition">
              <Package className="w-4 h-4" />
              নতুন পণ্য যোগ করুন
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
              <ClipboardList className="w-4 h-4" />
              অর্ডার দেখুন
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition">
              <DollarSign className="w-4 h-4" />
              পেমেন্ট উইথড্র
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">সাম্প্রতিক অর্ডার</h3>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
            <p className="text-gray-400 text-xs mt-1">পণ্য যোগ করুন এবং অর্ডার পেতে শুরু করুন!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">অর্ডার আইডি</th>
                <th className="pb-3 font-medium">তারিখ</th>
                <th className="pb-3 font-medium">পণ্য</th>
                <th className="pb-3 font-medium">মোট</th>
                <th className="pb-3 font-medium">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3">{order.id}</td>
                  <td className="py-3">{order.date}</td>
                  <td className="py-3">{order.product}</td>
                  <td className="py-3">{order.total}</td>
                  <td className="py-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
