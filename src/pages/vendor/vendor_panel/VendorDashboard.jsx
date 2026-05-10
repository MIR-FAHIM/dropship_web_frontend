import React from "react";
import {
  ShoppingBag, Package, TrendingUp, DollarSign, ClipboardList, Clock,
  CheckCircle2, XCircle, AlertTriangle, BarChart2, Loader2, Star,
} from "lucide-react";
import { useGetVendorDashboardReportQuery , useGetVendorIdQuery} from "../../../redux/features/vendor_api";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const userId = getFromLocalstorage("userId");
    const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
    const vendorId = vendorIdData?.data?.vendor_id;
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useGetVendorDashboardReportQuery(vendorId, {
    skip: !vendorId,
  });

  const report = reportData?.data;
  const vendor = report?.vendor;
  const products = report?.products;
  const orders = report?.orders;
  const sales = report?.sales;
  const topProducts = report?.top_selling_products || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Build order status map for easy lookup
  const orderStatusMap = {};
  (orders?.by_status || []).forEach((s) => {
    orderStatusMap[s.delivery_status] = s.count;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold">
          স্বাগতম, {vendor?.shop_name || "ভেন্ডর"}!
        </h1>
        <p className="mt-1 text-blue-100 text-sm">
          {vendor?.owner_name && <span className="font-medium">{vendor.owner_name} • </span>}
          {vendor?.shop_type && <span>{vendor.shop_type} • </span>}
          আপনার ড্যাশবোর্ডে সকল তথ্য এক নজরে দেখুন।
        </p>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white mb-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800">৳{sales?.total ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">মোট বিক্রয়</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{orders?.total ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">মোট অর্ডার</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white mb-3">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{products?.total ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">মোট পণ্য</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-800">৳{sales?.this_month ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">এই মাসের আয়</p>
        </div>
      </div>

      {/* Sales Breakdown Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "আজকের বিক্রয়", value: `৳${sales?.today ?? 0}`, color: "text-green-600 bg-green-50" },
          { label: "গতকালের বিক্রয়", value: `৳${sales?.yesterday ?? 0}`, color: "text-blue-600 bg-blue-50" },
          { label: "গত ৭ দিন", value: `৳${sales?.last_7_days ?? 0}`, color: "text-purple-600 bg-purple-50" },
          { label: "গত মাস", value: `৳${sales?.last_month ?? 0}`, color: "text-orange-600 bg-orange-50" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-4 ${item.color.split(" ")[1]}`}>
            <p className={`text-xl font-bold ${item.color.split(" ")[0]}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Order Status + Product Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">অর্ডার সারসংক্ষেপ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{orderStatusMap["pending"] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">পেন্ডিং</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <ClipboardList className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{orderStatusMap["processing"] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">প্রসেসিং</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{orderStatusMap["delivered"] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">সম্পন্ন</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{orderStatusMap["cancelled"] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">বাতিল</p>
            </div>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">পণ্যের অবস্থা</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{products?.published ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">পাবলিশড</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Package className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{products?.approved ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">অনুমোদিত</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{products?.low_stock ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">কম স্টক</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-800">{products?.out_of_stock ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">স্টক শেষ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            গত ৭ দিনের বিক্রয়
          </h3>
          <div className="space-y-3">
            {(sales?.daily_breakdown || []).map((day) => {
              const maxSell = Math.max(...(sales?.daily_breakdown || []).map((d) => d.sell), 1);
              const pct = Math.round((day.sell / maxSell) * 100);
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 shrink-0">
                    {new Date(day.date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-14 text-right">৳{day.sell}</span>
                </div>
              );
            })}
            {(!sales?.daily_breakdown || sales.daily_breakdown.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">কোনো তথ্য পাওয়া যায়নি।</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            শীর্ষ পণ্য
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      স্টক: {p.current_stock ?? 0} • মূল্য: ৳{p.unit_price}
                    </p>
                    {p.num_of_sale != null && (
                      <p className="text-xs text-green-600 font-medium">{p.num_of_sale} বিক্রি</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">এখনো কোনো বিক্রয় নেই।</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          মাসিক বিক্রয় বিশ্লেষণ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(sales?.monthly_breakdown || []).map((m) => {
            const [year, month] = m.month.split("-");
            const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("bn-BD", { month: "short", year: "2-digit" });
            return (
              <div key={m.month} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-800">৳{m.sell}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            );
          })}
          {(!sales?.monthly_breakdown || sales.monthly_breakdown.length === 0) && (
            <p className="text-sm text-gray-400 col-span-6 text-center py-4">কোনো তথ্য পাওয়া যায়নি।</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">দ্রুত কার্যক্রম</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/vendor-panel/products/create")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition"
          >
            <Package className="w-4 h-4" />
            নতুন পণ্য যোগ করুন
          </button>
          <button
            onClick={() => navigate("/vendor-panel/orders")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition"
          >
            <ClipboardList className="w-4 h-4" />
            অর্ডার দেখুন
          </button>
          <button
            onClick={() => navigate("/vendor-panel/products")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            পণ্য তালিকা
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
