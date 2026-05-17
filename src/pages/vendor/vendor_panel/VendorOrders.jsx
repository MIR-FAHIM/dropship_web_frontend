import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Phone,
  MapPin,
  Eye,
} from "lucide-react";
import { useGetVendorIdQuery } from "../../../redux/features/vendor_api";
import { useVendorOrdersQuery } from "../../../redux/features/order";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";

const STATUS_CONFIG = {
  Pending:    { label: "পেন্ডিং",     cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Processing: { label: "প্রসেসিং",    cls: "bg-blue-100 text-blue-700 border-blue-200" },
  Confirmed:  { label: "কনফার্মড",    cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  Shipped:    { label: "শিপড",        cls: "bg-purple-100 text-purple-700 border-purple-200" },
  Delivered:  { label: "ডেলিভার্ড",  cls: "bg-green-100 text-green-700 border-green-200" },
  Cancelled:  { label: "বাতিল",       cls: "bg-red-100 text-red-700 border-red-200" },
  Returned:   { label: "রিটার্ন",     cls: "bg-orange-100 text-orange-700 border-orange-200" },
};

const getStatusConfig = (name) =>
  STATUS_CONFIG[name] || { label: name, cls: "bg-gray-100 text-gray-600 border-gray-200" };

const latestStatus = (order) => {
  if (order.status_history?.length) {
    return order.status_history[0].status?.name || "—";
  }
  return "—";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" });
};

const VendorOrders = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const userId = getFromLocalstorage("userId");
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
  const vendorId = vendorIdData?.data?.vendor_id;

  const { data, isLoading, isFetching } = useVendorOrdersQuery(
    { vendorId, page },
    { skip: !vendorId }
  );

  const pagination = data?.data;
  const orders = pagination?.data || [];
  const lastPage = pagination?.last_page || 1;
  const total = pagination?.total || 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">অর্ডার</h1>
        {total > 0 && (
          <span className="text-sm text-gray-500">মোট {total} টি অর্ডার</span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
            <p className="text-gray-400 text-xs mt-1">পণ্য তালিকাভুক্ত করলে অর্ডার আসতে শুরু করবে।</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">অর্ডার</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">কাস্টমার</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">পণ্য</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">স্ট্যাটাস</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">পেমেন্ট</th>
            
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">ডেলিভারি</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const statusName = latestStatus(order);
                    const statusCfg = getStatusConfig(statusName);
                    const delivery = order.delivery_information;

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 transition-colors ${isFetching ? "opacity-60" : ""}`}
                      >
                        {/* Order */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-medium text-gray-800 text-xs">{order.order_number}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs truncate max-w-[130px]">{order.customer_name}</p>
                          <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {order.customer_phone?.slice(0, -6)}
                              <span className="blur-sm select-none">{order.customer_phone?.slice(-6)}</span>
                            </span>
                          </div>
                          {order.zone && (
                            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span>{order.zone}</span>
                            </div>
                          )}
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-start gap-1">
                                <Package className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-xs leading-tight line-clamp-1 max-w-[150px]">
                                  {item.product_name}
                                </span>
                                <span className="text-gray-400 text-xs whitespace-nowrap">× {item.qty}</span>
                                <span className="text-gray-400 text-xs whitespace-nowrap">× {item.unit_price} TK</span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {order.payment_status === "paid" ? "পেইড" : "আনপেইড"}
                          </span>
                        </td>

                      

                        {/* Delivery */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {delivery ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <Truck className="w-3 h-3" />
                                <span>{delivery.consignment_id}</span>
                              </div>
                              <p className="text-gray-400 text-xs">COD: ৳{delivery.collectable_amount}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* View Details */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => navigate(`/vendor-panel/orders/${order.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            বিস্তারিত
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  পেজ {page} / {lastPage}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage || isFetching}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
