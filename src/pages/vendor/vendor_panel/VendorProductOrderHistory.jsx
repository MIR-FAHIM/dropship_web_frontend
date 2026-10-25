import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AlertCircle, ChevronDown, ChevronRight, Filter, Loader2, Package, RefreshCw, RotateCcw } from "lucide-react";
import Pagination from "../../../components/shared/Pagination";
import { useGetVendorIdQuery } from "../../../redux/features/vendor_api";
import { useGetOrderStatusSummaryQuery } from "../../../redux/features/order";
import { refreshVendorOrderHistory, useGetVendorProductOrderHistoryQuery, useGetVendorProductOrderHistoryOrdersQuery } from "../../../redux/features/orderHistory";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { groupOrderParams, historyErrorMessage, historyRequestParams, readHistoryFilters, validateHistoryFilters } from "../../../utils/vendorOrderHistory.utils";

const inputClass = "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const money = (amount) => amount == null ? "-" : new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(Number(amount));
const date = (value) => {
  if (!value) return "-";
  // Keep a database date in its supplied timezone instead of implicitly shifting it.
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? new Date(match[1] + "T00:00:00").toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" }) : "-";
};

function StatusBadge({ value }) {
  const status = String(value || "").toLowerCase();
  const color = ["completed", "delivered", "paid"].includes(status) ? "bg-green-50 text-green-700" :
    ["cancelled", "returned", "failed", "refunded"].includes(status) ? "bg-red-50 text-red-700" :
      ["pending", "unpaid", "partially_paid"].includes(status) ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-700";
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${color}`}>{value || "-"}</span>;
}
StatusBadge.propTypes = { value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) };

function LoadState({ error, loading, retry, empty = "No matching orders found." }) {
  if (loading) return <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin text-blue-600" />Loading order history...</div>;
  if (error) return <div role="alert" className="px-4 py-10 text-center"><AlertCircle className="mx-auto h-6 w-6 text-red-600" /><p className="mx-auto mt-2 max-w-xl break-words text-sm text-red-700">{historyErrorMessage(error)}</p><button type="button" onClick={retry} disabled={loading} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Retry</button></div>;
  return <div className="py-16 text-center text-sm text-gray-500"><Package className="mx-auto mb-3 h-8 w-8 text-gray-300" />{empty}</div>;
}
LoadState.propTypes = { error: PropTypes.object, loading: PropTypes.bool, retry: PropTypes.func, empty: PropTypes.string };

function HistoryPagination({ paginator, loading, onChange }) {
  return <div className="border-t border-gray-200 px-4 py-3">
    <p className="text-xs text-gray-500">{paginator.from ?? 0}-{paginator.to ?? 0} of {paginator.total}</p>
    {paginator.last_page > 1 && <div className={loading ? "pointer-events-none opacity-50" : ""} aria-busy={loading}>
      <Pagination currentPage={paginator.current_page} totalPages={paginator.last_page} onPageChange={onChange} />
    </div>}
  </div>;
}
HistoryPagination.propTypes = { paginator: PropTypes.object.isRequired, loading: PropTypes.bool, onChange: PropTypes.func.isRequired };

function GroupOrders({ group, filters, sessionKey, initialOrders }) {
  const [page, setPage] = useState(1);
  const { currentData, isFetching, isError, error, refetch } = useGetVendorProductOrderHistoryOrdersQuery({
    ...groupOrderParams(group, filters, page), _sessionKey: sessionKey,
  }, { skip: page === 1 && Boolean(initialOrders) });
  const paginator = page === 1 && initialOrders ? initialOrders : currentData?.data?.orders;
  if (error?.status === 401) return <Navigate to="/vendor-login" replace />;
  if (isFetching || isError || !paginator?.data?.length) return <LoadState loading={isFetching} error={isError ? error : undefined} retry={refetch} />;
  return <section aria-label="Orders in product group" className="min-w-0 bg-gray-50/70">
    {paginator.data.map((order) => (
      <article key={order.order_id} className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <Link to={`/vendor-panel/orders/${order.order_id}`} className="break-all font-semibold text-blue-700 hover:underline">{order.order_number || `Order #${order.order_id}`}</Link>
            <p className="mt-1 text-xs text-gray-500">#{order.order_id} · {date(order.order_date)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={order.order_status?.name || order.status} /><StatusBadge value={order.payment_status} />
            <span className="text-xs text-gray-600">Quantity: <strong>{order.quantity}</strong></span>
            <span className="text-xs text-gray-600">Subtotal: <strong className="tabular-nums text-gray-900">{money(order.subtotal)}</strong></span>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <caption className="sr-only">Matching order item snapshots</caption>
            <thead className="border-y border-gray-200 text-gray-500"><tr>{["Product / Variant", "Quantity", "Vendor Unit Price", "Selling Price", "Subtotal", "Item Status"].map((label) => <th key={label} scope="col" className="px-3 py-2 font-medium">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => <tr key={item.id}>
                <td className="max-w-64 break-words px-3 py-3"><span className="font-medium text-gray-800">{item.product_name || "Unavailable product"}</span><p className="mt-1 text-gray-500">{item.sku || "-"}{item.attribute_id ? ` · Variant #${item.attribute_id}` : ""}</p></td>
                <td className="px-3 py-3 tabular-nums">{item.qty}</td><td className="px-3 py-3 whitespace-nowrap tabular-nums">{money(item.unit_price)}</td><td className="px-3 py-3 whitespace-nowrap tabular-nums">{money(item.reseller_price)}</td><td className="px-3 py-3 whitespace-nowrap tabular-nums">{money(item.line_total)}</td><td className="px-3 py-3"><StatusBadge value={item.status} /></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </article>
    ))}
    <HistoryPagination paginator={paginator} loading={isFetching} onChange={setPage} />
  </section>;
}
GroupOrders.propTypes = { group: PropTypes.object.isRequired, filters: PropTypes.object.isRequired, sessionKey: PropTypes.string.isRequired, initialOrders: PropTypes.object };

