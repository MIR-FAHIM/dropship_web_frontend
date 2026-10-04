import React, { useState } from "react";
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
import { toast } from "react-toastify";
import {
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatusSummaryQuery,
} from "../../../redux/features/order";
import { useGetVendorIdQuery, useGetVendorProfileQuery } from "../../../redux/features/vendor_api";
import AssignCarryBeeModal from "../../admin_panel/orders/carrybee_assign";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import {
  useLazyGetCarryBeeOrderDetailsQuery,
  useCreateCarryBeeOrderMutation,
} from "../../../redux/features/delivery_company/carrybeeStoreApi";

const CarryBeeDetailsPanel = ({ details, isLoading, isError, onRetry }) => {
  if (isLoading)
    return (
      <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...
      </div>
    );

  if (isError || !details)
    return (
      <div className="px-5 py-4 text-sm text-red-500 flex items-center justify-between">
        <span>ডেটা লোড করা যায়নি।</span>
        <button onClick={onRetry} className="text-xs text-red-600 underline">আবার চেষ্টা করুন</button>
      </div>
    );

  const statusColor =
    details.transfer_status === "Delivered"
      ? "bg-teal-100 text-teal-700 border-teal-200"
      : details.transfer_status === "Cancelled"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-yellow-100 text-yellow-700 border-yellow-200";

  return (
    <div className="border-t border-teal-100 px-5 py-4 space-y-3 text-sm bg-teal-50/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">লাইভ স্ট্যাটাস</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
          {details.transfer_status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
        <div>
          <p className="text-xs text-gray-400">Consignment ID</p>
          <p className="font-mono font-bold text-gray-900 text-xs tracking-wide">{details.consignment_id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Store ID</p>
          <p className="font-medium text-gray-700 text-xs">{details.store_id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">প্রাপক</p>
          <p className="font-medium text-gray-700">{details.recipient_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">ফোন</p>
          <p className="text-gray-700">
            {details.recipient_phone?.slice(0, 4)}
            <span className="blur-sm select-none">{details.recipient_phone?.slice(4, -4)}</span>
            {details.recipient_phone?.slice(-4)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">ঠিকানা</p>
          <p className="text-gray-700">{details.recipient_address}</p>
        </div>
      </div>

      <div className="border-t border-teal-100 pt-3 space-y-1.5">
        {/* <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">COD</span>
          <span className="font-medium text-gray-800">৳{details.collectable_amount}</span>
        </div> */}
        {/* <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">সংগৃহীত</span>
          <span>৳{details.collected_amount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">ডেলিভারি ফি</span>
          <span>৳{details.delivery_fee}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">COD ফি</span>
          <span>৳{details.cod_fee}</span>
        </div> */}
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">ডেলিভারি প্রচেষ্টা</span>
          <span>{details.attempt}</span>
        </div>
        <div className="flex justify-between text-gray-400 text-xs pt-1">
          <span>সর্বশেষ আপডেট</span>
          <span>{new Date(details.updated_at).toLocaleString("en-US")}</span>
        </div>
      </div>
    </div>
  );
};

const STATUS_COLOR = {
  Pending:           "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed:         "bg-indigo-100 text-indigo-700 border-indigo-200",
  Processing:        "bg-blue-100 text-blue-700 border-blue-200",
  Shipped:           "bg-purple-100 text-purple-700 border-purple-200",
  "Out for Delivery":"bg-orange-100 text-orange-700 border-orange-200",
  Delivered:         "bg-teal-100 text-teal-700 border-teal-200",
  Cancelled:         "bg-red-100 text-red-700 border-red-200",
  Returned:          "bg-pink-100 text-pink-700 border-pink-200",
  Completed:         "bg-green-100 text-green-700 border-green-200",
};

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("bn-BD", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const currency = (v) => `৳${Number(v || 0).toLocaleString("en-US")}`;

const DEFAULT_STATUS_LIST = [
  { id: 1, name: "Pending", bn: "পেন্ডিং" },
  { id: 2, name: "Confirmed", bn: "কনফার্মড" },
  { id: 3, name: "Processing", bn: "প্রসেসিং" },
  { id: 4, name: "Shipped", bn: "শিপড" },
  { id: 5, name: "Out for Delivery", bn: "আউট ফর ডেলিভারি" },
  { id: 6, name: "Delivered", bn: "ডেলিভার্ড" },
  { id: 7, name: "Cancelled", bn: "বাতিল" },
  { id: 8, name: "Returned", bn: "রিটার্ন" },
  { id: 9, name: "Completed", bn: "সম্পন্ন" },
];

const VendorOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetOrderDetailsQuery(id);
  const order = data?.data || null;
  const [showCarryBeeDetails, setShowCarryBeeDetails] = useState(false);
  const [carryBeeOpen, setCarryBeeOpen] = useState(false);
  const [fetchCarryBeeDetails, { data: cbDetailsData, isLoading: cbDetailsLoading, isError: cbDetailsError }] =
    useLazyGetCarryBeeOrderDetailsQuery();
  const cbDetails = cbDetailsData?.data?.data;

  const [createCarryBeeOrder, { isLoading: readySubmitting }] = useCreateCarryBeeOrderMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  const userId = getFromLocalstorage("userId");
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
  const vendorId = vendorIdData?.data?.vendor_id || order?.vendor_id || order?.vendor?.id;
  const { data: vendorProfileData } = useGetVendorProfileQuery(vendorId, {
    skip: !vendorId,
  });
  const vendorProfile = vendorProfileData?.data;

  const hasOwnDeliveryAccount = Boolean(
    vendorProfile?.has_own_delivery_account === true ||
    vendorProfile?.has_own_delivery_account === 1 ||
    vendorProfile?.has_own_delivery_account === "1" ||
    vendorProfile?.has_own_delivery_account === "true" ||
    order?.vendor?.has_own_delivery_account === true ||
    order?.vendor?.has_own_delivery_account === 1 ||
    order?.vendor?.has_own_delivery_account === "1" ||
    order?.vendor?.has_own_delivery_account === "true"
  );

  const { data: summaryData } = useGetOrderStatusSummaryQuery(undefined, {
    skip: !hasOwnDeliveryAccount,
  });
  const statusList = summaryData?.data?.length ? summaryData.data : DEFAULT_STATUS_LIST;

  const getCurrentStatusId = () => {
    if (!order) return "";
    if (typeof order.status === "object" && order.status?.id) return order.status.id;
    if (order.status_id) return order.status_id;
    if (order.status_history?.length && order.status_history[0].status?.id) {
      return order.status_history[0].status.id;
    }
    const found = statusList.find(
      (s) => s.name?.toLowerCase() === String(order.status).toLowerCase()
    );
    return found?.id || order.status || "";
  };

  const handleStatusChange = async (newStatusId) => {
    try {
      await updateStatus({
        id: order.id,
        status_id: Number(newStatusId),
        changed_by: userId || undefined,
      }).unwrap();
      toast.success("অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!");
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err?.data?.message || "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।");
    }
  };

  const handleReadyForCarryBee = async () => {
    const confirmed = window.confirm(`Mark order ${order.order_number} as ready for CarryBee?`);
    if (!confirmed) return;
    try {
      const vendorId = String(order.vendor_id ?? "");
      const { id, created_at, updated_at, ...draftPayload } = order.carry_bee_draft;
      await createCarryBeeOrder({ vendorId, ...draftPayload }).unwrap();
      await updateStatus({ id: order.id, status_id: 3 });
      toast.success("Order successfully submitted to CarryBee!");
      window.location.reload();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit order to CarryBee.");
    }
  };

  const handleShowCarryBeeDetails = () => {
    if (!showCarryBeeDetails && order?.delivery_information) {
      fetchCarryBeeDetails({
        vendorId: order.delivery_information.delivery_company_id,
        consignmentId: order.delivery_information.consignment_id,
      });
    }
    setShowCarryBeeDetails((p) => !p);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center py-32 space-y-3">
        <ClipboardList className="w-14 h-14 text-red-300 mx-auto" />
        <p className="text-red-500 text-sm font-medium">অর্ডার লোড করা যায়নি।</p>
        <button onClick={refetch} className="text-sm text-red-600 underline hover:text-red-700">
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  const latestStatusName = order.status_history?.[0]?.status?.name || "—";
  const statusCls = STATUS_COLOR[latestStatusName] || "bg-gray-100 text-gray-600 border-gray-200";
  const delivery = order.delivery_information;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/vendor-panel/orders")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{order.order_number}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{fmt(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusCls}`}>
            {latestStatusName}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            order.payment_status === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {order.payment_status === "paid" ? "পেইড" : "আনপেইড"}
          </span>
          {hasOwnDeliveryAccount && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Own Delivery
            </span>
          )}
          {hasOwnDeliveryAccount && (
            delivery ? (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full">
                <Truck className="w-3.5 h-3.5" /> CarryBee Assigned
              </span>
            ) : order.carry_bee_draft != null ? (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-full">
                <Truck className="w-3.5 h-3.5" /> CarryBee Draft Pending
              </span>
            ) : (
              <button
                onClick={() => setCarryBeeOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-full transition shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" /> Assign CarryBee
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800">পণ্যসমূহ</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product_name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      <span>পরিমাণ: {item.qty}</span>
                      <span>একক মূল্য: {currency(item.unit_price)}</span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-1 bg-gray-50 rounded px-2 py-1 whitespace-pre-line">{item.note}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-800">{currency(item.unit_price)}</p>
                    {item.shop?.shop_name && (
                      <p className="text-xs text-gray-400 mt-0.5">শপ: {item.shop.shop_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            {/* <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল</span>
                <span>{currency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>শিপিং চার্জ</span>
                <span>{currency(order.shipping_fee)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>ছাড়</span>
                  <span>-{currency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 text-base">
                <span>মোট</span>
                <span>{currency(order.total)}</span>
              </div>
            </div> */}
          </div>

          {/* Status History */}
          {order.status_history?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800">স্ট্যাটাস ইতিহাস</h2>
              </div>
              <div className="px-5 py-5">
                <div className="relative">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />
                  <div className="space-y-5">
                    {order.status_history.map((entry, idx) => {
                      const sName = entry.status?.name || "Unknown";
                      const cls = STATUS_COLOR[sName] || "bg-gray-100 text-gray-600 border-gray-200";
                      return (
                        <div key={entry.id} className="flex gap-4 relative">
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 z-10 ${idx === 0 ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`} />
                          <div className="flex-1 -mt-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{sName}</span>
                              <span className="text-xs text-gray-400">{fmt(entry.created_at)}</span>
                            </div>
                            {entry.note && (
                              <p className="text-xs text-gray-500 mt-1">{entry.note}</p>
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
          {/* Update Status Card for Own Delivery Vendors */}
          {hasOwnDeliveryAccount && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  স্ট্যাটাস পরিবর্তন (Update Status)
                </h2>
                {isUpdatingStatus && (
                  <span className="flex items-center gap-1 text-xs text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" /> আপডেটিং...
                  </span>
                )}
              </div>
              <div className="px-5 py-4">
                <select
                  value={getCurrentStatusId()}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`w-full text-sm font-medium rounded-lg px-3 py-2.5 border border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isUpdatingStatus ? "opacity-50" : ""
                  }`}
                >
                  {statusList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.bn ? `${s.bn} (${s.name})` : s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800">কাস্টমার তথ্য</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="font-medium text-gray-800">{order.customer_name}</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-600">
                  {order.customer_phone?.slice(0, 4)}
                  <span className="blur-sm select-none">{order.customer_phone?.slice(4, -4)}</span>
                  {order.customer_phone?.slice(-4)}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
                  {order.zone && <p className="text-xs text-gray-400 mt-1">জোন: {order.zone}</p>}
                </div>
              </div>
              {order.note && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-xs mt-0.5 shrink-0">নোট</span>
                  <p className="text-gray-600 text-xs">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assign CarryBee for Own Delivery Vendor */}
          {hasOwnDeliveryAccount && !delivery && !order.carry_bee_draft && (
            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-100 bg-amber-50 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-800">কুরিয়ার অ্যাসাইন (CarryBee)</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-gray-500 mb-3">
                  আপনার নিজস্ব ডেলিভারি অ্যাকাউন্ট দিয়ে CarryBee-তে সরাসরি পার্সেল বুকিং করুন।
                </p>
                <button
                  onClick={() => setCarryBeeOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  Assign CarryBee Order
                </button>
              </div>
            </div>
          )}

          {/* Ready for CarryBee */}
          {order.carry_bee_draft && !delivery && (
            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-100 bg-amber-50 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-800">CarryBee Delivery</h2>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-gray-500 mb-3">পণ্য প্রস্তুত হলে নিচের বাটন চাপুন।</p>
                <button
                  onClick={handleReadyForCarryBee}
                  disabled={readySubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {readySubmitting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Truck className="w-4 h-4" />}
                  Ready Product For CarryBee
                </button>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          {delivery && (
            <div className="bg-white rounded-xl border border-teal-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-teal-100 bg-teal-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-teal-700" />
                  <h2 className="text-sm font-semibold text-teal-800">ডেলিভারি তথ্য</h2>
                </div>
                <button
                  onClick={handleShowCarryBeeDetails}
                  className="text-xs font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2 transition"
                >
                  {showCarryBeeDetails ? "লুকান" : "লাইভ স্ট্যাটাস দেখুন"}
                </button>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-0.5">Consignment ID</p>
                    <p className="font-bold text-gray-900 font-mono text-xs tracking-wide">{delivery.consignment_id}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">প্রাপক</span>
                    <span className="font-medium text-gray-800 text-right max-w-[55%]">{delivery.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ফোন</span>
                    <span>
                      {delivery.recipient_phone?.slice(0, 4)}
                      <span className="blur-sm select-none">{delivery.recipient_phone?.slice(4, -4)}</span>
                      {delivery.recipient_phone?.slice(-4)}
                    </span>
                  </div>
                </div>
                {/* <div className="border-t border-gray-100 pt-3 space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">COD</span>
                    <span className="font-medium text-gray-800">৳{delivery.collectable_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ডেলিভারি ফি</span>
                    <span>৳{delivery.delivery_fee}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>মোট চার্জ</span>
                    <span>৳{delivery.total_fee}</span>
                  </div>
                </div> */}
              </div>
              {showCarryBeeDetails && (
                <CarryBeeDetailsPanel
                  details={cbDetails}
                  isLoading={cbDetailsLoading}
                  isError={cbDetailsError}
                  onRetry={() => fetchCarryBeeDetails({
                    vendorId: delivery.delivery_company_id,
                    consignmentId: delivery.consignment_id,
                  })}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Assign CarryBee Modal for vendors with own delivery account */}
      {carryBeeOpen && !delivery && (
        <AssignCarryBeeModal
          order={{ ...order, vendor_id: order.vendor_id || vendorId }}
          onClose={() => {
            setCarryBeeOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default VendorOrderDetails;
