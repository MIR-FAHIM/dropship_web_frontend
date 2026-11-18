import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useListOrdersByUserQuery } from "../../../redux/features/order";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import Pagination from "../../../components/shared/Pagination";
import OrderJourneyTabs, { journeyStageLabel } from "../../../components/shared/OrderJourneyTabs";
import useUrlFilters from "../../../hooks/useUrlFilters";
import { FaBoxOpen, FaChevronRight, FaMicrophone, FaSearch, FaTimes } from "react-icons/fa";
import { imgBaseUrl } from "../../../../config";
import InvoiceFlags from "../../../components/shared/InvoiceFlags";
import { Check, Copy, Truck } from "lucide-react";

// "Profit payout · Paid/Unpaid" badge opens that payout invoice.
const PAYOUT_LINK = { dropshipper: (inv) => `/app/billing/payout-invoices?search=${encodeURIComponent(inv.invoice_number)}&open=1` };
const PAYOUT_LABEL = { dropshipper: "Profit payout" };

/* ── order item thumbnails ── */
const itemImageUrl = (item) => {
  const image = item?.product?.primary_image;
  if (!image) return null;
  if (image.external_link) return image.external_link;
  if (!image.file_name) return null;
  return /^https?:\/\//i.test(image.file_name) ? image.file_name : `${imgBaseUrl}/${image.file_name}`;
};

const ItemThumb = ({ item, size = "h-10 w-10" }) => {
  const [failed, setFailed] = useState(false);
  const src = itemImageUrl(item);
  if (!src || failed) {
    return (
      <span className={`${size} flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-300`} title={item?.product_name}>
        <FaBoxOpen />
      </span>
    );
  }
  return (
    <img src={src} alt={item?.product_name || "Product"} title={item?.product_name} loading="lazy" onError={() => setFailed(true)}
      className={`${size} shrink-0 rounded-lg border border-gray-200 bg-white object-cover`} />
  );
};

// Up to 3 item images, then "+N" for the rest.
const ItemThumbs = ({ items = [], size }) => {
  if (!items.length) return null;
  const shown = items.slice(0, 3);
  return (
    <div className="flex items-center gap-1">
      {shown.map((item) => <ItemThumb key={item.id} item={item} size={size} />)}
      {items.length > shown.length && (
        <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold text-gray-600">+{items.length - shown.length}</span>
      )}
    </div>
  );
};

/* ── separate search fields (keys = API params) ── */
const SEARCH_FIELDS = [
  { key: "consignment_id", label: "Consignment ID", inputMode: "text" },
  { key: "order_number", label: "Order ID", inputMode: "text" },
  { key: "customer_name", label: "Name", inputMode: "text" },
  { key: "customer_phone", label: "Phone Number", inputMode: "tel" },
];

const ORDER_STATUS_OPTIONS = [
  [1, "Pending"], [2, "Assigned To Vendor"], [3, "Vendor Is Ready"], [4, "Shipped"],
  [5, "Out for Delivery"], [6, "Delivered"], [13, "Partially Delivered"], [9, "Completed"],
  [10, "Carrybee Paid"], [12, "Return in Transit"], [8, "Returned"], [7, "Cancelled"], [11, "Lost / Damaged"],
];

/* ── Live Track: same look as the "Live Delivery Tracking" card on the order details page ── */
// Same sources the details page uses for the consignment ID.
const consignmentOf = (order) =>
  order?.delivery_information?.consignment_id ||
  order?.consignment_id ||
  order?.carry_bee_draft?.consignment_id ||
  order?.tracking_number ||
  order?.tracking_code ||
  null;

const trackPath = (id) => `/app/track-order?consignment_id=${encodeURIComponent(id)}`;

// Only for orders that have a consignment ID; the cell stays empty otherwise.
// eslint-disable-next-line react/prop-types
const LiveTrack = ({ consignmentId, compact = false }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  if (!consignmentId) return <span className="text-xs text-gray-400">—</span>;

  const stop = (e) => e.stopPropagation();
  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(consignmentId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: nothing to do
    }
  };

  return (
    <div className={compact ? "flex flex-wrap items-center justify-between gap-2" : "flex flex-col items-start gap-1.5"} onClick={stop}>
      {!compact && <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">Consignment ID:</span>}
      <div className="flex min-w-0 items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(trackPath(consignmentId)); }}
          title="ট্র্যাক পেজে যান"
          className="font-mono font-bold text-xs text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 transition hover:underline whitespace-nowrap"
        >
          {consignmentId}
        </button>
        <button
          type="button"
          onClick={copy}
          title={copied ? "কপি হয়েছে!" : "Consignment ID কপি করুন"}
          aria-label={copied ? "কপি হয়েছে" : "Consignment ID কপি করুন"}
          className="inline-flex items-center justify-center p-1 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 transition"
        >
          {/* Icon only: the tooltip says what it does; a check shows it was copied. */}
          {copied
            ? <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
            : <Copy className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />}
        </button>
      </div>
      <Link
        to={trackPath(consignmentId)}
        onClick={stop}
        title="রিয়েল টাইম ডেলিভারি স্ট্যাটাস ট্র্যাক করুন"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden="true" />
        <Truck className="w-3.5 h-3.5" aria-hidden="true" />
        Live Track
      </Link>
    </div>
  );
};

