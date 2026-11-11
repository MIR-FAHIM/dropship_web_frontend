import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Search,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useGetVendorIdQuery, useGetVendorProfileQuery } from "../../../redux/features/vendor_api";
import { useVendorOrdersQuery, useGetOrderStatusSummaryQuery, useUpdateOrderStatusMutation } from "../../../redux/features/order";
import AssignCarryBeeModal from "../../admin_panel/orders/carrybee_assign";
import CourierIssueBadge from "../../../components/shared/CourierIssueBadge";
import { toast } from "react-toastify";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { imgBaseUrl } from "../../../../config";

// Small product thumbnail (same URL pattern as the admin orders list).
const getItemImageUrl = (item) => {
  const image = item?.product?.primary_image;
  if (!image) return null;
  if (image.external_link) return image.external_link;
  const fileName = image.file_name;
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return `${imgBaseUrl}/${fileName}`;
};

const ItemThumbnail = ({ item }) => {
  const [failed, setFailed] = useState(false);
  const src = getItemImageUrl(item);

  if (!src || failed) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-300">
        <Package className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={item?.product_name || "Product"}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-8 w-8 shrink-0 rounded border border-gray-200 bg-white object-cover"
    />
  );
};

// Selected variant (e.g. Color: Pink) from item.product_attribute, highlighted so
// the vendor packs the right one.
const ItemAttributeBadge = ({ item }) => {
  const pa = item?.product_attribute;
  const value = pa?.value?.value;
  if (!value) return null;
  const name = pa?.attribute?.name;
  const swatch = pa?.value?.color_code;

  return (
    <span
      className="mt-0.5 inline-flex max-w-[150px] items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold leading-tight text-amber-800"
      title={name ? `${name}: ${value}` : value}
    >
      {swatch && (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="truncate">
        {name && <span className="font-normal text-amber-700">{name}: </span>}
        {value}
      </span>
    </span>
  );
};

// Delivery/COD note (order.note) in amber, admin note in indigo. Clamped to
// 3 lines; full text in the tooltip.
const OrderNotesCell = ({ order }) => {
  const deliveryNote = order?.note?.trim();
  const adminNote = order?.admin_note?.trim();
  if (!deliveryNote && !adminNote) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  const notes = [
    deliveryNote && { key: "delivery", label: "Delivery / COD", text: deliveryNote, Icon: Truck,
      bar: "border-amber-400", chip: "bg-amber-100 text-amber-700" },
    adminNote && { key: "admin", label: "Admin", text: adminNote, Icon: ShieldCheck,
      bar: "border-indigo-400", chip: "bg-indigo-100 text-indigo-700" },
  ].filter(Boolean);

  return (
    <div className="flex w-[210px] flex-col gap-2">
      {notes.map(({ key, label, text, Icon, bar, chip }) => (
        <div key={key} className={`border-l-[3px] pl-2 ${bar}`} title={`${label} note: ${text}`}>
          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-px text-[10px] font-semibold leading-4 ${chip}`}>
            <Icon className="h-3 w-3" />
            {label}
          </span>
          <p className="mt-0.5 line-clamp-2 whitespace-pre-line break-words text-xs leading-snug text-gray-700">
            {text}
          </p>
        </div>
      ))}
    </div>
  );
};

const STATUS_CONFIG = {
  Pending:    { label: "পেন্ডিং",     cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  Processing: { label: "প্রসেসিং",    cls: "bg-blue-100 text-blue-700 border-blue-200" },
  Confirmed:  { label: "কনফার্মড",    cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  Shipped:    { label: "শিপড",        cls: "bg-purple-100 text-purple-700 border-purple-200" },
  Delivered:  { label: "ডেলিভার্ড",  cls: "bg-teal-100 text-teal-700 border-teal-200" },
  "Carrybee Paid": { label: "কুরিয়ার পেইড", cls: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" },
  Cancelled:  { label: "বাতিল",       cls: "bg-red-100 text-red-700 border-red-200" },
  Returned:   { label: "রিটার্ন",     cls: "bg-orange-100 text-orange-700 border-orange-200" },
  "Out for Delivery": { label: "আউট ফর ডেলিভারি", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  Completed:  { label: "সম্পন্ন",     cls: "bg-green-100 text-green-700 border-green-200" },
  "Assigned To Vendor": { label: "ভেন্ডরকে দেওয়া", cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  "Vendor Is Ready": { label: "ভেন্ডর প্রস্তুত", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  "Partially Delivered": { label: "আংশিক ডেলিভারি", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  "Return in Transit": { label: "রিটার্ন পথে", cls: "bg-pink-100 text-pink-700 border-pink-200" },
  "Lost / Damaged": { label: "হারানো / ক্ষতিগ্রস্ত", cls: "bg-gray-200 text-gray-800 border-gray-300" },
};

const DEFAULT_STATUS_LIST = [
  { id: 1, name: "Pending", bn: "পেন্ডিং" },
  { id: 2, name: "Confirmed", bn: "কনফার্মড" },
  { id: 3, name: "Processing", bn: "প্রসেসিং" },
  { id: 4, name: "Shipped", bn: "শিপড" },
  { id: 5, name: "Out for Delivery", bn: "আউট ফর ডেলিভারি" },
  { id: 6, name: "Delivered", bn: "ডেলিভার্ড" },
  { id: 10, name: "Carrybee Paid", bn: "ক্যারিবী পরিশোধিত" },
  { id: 7, name: "Cancelled", bn: "বাতিল" },
  { id: 8, name: "Returned", bn: "রিটার্ন" },
  { id: 9, name: "Completed", bn: "সম্পন্ন" },
];

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
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("bn-BD", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
};

const VendorOrders = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [carryBeeModalOpen, setCarryBeeModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const userId = getFromLocalstorage("userId");
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
  const vendorId = vendorIdData?.data?.vendor_id;

  const { data: vendorProfileData } = useGetVendorProfileQuery(vendorId, {
    skip: !vendorId,
  });
  const vendorProfile = vendorProfileData?.data;

  const hasOwnDeliveryAccount = Boolean(
    vendorProfile?.has_own_delivery_account === true ||
    vendorProfile?.has_own_delivery_account === 1 ||
    vendorProfile?.has_own_delivery_account === "1" ||
    vendorProfile?.has_own_delivery_account === "true"
  );

  const { data: summaryData } = useGetOrderStatusSummaryQuery(undefined, {
    skip: !hasOwnDeliveryAccount,
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const { data, isLoading, isFetching, refetch } = useVendorOrdersQuery(
    { vendorId, page },
    { skip: !vendorId }
  );

  const pagination = data?.data;
  const orders = pagination?.data || [];
  const lastPage = pagination?.last_page || 1;
  const total = pagination?.total || 0;

  const statusList = summaryData?.data?.length ? summaryData.data : DEFAULT_STATUS_LIST;

  const getStatusName = (order) => {
    if (typeof order.status === "object" && order.status?.name) return order.status.name;
    if (order.status_history?.length && order.status_history[0].status?.name) {
      return order.status_history[0].status.name;
    }
    const found = statusList.find((s) => String(s.id) === String(order.status || order.status_id));
    return found?.name || order.status || "—";
  };

  const getStatusId = (order) => {
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

  const tabs = useMemo(() => {
    const allTab = { label: "সকল", value: "all", count: orders.length };
    const dynamicTabs = statusList.map((s) => {
      const matchCount = orders.filter(
        (o) => String(getStatusId(o)) === String(s.id)
      ).length;
      return {
        label: s.bn || s.name,
        value: s.id,
        count: s.orders_count !== undefined ? s.orders_count : matchCount,
      };
    });
    return [allTab, ...dynamicTabs];
  }, [orders, statusList]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (hasOwnDeliveryAccount && activeTab !== "all") {
      result = result.filter((o) => String(getStatusId(o)) === String(activeTab));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.includes(q)
      );
    }
    return result;
  }, [orders, activeTab, searchQuery, hasOwnDeliveryAccount, statusList]);

  const handleStatusChange = async (orderId, newStatusId) => {
    try {
      await updateStatus({
        id: orderId,
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">অর্ডার</h1>
            {hasOwnDeliveryAccount && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Own Delivery Enabled
              </span>
            )}
          </div>
          {total > 0 && (
            <p className="text-xs text-gray-500 mt-1">মোট {total} টি অর্ডার</p>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="অর্ডার নম্বর / কাস্টমার / ফোন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white"
          />
        </div>
      </div>

      {hasOwnDeliveryAccount && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                activeTab === tab.value
                  ? "border-blue-500 bg-blue-50 text-blue-600 shadow-2xs font-semibold"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              }`}
            >
              {tab.label}{" "}
              <span
                className={
                  activeTab === tab.value ? "text-blue-500" : "text-gray-400"
                }
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
      )}









      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">নোট</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">স্ট্যাটাস</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">পেমেন্ট</th>
            
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">ডেলিভারি</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const statusName = getStatusName(order);
                    const statusCfg = getStatusConfig(statusName);
                    const delivery = order.delivery_information;

                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 transition-colors ${isFetching ? "opacity-60" : ""}`}
                      >
                        {/* Order */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            to={`/vendor-panel/orders/${order.id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {order.order_number}
                          </Link>
                          <p className="text-gray-400 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs truncate max-w-[130px]">{order.customer_name}</p>
                          <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {order.customer_phone?.slice(0, 4)}
                              <span className="blur-sm select-none">{order.customer_phone?.slice(4, -4)}</span>
                              {order.customer_phone?.slice(-4)}
                            </span>
                          </div>
                          {order.zone && (() => {
                            // Inside District = green, Outside District = orange, anything else = gray.
                            const zone = String(order.zone).trim().toLowerCase();
                            const zoneCls = zone.startsWith("inside")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : zone.startsWith("outside")
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-gray-50 text-gray-600 border-gray-200";
                            return (
                              <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${zoneCls}`}>
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                {order.zone}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {order.items?.map((item) => {
                              // Link only when the product still belongs to this vendor;
                              // the vendor product page can't open another vendor's product.
                              const canOpenProduct = Boolean(item.product_id)
                                && (item.product?.vendor_id == null || Number(item.product.vendor_id) === Number(vendorId));
                              return (
                                <div key={item.id} className="flex items-center gap-2">
                                  <ItemThumbnail item={item} />
                                  <div className="min-w-0">
                                    {canOpenProduct ? (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/vendor-panel/products/${item.product_id}`); }}
                                        className="block text-left text-blue-600 hover:text-blue-800 hover:underline text-xs leading-tight line-clamp-1 max-w-[150px]"
                                        title={item.product_name}
                                      >
                                        {item.product_name}
                                      </button>
                                    ) : (
                                      <span className="block text-gray-700 text-xs leading-tight line-clamp-1 max-w-[150px]" title={item.product_name}>
                                        {item.product_name}
                                      </span>
                                    )}
                                    <ItemAttributeBadge item={item} />
                                    <span className="block text-gray-400 text-[11px] whitespace-nowrap">
                                      × {item.qty} · {item.unit_price} TK
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Notes: delivery/COD note (amber) + admin note (indigo) */}
                        <td className="px-4 py-3 align-top">
                          <OrderNotesCell order={order} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {hasOwnDeliveryAccount ? (
                            <select
                              value={getStatusId(order) || ""}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              className={`text-xs font-medium rounded-full px-2.5 py-1 border cursor-pointer focus:ring-2 focus:ring-blue-500 ${statusCfg.cls}`}
                            >
                              {statusList.map((s) => (
                                <option key={s.id} value={s.id} className="bg-white text-gray-800">
                                  {s.bn || s.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.cls}`}>
                              {statusCfg.label}
                            </span>
                          )}
                          <CourierIssueBadge deliveryInfo={order.delivery_information} />
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                order.payment_status === "paid"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}
                            >
                              {order.payment_status === "paid" ? "পেইড" : "আনপেইড"}
                            </span>
                            {delivery && (
                              order.is_carrybee_paid || order.carrybee_paid_at || order.carrybee_invoice_id ? (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  title={`CarryBee Paid: #${order.carrybee_invoice_id || "পরিশোধিত"}`}
                                >
                                  ✓ CarryBee Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  কুরিয়ার: অপেক্ষমান
                                </span>
                              )
                            )}
                          </div>
                        </td>

                      

                        {/* Delivery */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {delivery ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <Truck className="w-3 h-3" />
                                <span>{delivery.consignment_id}</span>
                              </div>
                            </div>
                          ) : (
                          hasOwnDeliveryAccount ? (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setCarryBeeModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors shadow-sm"
                            >
                              <Truck className="w-3 h-3" />
                              Assign CarryBee
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )
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
      {/* Assign CarryBee Modal for vendors with own delivery account */}
      {carryBeeModalOpen && selectedOrder && (
        <AssignCarryBeeModal
          order={{
            ...selectedOrder,
            vendor_id: selectedOrder.vendor_id || vendorId,
          }}
          onClose={() => {
            setCarryBeeModalOpen(false);
            setSelectedOrder(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default VendorOrders;