function HistoryFilters({ filters, shopId, shopName, statuses, statusError, loading, onApply, onReset }) {
  const [draft, setDraft] = useState(filters);
  const [validation, setValidation] = useState("");
  const change = (field, value) => { setDraft((previous) => ({ ...previous, [field]: value })); setValidation(""); };
  const submit = (event) => {
    event.preventDefault();
    const values = { ...draft, ...Object.fromEntries(new FormData(event.currentTarget)) };
    const message = validateHistoryFilters(values);
    setValidation(message);
    if (!message) onApply(values);
  };
  return <form onSubmit={submit} className="space-y-3 border-y border-gray-200 bg-gray-50/70 py-4">
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label className="min-w-0 text-xs font-medium text-gray-600">Product ID<input name="product_id" type="number" min="1" step="1" value={draft.product_id} onChange={(event) => change("product_id", event.target.value)} placeholder="All products" className={`mt-1.5 ${inputClass}`} /></label>
      <label className="min-w-0 text-xs font-medium text-gray-600">Shop<select name="shop_id" value={draft.shop_id} onChange={(event) => change("shop_id", event.target.value)} className={`mt-1.5 ${inputClass}`}><option value="">All my shops</option>{shopId && <option value={shopId}>{shopName || `My shop #${shopId}`}</option>}{draft.shop_id && String(draft.shop_id) !== String(shopId) && <option value={draft.shop_id}>Shop #{draft.shop_id}</option>}</select></label>
      <label className="min-w-0 text-xs font-medium text-gray-600">Order Status<select name="status" value={draft.status} onChange={(event) => change("status", event.target.value)} disabled={statusError} className={`mt-1.5 disabled:opacity-60 ${inputClass}`}><option value="">{statusError ? "Status options unavailable" : "All order statuses"}</option>{statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}{draft.status && !statuses.some((status) => String(status.id) === draft.status) && <option value={draft.status}>Status #{draft.status}</option>}</select></label>
      <label className="min-w-0 text-xs font-medium text-gray-600">Payment Status<select name="payment_status" value={draft.payment_status} onChange={(event) => change("payment_status", event.target.value)} className={`mt-1.5 ${inputClass}`}><option value="">All payment statuses</option>{["unpaid", "paid", "failed", "refunded", "pending", "partially_paid"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
      <label className="min-w-0 text-xs font-medium text-gray-600">From Date<input name="date_from" type="date" value={draft.date_from} onChange={(event) => change("date_from", event.target.value)} className={`mt-1.5 ${inputClass}`} /></label>
      <label className="min-w-0 text-xs font-medium text-gray-600">To Date<input name="date_to" type="date" value={draft.date_to} min={draft.date_from || undefined} onChange={(event) => change("date_to", event.target.value)} className={`mt-1.5 ${inputClass}`} /></label>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="submit" disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}{loading ? "Loading..." : "Apply Filters"}</button>
      <button type="button" onClick={onReset} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60"><RotateCcw className="h-4 w-4" />Reset</button>
    </div>
    {validation && <p role="alert" className="text-sm text-red-700">{validation}</p>}
  </form>;
}
HistoryFilters.propTypes = { filters: PropTypes.object.isRequired, shopId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), shopName: PropTypes.string, statuses: PropTypes.array.isRequired, statusError: PropTypes.bool, loading: PropTypes.bool, onApply: PropTypes.func.isRequired, onReset: PropTypes.func.isRequired };

function ProductGroups({ groups, filters, sessionKey, loading, initialOrders }) {
  const [expanded, setExpanded] = useState(null);
  return <div className="overflow-x-auto border-y border-gray-200 bg-white" aria-busy={loading}>
    <table className="w-full min-w-[680px] text-left text-sm">
      <caption className="sr-only">Order history grouped by product and fulfillment shop</caption>
      <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500"><tr><th scope="col" className="w-14 px-4 py-3"><span className="sr-only">Expand orders</span></th>{["Product", "Shop", "Quantity", "Orders", "Product Sales"].map((label) => <th key={label} scope="col" className={`px-4 py-3 ${["Quantity", "Orders", "Product Sales"].includes(label) ? "text-right" : ""}`}>{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-gray-200">
        {groups.map((group) => {
          const key = `${group.product_id ?? "unlinked"}-${group.shop_id}`;
          const name = group.product_name || group.product?.name || "Unavailable product";
          const isExpanded = expanded === key;
          return <Fragment key={key}>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-4"><button type="button" disabled={loading} aria-label={`${isExpanded ? "Collapse" : "Expand"} orders for ${name}`} title={isExpanded ? "Collapse orders" : "Expand orders"} aria-expanded={isExpanded} aria-controls={`history-group-${key}`} onClick={() => setExpanded(isExpanded ? null : key)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button></td>
              <td className="max-w-80 break-words px-4 py-4"><p className="font-medium text-gray-900">{name}</p><p className="mt-1 break-all text-xs text-gray-500">{group.product?.sku || "-"} · {group.product_id == null ? "Deleted product" : `#${group.product_id}`}</p></td>
              <td className="max-w-60 break-words px-4 py-4"><p className="text-gray-800">{group.shop?.name || group.shop?.vendor?.shop_name || `Shop #${group.shop_id}`}</p><p className="mt-1 text-xs text-gray-500">#{group.shop_id}</p></td>
              <td className="px-4 py-4 text-right tabular-nums">{group.totals.total_quantity}</td><td className="px-4 py-4 text-right tabular-nums">{group.totals.order_count}</td><td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-gray-900">{money(group.totals.total_product_sales)}</td>
            </tr>
            {isExpanded && <tr id={`history-group-${key}`}><td colSpan={6} className="p-0"><GroupOrders group={group} filters={filters} sessionKey={sessionKey} initialOrders={initialOrders} /></td></tr>}
          </Fragment>;
        })}
      </tbody>
    </table>
  </div>;
}
ProductGroups.propTypes = { groups: PropTypes.array.isRequired, filters: PropTypes.object.isRequired, sessionKey: PropTypes.string.isRequired, loading: PropTypes.bool, initialOrders: PropTypes.object };

export default function VendorProductOrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const filters = readHistoryFilters(searchParams);
  const validation = validateHistoryFilters(filters);
  const page = /^[1-9]\d*$/.test(searchParams.get("page") || "") ? Math.min(Number(searchParams.get("page")), 1000000) : 1;
  const perPage = [10, 20, 50, 100].includes(Number(searchParams.get("per_page"))) ? Number(searchParams.get("per_page")) : 20;
  const sessionKey = String(getFromLocalstorage("token") || "");
  const userId = getFromLocalstorage("userId");
  const vendor = useGetVendorIdQuery(userId, { skip: !userId });
  const statuses = useGetOrderStatusSummaryQuery();
  const queryArgs = { ...historyRequestParams(filters), page, per_page: perPage, ...(filters.product_id ? { history_per_page: 10 } : {}), _sessionKey: sessionKey };
  const { currentData, isFetching, isError, error } = useGetVendorProductOrderHistoryQuery(queryArgs, { skip: Boolean(validation), refetchOnMountOrArgChange: true });
  const paginator = currentData?.data?.groups;
  const groups = paginator?.data || [];
  const vendorId = vendor.data?.data?.vendor_id;
  const shopName = groups.find((group) => String(group.shop_id) === String(vendorId))?.shop?.name;
  const statusesList = Array.isArray(statuses.data?.data) ? statuses.data.data : [];
  const filtersKey = JSON.stringify(filters);

  const updateQuery = (values, nextPage = 1, size = perPage) => setSearchParams(new URLSearchParams({
    ...historyRequestParams(values), per_page: String(size), page: String(nextPage),
  }));
  const refresh = () => {
    dispatch(refreshVendorOrderHistory());
    if (statuses.isError) statuses.refetch();
    if (vendor.isError) vendor.refetch();
  };
  if (error?.status === 401) return <Navigate to="/vendor-login" replace />;

  return <div className="min-w-0 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-gray-800"><Package className="h-5 w-5 shrink-0 text-blue-600" /><span>Product-Wise Order History</span></h1>
      <button type="button" onClick={refresh} disabled={isFetching || Boolean(validation)} title="Refresh order history" aria-label="Refresh order history" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">{isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</button>
    </header>
    <HistoryFilters key={filtersKey} filters={filters} shopId={vendorId} shopName={shopName} statuses={statusesList} statusError={statuses.isError || Boolean(statuses.data && !Array.isArray(statuses.data.data))} loading={isFetching} onApply={(values) => { if (JSON.stringify(values) === filtersKey && page === 1) refresh(); else updateQuery(values); }} onReset={() => setSearchParams({})} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-600">{paginator && !isFetching && !isError ? `${paginator.total} product/shop groups` : "Product / shop groups"}</p>
      <label className="flex items-center gap-2 text-xs text-gray-600">Rows per page<select value={perPage} onChange={(event) => updateQuery(filters, 1, Number(event.target.value))} disabled={isFetching} className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:opacity-50">{[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
    </div>
    {validation ? <p role="alert" className="text-sm text-red-700">{validation}</p> : isFetching || isError || !groups.length ? <LoadState loading={isFetching} error={isError ? error : undefined} retry={refresh} empty="No product order history matches these filters." /> :
      <ProductGroups key={JSON.stringify(queryArgs)} groups={groups} filters={filters} sessionKey={sessionKey} loading={isFetching} initialOrders={currentData?.data?.orders} />}
    {!validation && !isFetching && !isError && paginator && <HistoryPagination paginator={paginator} loading={isFetching} onChange={(nextPage) => updateQuery(filters, nextPage)} />}
    {!validation && !isFetching && !isError && paginator?.current_page > paginator?.last_page && <button type="button" onClick={() => updateQuery(filters)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-blue-700">Back to first page</button>}
    <p className="text-xs text-gray-500">Product sales before shipping and order-level discounts.</p>
  </div>;
}
