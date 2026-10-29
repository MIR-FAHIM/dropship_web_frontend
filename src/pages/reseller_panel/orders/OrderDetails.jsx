import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderDetailsQuery, usePayAdvanceMutation, useCheckAdvanceRequirementQuery } from "../../../redux/features/order";
import { Wallet, X } from "lucide-react";
import { imgBaseUrl } from "../../../../config";
import {
  FaArrowLeft, FaBoxOpen, FaUser, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaStickyNote, FaChartLine, FaCheckCircle, FaClock,
} from "react-icons/fa";
import { Truck, Copy, Check, Search, ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminBasePrice,
  getResellerProfit,
  getVendorPrice,
  toNumber,
} from "../../../utils/pricing.utils";

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

const getOrderItemPricing = (item = {}) => {
  const qty = Number(item?.qty || 1);
  const vendorPrice = getVendorPrice(item);
  const adminPrice = getAdminBasePrice(item);
  const lineUnitPrice = qty > 0 ? Number(item?.line_total || 0) / qty : 0;
  const sellingPrice = toNumber(item?.reseller_price ?? item?.selling_price ?? lineUnitPrice, adminPrice);

  return {
    qty,
    vendorPrice,
    sellingPrice,
    lineTotal: sellingPrice * qty,
    resellerProfit: getResellerProfit({ resellerPrice: sellingPrice, adminPrice, qty }),
  };
};

