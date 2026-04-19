import React from "react";
import { useGetAdminDashboardReportQuery } from "../../../redux/features/report";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
  Store,
  Users,
  Truck,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

const getStatCards = (data) => [
  {
    label: "মোট বিক্রয়",
    value: `৳${data?.total_sell ?? 0}`,
    change: "",
    icon: <DollarSign className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    label: "মোট অর্ডার",
    value: `${data?.orders_count ?? 0}`,
    change: "",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    label: "মোট পণ্য",
    value: `${data?.products_count ?? 0}`,
    change: "",
    icon: <Package className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    label: "মোট ভেন্ডর",
    value: `${data?.total_vendor ?? 0}`,
    change: "",
    icon: <Store className="w-6 h-6" />,
    color: "bg-orange-500",
  },
  {
    label: "মোট ড্রপশিপার",
    value: `${data?.total_dropshipper ?? 0}`,
    change: "",
    icon: <Truck className="w-6 h-6" />,
    color: "bg-teal-500",
  },
  {
    label: "মোট কর্মচারী",
    value: `${data?.total_admin ?? 0}`,
    change: "",
    icon: <Users className="w-6 h-6" />,
    color: "bg-indigo-500",
  },
];


const AdminDashboard = () => {
  const { data, isLoading, isError, error } = useGetAdminDashboardReportQuery();
  const stats = getStatCards(data?.data);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold">স্বাগতম, অ্যাডমিন!</h1>
        <p className="mt-1 text-gray-300 text-sm">
          প্ল্যাটফর্মের সকল তথ্য এক নজরে দেখুন এবং পরিচালনা করুন।
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-gray-100 rounded-xl border border-gray-200 p-5 animate-pulse h-32" />
          ))
        ) : isError ? (
          <div className="col-span-6 text-center text-red-500">ডেটা লোড করতে সমস্যা হয়েছে।</div>
        ) : (
          stats.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className={`flex items-center justify-between mb-3`}>
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                  {card.icon}
                </div>
                {card.change && (
                  <span className="flex items-center text-xs font-medium text-green-600">
                    <ArrowUpRight className="w-3 h-3" />
                    {card.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Order Summary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
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
              <Store className="w-4 h-4" />
              ভেন্ডর অনুমোদন
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition">
              <ClipboardList className="w-4 h-4" />
              অর্ডার পরিচালনা
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition">
              <DollarSign className="w-4 h-4" />
              পেমেন্ট রিপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">সাম্প্রতিক অর্ডার</h3>
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
        </div>
      </div>

      {/* Recent Vendors Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">সাম্প্রতিক ভেন্ডর রেজিস্ট্রেশন</h3>
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">এখনো কোনো ভেন্ডর রেজিস্টার করেননি।</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
