import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListOrdersByUserQuery } from "../../../redux/features/order";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import Pagination from "../../../components/shared/Pagination";
import { FaBoxOpen, FaChevronRight } from "react-icons/fa";

/* ── helpers ── */
const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

const STATUS_STYLES = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  completed:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  default:    "bg-gray-100 text-gray-600",
};
const statusStyle = (s) =>
  STATUS_STYLES[String(s).toLowerCase()] ?? STATUS_STYLES.default;

const PAY_STYLES = {
  paid:    "bg-green-100 text-green-700",
  unpaid:  "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
  default: "bg-gray-100 text-gray-600",
};
const payStyle = (s) =>
  PAY_STYLES[String(s).toLowerCase()] ?? PAY_STYLES.default;

const getStatusName = (status) => {
  if (!status) return "";
  if (typeof status === "string") return status;
  return status?.name || "";
};

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
};

/* ── component ── */
const Order = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const userId = getFromLocalstorage("userId") || 1;

  const { data: ordersData, error, isLoading } = useListOrdersByUserQuery({ userId, page });

  const orders = ordersData?.data?.data || [];
  const totalPages = ordersData?.data?.last_page || 1;

  const statuses = [
    "all",
    ...Array.from(new Set(orders.map((o) => getStatusName(o.status)).filter(Boolean))),
  ];
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => getStatusName(o.status).toLowerCase() === filter.toLowerCase());

  /* loading */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Error loading orders: {error?.data?.message || error?.message || "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <FaBoxOpen className="text-indigo-600 text-xl" />
          <h2 className="text-xl font-black text-gray-800">My Orders</h2>
          {orders.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {ordersData?.data?.total ?? orders.length}
            </span>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition
                ${filter === s
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <FaBoxOpen className="text-gray-300 text-5xl mx-auto mb-3" />
            <p className="text-gray-400 font-semibold">No orders found.</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards (hidden on md+) ── */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/app/orders-details/${order.id}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:scale-[0.99] transition"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{order.order_number || `#${order.id}`}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmt(order.created_at)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyle(getStatusName(order.status))}`}>
                      {getStatusName(order.status) || "—"}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500 text-xs">Customer</span>
                    <span className="font-semibold text-gray-700">{order.customer_name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500 text-xs">Phone</span>
                    <span className="font-semibold text-gray-700">{order.customer_phone || "—"}</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-indigo-700">{money(order.grand_total ?? order.total)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${payStyle(order.payment_status)}`}>
                        {order.payment_status || "—"}
                      </span>
                    </div>
                    <FaChevronRight className="text-gray-300 text-sm" />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table (hidden on <md) ── */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order", "Date", "Customer", "Phone", "Amount", "Profit", "Status", "Payment", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-indigo-50/30 transition cursor-pointer"
                      onClick={() => navigate(`/app/orders-details/${order.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{order.order_number || `#${order.id}`}</p>
                        <p className="text-[11px] text-gray-400">#{order.id}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(order.created_at)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{order.customer_name || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{order.customer_phone || "—"}</td>
                      <td className="px-4 py-3 font-black text-indigo-700 whitespace-nowrap">
                        {money(order.grand_total ?? order.total)}
                      </td>
                      <td className="px-4 py-3 font-black text-indigo-700 whitespace-nowrap">
                        {money(order.reseller_profit ?? order.reseller_profit)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyle(getStatusName(order.status))}`}>
                          {getStatusName(order.status) || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${payStyle(order.payment_status)}`}>
                          {order.payment_status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/app/orders-details/${order.id}`); }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition whitespace-nowrap"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={ordersData?.data?.current_page || 1}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
