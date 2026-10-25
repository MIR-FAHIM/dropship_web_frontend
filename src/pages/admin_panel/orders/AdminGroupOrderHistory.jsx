import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  Store,
  ExternalLink,
} from "lucide-react";
import Pagination from "../../../components/shared/Pagination";
import { useGetOrderStatusSummaryQuery } from "../../../redux/features/order";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";
import {
  refreshAdminOrderHistory,
  useGetAdminGroupOrderHistoryQuery,
  useGetAdminGroupOrderHistoryOrdersQuery,
} from "../../../redux/features/orderHistory";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import {
  adminGroupOrderParams,
  adminHistoryErrorMessage,
  adminHistoryRequestParams,
  readAdminHistoryFilters,
  validateAdminHistoryFilters,
} from "../../../utils/adminOrderHistory.utils";

const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

const money = (amount) =>
  amount == null
    ? "-"
    : new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 2,
      }).format(Number(amount));

const date = (value) => {
  if (!value) return "-";
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match
    ? new Date(match[1] + "T00:00:00").toLocaleDateString("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";
};

function StatusBadge({ value }) {
  const status = String(value || "").toLowerCase();
  const color = ["completed", "delivered", "paid"].includes(status)
    ? "bg-green-50 text-green-700 border-green-200"
    : ["cancelled", "returned", "failed", "refunded"].includes(status)
    ? "bg-red-50 text-red-700 border-red-200"
    : ["pending", "unpaid", "partially_paid"].includes(status)
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {value || "-"}
    </span>
  );
}
StatusBadge.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function LoadState({
  error,
  loading,
  retry,
  empty = "No matching orders found.",
}) {
  if (loading)
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500"
      >
        <Loader2 className="h-5 w-5 animate-spin text-red-600" />
        Loading group-wise order history...
      </div>
    );
  if (error)
    return (
      <div role="alert" className="px-4 py-10 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-red-600" />
        <p className="mx-auto mt-2 max-w-xl break-words text-sm text-red-700">
          {adminHistoryErrorMessage(error)}
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={loading}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  return (
    <div className="py-16 text-center text-sm text-gray-500">
      <Package className="mx-auto mb-3 h-8 w-8 text-gray-300" />
      {empty}
    </div>
  );
}
LoadState.propTypes = {
  error: PropTypes.object,
  loading: PropTypes.bool,
  retry: PropTypes.func,
  empty: PropTypes.string,
};