const getStatusName = (status) => {
  if (!status) return "";
  if (typeof status === "string") return status;
  return status?.name || "";
};

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
  const [payAdvance, { isLoading: isPayingAdvance }] = usePayAdvanceMutation();
  const userId = localStorage.getItem("userId");
  const { data: advanceReqData } = useCheckAdvanceRequirementQuery(userId, { skip: !userId });
  const availableWalletBalance = Number(advanceReqData?.data?.available_wallet_balance ?? 0);

  const [showPayAdvanceModal, setShowPayAdvanceModal] = useState(false);
  const [advancePayMethod, setAdvancePayMethod] = useState("wallet");
  const [mfsMethod, setMfsMethod] = useState("bkash");
  const [mfsTrxId, setMfsTrxId] = useState("");
  const [mfsSenderPhone, setMfsSenderPhone] = useState("");

  const handlePayAdvanceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (advancePayMethod === "wallet") {
        const requiredAmount = Number(order?.advance_amount || 130);
        if (availableWalletBalance < requiredAmount) {
          toast.error("ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। আপনার ব্যালেন্স ৳" + availableWalletBalance + ", প্রয়োজন ৳" + requiredAmount);
          return;
        }
        await payAdvance({ id: order.id, pay_from_wallet: true, amount: requiredAmount }).unwrap();
        toast.success("ওয়ালেট থেকে অগ্রিম পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!");
        setShowPayAdvanceModal(false);
      } else {
        if (!mfsTrxId.trim()) {
          toast.error("অনুগ্রহ করে Trx ID দিন");
          return;
        }
        await payAdvance({
          id: order.id,
          payment_method: mfsMethod,
          trx_id: mfsTrxId.trim(),
          sender_phone: mfsSenderPhone.trim(),
          amount: Number(order?.advance_amount || 130),
        }).unwrap();
        toast.success("অগ্রিম পেমেন্ট সাবমিট হয়েছে। অ্যাডমিন ভেরিফিকেশনের জন্য অপেক্ষা করুন।");
        setShowPayAdvanceModal(false);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "অগ্রিম পেমেন্ট করতে সমস্যা হয়েছে");
    }
  };
  const order = data?.data;

  const [copiedConsignment, setCopiedConsignment] = useState(false);

  const deliveryInfo = order?.delivery_information;
  const consignmentId =
    deliveryInfo?.consignment_id ||
    order?.consignment_id ||
    order?.carry_bee_draft?.consignment_id ||
    order?.tracking_number ||
    order?.tracking_code ||
    deliveryInfo?.tracking_number;

  const handleCopyConsignment = async (e) => {
    e?.stopPropagation?.();
    if (!consignmentId) return;
    try {
      await navigator.clipboard.writeText(consignmentId);
      setCopiedConsignment(true);
      toast.success("Consignment ID কপি করা হয়েছে!");
      setTimeout(() => setCopiedConsignment(false), 2000);
    } catch {
      toast.error("Consignment ID কপি করতে সমস্যা হয়েছে");
    }
  };

  const handleTrackOrder = (e) => {
    e?.stopPropagation?.();
    if (!consignmentId) return;
    navigate(`/app/track-order?consignment_id=${encodeURIComponent(consignmentId)}`);
  };

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

  const statusName = getStatusName(order?.status);
  const st = getStatus(statusName);
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
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-xs text-gray-400">{order?.order_number ? `#${order.order_number}` : `ID: ${id}`}</p>
              {consignmentId && (
                <button
                  type="button"
                  onClick={handleTrackOrder}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-mono font-bold border border-indigo-200 transition cursor-pointer"
                  title="রিয়েল-টাইম ট্র্যাকিং দেখুন"
                >
                  <Truck className="w-3 h-3 text-indigo-500" />
                  <span>CID: {consignmentId}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${st.pill}`}>
              {statusName || "—"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getPayStyle(order?.payment_status)}`}>
              {order?.payment_status || "—"}
            </span>
          </div>
        </div>

        {/* ── Advance Payment Alert / Badge ── */}
        {order?.advance_status === "pending" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 mb-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                  <FaClock className="text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-amber-900">অগ্রিম ডেলিভারি চার্জ বাকি রয়েছে</p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold">
                      {order?.advance_trx_id ? "ভেরিফিকেশন অপেক্ষমাণ" : "পরিশোধ বাকি"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    {order?.advance_trx_id
                      ? "আপনি " + (order.advance_payment_method?.toUpperCase() || "MFS") + " মাধ্যমে Trx ID: " + order.advance_trx_id + " সাবমিট করেছেন। অ্যাডমিন কর্তৃক যাচাই সম্পন্ন হলে অর্ডারটি প্রসেসিংয়ে যাবে।"
                      : "এই অর্ডারের জন্য ৳" + (order?.advance_amount || 130) + " অগ্রিম পরিশোধ করতে হবে।"}
                  </p>
                </div>
              </div>
              {!order?.advance_trx_id && (
                <button
                  type="button"
                  onClick={() => setShowPayAdvanceModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition shrink-0"
                >
                  অগ্রিম পরিশোধ করুন (Pay Advance)
                </button>
              )}
            </div>
          </div>
        )}

        {order?.advance_status === "approved" && Number(order?.advance_amount) > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 mb-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FaCheckCircle className="text-sm" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  অগ্রিম পরিশোধিত: {money(order.advance_amount)} ({order.advance_payment_method?.toUpperCase() || "PAID"})
                </p>
                {order.advance_trx_id && (
                  <p className="text-[11px] text-emerald-700 font-mono mt-0.5">Trx ID: {order.advance_trx_id}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold">কাস্টমার প্রদেয় COD</p>
              <p className="text-sm font-black text-gray-800">{money(order.remaining_cod)}</p>
            </div>
          </div>
        )}

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

        {/* ── Consignment & Real Time Delivery Tracking Card ── */}
        {consignmentId && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-indigo-100/70 border border-indigo-200/80 p-4 mb-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Live Delivery Tracking
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real Time
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Consignment ID:</span>
                    <button
                      type="button"
                      onClick={handleTrackOrder}
                      className="font-mono font-bold text-sm text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-xs transition hover:underline cursor-pointer"
                      title="ট্র্যাক পেজে যান"
                    >
                      {consignmentId}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyConsignment}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition shadow-xs cursor-pointer"
                      title="Consignment ID কপি করুন"
                    >
                      {copiedConsignment ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-700">কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-600" />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleTrackOrder}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition cursor-pointer"
                  title="রিয়েল টাইম ডেলিভারি স্ট্যাটাস ট্র্যাক করুন"
                >
                  <Search className="w-4 h-4" />
                  <span>ট্র্যাক করুন (Track Order)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Delivery Summary info */}
            <div className="mt-3 pt-3 border-t border-indigo-200/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {(deliveryInfo?.collectable_amount != null || order?.remaining_cod != null || grand > 0) && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Collectable</span>
                  <span className="font-bold text-gray-900">
                    {money(deliveryInfo?.collectable_amount ?? order?.remaining_cod ?? grand)}
                  </span>
                </div>
              )}
              {(deliveryInfo?.merchant_order_id || order?.order_number) && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Merchant Order</span>
                  <span className="font-medium text-gray-800">
                    {deliveryInfo?.merchant_order_id || order?.order_number}
                  </span>
                </div>
              )}
              {(deliveryInfo?.recipient_phone || order?.customer_phone) && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Recipient Phone</span>
                  <span className="font-medium text-gray-800">
                    {deliveryInfo?.recipient_phone || order?.customer_phone}
                  </span>
                </div>
              )}
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
              {consignmentId && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-gray-100">
                  <span className="text-gray-500">Consignment ID</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleTrackOrder}
                      className="font-mono font-bold text-indigo-600 hover:text-indigo-800 underline decoration-dotted cursor-pointer"
                      title="ট্র্যাক পেজে যান"
                    >
                      {consignmentId}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyConsignment}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition cursor-pointer"
                      title="Consignment ID কপি করুন"
                    >
                      {copiedConsignment ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
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
              const pricing = getOrderItemPricing(item);
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
                    {item.product_attribute?.attribute?.name && item.product_attribute?.value?.value && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold border border-indigo-200">
                        {item.product_attribute.attribute.name}: {item.product_attribute.value.value}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">Qty: <b className="text-gray-700">{item.qty}</b></span>
                      <span className="text-xs text-gray-500">Selling: {money(pricing.sellingPrice)} / pc</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px] text-gray-500">
                      <span>Vendor: <b>{money(pricing.vendorPrice)}</b></span>
                      <span>Profit: <b className="text-green-600">{money(pricing.resellerProfit)}</b></span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${ist.pill}`}>{item.status}</span>
                      <span className="font-black text-indigo-700 text-sm">{money(pricing.lineTotal)}</span>
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
                  {["Product", "Qty", "Vendor Price", "Selling Price", "Reseller Profit", "Line Total"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order?.items?.map((item) => {
                  const imgSrc = item?.product?.primary_image?.file_name
                    ? `${imgBaseUrl}/${item.product.primary_image.file_name}`
                    : null;
                  const pricing = getOrderItemPricing(item);
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
                            {item.product_attribute?.attribute?.name && item.product_attribute?.value?.value && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold border border-indigo-200">
                                {item.product_attribute.attribute.name}: {item.product_attribute.value.value}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700">{item.qty}</td>
                      <td className="px-4 py-3 text-gray-600">{money(pricing.vendorPrice)}</td>
                      <td className="px-4 py-3 text-gray-600">{money(pricing.sellingPrice)}</td>
                      <td className="px-4 py-3 font-bold text-green-600">{money(pricing.resellerProfit)}</td>
                      <td className="px-4 py-3 font-black text-indigo-700">{money(pricing.lineTotal)}</td>
             
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

        {/* ── Pay Advance Modal ── */}
        {showPayAdvanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowPayAdvanceModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-gray-900 mb-1">অগ্রিম ডেলিভারি চার্জ পরিশোধ</h3>
              <p className="text-xs text-gray-500 mb-4">
                অর্ডার #{order?.order_number || order?.id}-এর ডেলিভারি ফি: <strong>৳{order?.advance_amount || 130}</strong>
              </p>

              <form onSubmit={handlePayAdvanceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdvancePayMethod("wallet")}
                    className={"p-3 rounded-xl border text-left transition " + (advancePayMethod === "wallet" ? "border-indigo-600 bg-indigo-50/50 text-indigo-900" : "border-gray-200 bg-white text-gray-700")}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Wallet className="w-4 h-4 text-indigo-600" />
                      ওয়ালেট ব্যালেন্স
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">উপলব্ধ: ৳{availableWalletBalance}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdvancePayMethod("mfs")}
                    className={"p-3 rounded-xl border text-left transition " + (advancePayMethod === "mfs" ? "border-indigo-600 bg-indigo-50/50 text-indigo-900" : "border-gray-200 bg-white text-gray-700")}
                  >
                    <div className="font-bold text-xs">bKash Payment / MFS</div>
                    <p className="text-[11px] text-gray-500 mt-1">ম্যানুয়াল বিকাশ পেমেন্ট</p>
                  </button>
                </div>

                {advancePayMethod === "wallet" ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    {availableWalletBalance >= Number(order?.advance_amount || 130) ? (
                      <p className="text-emerald-700 font-medium">
                        ✓ আপনার ওয়ালেট থেকে ৳{order?.advance_amount || 130} তাৎক্ষণিকভাবে কেটে নেওয়া হবে এবং অর্ডার নিশ্চিত হবে।
                      </p>
                    ) : (
                      <p className="text-red-600 font-medium">
                        ⚠️ পর্যাপ্ত ওয়ালেট ব্যালেন্স নেই (উপলব্ধ: ৳{availableWalletBalance})। অনুগ্রহ করে bKash/Nagad নির্বাচন করুন।
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <p className="text-gray-700">
                        আমাদের বিকাশ নম্বরে <strong>৳{order?.advance_amount || 130}</strong> পেমেন্ট করুন: <span className="font-mono font-bold text-indigo-600 text-sm">01941606310</span>
                      </p>
                      <p className="text-red-600 font-bold text-[11px] mt-1">
                        ⚠️ শুধুমাত্র বিকাশ পেমেন্ট (Bkash Payment ✅) করুন। সেন্ড মানি (Send money ❌) করবেন না।
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">পেমেন্ট মেথড</label>
                        <select
                          value={mfsMethod}
                          onChange={(e) => setMfsMethod(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs"
                        >
                          <option value="bkash">bKash</option>
                          <option value="nagad">Nagad</option>
                          <option value="rocket">Rocket</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">সেন্ডার নম্বর</label>
                        <input
                          type="text"
                          placeholder="01XXXXXXXXX"
                          value={mfsSenderPhone}
                          onChange={(e) => setMfsSenderPhone(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Transaction ID (Trx ID)</label>
                      <input
                        type="text"
                        placeholder="যেমন: BKL998811"
                        value={mfsTrxId}
                        onChange={(e) => setMfsTrxId(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayAdvanceModal(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isPayingAdvance || (advancePayMethod === "wallet" && availableWalletBalance < Number(order?.advance_amount || 130))}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow"
                  >
                    {isPayingAdvance ? "প্রসেসিং..." : "পেমেন্ট নিশ্চিত করুন"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
