import React, { useState, useMemo } from "react";
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
  CheckCircle,
  XCircle,
  CreditCard,
  X,
  Lock,
  Edit3,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetOrderDetailsQuery,
  useUpdateOrderInfoMutation,
  useUpdateOrderStatusMutation,
  useGetOrderStatusSummaryQuery,
  useApproveAdvanceMutation,
  useRejectAdvanceMutation,
} from "../../../redux/features/order";
import AssignCarryBeeModal, { CarryBeeInfoCard } from "./carrybee_assign";
import {
  getAdminBasePrice,
  getAdminCommission,
  getResellerProfit,
  getVendorPrice,
  toNumber,
} from "../../../utils/pricing.utils";

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

/* ──────────────────────────────────────────
   Admin Order Details
────────────────────────────────────────── */
const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetOrderDetailsQuery(id);
  const { data: summaryData } = useGetOrderStatusSummaryQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [updateOrderInfo, { isLoading: isSavingOrder }] =
    useUpdateOrderInfoMutation();

  const [carryBeeOpen, setCarryBeeOpen] = useState(false);
  const [approveAdvance, { isLoading: isApprovingAdvance }] = useApproveAdvanceMutation();
  const [rejectAdvance, { isLoading: isRejectingAdvance }] = useRejectAdvanceMutation();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Edit Order Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    customer_phone: "",
    shipping_address: "",
    zone: "",
    note: "",
    shipping_fee: 0,
    discount: 0,
    payment_status: "unpaid",
    advance_amount: 0,
    advance_status: "none",
    advance_payment_method: "",
    advance_trx_id: "",
    advance_sender_phone: "",
    items: [],
  });

  const order = data?.data || null;
  const statusList = summaryData?.data || [];

  // Determine lock state
  const hasConsignment = Boolean(
    order?.has_consignment ||
    order?.delivery_information?.consignment_id ||
    order?.consignment_id
  );
  const isOrderEditable = order?.is_editable !== undefined ? Boolean(order.is_editable) : !hasConsignment;
  const consignmentId = order?.consignment_id || order?.delivery_information?.consignment_id || null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-US")}`;

  const getOrderItemPricing = (item = {}) => {
    const qty = Number(item?.qty || 1);
    const vendorPrice = getVendorPrice(item);
    const adminPrice = getAdminBasePrice(item);
    const lineUnitPrice = qty > 0 ? Number(item?.line_total || 0) / qty : 0;
    const sellingPrice = toNumber(item?.reseller_price ?? item?.selling_price ?? lineUnitPrice, adminPrice);

    return {
      qty,
      vendorPrice,
      adminPrice,
      sellingPrice,
      lineTotal: sellingPrice * qty,
      resellerProfit: getResellerProfit({ resellerPrice: sellingPrice, adminPrice, qty }),
      adminCommission: getAdminCommission({ adminPrice, unitPrice: vendorPrice, qty }),
    };
  };

  const getCurrentStatusName = () => {
    if (!order) return "";
    if (typeof order.status === "object" && order.status?.name)
      return order.status.name;
    const found = statusList.find((s) => String(s.id) === String(order.status));
    return found?.name || order.status;
  };

  const getCurrentStatusId = () => {
    if (!order) return "";
    if (typeof order.status === "object" && order.status?.id)
      return order.status.id;
    return order.status;
  };

  const handleApproveAdvance = async () => {
    try {
      await approveAdvance({ id: order.id, admin_note: "Approved by Admin" }).unwrap();
      toast.success("অর্ডার অগ্রিম সফলভাবে অনুমোদন করা হয়েছে!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "অগ্রিম অনুমোদন ব্যর্থ হয়েছে");
    }
  };

  const handleRejectAdvance = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("অনুগ্রহ করে অগ্রিম বাতিলের কারণ উল্লেখ করুন");
      return;
    }
    try {
      await rejectAdvance({ id: order.id, reason: rejectReason.trim() }).unwrap();
      toast.success("অগ্রিম বাতিল করা হয়েছে");
      setShowRejectModal(false);
      setRejectReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "অগ্রিম বাতিল করতে সমস্যা হয়েছে");
    }
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

  // Open Full Edit Modal
  const handleOpenEditModal = () => {
    if (!isOrderEditable) {
      toast.warning("This order is locked because a delivery consignment has already been created.");
      return;
    }

    setEditForm({
      customer_name: order.customer_name || "",
      customer_phone: order.customer_phone || "",
      shipping_address: order.shipping_address || "",
      zone: order.zone || "",
      note: order.note || "",
      shipping_fee: Number(order.shipping_fee || 0),
      discount: Number(order.discount || 0),
      payment_status: order.payment_status || "unpaid",
      advance_amount: Number(order.advance_amount || 0),
      advance_status: order.advance_status || "none",
      advance_payment_method: order.advance_payment_method || "",
      advance_trx_id: order.advance_trx_id || "",
      advance_sender_phone: order.advance_sender_phone || "",
      items: (order.items || []).map((item) => {
        const pricing = getOrderItemPricing(item);
        return {
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          qty: Number(item.qty || 1),
          admin_price: Number(item.admin_price || pricing.adminPrice || 0),
          unit_price: Number(item.unit_price || pricing.vendorPrice || 0),
          reseller_price: Number(item.reseller_price ?? pricing.sellingPrice ?? 0),
          attribute_id: item.attribute_id ? String(item.attribute_id) : "",
          shop_id: item.shop_id || item.shop?.id,
          note: item.note || "",
          available_attributes: item.product?.product_attributes || [],
        };
      }),
    });
    setShowEditModal(true);
  };

  // Edit Modal Real-Time Calculations
  const calculatedSubtotal = useMemo(() => {
    return (editForm.items || []).reduce((acc, item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.reseller_price || 0);
      return acc + qty * price;
    }, 0);
  }, [editForm.items]);

  const calculatedResellerProfit = useMemo(() => {
    return (editForm.items || []).reduce((acc, item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.reseller_price || 0);
      const adminPrice = Number(item.admin_price || 0);
      return acc + qty * (price - adminPrice);
    }, 0);
  }, [editForm.items]);

  const calculatedTotal = useMemo(() => {
    const shipping = Number(editForm.shipping_fee || 0);
    const discount = Number(editForm.discount || 0);
    return Math.max(0, Math.round((calculatedSubtotal + shipping - discount) * 100) / 100);
  }, [calculatedSubtotal, editForm.shipping_fee, editForm.discount]);

  const calculatedRemainingCod = useMemo(() => {
    const advance = Number(editForm.advance_amount || 0);
    return Math.max(0, Math.round((calculatedTotal - advance) * 100) / 100);
  }, [calculatedTotal, editForm.advance_amount]);

  // Handle Item Changes
  const handleItemFieldChange = (index, field, value) => {
    setEditForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return { ...prev, items: newItems };
    });
  };

  // Save Full Edit Order
  const handleSaveEditOrder = async (e) => {
    e?.preventDefault();

    if (!editForm.customer_name?.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!editForm.customer_phone?.trim()) {
      toast.error("Customer phone is required");
      return;
    }
    if (!editForm.shipping_address?.trim()) {
      toast.error("Shipping address is required");
      return;
    }
    if (!editForm.items || editForm.items.length === 0) {
      toast.error("Order must have at least one item");
      return;
    }

    // Validate item quantities and reseller price >= admin price
    for (let i = 0; i < editForm.items.length; i++) {
      const item = editForm.items[i];
      if (Number(item.qty) < 1) {
        toast.error(`Quantity for "${item.product_name || `Item ${i + 1}`}" must be at least 1`);
        return;
      }
      if (Number(item.reseller_price) < Number(item.admin_price)) {
        toast.error(
          `Selling price (৳${item.reseller_price}) cannot be less than base price (৳${item.admin_price}) for "${item.product_name}"`
        );
        return;
      }
    }

    const shipping = Number(editForm.shipping_fee || 0);
    const discount = Number(editForm.discount || 0);
    if (discount > (calculatedSubtotal + shipping)) {
      toast.error("Discount cannot exceed subtotal + shipping fee");
      return;
    }

    const advance = Number(editForm.advance_amount || 0);
    if (advance > calculatedTotal) {
      toast.error("Advance amount cannot exceed total order amount");
      return;
    }

    const payload = {
      id: order.id,
      customer_name: editForm.customer_name.trim(),
      customer_phone: editForm.customer_phone.trim(),
      shipping_address: editForm.shipping_address.trim(),
      zone: editForm.zone?.trim() || null,
      note: editForm.note?.trim() || null,
      shipping_fee: shipping,
      discount: discount,
      total: calculatedTotal,
      payment_status: editForm.payment_status,
      advance_amount: advance,
      advance_status: editForm.advance_status,
      advance_payment_method: editForm.advance_payment_method || null,
      advance_trx_id: editForm.advance_trx_id || null,
      advance_sender_phone: editForm.advance_sender_phone || null,
      items: editForm.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        qty: Number(item.qty),
        reseller_price: Number(item.reseller_price),
        admin_price: Number(item.admin_price),
        unit_price: Number(item.unit_price),
        attribute_id: item.attribute_id ? Number(item.attribute_id) : null,
        shop_id: item.shop_id,
        note: item.note || null,
      })),
    };

    try {
      await updateOrderInfo(payload).unwrap();
      toast.success("Order updated successfully!");
      setShowEditModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update order");
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
        <p className="text-red-500 text-sm font-medium">Failed to load order.</p>
        <button
          onClick={refetch}
          className="text-sm text-red-600 underline hover:text-red-700"
        >
          Try again
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">
                {order.order_number}
              </h1>
              {!isOrderEditable && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600" /> Locked
                </span>
              )}
            </div>
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

          {/* Edit Order Action Button */}
          {isOrderEditable ? (
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm transition"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Order
            </button>
          ) : (
            <span
              title="Order locked: Consignment has been created"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full border border-gray-200 cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5 text-gray-400" /> Locked
            </span>
          )}

          {/* Delivery Assignment Buttons */}
          {order.delivery_information ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full">
              <Truck className="w-3.5 h-3.5" /> CarryBee Assigned
            </span>
          ) : order.carry_bee_draft != null ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-full">
              <Truck className="w-3.5 h-3.5" /> CarryBee Order Draft Sent to {order.vendor?.shop_name || "Vendor"}
            </span>
          ) : (
            <button
              onClick={() => setCarryBeeOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition"
            >
              <Truck className="w-4 h-4" /> Assign CarryBee Order with {order.vendor?.shop_name || "Vendor"}
            </button>
          )}
        </div>
      </div>

      {/* Prominent Lock Banner if Consignment Created */}
      {(!isOrderEditable || hasConsignment) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3.5 text-amber-900 shadow-sm">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-gray-900">
                Order Locked / অর্ডার লক করা
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 text-amber-800">
                Consignment Created
              </span>
              {consignmentId && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-gray-800 border border-amber-300">
                  Consignment ID: {consignmentId}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              এই অর্ডারের জন্য ডেলিভারি কনসাইনমেন্ট তৈরি সম্পন্ন হয়েছে। কনসাইনমেন্ট তৈরি হওয়ার পর অর্ডারের আইটেম, পরিমাণ, মূল্য, ডিসকাউন্ট, ডেলিভারি চার্জ বা কাস্টমার ডেলিভারি তথ্য পরিবর্তন করা নিষেধ।
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Items
              </h2>
              {isOrderEditable ? (
                <button
                  onClick={handleOpenEditModal}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Items & Prices
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" /> Locked
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => {
                const pricing = getOrderItemPricing(item);

                return (
                  <div
                    key={item.id}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      {item.product_id ? (
                        <button
                          onClick={() => navigate(`/admin-panel/products/${item.product_id}`)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {item.product_name}
                        </button>
                      ) : (
                        <p className="font-medium text-gray-800">{item.product_name}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        <span>Qty: {pricing.qty}</span>
                        <span>Vendor Price: {formatCurrency(pricing.vendorPrice)}</span>
                        <span>Admin/Base Price: {formatCurrency(pricing.adminPrice)}</span>
                        <span>Selling Price: {formatCurrency(pricing.sellingPrice)}</span>
                        <span>Reseller Profit: {formatCurrency(pricing.resellerProfit)}</span>
                        <span>Admin Commission: {formatCurrency(pricing.adminCommission)}</span>
                      </div>
                      {item.product_attribute?.attribute?.name && item.product_attribute?.value?.value && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-200">
                          {item.product_attribute.attribute.name}: {item.product_attribute.value.value}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">
                        {formatCurrency(pricing.lineTotal)}
                      </p>
                      {item.shop && (
                        <p className="text-xs mt-0.5">
                          {item.shop.id ? (
                            <button
                              onClick={() => navigate(`/admin-panel/vendors/${item.shop.id}`)}
                              className="text-blue-500 hover:text-blue-700 hover:underline"
                            >
                              Shop: {item.shop.shop_name}
                            </button>
                          ) : (
                            <span className="text-green-600">Shop: {item.shop.shop_name}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-base text-gray-900">{formatCurrency(order.total)}</span>
              </div>
              {Number(order.reseller_profit) > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Reseller Profit</span>
                  <span>{formatCurrency(order.reseller_profit)}</span>
                </div>
              )}
              {Number(order.remaining_cod) !== undefined && (
                <div className="flex justify-between text-indigo-700 font-semibold pt-1 border-t border-dashed border-gray-200">
                  <span>Remaining COD</span>
                  <span>{formatCurrency(order.remaining_cod)}</span>
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
                  Status History
                </h2>
              </div>
              <div className="px-5 py-4">
                <div className="relative">
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
          {/* Advance Payment Info Card */}
          {(Boolean(order.advance_status && order.advance_status !== "none") || Number(order.advance_amount) > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  অগ্রিম ডেলিভারি চার্জ
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  order.advance_status === "approved" ? "bg-green-100 text-green-800 border border-green-300" :
                  ["pending", "submitted"].includes(order.advance_status) ? "bg-amber-100 text-amber-800 border border-amber-300" :
                  order.advance_status === "rejected" ? "bg-red-100 text-red-800 border border-red-200" : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}>
                  {order.advance_status === "approved" ? "Approved (গৃহীত)" :
                   ["pending", "submitted"].includes(order.advance_status) ? "Pending (যাচাই বাকি)" :
                   order.advance_status === "rejected" ? "Rejected (বাতিল)" : "None"}
                </span>
              </div>
              <div className="p-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 block">অগ্রিম পরিমাণ:</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{formatCurrency(order.advance_amount || 0)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">পেমেন্ট মেথড:</span>
                    <p className="font-semibold text-gray-800 uppercase mt-0.5">{order.advance_payment_method || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-500 block">Trx ID:</span>
                    <p className="font-mono text-gray-900 font-medium mt-0.5 select-all">{order.advance_trx_id || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">প্রেরক নম্বর:</span>
                    <p className="font-mono text-gray-900 font-medium mt-0.5">{order.advance_sender_phone || "—"}</p>
                  </div>
                </div>

                {order.advance_verified_at && (
                  <div className="pt-2 border-t border-gray-100 text-gray-500">
                    যাচাইকৃত সময়: {formatDate(order.advance_verified_at)}
                  </div>
                )}

                {(order.advance_status === "pending" || order.advance_status === "submitted") && (
                  <div className="pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      type="button"
                      onClick={handleApproveAdvance}
                      disabled={isApprovingAdvance || isRejectingAdvance}
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                    >
                      {isApprovingAdvance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      অনুমোদন করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      disabled={isApprovingAdvance || isRejectingAdvance}
                      className="py-2 px-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      বাতিল
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Update Status
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
                  Updating...
                </p>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Info
              </h2>
              {isOrderEditable ? (
                <button
                  onClick={handleOpenEditModal}
                  className="text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 transition flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" /> Locked
                </span>
              )}
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="font-medium text-gray-800">{order.customer_name || "—"}</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">{order.customer_phone || "—"}</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 whitespace-pre-line">{order.shipping_address || "—"}</p>
                  {order.zone && (
                    <p className="text-xs text-gray-400 mt-1">Zone: {order.zone}</p>
                  )}
                </div>
              </div>
              {order.note && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0">Note</span>
                  <p className="text-gray-600 text-xs">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dropshipper Info */}
          {order.user && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Dropshipper
                </h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{order.user.name}</p>
                {order.user.phone && <p className="text-xs text-gray-500 mt-0.5">{order.user.phone}</p>}
                {order.user.email && <p className="text-xs text-gray-500">{order.user.email}</p>}
              </div>
            </div>
          )}

          {/* Delivery Man */}
          {order.delivery_man && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery Man
                </h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p>{order.delivery_man.name || "—"}</p>
              </div>
            </div>
          )}

          <CarryBeeInfoCard deliveryInfo={order.delivery_information} />

          {/* Note */}
          {order.note && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Note</h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p>{order.note}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {carryBeeOpen && !order.delivery_information && (
        <AssignCarryBeeModal order={order} onClose={() => setCarryBeeOpen(false)} />
      )}

      {/* Reject Advance Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-gray-900 mb-2">অগ্রিম পেমেন্ট বাতিল</h3>
            <p className="text-xs text-gray-500 mb-4">
              অর্ডার #{order.order_number}-এর অগ্রিম বাতিলের কারণ উল্লেখ করুন:
            </p>
            <form onSubmit={handleRejectAdvance} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="যেমন: ভুল Trx ID বা টাকা জমা হয়নি"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isRejectingAdvance}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                >
                  {isRejectingAdvance ? "বাতিল হচ্ছে..." : "নিশ্চিত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────
          Comprehensive Order Edit Modal
      ────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-8 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  Edit Order #{order.order_number}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update customer details, items, variants, prices, and delivery charges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEditOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Section 1: Customer Details */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-500" /> Customer & Delivery Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.customer_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, customer_name: e.target.value }))}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Customer Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.customer_phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, customer_phone: e.target.value }))}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Shipping Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={editForm.shipping_address}
                      onChange={(e) => setEditForm((p) => ({ ...p, shipping_address: e.target.value }))}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Zone / City
                    </label>
                    <input
                      type="text"
                      value={editForm.zone}
                      onChange={(e) => setEditForm((p) => ({ ...p, zone: e.target.value }))}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Admin Note
                    </label>
                    <input
                      type="text"
                      value={editForm.note}
                      onChange={(e) => setEditForm((p) => ({ ...p, note: e.target.value }))}
                      placeholder="Optional notes"
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Order Items & Variants */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gray-500" /> Order Items & Pricing
                </h4>
                <div className="space-y-3">
                  {editForm.items?.map((item, idx) => {
                    const lineTotal = Number(item.qty || 0) * Number(item.reseller_price || 0);
                    const lineProfit = Number(item.qty || 0) * (Number(item.reseller_price || 0) - Number(item.admin_price || 0));
                    const isPriceUnderAdmin = Number(item.reseller_price) < Number(item.admin_price);

                    return (
                      <div
                        key={item.id || idx}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">
                              {item.product_name}
                            </p>
                            <div className="flex gap-3 text-[11px] text-gray-400 mt-0.5">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              <span>Base Admin Price: <strong className="text-gray-700">৳{item.admin_price}</strong></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-gray-900">
                              Line Total: ৳{lineTotal.toLocaleString()}
                            </span>
                            <span className="block text-[11px] font-semibold text-green-600">
                              Profit: ৳{lineProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Variant / ProductAttribute Selection */}
                          <div>
                            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                              Variant / ভ্যারিয়েন্ট
                            </label>
                            {item.available_attributes && item.available_attributes.length > 0 ? (
                              <select
                                value={item.attribute_id || ""}
                                onChange={(e) => handleItemFieldChange(idx, "attribute_id", e.target.value)}
                                className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                              >
                                <option value="">Default (No Variant)</option>
                                {item.available_attributes.map((attr) => (
                                  <option key={attr.id} value={attr.id}>
                                    {attr.attribute?.name ? `${attr.attribute.name}: ` : ""}{attr.value?.value || `Variant #${attr.id}`}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs text-gray-400 italic block py-1.5">No variants available</span>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={item.qty}
                              onChange={(e) => handleItemFieldChange(idx, "qty", Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Selling / Reseller Price */}
                          <div>
                            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                              Selling Price (৳)
                            </label>
                            <input
                              type="number"
                              min={item.admin_price}
                              step="any"
                              required
                              value={item.reseller_price}
                              onChange={(e) => handleItemFieldChange(idx, "reseller_price", parseFloat(e.target.value) || 0)}
                              className={`w-full text-xs border rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 ${
                                isPriceUnderAdmin ? "border-red-400 bg-red-50 text-red-700" : "border-gray-300"
                              }`}
                            />
                            {isPriceUnderAdmin && (
                              <p className="text-[10px] text-red-600 font-medium mt-1">
                                Must be ≥ ৳{item.admin_price}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Financials & Authoritative Calculation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Financial Charges Inputs */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" /> Charges & Advance
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Shipping Fee (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={editForm.shipping_fee}
                        onChange={(e) => setEditForm((p) => ({ ...p, shipping_fee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Discount (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={editForm.discount}
                        onChange={(e) => setEditForm((p) => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Advance Amount (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={editForm.advance_amount}
                        onChange={(e) => setEditForm((p) => ({ ...p, advance_amount: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Advance Status
                      </label>
                      <select
                        value={editForm.advance_status}
                        onChange={(e) => setEditForm((p) => ({ ...p, advance_status: e.target.value }))}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Advance Method
                      </label>
                      <select
                        value={editForm.advance_payment_method}
                        onChange={(e) => setEditForm((p) => ({ ...p, advance_payment_method: e.target.value }))}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None / Unspecified</option>
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="rocket">Rocket</option>
                        <option value="wallet">Wallet Balance</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Payment Status
                      </label>
                      <select
                        value={editForm.payment_status}
                        onChange={(e) => setEditForm((p) => ({ ...p, payment_status: e.target.value }))}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Advance Trx ID
                      </label>
                      <input
                        type="text"
                        value={editForm.advance_trx_id}
                        onChange={(e) => setEditForm((p) => ({ ...p, advance_trx_id: e.target.value }))}
                        placeholder="e.g. 9B877XDF"
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Advance Sender Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.advance_sender_phone}
                        onChange={(e) => setEditForm((p) => ({ ...p, advance_sender_phone: e.target.value }))}
                        placeholder="e.g. 01700000000"
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Real-Time Recalculation Summary Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-600" /> Authoritative Calculations
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold text-gray-800">৳{calculatedSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping Fee:</span>
                        <span className="font-semibold text-gray-800">+ ৳{Number(editForm.shipping_fee || 0).toLocaleString()}</span>
                      </div>
                      {Number(editForm.discount) > 0 && (
                        <div className="flex justify-between text-amber-700">
                          <span>Discount:</span>
                          <span className="font-semibold">- ৳{Number(editForm.discount || 0).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-green-700 font-medium pt-1 border-t border-indigo-200">
                        <span>Total Reseller Profit:</span>
                        <span className="font-bold">৳{calculatedResellerProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Advance Paid:</span>
                        <span className="font-semibold text-gray-800">৳{Number(editForm.advance_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-indigo-900 font-bold pt-1 border-t border-indigo-200">
                        <span>Remaining COD:</span>
                        <span className="font-mono text-sm">৳{calculatedRemainingCod.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-indigo-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-gray-500 block">Total Order Amount</span>
                      <span className="text-xs text-gray-400">(Subtotal + Shipping - Discount)</span>
                    </div>
                    <span className="text-2xl font-black text-indigo-900">
                      ৳{calculatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSavingOrder}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingOrder}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {isSavingOrder ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Order Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;
