import React, { useState, useMemo } from "react";
import { ClipboardList, Search, Eye, Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useListAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatusSummaryQuery,
} from "../../../redux/features/order";

const statusColorMap = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-teal-100 text-teal-700",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-pink-100 text-pink-700",
  Completed: "bg-green-100 text-green-700",
};

const paymentColors = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useListAllOrdersQuery();
  const { data: summaryData } = useGetOrderStatusSummaryQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.data?.data || [];
  const pagination = data?.data || {};
  const statusList = summaryData?.data || [];

  // Build tab data from API summary
  const tabs = useMemo(() => {
    const totalCount = statusList.reduce((sum, s) => sum + (s.orders_count || 0), 0);
    const allTab = { label: "সকল", value: "all", count: totalCount };
    const statusTabs = statusList.map((s) => ({
      label: s.name,
      value: s.id,
      count: s.orders_count || 0,
    }));
    return [allTab, ...statusTabs];
  }, [statusList]);

  // Helper to get status name from order
  const getStatusName = (order) => order.status?.name || "Unknown";
  const getStatusId = (order) => order.status?.id;

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== "all") {
      result = result.filter((o) => getStatusId(o) === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.includes(q) ||
          o.user?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, activeTab, searchQuery]);

  const handleStatusChange = async (orderId, newStatusId) => {
    const userId = localStorage.getItem("userId");
    try {
      await updateStatus({
        id: orderId,
        status_id: Number(newStatusId),
        changed_by: userId || undefined,
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `৳${Number(amount || 0).toLocaleString("bn-BD")}`;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">অর্ডার</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="অর্ডার নম্বর / নাম / ফোন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              activeTab === tab.value
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            {tab.label}{" "}
            <span
              className={
                activeTab === tab.value ? "text-red-400" : "text-gray-400"
              }
            >
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table / List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500 text-sm">অর্ডার লোড হচ্ছে...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <ClipboardList className="w-14 h-14 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 text-sm font-medium">
              অর্ডার লোড করতে সমস্যা হয়েছে।
            </p>
            <button
              onClick={refetch}
              className="mt-3 text-sm text-red-600 underline hover:text-red-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              কোনো অর্ডার পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-semibold">
                      অর্ডার নম্বর
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      কাস্টমার
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      ড্রপশিপার
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">তারিখ</th>
                    <th className="text-right py-3 px-4 font-semibold">মোট</th>
                    <th className="text-center py-3 px-4 font-semibold">
                      পেমেন্ট
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      স্ট্যাটাস
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer_phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {order.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <User className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 text-xs">
                                {order.user.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {order.user.phone}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-800">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            paymentColors[order.payment_status] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={getStatusId(order) || ""}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-red-500 ${
                            statusColorMap[getStatusName(order)] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => navigate(`/admin-panel/orders/${order.id}`)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        statusColorMap[getStatusName(order)] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getStatusName(order)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer_phone}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      {formatCurrency(order.total)}
                    </p>
                  </div>

                  {/* Dropshipper info */}
                  {order.user && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {order.user.name} &middot; {order.user.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          paymentColors[order.payment_status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                      <select
                        value={getStatusId(order) || ""}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="text-xs rounded-lg border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-500"
                      >
                        {statusList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => navigate(`/admin-panel/orders/${order.id}`)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      দেখুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <p>
            মোট {pagination.total} টি অর্ডারের মধ্যে {pagination.from}–
            {pagination.to} দেখানো হচ্ছে
          </p>
          <div className="flex gap-1">
            {pagination.links?.map((link, i) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => {
                  if (link.url) {
                    const pageNum = new URL(link.url).searchParams.get("page");
                    setPage(Number(pageNum));
                  }
                }}
                className={`px-3 py-1 rounded text-sm border transition ${
                  link.active
                    ? "bg-red-600 text-white border-red-600"
                    : link.url
                    ? "border-gray-300 hover:bg-gray-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
