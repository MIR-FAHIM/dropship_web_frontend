import React, { useState, useEffect } from "react";
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
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetOrderDetailsQuery,
  useUpdateOrderInfoMutation,
  useUpdateOrderStatusMutation,
  useGetOrderStatusSummaryQuery,
} from "../../../redux/features/order";
import { useListDeliveryCompaniesQuery } from "../../../redux/features/delivery_company";
import {
  useListCarryBeeStoresQuery,
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useCreateCarryBeeOrderMutation,
  useLazyGetCarryBeeOrderDetailsQuery,
} from "../../../redux/features/delivery_company/carrybeeStoreApi";

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
   CarryBee Order Details Panel
────────────────────────────────────────── */
const CarryBeeDetailsPanel = ({ details, isLoading, isError, onRetry }) => {
  if (isLoading)
    return (
      <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );

  if (isError || !details)
    return (
      <div className="px-5 py-4 text-sm text-red-500 flex items-center justify-between">
        <span>Failed to load data.</span>
        <button onClick={onRetry} className="text-xs text-red-600 underline">Retry</button>
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
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Status</span>
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
          <p className="text-xs text-gray-400">Recipient</p>
          <p className="font-medium text-gray-700">{details.recipient_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Phone</p>
          <p className="text-gray-700">{details.recipient_phone}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">Address</p>
          <p className="text-gray-700">{details.recipient_address}</p>
        </div>
      </div>

      <div className="border-t border-teal-100 pt-3 space-y-1.5">
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">Collectable</span>
          <span className="font-medium text-gray-800">৳{details.collectable_amount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">Collected</span>
          <span>৳{details.collected_amount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">Delivery Fee</span>
          <span>৳{details.delivery_fee}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">COD Fee</span>
          <span>৳{details.cod_fee}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-gray-400">Delivery Attempts</span>
          <span>{details.attempt}</span>
        </div>
        <div className="flex justify-between text-gray-400 text-xs pt-1">
          <span>Last Updated</span>
          <span>{new Date(details.updated_at).toLocaleString("en-US")}</span>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────
   Stable sub-components (must live outside modal
   so React doesn't remount them on every render)
────────────────────────────────────────── */
const SL = ({ label, value, onChange, options, placeholder, disabled }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 pr-7">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const FLD = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input type={type} value={value} onChange={onChange}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
  </div>
);

const CHK = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
    {label}
  </label>
);

/* ──────────────────────────────────────────
   CarryBee Assignment Modal
────────────────────────────────────────── */
const AssignCarryBeeModal = ({ order, onClose }) => {
  const { data: companiesData } = useListDeliveryCompaniesQuery();
  const companies = Array.isArray(companiesData?.data?.data) ? companiesData.data.data : [];

  const [companyId, setCompanyId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [cityId, setCityId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [form, setForm] = useState({
    delivery_type: 1,
    product_type: 1,
    recipient_name: order.customer_name || "",
    recipient_phone: order.customer_phone || "",
    recipient_secendary_phone: "",
    recipient_address: order.shipping_address || "",
    special_instruction: "",
    product_description: "",
    item_weight: 500,
    item_quantity: order.items?.reduce((s, i) => s + Number(i.qty || 1), 0) || 1,
    collectable_amount: Number(order.total || 0),
    is_closed_box: false,
    is_exchange: false,
  });

  const { data: storesData } = useListCarryBeeStoresQuery(companyId, { skip: !companyId });
  const stores = Array.isArray(storesData?.data?.data?.stores) ? storesData.data.data.stores : [];

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(companyId, { skip: !companyId });
  const { data: zonesData, isLoading: zonesLoading } = useGetZonesQuery(
    { companyId, cityId }, { skip: !companyId || !cityId }
  );
  const { data: areasData, isLoading: areasLoading } = useGetAreasQuery(
    { companyId, cityId, zoneId }, { skip: !companyId || !cityId || !zoneId }
  );

  const cityOptions = (citiesData?.data?.data?.cities || []).map((c) => ({ value: c.id, label: c.name }));
  const zoneOptions = (zonesData?.data?.data?.zones || []).map((z) => ({ value: z.id, label: z.name }));
  const areaOptions = (areasData?.data?.data?.areas || []).map((a) => ({ value: a.id, label: a.name }));

  useEffect(() => { setStoreId(""); setCityId(""); setZoneId(""); setAreaId(""); }, [companyId]);
  useEffect(() => { setZoneId(""); setAreaId(""); }, [cityId]);
  useEffect(() => { setAreaId(""); }, [zoneId]);

  const [createOrder, { isLoading: submitting }] = useCreateCarryBeeOrderMutation();
  const [createdOrder, setCreatedOrder] = useState(null);

  const setField = (k) => (e) => setForm((p) => ({
    ...p,
    [k]: e.target.type === "checkbox" ? e.target.checked
       : e.target.type === "number"   ? Number(e.target.value)
       : e.target.value,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !storeId || !cityId || !zoneId || !areaId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const confirmed = window.confirm(
      `Assign order ${order.order_number} to CarryBee?`
    );
    if (!confirmed) return;
    try {
      const res = await createOrder({
        companyId,
        order_id: order.id,
        store_id: Number(storeId),
        merchant_order_id: order.order_number,
        delivery_type: Number(form.delivery_type),
        product_type: Number(form.product_type),
        recipient_phone: form.recipient_phone,
        recipient_secendary_phone: form.recipient_secendary_phone || null,
        recipient_name: form.recipient_name,
        recipient_address: form.recipient_address,
        city_id: Number(cityId),
        zone_id: Number(zoneId),
        area_id: Number(areaId),
        special_instruction: form.special_instruction || null,
        product_description: form.product_description || null,
        item_weight: Number(form.item_weight),
        item_quantity: Number(form.item_quantity),
        collectable_amount: Number(form.collectable_amount),
        is_closed_box: form.is_closed_box,
        is_exchange: form.is_exchange,
      }).unwrap();
      setCreatedOrder(res?.data?.data?.order || null);
      toast.success("Order successfully assigned to CarryBee!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to assign order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-500" />
            {createdOrder ? "CarryBee Order Created" : "Assign to CarryBee"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {createdOrder ? (
          /* ── Success Review Card ── */
          <div className="p-6 space-y-5">
            {/* Header badge */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Order created successfully!</p>
                <p className="text-xs text-green-600 mt-0.5">Assignment to CarryBee completed.</p>
              </div>
            </div>

            {/* Consignment & IDs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Consignment ID</p>
                <p className="text-sm font-bold text-gray-900 font-mono tracking-wide">{createdOrder.consignment_id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Merchant Order ID</p>
                <p className="text-sm font-semibold text-gray-800">{createdOrder.merchant_order_id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">CarryBee Order ID</p>
                <p className="text-sm font-semibold text-gray-800">#{createdOrder.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Store ID</p>
                <p className="text-sm font-semibold text-gray-800">{createdOrder.store_id}</p>
              </div>
            </div>

            {/* Recipient */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recipient Info</p>
              </div>
              <div className="px-4 py-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{createdOrder.recipient_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{createdOrder.recipient_phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span>{createdOrder.recipient_address}</span>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Charge Details</p>
              </div>
              <div className="px-4 py-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Collectable Amount</span>
                  <span className="font-medium text-gray-800">৳{createdOrder.collectable_amount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>৳{createdOrder.delivery_fee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>COD Fee</span>
                  <span>৳{createdOrder.cod_fee}</span>
                </div>
                {Number(createdOrder.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{createdOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total Fee</span>
                  <span>৳{createdOrder.total_fee}</span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
              <div><span className="text-gray-400 block">Weight</span>{createdOrder.weight_in_kg} kg</div>
              <div><span className="text-gray-400 block">Quantity</span>{createdOrder.quantity}</div>
              <div><span className="text-gray-400 block">Delivery Type</span>{createdOrder.delivery_type === 1 ? "Regular" : "Express"}</div>
              {createdOrder.product_description && (
                <div className="col-span-2"><span className="text-gray-400 block">Product Description</span>{createdOrder.product_description}</div>
              )}
              {createdOrder.special_instruction && (
                <div className="col-span-2"><span className="text-gray-400 block">Special Instruction</span>{createdOrder.special_instruction}</div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                Back
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Company & Store */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SL label="Delivery Company *" value={companyId} onChange={setCompanyId}
              options={companies.map((c) => ({ value: c.id, label: c.company_name }))}
              placeholder="Select company" />
            <SL label="Store *" value={storeId} onChange={setStoreId}
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
              placeholder={!companyId ? "Select company first" : "Select store"}
              disabled={!companyId} />
          </div>

          {/* Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FLD label="Recipient Name *" value={form.recipient_name} onChange={setField("recipient_name")} />
            <FLD label="Recipient Phone *" value={form.recipient_phone} onChange={setField("recipient_phone")} />
            <FLD label="Secondary Phone" value={form.recipient_secendary_phone} onChange={setField("recipient_secendary_phone")} />
            <FLD label="Recipient Address *" value={form.recipient_address} onChange={setField("recipient_address")} />
          </div>

          {/* Geo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SL label="City *" value={cityId} onChange={setCityId}
              options={cityOptions}
              placeholder={!companyId ? "Select company first" : citiesLoading ? "Loading..." : "Select city"}
              disabled={!companyId || citiesLoading} />
            <SL label="Zone *" value={zoneId} onChange={setZoneId}
              options={zoneOptions}
              placeholder={!cityId ? "Select city first" : zonesLoading ? "Loading..." : "Select zone"}
              disabled={!cityId || zonesLoading} />
            <SL label="Area *" value={areaId} onChange={setAreaId}
              options={areaOptions}
              placeholder={!zoneId ? "Select zone first" : areasLoading ? "Loading..." : "Select area"}
              disabled={!zoneId || areasLoading} />
          </div>

          {/* Order info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Delivery Type</label>
              <select value={form.delivery_type} onChange={setField("delivery_type")}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value={1}>Regular</option>
                <option value={2}>Express</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Product Type</label>
              <select value={form.product_type} onChange={setField("product_type")}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value={1}>Normal</option>
                <option value={2}>Liquid</option>
                <option value={3}>Fragile</option>
              </select>
            </div>
            <FLD label="Weight (grams) *" value={form.item_weight} onChange={setField("item_weight")} type="number" />
            <FLD label="Quantity *" value={form.item_quantity} onChange={setField("item_quantity")} type="number" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FLD label="Collectable Amount *" value={form.collectable_amount} onChange={setField("collectable_amount")} type="number" />
            <FLD label="Product Description" value={form.product_description} onChange={setField("product_description")} />
          </div>

          <FLD label="Special Instruction" value={form.special_instruction} onChange={setField("special_instruction")} />

          <div className="flex items-center gap-6">
            <CHK label="Closed Box" checked={form.is_closed_box} onChange={setField("is_closed_box")} />
            <CHK label="Exchange" checked={form.is_exchange} onChange={setField("is_exchange")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Assign to CarryBee
            </button>
          </div>
          </form>
        )}
      </div>
    </div>
  );
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetOrderDetailsQuery(id);
  const { data: summaryData } = useGetOrderStatusSummaryQuery();
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [updateOrderInfo, { isLoading: isSavingInfo }] =
    useUpdateOrderInfoMutation();
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({});
  const [carryBeeOpen, setCarryBeeOpen] = useState(false);
  const [showCarryBeeDetails, setShowCarryBeeDetails] = useState(false);
  const [fetchCarryBeeDetails, { data: cbDetailsData, isLoading: cbDetailsLoading, isError: cbDetailsError }] =
    useLazyGetCarryBeeOrderDetailsQuery();
  const cbDetails = cbDetailsData?.data?.data;

  const handleShowCarryBeeDetails = () => {
    if (!showCarryBeeDetails && order?.delivery_information) {
      fetchCarryBeeDetails({
        companyId: order.delivery_information.delivery_company_id,
        consignmentId: order.delivery_information.consignment_id,
      });
    }
    setShowCarryBeeDetails((p) => !p);
  };

  const order = data?.data || null;
  const statusList = summaryData?.data || [];

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

  const handleEditInfo = () => {
    setInfoForm({
      customer_name: order.customer_name || "",
      customer_phone: order.customer_phone || "",
      shipping_address: order.shipping_address || "",
      zone: order.zone || "",
      note: order.note || "",
    });
    setEditingInfo(true);
  };

  const handleSaveInfo = async () => {
    try {
      await updateOrderInfo({ id: order.id, ...infoForm }).unwrap();
      toast.success("Order info updated.");
      setEditingInfo(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update.");
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
          Failed to load order.
        </p>
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
          {order.delivery_information ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full">
              <Truck className="w-3.5 h-3.5" /> CarryBee Assigned
            </span>
          ) : (
            <button
              onClick={() => setCarryBeeOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition"
            >
              <Truck className="w-4 h-4" /> Assign CarryBee
            </button>
          )}
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
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
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
                      <span>Qty: {item.qty}</span>
                      <span>Unit price: {formatCurrency(item.unit_price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">
                      {formatCurrency(item.line_total)}
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
              ))}
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
                <span className="text-base">{formatCurrency(order.total)}</span>
              </div>
              {Number(order.reseller_profit) > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Reseller Profit</span>
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
                  Status History
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
              {!editingInfo ? (
                <button
                  onClick={handleEditInfo}
                  className="text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 transition"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingInfo(false)}
                    disabled={isSavingInfo}
                    className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInfo}
                    disabled={isSavingInfo}
                    className="text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1 font-medium transition disabled:opacity-60 flex items-center gap-1"
                  >
                    {isSavingInfo && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              {editingInfo ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Customer Name</label>
                    <input
                      value={infoForm.customer_name}
                      onChange={(e) => setInfoForm((p) => ({ ...p, customer_name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                    <input
                      value={infoForm.customer_phone}
                      onChange={(e) => setInfoForm((p) => ({ ...p, customer_phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Shipping Address</label>
                    <textarea
                      rows={3}
                      value={infoForm.shipping_address}
                      onChange={(e) => setInfoForm((p) => ({ ...p, shipping_address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Zone</label>
                    <input
                      value={infoForm.zone}
                      onChange={(e) => setInfoForm((p) => ({ ...p, zone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Note</label>
                    <textarea
                      rows={2}
                      value={infoForm.note}
                      onChange={(e) => setInfoForm((p) => ({ ...p, note: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="font-medium text-gray-800">{order.customer_name}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">{order.customer_phone}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 whitespace-pre-line">{order.shipping_address}</p>
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
                </>
              )}
            </div>
          </div>

          {/* Dropshipper Info */}
          {order.user_id && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Dropshipper
                </h2>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                <p>Order By: {order.user.name}</p>
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

          {/* CarryBee Delivery Info */}
          {order.delivery_information ? (
            <div className="bg-white rounded-xl border border-teal-200">
              <div className="px-5 py-4 border-b border-teal-100 bg-teal-50 rounded-t-xl flex items-center justify-between">
                <h2 className="text-sm font-semibold text-teal-800 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  CarryBee Delivery Info
                </h2>
                <button
                  onClick={handleShowCarryBeeDetails}
                  className="text-xs font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2 transition"
                >
                  {showCarryBeeDetails ? "Hide" : "View delivery details"}
                </button>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-0.5">Consignment ID</p>
                    <p className="font-bold text-gray-900 font-mono text-xs tracking-wide">{order.delivery_information.consignment_id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-0.5">Merchant Order ID</p>
                    <p className="font-semibold text-gray-800 text-xs">{order.delivery_information.merchant_order_id}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recipient</span>
                    <span className="font-medium text-gray-800">{order.delivery_information.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone</span>
                    <span>{order.delivery_information.recipient_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Address</span>
                    <span className="text-right max-w-[55%]">{order.delivery_information.recipient_address}</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Collectable</span>
                    <span className="font-medium text-gray-800">৳{order.delivery_information.collectable_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span>৳{order.delivery_information.delivery_fee}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>Total Fee</span>
                    <span>৳{order.delivery_information.total_fee}</span>
                  </div>
                </div>
              </div>
              {showCarryBeeDetails && (
                <CarryBeeDetailsPanel
                  details={cbDetails}
                  isLoading={cbDetailsLoading}
                  isError={cbDetailsError}
                  onRetry={() => fetchCarryBeeDetails({
                    companyId: order.delivery_information.delivery_company_id,
                    consignmentId: order.delivery_information.consignment_id,
                  })}
                />
              )}
            </div>
          ) : null}

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
    </div>
  );
};

export default AdminOrderDetails;