/* ── helpers ── */
const money = (n) => `৳${Number(n || 0).toLocaleString()}`;

// Same maths as the "Order Profit Calculation" box on the order details page:
// COD cash − admin price − delivery charge − 1% COD charge = profit.
const moneyBreakdown = (order) => {
  const profit = Number(order?.reseller_profit ?? 0);
  const delivery = Number(order?.shipping_fee ?? 0);
  const grand = Number(order?.grand_total ?? order?.total ?? 0);
  const codCash = Number(order?.delivery_information?.collectable_amount ?? order?.remaining_cod ?? grand);
  const codCharge = Math.round(codCash * 0.01);
  const adminPrice = Number(order?.admin_price_total ?? order?.admin_price ?? (codCash - delivery - codCharge - profit));
  return { codCash, adminPrice, delivery, codCharge, profit };
};

// Short, narrow money columns so Status gets the room.
const MONEY_HEADERS = ["Total COD", "Admin ৳", "Delivery", "1% COD", "Profit"];

// CarryBee stage under the status, left out when it just repeats the status ("Pending" twice).
const stageNote = (order) => {
  const label = journeyStageLabel(order?.journey);
  const status = typeof order?.status === "object" ? order?.status?.name : order?.status;
  return label && String(label).toLowerCase() !== String(status || "").toLowerCase() ? label : null;
};

