import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  MapPin,
  Phone,
  User,
  Truck,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useListCarryBeeStoresQuery,
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useGetCarryBeeAreaDetailsMutation,
  useCarrybeeOrderDraftCreateMutation,
  useLazyGetCarryBeeOrderDetailsQuery,
} from "../../../../redux/features/delivery_company/carrybeeStoreApi";
import { useUpdateOrderStatusMutation } from "../../../../redux/features/order";

/* ──────────────────────────────────────────
   Internal form sub-components
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

const FLD = ({ label, value, onChange, type = "text", suffix }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <div className="relative">
      <input type={type} value={value} onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-8" />
      {suffix && <div className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
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
   CarryBee Order Details Panel
────────────────────────────────────────── */
export const CarryBeeDetailsPanel = ({ details, isLoading, isError, onRetry }) => {
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
   CarryBee Delivery Info Card (shown on order page)
   Exported for use in AdminOrderDetails
────────────────────────────────────────── */
export const CarryBeeInfoCard = ({ deliveryInfo, onAssign }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [fetchDetails, { data: detailsData, isLoading, isError }] =
    useLazyGetCarryBeeOrderDetailsQuery();
  const details = detailsData?.data?.data;
    const userId = localStorage.getItem("userId");
  const handleToggle = () => {
    if (!showDetails && deliveryInfo) {
      fetchDetails({
        companyId: deliveryInfo.delivery_company_id,
        consignmentId: deliveryInfo.consignment_id,
      });
    }
    setShowDetails((p) => !p);
  };

  if (!deliveryInfo) return null;

  return (
    <div className="bg-white rounded-xl border border-teal-200">
      <div className="px-5 py-4 border-b border-teal-100 bg-teal-50 rounded-t-xl flex items-center justify-between">
        <h2 className="text-sm font-semibold text-teal-800 flex items-center gap-2">
          <Truck className="w-4 h-4" />
          CarryBee Delivery Info
        </h2>
        <button
          onClick={handleToggle}
          className="text-xs font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2 transition"
        >
          {showDetails ? "Hide" : "View delivery details"}
        </button>
      </div>
      <div className="px-5 py-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <p className="text-xs text-gray-400 mb-0.5">Consignment ID</p>
            <p className="font-bold text-gray-900 font-mono text-xs tracking-wide">{deliveryInfo.consignment_id}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <p className="text-xs text-gray-400 mb-0.5">Merchant Order ID</p>
            <p className="font-semibold text-gray-800 text-xs">{deliveryInfo.merchant_order_id}</p>
          </div>
        </div>
        <div className="space-y-1.5 text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Recipient</span>
            <span className="font-medium text-gray-800">{deliveryInfo.recipient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Phone</span>
            <span>{deliveryInfo.recipient_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Address</span>
            <span className="text-right max-w-[55%]">{deliveryInfo.recipient_address}</span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Collectable</span>
            <span className="font-medium text-gray-800">৳{deliveryInfo.collectable_amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Delivery Fee</span>
            <span>৳{deliveryInfo.delivery_fee}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-800">
            <span>Total Fee</span>
            <span>৳{deliveryInfo.total_fee}</span>
          </div>
        </div>
      </div>
      {showDetails && (
        <CarryBeeDetailsPanel
          details={details}
          isLoading={isLoading}
          isError={isError}     
          onRetry={() => fetchDetails({
            companyId: deliveryInfo.delivery_company_id,
            consignmentId: deliveryInfo.consignment_id,
          })}
        /> 
      )}
    </div>
  );
};

/* ──────────────────────────────────────────
   Assign CarryBee Modal
────────────────────────────────────────── */
const AssignCarryBeeModal = ({ order, onClose }) => {
  const companyId = "1";
  const userId = localStorage.getItem("userId");
  const [storeId, setStoreId] = useState("");
  const [cityId, setCityId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
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
    own_vendor_id: "",
    own_created_by: "",
    own_admin_status: "",
    own_is_vendor_ready: false,
    own_note: "",
  });

  const { data: storesData } = useListCarryBeeStoresQuery(companyId);
  const stores = Array.isArray(storesData?.data?.data?.stores) ? storesData.data.data.stores : [];

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery(companyId);
  const { data: zonesData, isLoading: zonesLoading } = useGetZonesQuery(
    { companyId, cityId }, { skip: !cityId }
  );
  const { data: areasData, isLoading: areasLoading } = useGetAreasQuery(
    { companyId, cityId, zoneId }, { skip: !cityId || !zoneId }
  );

  const cityOptions = (citiesData?.data?.data?.cities || []).map((c) => ({ value: c.id, label: c.name }));
  const zoneOptions = (zonesData?.data?.data?.zones || []).map((z) => ({ value: z.id, label: z.name }));
  const areaOptions = (areasData?.data?.data?.areas || []).map((a) => ({ value: a.id, label: a.name }));

  useEffect(() => { setZoneId(""); setAreaId(""); }, [cityId]);
  useEffect(() => { setAreaId(""); }, [zoneId]);

  const [getAreaDetails, { isLoading: addressLookupLoading }] = useGetCarryBeeAreaDetailsMutation();
  const autoZoneRef = useRef(null);

  const handleGetCityZone = async () => {
    const address = form.recipient_address?.trim();
    if (!address) return;
    try {
      const res = await getAreaDetails({ companyId, query: address }).unwrap();
      const { city_id, zone_id } = res?.data ?? {};
      if (city_id) {
        autoZoneRef.current = zone_id ? String(zone_id) : null;
        setCityId(String(city_id));
        setAutoDetected(true);
      }
    } catch {
      // silently ignore — user can still pick manually
    }
  };

  useEffect(() => {
    if (!autoZoneRef.current || !zonesData) return;   
    const pending = autoZoneRef.current;
    const exists = (zonesData?.data?.data?.zones || []).some((z) => String(z.id) === pending);
    if (exists) {
      setZoneId(pending);
      autoZoneRef.current = null;
    }
  }, [zonesData]);

  const [createOrder, { isLoading: submitting }] = useCarrybeeOrderDraftCreateMutation();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [formError, setFormError] = useState("");

  const setField = (k) => (e) => setForm((p) => ({
    ...p,
    [k]: e.target.type === "checkbox" ? e.target.checked
       : e.target.type === "number"   ? Number(e.target.value)
       : e.target.value,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!storeId || !cityId || !zoneId) {
      setFormError("Please select Store, City and Zone before submitting.");
      return;
    }
    const confirmed = window.confirm(`Assign order ${order.order_number} to CarryBee?`);
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
        area_id: areaId ? Number(areaId) : null,
        special_instruction: form.special_instruction || null,
        product_description: form.product_description || null,
        item_weight: Number(form.item_weight),
        item_quantity: Number(form.item_quantity),
        collectable_amount: Number(form.collectable_amount),
        is_closed_box: form.is_closed_box,
        is_exchange: form.is_exchange,
        own_vendor_id: order.vendor_id ? Number(order.vendor_id) : null,
        own_created_by: userId ? Number(userId) : null,
        own_admin_status: form.own_admin_status || null,
        own_is_vendor_ready: form.own_is_vendor_ready,
        own_note: form.own_note || null,
      }).unwrap();
      await updateStatus({ id: order.id, status_id: 2 });
      toast.success("Order successfully assigned to CarryBee!");
      window.location.reload();
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
            Draft to CarryBee Order
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Store */}
            <SL label="Store *" value={storeId} onChange={setStoreId}
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Select store" />

            {/* Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FLD label="Recipient Name *" value={form.recipient_name} onChange={setField("recipient_name")} />
              <FLD label="Recipient Phone *" value={form.recipient_phone} onChange={setField("recipient_phone")} />
              <FLD label="Secondary Phone" value={form.recipient_secendary_phone} onChange={setField("recipient_secendary_phone")} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Recipient Address *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.recipient_address}
                    onChange={setField("recipient_address")}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleGetCityZone}
                    disabled={!form.recipient_address?.trim() || addressLookupLoading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {addressLookupLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <MapPin className="w-3.5 h-3.5" />
                    }
                    Get City &amp; Zone
                  </button>
                </div>
              </div>
            </div>

            {/* Geo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SL label="City *" value={cityId}
                onChange={(v) => { setCityId(v); setAutoDetected(false); }}
                options={cityOptions}
                placeholder={citiesLoading ? "Loading..." : "Select city"}
                disabled={citiesLoading} />
              <SL label="Zone *" value={zoneId}
                onChange={(v) => { setZoneId(v); setAutoDetected(false); }}
                options={zoneOptions}
                placeholder={!cityId ? "Select city first" : zonesLoading ? "Loading..." : "Select zone"}
                disabled={!cityId || zonesLoading} />
              <SL label="Area" value={areaId} onChange={setAreaId}
                options={areaOptions}
                placeholder={!zoneId ? "Select zone first" : areasLoading ? "Loading..." : "Select area"}
                disabled={!zoneId || areasLoading} />
            </div>

            {/* Selected location chips */}
            {(cityId || zoneId || areaId) && (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mr-1">Selected:</span>
                {cityId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {cityOptions.find((c) => String(c.value) === String(cityId))?.label ?? `City #${cityId}`}
                    {autoDetected && (
                      <span className="ml-0.5 px-1.5 py-px text-[9px] font-bold bg-blue-100 text-blue-500 rounded-full leading-tight">AUTO</span>
                    )}
                  </span>
                )}
                {zoneId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                    </svg>
                    {zoneOptions.find((z) => String(z.value) === String(zoneId))?.label ?? `Zone #${zoneId}`}
                    {autoDetected && (
                      <span className="ml-0.5 px-1.5 py-px text-[9px] font-bold bg-purple-100 text-purple-500 rounded-full leading-tight">AUTO</span>
                    )}
                  </span>
                )}
                {areaId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" />
                    </svg>
                    {areaOptions.find((a) => String(a.value) === String(areaId))?.label ?? `Area #${areaId}`}
                  </span>
                )}
              </div>
            )}

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

            {/* Internal / Admin */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Internal / Admin Note</p>
             
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Note</label>
                <textarea
                  value={form.own_note}
                  onChange={setField("own_note")}
                  rows={2}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              {/* <CHK label="Vendor Ready" checked={form.own_is_vendor_ready} onChange={setField("own_is_vendor_ready")} /> */}
            </div>

            {formError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Draft CarryBee Order
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AssignCarryBeeModal;