function HistoryPagination({ paginator, loading, onChange }) {
  return (
    <div className="border-t border-gray-200 px-4 py-3 sm:flex sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500 mb-2 sm:mb-0">
        Showing {paginator.from ?? 0} to {paginator.to ?? 0} of {paginator.total}{" "}
        records
      </p>
      {paginator.last_page > 1 && (
        <div
          className={loading ? "pointer-events-none opacity-50" : ""}
          aria-busy={loading}
        >
          <Pagination
            currentPage={paginator.current_page}
            totalPages={paginator.last_page}
            onPageChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
HistoryPagination.propTypes = {
  paginator: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

function AdminGroupOrders({ group, filters, sessionKey, initialOrders }) {
  const [page, setPage] = useState(1);
  const { currentData, isFetching, isError, error, refetch } =
    useGetAdminGroupOrderHistoryOrdersQuery(
      {
        ...adminGroupOrderParams(group, filters, page),
        _sessionKey: sessionKey,
      },
      { skip: page === 1 && Boolean(initialOrders) }
    );
  const paginator =
    page === 1 && initialOrders ? initialOrders : currentData?.data?.orders;

  if (error?.status === 401) return <Navigate to="/admin-login" replace />;
  if (isFetching || isError || !paginator?.data?.length)
    return (
      <LoadState
        loading={isFetching}
        error={isError ? error : undefined}
        retry={refetch}
      />
    );

  return (
    <section
      aria-label="Orders in vendor product group"
      className="min-w-0 bg-slate-50/80 p-3 sm:p-5 border-t border-b border-gray-200"
    >
      <div className="space-y-4">
        {paginator.data.map((order) => (
          <article
            key={order.order_id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs"
          >
            <header className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm border-b border-gray-100 pb-3">
              <div className="min-w-0 flex items-center gap-2">
                <Link
                  to={`/admin-panel/orders/${order.order_id}`}
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Order Details"
                >
                  {order.order_number || `Order #${order.order_id}`}
                  <ExternalLink className="w-3.5 h-3.5 inline text-gray-400" />
                </Link>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">
                  {date(order.order_date)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  value={order.order_status?.name || order.status}
                />
                <StatusBadge value={order.payment_status} />
                <span className="text-xs text-gray-600">
                  Total Qty: <strong>{order.quantity}</strong>
                </span>
                <span className="text-xs text-gray-600">
                  Subtotal:{" "}
                  <strong className="tabular-nums text-gray-900">
                    {money(order.subtotal)}
                  </strong>
                </span>
              </div>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50/60 text-gray-500 font-semibold">
                  <tr>
                    {[
                      "Product / Variant",
                      "Quantity",
                      "Vendor Price",
                      "Admin Price",
                      "Reseller Price",
                      "Subtotal",
                      "Item Status",
                    ].map((label) => (
                      <th key={label} scope="col" className="px-3 py-2">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="max-w-64 break-words px-3 py-2.5">
                        <span className="font-medium text-gray-800">
                          {item.product_name || "Unavailable product"}
                        </span>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {item.sku || "-"}{" "}
                          {item.attribute_id
                            ? `· Variant #${item.attribute_id}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-medium">
                        {item.qty}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-gray-600">
                        {money(item.unit_price)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-gray-700 font-medium">
                        {money(item.admin_price)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-gray-600">
                        {money(item.reseller_price)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums font-semibold text-gray-900">
                        {money(item.line_total)}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge value={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-3">
        <HistoryPagination
          paginator={paginator}
          loading={isFetching}
          onChange={setPage}
        />
      </div>
    </section>
  );
}
AdminGroupOrders.propTypes = {
  group: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  sessionKey: PropTypes.string.isRequired,
  initialOrders: PropTypes.object,
};

function AdminHistoryFilters({
  filters,
  vendors,
  vendorsLoading,
  statuses,
  statusError,
  loading,
  onApply,
  onReset,
}) {
  const [draft, setDraft] = useState(filters);
  const [validation, setValidation] = useState("");

  const change = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setValidation("");
  };

  const submit = (event) => {
    event.preventDefault();
    const values = {
      ...draft,
      ...Object.fromEntries(new FormData(event.currentTarget)),
    };
    const message = validateAdminHistoryFilters(values);
    setValidation(message);
    if (!message) onApply(values);
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs"
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Vendor Selector */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          Vendor
          <select
            name="vendor_id"
            value={draft.vendor_id}
            onChange={(e) => change("vendor_id", e.target.value)}
            disabled={vendorsLoading}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.shop_name || v.name || `Vendor #${v.id}`} (ID: {v.id})
              </option>
            ))}
            {draft.vendor_id &&
              !vendors.some((v) => String(v.id) === String(draft.vendor_id)) && (
                <option value={draft.vendor_id}>
                  Vendor #{draft.vendor_id}
                </option>
              )}
          </select>
        </label>

        {/* Product ID Filter */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          Product ID
          <input
            name="product_id"
            type="number"
            min="1"
            step="1"
            value={draft.product_id}
            onChange={(e) => change("product_id", e.target.value)}
            placeholder="All Products (e.g. 101)"
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        {/* Shop ID Filter (Optional fine-grained) */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          Fulfillment Shop ID
          <input
            name="shop_id"
            type="number"
            min="1"
            step="1"
            value={draft.shop_id}
            onChange={(e) => change("shop_id", e.target.value)}
            placeholder="All Shops"
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        {/* Order Status */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          Order Status
          <select
            name="status"
            value={draft.status}
            onChange={(e) => change("status", e.target.value)}
            disabled={statusError}
            className={`mt-1.5 disabled:opacity-60 ${inputClass}`}
          >
            <option value="">
              {statusError ? "Status options unavailable" : "All Order Statuses"}
            </option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
            {draft.status &&
              !statuses.some((s) => String(s.id) === String(draft.status)) && (
                <option value={draft.status}>Status #{draft.status}</option>
              )}
          </select>
        </label>

        {/* Payment Status */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          Payment Status
          <select
            name="payment_status"
            value={draft.payment_status}
            onChange={(e) => change("payment_status", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">All Payment Statuses</option>
            {[
              "unpaid",
              "paid",
              "failed",
              "refunded",
              "pending",
              "partially_paid",
            ].map((st) => (
              <option key={st} value={st}>
                {st.replaceAll("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        {/* Date From */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          From Date
          <input
            name="date_from"
            type="date"
            value={draft.date_from}
            onChange={(e) => change("date_from", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        {/* Date To */}
        <label className="min-w-0 text-xs font-semibold text-gray-700">
          To Date
          <input
            name="date_to"
            type="date"
            min={draft.date_from || undefined}
            value={draft.date_to}
            onChange={(e) => change("date_to", e.target.value)}
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 transition"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Filter className="h-4 w-4" />
          )}
          {loading ? "Filtering..." : "Apply Filters"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60 transition"
        >
          <RotateCcw className="h-4 w-4 text-gray-500" />
          Reset
        </button>
      </div>

      {validation && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {validation}
        </p>
      )}
    </form>
  );
}
AdminHistoryFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  vendors: PropTypes.array.isRequired,
  vendorsLoading: PropTypes.bool,
  statuses: PropTypes.array.isRequired,
  statusError: PropTypes.bool,
  loading: PropTypes.bool,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

function AdminProductGroups({
  groups,
  filters,
  sessionKey,
  loading,
  initialOrders,
}) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div
      className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs"
      aria-busy={loading}
    >
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">
          Order history grouped across both vendor and product
        </caption>
        <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <tr>
            <th scope="col" className="w-12 px-4 py-3.5">
              <span className="sr-only">Expand orders</span>
            </th>
            <th scope="col" className="px-4 py-3.5">
              Product Information
            </th>
            <th scope="col" className="px-4 py-3.5">
              Vendor / Shop
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Quantity Sold
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Orders Count
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Product Sales
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {groups.map((group) => {
            const vendorId =
              group.vendor_id ??
              group.shop_id ??
              group.shops?.[0]?.vendor?.id ??
              group.shops?.[0]?.id;

            const shopsList =
              Array.isArray(group.shops) && group.shops.length > 0
                ? group.shops
                : group.shop || group.vendor
                ? [
                    {
                      id: group.shop?.id || group.shop_id || vendorId,
                      name:
                        group.shop?.name ||
                        group.vendor?.shop_name ||
                        `Vendor #${vendorId}`,
                      vendor: group.vendor,
                    },
                  ]
                : [];

            const primaryShopName =
              group.shop?.name ||
              group.vendor?.shop_name ||
              (shopsList.length === 1
                ? shopsList[0].name ||
                  shopsList[0].vendor?.shop_name ||
                  `Shop #${shopsList[0].id}`
                : shopsList.length > 1
                ? `${shopsList.length} Shops`
                : vendorId
                ? `Vendor #${vendorId}`
                : "All Shops");

            const groupKey = `${group.product_id ?? "unlinked"}-${
              vendorId ?? (shopsList.map((s) => s.id).join("_") || "all")
            }`;
            const productName =
              group.product_name ||
              group.product?.name ||
              "Unavailable Product";
            const isExpanded = expanded === groupKey;

            return (
              <Fragment key={groupKey}>
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={loading}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} orders for ${productName} by ${primaryShopName}`}
                      title={isExpanded ? "Collapse orders" : "Expand orders"}
                      aria-expanded={isExpanded}
                      onClick={() => setExpanded(isExpanded ? null : groupKey)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition shadow-2xs"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="max-w-xs break-words px-4 py-4">
                    <p className="font-semibold text-gray-900 line-clamp-2">
                      {productName}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span>{group.product?.sku || "SKU: —"}</span>
                      <span>·</span>
                      {group.product_id ? (
                        <Link
                          to={`/admin-panel/products/${group.product_id}`}
                          className="text-blue-600 hover:underline font-mono"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          #{group.product_id}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unlinked</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-xs break-words px-4 py-4">
                    {shopsList.length > 0 ? (
                      <div className="space-y-1.5">
                        {shopsList.map((s, idx) => {
                          const sId = s.vendor?.id || s.id;
                          const sName =
                            s.name || s.vendor?.shop_name || `Shop #${sId}`;
                          return (
                            <div
                              key={sId || idx}
                              className="flex items-center gap-1.5"
                            >
                              <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium text-gray-800 text-xs sm:text-sm">
                                {sName}
                              </span>
                              {sId && (
                                <Link
                                  to={`/admin-panel/vendors/${s.vendor?.id || sId}`}
                                  className="inline-block text-xs text-blue-600 hover:underline font-mono"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  #{sId}
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <p className="font-medium text-gray-800">
                            {primaryShopName}
                          </p>
                        </div>
                        {vendorId && (
                          <Link
                            to={`/admin-panel/vendors/${vendorId}`}
                            className="mt-1 inline-block text-xs text-blue-600 hover:underline font-mono"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Vendor #{vendorId}
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums font-semibold text-gray-800">
                    {group.totals?.total_quantity ?? 0}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-gray-700">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-xs text-gray-800">
                      {group.totals?.order_count ?? 0}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-bold tabular-nums text-gray-900 text-sm">
                    {money(group.totals?.total_product_sales)}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="p-0 bg-gray-50">
                      <AdminGroupOrders
                        group={group}
                        filters={filters}
                        sessionKey={sessionKey}
                        initialOrders={groups.length === 1 ? initialOrders : undefined}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
AdminProductGroups.propTypes = {
  groups: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  sessionKey: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  initialOrders: PropTypes.object,
};

export default function AdminGroupOrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const filters = readAdminHistoryFilters(searchParams);
  const validation = validateAdminHistoryFilters(filters);
  const page = /^[1-9]\d*$/.test(searchParams.get("page") || "")
    ? Math.min(Number(searchParams.get("page")), 1000000)
    : 1;
  const perPage = [10, 20, 50, 100].includes(Number(searchParams.get("per_page")))
    ? Number(searchParams.get("per_page"))
    : 20;

  const sessionKey = String(getFromLocalstorage("token") || "");
  const statuses = useGetOrderStatusSummaryQuery();
  const { data: vendorData, isLoading: vendorsLoading } = useGetVendorListQuery();
  const vendorsList = vendorData?.data || [];

  const queryArgs = {
    ...adminHistoryRequestParams(filters),
    page,
    per_page: perPage,
    group_by: "vendor_product",
    ...(filters.product_id ? { history_per_page: 10 } : {}),
    _sessionKey: sessionKey,
  };

  const { currentData, isFetching, isError, error, refetch } =
    useGetAdminGroupOrderHistoryQuery(queryArgs, {
      skip: Boolean(validation),
      refetchOnMountOrArgChange: true,
    });

  const paginator = currentData?.data?.groups;
  const groups = paginator?.data || [];
  const statusesList = Array.isArray(statuses.data?.data)
    ? statuses.data.data
    : [];
  const filtersKey = JSON.stringify(filters);

  const updateQuery = (values, nextPage = 1, size = perPage) => {
    setSearchParams(
      new URLSearchParams({
        ...adminHistoryRequestParams(values),
        per_page: String(size),
        page: String(nextPage),
      })
    );
  };

  const refresh = () => {
    dispatch(refreshAdminOrderHistory());
    refetch();
    if (statuses.isError) statuses.refetch();
  };

  if (error?.status === 401) return <Navigate to="/admin-login" replace />;

  return (
    <div className="min-w-0 space-y-6 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex min-w-0 items-center gap-2.5 text-xl font-bold text-gray-900">
            <Package className="h-6 w-6 text-red-600 shrink-0" />
            <span>Group-Wise Order History</span>
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Order history grouped by vendor and product combinations with sales aggregation
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isFetching || Boolean(validation)}
          title="Refresh order history"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-50 transition shadow-xs"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* Filter Bar */}
      <AdminHistoryFilters
        key={filtersKey}
        filters={filters}
        vendors={vendorsList}
        vendorsLoading={vendorsLoading}
        statuses={statusesList}
        statusError={
          statuses.isError ||
          Boolean(statuses.data && !Array.isArray(statuses.data.data))
        }
        loading={isFetching}
        onApply={(values) => {
          if (JSON.stringify(values) === filtersKey && page === 1) refresh();
          else updateQuery(values);
        }}
        onReset={() => setSearchParams({})}
      />

      {/* Results Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700">
          {paginator && !isFetching && !isError
            ? `${paginator.total} Vendor / Product Groups`
            : "Vendor / Product Groups"}
        </p>
        <label className="flex items-center gap-2 text-xs text-gray-600 font-medium">
          Rows per page
          <select
            value={perPage}
            onChange={(e) => updateQuery(filters, 1, Number(e.target.value))}
            disabled={isFetching}
            className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table / Error / Loading States */}
      {validation ? (
        <p role="alert" className="text-sm text-red-700 font-medium">
          {validation}
        </p>
      ) : isFetching || isError || !groups.length ? (
        <LoadState
          loading={isFetching}
          error={isError ? error : undefined}
          retry={refresh}
          empty="No vendor / product order history matches these filters."
        />
      ) : (
        <AdminProductGroups
          key={JSON.stringify(queryArgs)}
          groups={groups}
          filters={filters}
          sessionKey={sessionKey}
          loading={isFetching}
          initialOrders={currentData?.data?.orders}
        />
      )}

      {/* Pagination */}
      {!validation && !isFetching && !isError && paginator && (
        <HistoryPagination
          paginator={paginator}
          loading={isFetching}
          onChange={(nextPage) => updateQuery(filters, nextPage)}
        />
      )}

      <p className="text-xs text-gray-400">
        * Product sales are calculated based on item snapshot line totals before order-level discounts and courier fees.
      </p>
    </div>
  );
}