const signedMoney = (n) => `${n >= 0 ? "+" : "−"}${money(Math.abs(n))}`;

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
// order.payment_status = whether the customer COD cash was collected (not the dropshipper payout).
const codCollectedLabel = (s) => (String(s).toLowerCase() === "paid" ? "Collected" : s ? "Not collected" : "—");

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
  // Filters and page live in the URL, so Back from the order details keeps them.
  const { get, update, clear, hasAny } = useUrlFilters();
  const page = Number(get("page", "1")) || 1;
  const perPage = get("per_page", "");
  const dateFilter = get("period", "all");
  const dateFrom = get("date_from");
  const dateTo = get("date_to");
  const section = get("section");
  const stage = get("stage");
  const setPage = (p) => update({ page: p > 1 ? p : "" }, { resetPage: false });

  // One box per field (URL keys = API params); typing is debounced into the URL.
  const urlFields = Object.fromEntries(SEARCH_FIELDS.map(({ key }) => [key, get(key)]));
  const urlFieldsKey = JSON.stringify(urlFields);
  const status = get("status");
  const [fields, setFields] = useState(urlFields);
  const setField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));
  const [voiceMessage, setVoiceMessage] = useState("");
  const userId = getFromLocalstorage("userId") || 1;

  // Keep the boxes in sync when the URL changes (Clear filters, Back).
  useEffect(() => { setFields(JSON.parse(urlFieldsKey)); }, [urlFieldsKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const patch = {};
      SEARCH_FIELDS.forEach(({ key }) => {
        const value = (fields[key] || "").trim();
        if (value !== urlFields[key]) patch[key] = value;
      });
      if (Object.keys(patch).length) update(patch);
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const { data: ordersData, error, isLoading, isFetching } = useListOrdersByUserQuery({
    userId,
    page,
    per_page: perPage || undefined,
    fields: { ...urlFields, status },
    period: dateFilter,
    date_from: dateFilter === "custom" ? dateFrom : undefined,
    date_to: dateFilter === "custom" ? dateTo : undefined,
    section: section || undefined,
    stage: stage || undefined,
  });

  const clearFilters = () => { clear(["per_page"]); setFields({}); setVoiceMessage(""); };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage("Voice search is not supported in this browser. You can type the search instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setVoiceMessage("Listening…");
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      // Spoken digits go to Phone, anything else to Name.
      const digits = transcript.replace(/[^0-9০-৯]/g, "");
      setField(digits.length >= 6 ? "customer_phone" : "customer_name", digits.length >= 6 ? digits : transcript);
      setVoiceMessage(transcript ? `Searching for “${transcript}”` : "No speech detected.");
    };
    recognition.onerror = () => setVoiceMessage("Could not recognize speech. Try again or type your search.");
    recognition.onend = () => setVoiceMessage((message) => message === "Listening…" ? "" : message);
    recognition.start();
  };

  const orders = ordersData?.data?.data || [];
  const totalPages = ordersData?.data?.last_page || 1;

  const filteredOrders = orders;

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
      <div className="w-full">

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

        {/* Separate search fields, like CarryBee */}
        <div className="mb-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {SEARCH_FIELDS.map(({ key, label, inputMode }) => (
              <label key={key} className="flex min-w-0 items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 sm:px-3 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <FaSearch className="text-gray-400 shrink-0 text-sm" aria-hidden="true" />
                <input
                  type="search"
                  inputMode={inputMode}
                  value={fields[key] || ""}
                  onChange={(event) => setField(key, event.target.value)}
                  placeholder={label}
                  aria-label={`Search by ${label}`}
                  className="w-full min-w-0 py-2.5 text-sm text-gray-800 placeholder:text-gray-500 outline-none bg-transparent"
                />
                {key === "customer_name" && (
                  <button type="button" onClick={startVoiceSearch} title="Search by voice in Bengali" aria-label="Search by voice" className="shrink-0 p-1 rounded text-indigo-600 hover:bg-indigo-50">
                    <FaMicrophone />
                  </button>
                )}
              </label>
            ))}
            <select
              value={status}
              onChange={(event) => update({ status: event.target.value })}
              aria-label="Order status"
              className={`col-span-2 lg:col-span-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${status ? "text-gray-800" : "text-gray-500"}`}
            >
              <option value="">Order Status</option>
              {ORDER_STATUS_OPTIONS.map(([id, name]) => <option key={id} value={id} className="text-gray-800">{name}</option>)}
            </select>
          </div>
          {voiceMessage && <p role="status" className="text-xs text-indigo-600 mt-2">{voiceMessage}</p>}
        </div>

        {/* Order date filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[['all', 'All'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['custom', 'Date range']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => update(value === "custom" ? { period: value } : { period: value, date_from: "", date_to: "" })}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition ${dateFilter === value ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"}`}
            >
              {label}
            </button>
          ))}
          {dateFilter === "custom" && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label className="text-xs text-gray-500">From
                <input type="date" value={dateFrom} onChange={(event) => update({ date_from: event.target.value })} className="ml-2 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700" />
              </label>
              <label className="text-xs text-gray-500">To
                <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => update({ date_to: event.target.value })} className="ml-2 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700" />
              </label>
            </div>
          )}
          {hasAny() && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 bg-white text-red-600 hover:bg-red-50 transition"
            >
              <FaTimes /> Clear filters
            </button>
          )}
        </div>

        {/* CarryBee-style sections and stage counts (server side, across all pages) */}
        <div className={`mb-5 ${isFetching ? "opacity-70" : ""}`}>
          <OrderJourneyTabs
            counts={ordersData?.data?.journey_counts}
            section={section}
            stage={stage}
            onChange={({ section: sec, stage: stg }) => update({ section: sec, stage: stg })}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <FaBoxOpen className="text-gray-300 text-5xl mx-auto mb-3" />
            <p className="text-gray-400 font-semibold">{hasAny() ? "No orders match these filters." : "No orders found."}</p>
          </div>
        ) : (
          <>
            {/* ── Cards on phones and tablets (table from lg) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/app/orders-details/${order.id}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:scale-[0.99] transition"
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-3">
                    <ItemThumbs items={order.items?.slice(0, 1)} size="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 break-all font-black text-gray-800 text-sm leading-snug">{order.order_number || `#${order.id}`}</p>
                        <span className={`shrink-0 max-w-[45%] truncate px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${statusStyle(getStatusName(order.status))}`} title={getStatusName(order.status)}>
                          {getStatusName(order.status) || "—"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 text-xs text-gray-500">
                        <span>{fmt(order.created_at)}{order.items?.length > 1 ? ` · ${order.items.length} items` : ""}</span>
                        {stageNote(order) && <span className="font-medium text-gray-600">{stageNote(order)}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                    <span className="shrink-0 text-gray-500 text-xs">Customer</span>
                    <span className="min-w-0 truncate font-semibold text-gray-700">{order.customer_name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm mb-3">
                    <span className="shrink-0 text-gray-500 text-xs">Phone</span>
                    <a href={order.customer_phone ? `tel:${order.customer_phone}` : undefined} onClick={(e) => e.stopPropagation()} className="font-semibold text-gray-700 tabular-nums">{order.customer_phone || "—"}</a>
                  </div>

                  {/* COD → profit breakdown */}
                  {(() => {
                    const b = moneyBreakdown(order);
                    return (
                      <div className="rounded-lg bg-gray-50 px-3 py-2 mb-3 text-xs">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {[["Total COD", money(b.codCash)], ["Admin ৳", `−${money(b.adminPrice)}`],
                            ["Delivery", `−${money(b.delivery)}`], ["1% COD", `−${money(b.codCharge)}`]].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-2">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-semibold tabular-nums text-gray-800">{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between border-t border-gray-200 pt-1.5">
                          <span className="font-bold text-gray-700">Profit</span>
                          <span className={`text-sm font-black tabular-nums ${b.profit >= 0 ? "text-green-700" : "text-red-600"}`}>{signedMoney(b.profit)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-base font-black text-indigo-700">{money(order.grand_total ?? order.total)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${payStyle(order.payment_status)}`} title="Customer COD cash collected?">{"COD: "}
                        {codCollectedLabel(order.payment_status)}
                      </span>
                      <InvoiceFlags invoices={order.invoices} kinds={["dropshipper"]} links={PAYOUT_LINK} labels={PAYOUT_LABEL} align="start" />
                    </div>
                    <FaChevronRight className="shrink-0 text-gray-300 text-sm" />
                  </div>
                  {consignmentOf(order) && (
                    <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
                      <LiveTrack consignmentId={consignmentOf(order)} compact />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Desktop table (lg+) ── */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order", "Live Track", "Date", "Customer", "Phone", "Total COD", "Admin ৳", "Delivery", "1% COD", "Profit", "Status", "COD Collected", ""].map((h) => (
                      <th key={h} className={`py-3 text-xs font-black text-gray-500 uppercase whitespace-nowrap ${MONEY_HEADERS.includes(h) ? "px-2 text-right tracking-normal" : "px-4 text-left tracking-wide"}`}>
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
                        <div className="flex items-center gap-3">
                          <ItemThumbs items={order.items} />
                          <div>
                            <p className="font-bold text-gray-800 whitespace-nowrap">{order.order_number || `#${order.id}`}</p>
                            <p className="text-[11px] text-gray-400">#{order.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <LiveTrack consignmentId={consignmentOf(order)} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(order.created_at)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{order.customer_name || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{order.customer_phone || "—"}</td>
                      {(() => {
                        const b = moneyBreakdown(order);
                        return (
                          <>
                            <td className="px-2 py-3 text-right text-xs font-black text-gray-900 whitespace-nowrap tabular-nums">{money(b.codCash)}</td>
                            <td className="px-2 py-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap tabular-nums">{money(b.adminPrice)}</td>
                            <td className="px-2 py-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap tabular-nums">{money(b.delivery)}</td>
                            <td className="px-2 py-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap tabular-nums">{money(b.codCharge)}</td>
                            <td className={`px-2 py-3 text-right text-xs font-black whitespace-nowrap tabular-nums ${b.profit >= 0 ? "text-green-700" : "text-red-600"}`}>{signedMoney(b.profit)}</td>
                          </>
                        );
                      })()}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyle(getStatusName(order.status))}`}>
                          {getStatusName(order.status) || "—"}
                        </span>
                        {stageNote(order) && <p className="mt-1.5 text-[11px] text-gray-500 whitespace-nowrap">{stageNote(order)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${payStyle(order.payment_status)}`}>
                          {codCollectedLabel(order.payment_status)}
                        </span>
                        <InvoiceFlags invoices={order.invoices} kinds={["dropshipper"]} links={PAYOUT_LINK} labels={PAYOUT_LABEL} align="start" />
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
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="text-xs text-gray-600 flex items-center gap-2">
            Per page
            <select
              value={perPage || String(ordersData?.data?.per_page || 15)}
              onChange={(event) => update({ per_page: event.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white"
            >
              {[...new Set([10, 15, 20, 50, 100, Number(perPage || ordersData?.data?.per_page || 15)])].sort((x, y) => x - y).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          {totalPages > 1 && (
            <Pagination
              currentPage={ordersData?.data?.current_page || 1}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
