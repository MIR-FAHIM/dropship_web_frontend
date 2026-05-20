import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderDetailsQuery } from "../../../redux/features/order";
import { imgBaseUrl } from "../../../../config";
import {
  FaArrowLeft, FaBoxOpen, FaUser, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaStickyNote, FaChartLine, FaCheckCircle, FaClock,
} from "react-icons/fa";

/* ── helpers ── */
const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

const fmt = (v) => {
  if (!v) return "N/A";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
};

const STATUS_STYLES = {
  pending:    { pill: "bg-yellow-100 text-yellow-700 border-yellow-200",  dot: "bg-yellow-400" },
  processing: { pill: "bg-blue-100 text-blue-700 border-blue-200",        dot: "bg-blue-400" },
  shipped:    { pill: "bg-indigo-100 text-indigo-700 border-indigo-200",  dot: "bg-indigo-400" },
  delivered:  { pill: "bg-green-100 text-green-700 border-green-200",     dot: "bg-green-500" },
  completed:  { pill: "bg-green-100 text-green-700 border-green-200",     dot: "bg-green-500" },
  cancelled:  { pill: "bg-red-100 text-red-600 border-red-200",           dot: "bg-red-400" },
};
const getStatus = (s) =>
  STATUS_STYLES[String(s || "").toLowerCase()] ??
  { pill: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };

const PAY_STYLES = {
  paid:    "bg-green-100 text-green-700 border-green-200",
  unpaid:  "bg-red-100 text-red-600 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
};
const getPayStyle = (s) =>
  PAY_STYLES[String(s || "").toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";

/* ── InfoRow ── */
const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-start gap-3">
    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent ?? "bg-indigo-50 text-indigo-500"}`}>
      <Icon className="text-xs" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value || "N/A"}</p>
    </div>
  </div>
);

/* ── main ── */
const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetOrderDetailsQuery(id);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Error: {error?.message}
      </div>
    );
  }

  const st = getStatus(order?.status);
  const subtotal = Number(order?.subtotal ?? 0);
  const profit   = Number(order?.reseller_profit ?? 0);
  const delivery = Number(order?.shipping_fee ?? 0);
  const grand    = Number(order?.grand_total ?? order?.total ?? 0);
  const profitMargin = grand > 0 ? ((profit / grand) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-gray-800 leading-tight">Order Details</h1>
            <p className="text-xs text-gray-400">{order?.order_number ? `#${order.order_number}` : `ID: ${id}`}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${st.pill}`}>
              {order?.status || "—"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getPayStyle(order?.payment_status)}`}>
              {order?.payment_status || "—"}
            </span>
          </div>
        </div>

        {/* ── Profit Banner ── */}
        {profit > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-400 p-4 mb-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs text-white/80 font-semibold">Your Profit on this Order</p>
                <p className="text-2xl font-black text-white">+{money(profit)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">Margin</p>
              <p className="text-xl font-black text-white">{profitMargin}%</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 mb-4">

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-1.5">
              <FaUser className="text-indigo-400" /> Customer Info
            </h2>
            <div className="flex flex-col gap-3">
              <InfoRow icon={FaUser}        label="Name"    value={order?.customer_name}    accent="bg-indigo-50 text-indigo-500" />
              <InfoRow icon={FaPhone}       label="Phone"   value={order?.customer_phone}   accent="bg-blue-50 text-blue-500" />
              <InfoRow icon={FaMapMarkerAlt} label="Address" value={order?.shipping_address} accent="bg-pink-50 text-pink-500" />
              <InfoRow icon={FaMapMarkerAlt} label="Zone"    value={order?.zone}             accent="bg-orange-50 text-orange-500" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-1.5">
              <FaBoxOpen className="text-indigo-400" /> Order Summary
            </h2>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-800">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Charge</span>
                <span className="font-bold text-gray-800">{money(delivery)}</span>
              </div>
              <div className="border-t border-dashed border-gray-100 pt-2 flex justify-between">
                <span className="font-black text-gray-800">Grand Total</span>
                <span className="font-black text-indigo-700 text-base">{money(grand)}</span>
              </div>
              {profit > 0 && (
                <div className="flex justify-between bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                  <span className="font-black text-green-700 text-xs">Your Profit</span>
                  <span className="font-black text-green-600">+{money(profit)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>Payment Method</span>
                <span className="font-semibold text-gray-600 capitalize">{order?.payment_method || "—"}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col gap-2">
              <InfoRow icon={FaCalendarAlt} label="Placed on" value={fmt(order?.created_at)} accent="bg-purple-50 text-purple-400" />
              {order?.note && (
                <InfoRow icon={FaStickyNote} label="Note" value={order.note} accent="bg-yellow-50 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-gray-700 flex items-center gap-1.5">
              <FaBoxOpen className="text-indigo-400" /> Order Items
            </h2>
            <span className="text-xs font-bold text-gray-400">
              {order?.items?.length || 0} item{order?.items?.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {order?.items?.map((item) => {
              const imgSrc = item?.product?.primary_image?.file_name
                ? `${imgBaseUrl}/${item.product.primary_image.file_name}`
                : null;
              const ist = getStatus(item.status);
              return (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.product_name} className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <FaBoxOpen className="text-indigo-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{item.product_name || "—"}</p>
                    {item.sku && <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">Qty: <b className="text-gray-700">{item.qty}</b></span>
                      <span className="text-xs text-gray-500">{money(item.unit_price)} / pc</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${ist.pill}`}>{item.status}</span>
                      <span className="font-black text-indigo-700 text-sm">{money(item.line_total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Product", "Qty", "Unit Price", "Line Total", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order?.items?.map((item) => {
                  const imgSrc = item?.product?.primary_image?.file_name
                    ? `${imgBaseUrl}/${item.product.primary_image.file_name}`
                    : null;
                  const ist = getStatus(item.status);
                  return (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {imgSrc ? (
                            <img src={imgSrc} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                              <FaBoxOpen className="text-indigo-300 text-xs" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800">{item.product_name || "—"}</p>
                            {item.sku && <p className="text-[10px] text-gray-400">SKU: {item.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-gray-600">{money(item.unit_price)}</td>
                      <td className="px-4 py-3 font-black text-indigo-700">{money(item.line_total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${ist.pill}`}>{item.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status History */}
        {order?.status_history?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-1.5">
              <FaClock className="text-indigo-400" /> Status History
            </h2>
            <div className="relative pl-5">
              {/* vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100 rounded-full" />

              <div className="flex flex-col gap-4">
                {order.status_history.map((entry, i) => {
                  const isCurrent = i === 0;
                  const est = getStatus(entry?.status?.name ?? entry?.status_id);
                  return (
                    <div key={entry.id ?? i} className="flex gap-3 relative">
                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border-2 border-white shadow-sm ${isCurrent ? est.dot : "bg-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-gray-800">
                            {entry?.status?.name || entry?.status_id || "Status update"}
                          </p>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wide border border-green-200 flex items-center gap-1">
                              <FaCheckCircle className="text-[9px]" /> Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(entry?.created_at)}</p>
                        {entry?.note && (
                          <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg px-2 py-1">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderDetailsPage;
