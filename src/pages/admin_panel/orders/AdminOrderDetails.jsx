import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  Clock,
  Truck,
  ClipboardList,
} from "lucide-react";
import {
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatusSummaryQuery,
} from "../../../redux/features/order";

const statusColorMap = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Processing: "bg-blue-100 text-blue-700 border-blue-200",
  Shipped: "bg-purple-100 text-purple-700 border-purple-200",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-200",
  Delivered: "bg-teal-100 text-teal-700 border-teal-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Returned: "bg-pink-100 text-pink-700 border-pink-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
};

const paymentColors = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetOrderDetailsQuery(id);
  const { data: summaryData } = useGetOrderStatusSummaryQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const order = data?.data || null;
  const statusList = summaryData?.data || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) =>
    `৳${Number(amount || 0).toLocaleString("bn-BD")}`;

  const getCurrentStatusName = () => {
    if (!order) return "";
    // status can be a string ID or an object
    if (typeof order.status === "object" && order.status?.name)
      return order.status.name;
    // If it's a string ID, look it up from statusList
    const found = statusList.find((s) => String(s.id) === String(order.status));
    return found?.name || order.status;
  };

  const getCurrentStatusId = () => {
    if (!order) return "";
    if (typeof order.status === "object" && order.status?.id)
      return order.status.id;
    return order.status;
  };

  const handleStatusChange = async (newStatusId) => {
    const userId = localStorage.getItem("userId");
    try {
      await updateStatus({
        id: order.id,
        status_id: Number(newStatusId),
        changed_by: userId || undefined,
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-32 space-y-3">
        <ClipboardList className="w-14 h-14 text-red-300 mx-auto" />
        <p className="text-red-500 text-sm font-medium">
          অর্ডার লোড করতে সমস্যা হয়েছে।
        </p>
        <button
          onClick={refetch}
          className="text-sm text-red-600 underline hover:text-red-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  const statusName = getCurrentStatusName();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin-panel/orders")}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {order.order_number}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${
              statusColorMap[statusName] || "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {statusName}
          </span>
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
              paymentColors[order.payment_status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4" />
                অর্ডার আইটেম
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.product_name}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      <span>পরিমাণ: {item.qty}</span>
                      <span>একক মূল্য: {formatCurrency(item.unit_price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">
                      {formatCurrency(item.line_total)}
                    </p>
                    {Number(item.line_total_reseller_profit) > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">
                        মুনাফা: {formatCurrency(item.line_total_reseller_profit)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>শিপিং ফি</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>ডিসকাউন্ট</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>মোট</span>
                <span className="text-base">{formatCurrency(order.total)}</span>
              </div>
              {Number(order.reseller_profit) > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>রিসেলার মুনাফা</span>
                  <span>{formatCurrency(order.reseller_profit)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          {order.status_history?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  স্ট্যাটাস হিস্টোরি
                </h2>
              </div>
              <div className="px-5 py-4">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />
                  <div className="space-y-5">
                    {order.status_history.map((entry, idx) => {
                      const sName = entry.status?.name || "Unknown";
                      const colorClass =
                        statusColorMap[sName] || "bg-gray-100 text-gray-600 border-gray-200";
                      return (
                        <div key={entry.id} className="flex gap-4 relative">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 z-10 ${
                              idx === 0
                                ? "bg-red-500 border-red-500"
                                : "bg-white border-gray-300"
                            }`}
                          />
                          <div className="flex-1 -mt-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
                              >
                                {sName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(entry.created_at)}
                              </span>
                            </div>
                            {entry.note && (
                              <p className="text-xs text-gray-500 mt-1">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                স্ট্যাটাস পরিবর্তন
              </h2>
            </div>
            <div className="px-5 py-4">
              <select
                value={getCurrentStatusId()}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`w-full text-sm font-medium rounded-lg px-3 py-2.5 border border-gray-300 cursor-pointer focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isUpdating ? "opacity-50" : ""
                }`}
              >
                {statusList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {isUpdating && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  আপডেট হচ্ছে...
                </p>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                কাস্টমার তথ্য
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">
                    {order.customer_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">{order.customer_phone}</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 whitespace-pre-line">
                    {order.shipping_address}
                  </p>
                  {order.zone && (
                    <p className="text-xs text-gray-400 mt-1">
                      জোন: {order.zone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dropshipper Info */}
          {order.user_id && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  ড্রপশিপার
                </h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p>User ID: {order.user_id}</p>
              </div>
            </div>
          )}

          {/* Delivery Man */}
          {order.delivery_man && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  ডেলিভারি ম্যান
                </h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p>{order.delivery_man.name || "—"}</p>
              </div>
            </div>
          )}

          {/* Note */}
          {order.note && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">নোট</h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p>{order.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
