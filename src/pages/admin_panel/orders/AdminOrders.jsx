import React, { useState, useMemo, useRef, useEffect } from "react";
import { ClipboardList, Search, Eye, Loader2, User, CheckCircle, CheckCircle2, Clock, Lock, Store, ChevronDown, X, Check, FileText, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useListAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetOrderStatusSummaryQuery,
} from "../../../redux/features/order";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";
import VendorSettlementInvoiceModal from "./VendorSettlementInvoiceModal";
import ManualCarrybeePaymentModal from "./ManualCarrybeePaymentModal";

const statusColorMap = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-teal-100 text-teal-700",
  "Carrybee Paid": "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300",
  "Courier Paid": "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300",
  Cancelled: "bg-red-100 text-red-700",
  Returned: "bg-pink-100 text-pink-700",
  Completed: "bg-green-100 text-green-700",
};

const paymentColors = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

export const renderOrderPaymentBadge = (order, onManagePayment) => {
  const statusId = Number(order.status?.id || order.status || 0);
  const isCancelledOrReturned = [7, 8, 11].includes(statusId);
  const hasConsignment = Boolean(
    order.has_consignment ||
    order.consignment_id ||
    order.delivery_information?.consignment_id
  );
  const carrybeeInvoiceId = order.carrybee_invoice_id || order.delivery_information?.carrybee_invoice_id;

  // Genuine CarryBee Paid: Order is NOT cancelled, was actually assigned to CarryBee, and received an invoice ID or paid timestamp
  const isCarrybeePaid = !isCancelledOrReturned && hasConsignment && Boolean(
    statusId === 10 ||
    order.status?.name === "Carrybee Paid" ||
    order.is_carrybee_paid ||
    carrybeeInvoiceId ||
    order.carrybee_paid_at
  );

  const wrapBadge = (content) => {
    if (!onManagePayment) return content;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onManagePayment(order);
        }}
        className="inline-flex flex-col items-center cursor-pointer hover:opacity-80 transition focus:outline-none"
        title="CarryBee পেমেন্ট পরিবর্তন বা রিসেট করুন"
      >
        {content}
      </button>
    );
  };

  // If order is cancelled or returned:
  if (isCancelledOrReturned) {
    return wrapBadge(
      <div className="inline-flex flex-col items-center gap-0.5">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          বাতিল / Unpaid
        </span>
        <span className="text-[10px] text-gray-400">অর্ডার বাতিল</span>
      </div>
    );
  }

  if (isCarrybeePaid) {
    const invoiceId = carrybeeInvoiceId;
    const disbursedTo = order.carrybee_disbursed_to;

    return wrapBadge(
      <div className="inline-flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
          <Truck className="w-3 h-3 text-emerald-600" />
          CarryBee Paid
        </span>
        {invoiceId && (
          <span
            className="text-[10px] font-mono font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
            title={`CarryBee Invoice ID: ${invoiceId}`}
          >
            {invoiceId}
          </span>
        )}
        {disbursedTo && (
          <span
            className={`text-[9px] font-bold tracking-tight ${
              disbursedTo === "vendor" ? "text-amber-700" : "text-blue-700"
            }`}
          >
            ({disbursedTo === "vendor" ? "ভেন্ডর একাউন্টে" : "প্ল্যাটফর্মে"})
          </span>
        )}
      </div>
    );
  }

  if (order.payment_status === "paid") {
    return wrapBadge(
      <div className="inline-flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3 text-green-600" />
          Paid (সাধারণ)
        </span>
        {hasConsignment ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            <Clock className="w-2.5 h-2.5 text-amber-600" /> কুরিয়ার বাকি
          </span>
        ) : (
          <span className="text-[10px] text-gray-400">কুরিয়ার ছাড়া</span>
        )}
      </div>
    );
  }

  if (order.payment_status === "unpaid") {
    return wrapBadge(
      <div className="inline-flex flex-col items-center gap-0.5">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          Unpaid
        </span>
        <span className="text-[10px] text-gray-400">COD বাকি</span>
      </div>
    );
  }

  return wrapBadge(
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        paymentColors[order.payment_status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {order.payment_status || "Pending"}
    </span>
  );
};

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [manualPaymentOrder, setManualPaymentOrder] = useState(null);
  const vendorDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch vendors for filter
  const { data: vendorData, isLoading: isVendorsLoading } = useGetVendorListQuery();
  const vendors = useMemo(() => {
    const list = vendorData?.data?.data || vendorData?.data || [];
    return Array.isArray(list) ? list : [];
  }, [vendorData]);

  // Selected vendor object
  const selectedVendor = useMemo(() => {
    if (!selectedVendorId) return null;
    return vendors.find((v) => String(v.id) === String(selectedVendorId)) || null;
  }, [vendors, selectedVendorId]);

  // Filter vendors based on search input inside the dropdown
  const filteredVendors = useMemo(() => {
    if (!vendorSearchTerm.trim()) return vendors;
    const term = vendorSearchTerm.toLowerCase();
    return vendors.filter((v) => {
      const shopName = (v.shop_name || "").toLowerCase();
      const ownerName = (v.owner_name || "").toLowerCase();
      const userName = (v.user?.name || "").toLowerCase();
      const userPhone = (v.user?.phone || "").toLowerCase();
      const idStr = String(v.id);
      return (
        shopName.includes(term) ||
        ownerName.includes(term) ||
        userName.includes(term) ||
        userPhone.includes(term) ||
        idStr.includes(term)
      );
    });
  }, [vendors, vendorSearchTerm]);

  // Close vendor dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
        setIsVendorDropdownOpen(false);
      }
    };
    if (isVendorDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVendorDropdownOpen]);

  const handleSelectVendor = (vendorId) => {
    setSelectedVendorId(vendorId ? String(vendorId) : "");
    setPage(1);
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
  };

  // Query arguments for /orders/all/orders
  const queryParams = useMemo(() => {
    const params = { page };
    if (selectedVendorId) {
      params.vendor_id = selectedVendorId;
    }
    return params;
  }, [page, selectedVendorId]);

  const { data, isLoading, isError, refetch } = useListAllOrdersQuery(queryParams);
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

  // Helper to get vendor / shop name for search
  const getOrderVendorName = (order) => {
    if (order.vendor?.shop_name) return order.vendor.shop_name;
    const firstItemShop = order.items?.find((it) => it.shop?.shop_name)?.shop?.shop_name;
    return firstItemShop || "";
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== "all") {
      result = result.filter((o) => getStatusId(o) === activeTab);
    }
    if (paymentFilter === "carrybee_paid") {
      result = result.filter((o) =>
        Boolean(
          o.is_carrybee_paid ||
          o.carrybee_paid_at ||
          o.carrybee_invoice_id ||
          o.delivery_information?.carrybee_invoice_id ||
          o.courier_payout_status === "received"
        )
      );
    } else if (paymentFilter === "awaiting_carrybee") {
      result = result.filter(
        (o) =>
          o.payment_status === "paid" &&
          !Boolean(
            o.is_carrybee_paid ||
            o.carrybee_paid_at ||
            o.carrybee_invoice_id ||
            o.delivery_information?.carrybee_invoice_id ||
            o.courier_payout_status === "received"
          )
      );
    } else if (paymentFilter === "unpaid") {
      result = result.filter((o) => o.payment_status === "unpaid");
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          getOrderVendorName(o).toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, activeTab, paymentFilter, searchQuery]);

  const handleToggleSelectOrder = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const selectedOrdersList = useMemo(() => {
    return orders.filter((o) => selectedOrderIds.includes(o.id));
  }, [orders, selectedOrderIds]);

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
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Searchable Vendor Filter */}
          <div className="relative flex-1 sm:flex-none" ref={vendorDropdownRef}>
            <button
              type="button"
              onClick={() => setIsVendorDropdownOpen((prev) => !prev)}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition w-full sm:w-60 bg-white ${
                selectedVendorId
                  ? "border-red-500 text-red-700 bg-red-50/50 hover:bg-red-50"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Store className={`w-4 h-4 shrink-0 ${selectedVendorId ? "text-red-500" : "text-gray-400"}`} />
                <span className="truncate">
                  {selectedVendor
                    ? (selectedVendor.shop_name || `Vendor #${selectedVendor.id}`)
                    : "সকল ভেন্ডর (All Vendors)"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {selectedVendorId && (
                  <span
                    role="button"
                    title="ভেন্ডর ফিল্টার মুছুন"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVendor("");
                    }}
                    className="p-0.5 rounded-full hover:bg-red-200/60 text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isVendorDropdownOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isVendorDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* Search input inside dropdown */}
                <div className="p-2.5 border-b border-gray-100 bg-gray-50/60">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="ভেন্ডর খুঁজুন (নাম, আইডি)..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-7 py-1.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {vendorSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setVendorSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vendor Options List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 py-1">
                  {/* Option: All Vendors */}
                  <button
                    type="button"
                    onClick={() => handleSelectVendor("")}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition ${
                      !selectedVendorId
                        ? "bg-red-50 text-red-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-gray-400" />
                      সকল ভেন্ডর (All Vendors)
                    </span>
                    {!selectedVendorId && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </button>

                  {isVendorsLoading ? (
                    <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ভেন্ডর লোড হচ্ছে...
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">
                      কোনো ভেন্ডর পাওয়া যায়নি
                    </div>
                  ) : (
                    filteredVendors.map((v) => {
                      const isSelected = String(v.id) === String(selectedVendorId);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVendor(v.id)}
                          className={`w-full px-3.5 py-2 text-left flex items-start justify-between text-xs transition ${
                            isSelected
                              ? "bg-red-50 text-red-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-semibold truncate ${isSelected ? "text-red-700" : "text-gray-800"}`}>
                                {v.shop_name || "Unnamed Shop"}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-gray-100 text-gray-500 border border-gray-200">
                                ID: {v.id}
                              </span>
                            </div>
                            {(v.owner_name || v.user?.name || v.user?.phone) && (
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {v.owner_name || v.user?.name} {v.user?.phone ? `• ${v.user.phone}` : ""}
                              </p>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment Status Filter Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-2xs"
          >
            <option value="all">সব পেমেন্ট স্ট্যাটাস</option>
            <option value="carrybee_paid">🟢 CarryBee Paid (কুরিয়ার পরিশোধিত)</option>
            <option value="awaiting_carrybee">⏳ Paid (CarryBee বাকি)</option>
            <option value="unpaid">🔴 Unpaid (বাকি)</option>
          </select>

          {/* Search Input for Orders */}
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

      {/* Active Vendor Filter Banner */}
      {selectedVendor && (
        <div className="flex items-center justify-between gap-3 bg-red-50/70 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-red-500" />
            <span>
              ভেন্ডর ফিল্টার: <strong>{selectedVendor.shop_name || `Vendor #${selectedVendor.id}`}</strong> (ID: {selectedVendor.id})
              {selectedVendor.owner_name ? ` • মালিক: ${selectedVendor.owner_name}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectVendor("")}
            className="flex items-center gap-1 font-semibold text-red-600 hover:text-red-800 underline ml-auto shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            ফিল্টার রিসেট
          </button>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
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
              {selectedVendor
                ? `"${selectedVendor.shop_name || 'এই ভেন্ডর'}"-এর কোনো অর্ডার পাওয়া যায়নি।`
                : "কোনো অর্ডার পাওয়া যায়নি।"}
            </p>
            {selectedVendor && (
              <button
                type="button"
                onClick={() => handleSelectVendor("")}
                className="mt-3 text-sm text-red-600 underline hover:text-red-700 font-medium"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="py-3 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredOrders.length > 0 &&
                          selectedOrderIds.length === filteredOrders.length
                        }
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                        title="সবগুলো নির্বাচন করুন"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      অর্ডার নম্বর
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      কাস্টমার
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      ড্রপশিপার
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Items</th>
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
                      className={`hover:bg-gray-50 transition ${
                        selectedOrderIds.includes(order.id) ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleToggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800">
                            {order.order_number}
                          </span>
                          {(order.has_consignment || order.consignment_id || order.delivery_information?.consignment_id) && (
                            <span title="Locked - Consignment Created" className="text-amber-500">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
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
                      <td className="py-3 px-4 max-w-[220px]">
                        {order.items?.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 mb-1">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </span>
                            {order.items.map((item) => (
                              <div key={item.id}>
                                {item.product_id ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/admin-panel/products/${item.product_id}`); }}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline leading-snug line-clamp-1 text-left"
                                  >
                                    {item.product_name}
                                  </button>
                                ) : (
                                  <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-1">{item.product_name}</p>
                                )}
                                {item.shop && (
                                  item.shop.id ? (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigate(`/admin-panel/vendors/${item.shop.id}`); }}
                                      className="text-[11px] text-orange-400 hover:text-orange-600 hover:underline leading-tight text-left"
                                    >
                                      {item.shop.shop_name}
                                    </button>
                                  ) : (
                                    <p className="text-[11px] text-gray-400 leading-tight">{item.shop.shop_name}</p>
                                  )
                                )}
                              </div>
                            ))}
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
                        {renderOrderPaymentBadge(order, (o) => setManualPaymentOrder(o))}
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
                        {Number(getStatusId(order)) === 10 && (
                          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            কুরিয়ার পেইড (সেটেলমেন্ট বাকি)
                          </p>
                        )}
                        {Number(getStatusId(order)) === 6 && (
                          <p className="text-[10px] text-teal-600 font-medium mt-0.5">
                            কুরিয়ার টাকার অপেক্ষায়
                          </p>
                        )}
                        {Number(getStatusId(order)) === 9 && (
                          <p className="text-[10px] text-green-700 font-semibold mt-0.5">
                            ✓ সম্পূর্ণ নিষ্পন্ন
                          </p>
                        )}
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
            <div className="md:hidden p-3 sm:p-4 space-y-3 bg-gray-50/50">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleToggleSelectOrder(order.id)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-800 text-sm">
                            {order.order_number}
                          </p>
                          {(order.has_consignment || order.consignment_id || order.delivery_information?.consignment_id) && (
                            <span title="Locked - Consignment Created" className="text-amber-500">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        statusColorMap[getStatusName(order)] ||
                        "bg-gray-100 text-gray-600 border-gray-200"
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
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {order.user.name} &middot; {order.user.phone}
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-1 border border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-2">
                          {item.product_id ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/admin-panel/products/${item.product_id}`); }}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline leading-snug flex-1 text-left"
                            >
                              {item.product_name}
                            </button>
                          ) : (
                            <p className="text-xs text-gray-800 leading-snug flex-1">{item.product_name}</p>
                          )}
                          {item.shop && (
                            item.shop.id ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/admin-panel/vendors/${item.shop.id}`); }}
                                className="text-[11px] text-blue-400 hover:text-blue-600 hover:underline whitespace-nowrap"
                              >
                                {item.shop.shop_name}
                              </button>
                            ) : (
                              <p className="text-[11px] text-gray-400 whitespace-nowrap">{item.shop.shop_name}</p>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderOrderPaymentBadge(order, (o) => setManualPaymentOrder(o))}
                      <select
                        value={getStatusId(order) || ""}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="text-xs rounded-lg border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-red-500 bg-white"
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
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
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

      {/* Floating Batch Action Bar for Multi-Order Selection */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-semibold">
            <strong className="text-amber-400 font-mono text-sm">{selectedOrderIds.length}</strong>টি অর্ডার নির্বাচিত
          </span>
          <div className="h-4 w-px bg-gray-700" />
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
          >
            <FileText className="w-3.5 h-3.5" />
            ভেন্ডর সেটেলমেন্ট ইনভয়েস তৈরি করুন
          </button>
          <button
            type="button"
            onClick={() => setSelectedOrderIds([])}
            className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
          >
            মুছুন (Clear)
          </button>
        </div>
      )}

      {/* Vendor Settlement Invoice Modal */}
      {isInvoiceModalOpen && (
        <VendorSettlementInvoiceModal
          selectedOrders={selectedOrdersList}
          vendor={selectedVendor}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSuccess={() => {
            setSelectedOrderIds([]);
            refetch();
          }}
        />
      )}

      {/* Manual CarryBee Payment Modal */}
      {manualPaymentOrder && (
        <ManualCarrybeePaymentModal
          order={manualPaymentOrder}
          isOpen={Boolean(manualPaymentOrder)}
          onClose={() => setManualPaymentOrder(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};

export default AdminOrders;
