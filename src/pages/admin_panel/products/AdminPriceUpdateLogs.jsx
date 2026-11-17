import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ListChecks, Loader2, Minus, Search, Store, TrendingDown, TrendingUp, X } from "lucide-react";
import { useGetPriceUpdateLogsQuery } from "../../../redux/features/product";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";
import { ClearFilterChip, OrderDateFilter, describeDateRange } from "../orders/OrderListFilters";

const PER_PAGE_OPTIONS = [20, 50, 100];

const taka = (n) => `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Product price change history, newest first. Filters (search, supplier, dates)
 * and the page are kept in the URL, so Back from a product returns to the same view.
 */
const AdminPriceUpdateLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const get = (key) => searchParams.get(key) || "";
  const updateUrl = (patch, { resetPage = true } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => (v === undefined || v === null || v === "" ? next.delete(k) : next.set(k, String(v))));
      if (resetPage && !("page" in patch)) next.delete("page");
      return next;
    }, { replace: true });
  };

  const page = Math.max(1, Number(get("page")) || 1);
  const perPage = PER_PAGE_OPTIONS.includes(Number(get("per_page"))) ? Number(get("per_page")) : 20;
  const vendorId = get("vendor_id");
  const dateFrom = get("date_from");
  const dateTo = get("date_to");
  const urlSearch = get("q");

  // Debounced product search (name, SKU or product id).
  const [searchInput, setSearchInput] = useState(urlSearch);
  useEffect(() => {
    const term = searchInput.trim();
    if (term === urlSearch) return undefined;
    const t = setTimeout(() => updateUrl({ q: term }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, urlSearch]);

  const queryArgs = useMemo(() => {
    const params = { page, per_page: perPage };
    if (urlSearch) params.search = urlSearch;
    if (vendorId) params.vendor_id = vendorId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  }, [page, perPage, urlSearch, vendorId, dateFrom, dateTo]);

  const { data, isLoading, isFetching, isError, refetch } = useGetPriceUpdateLogsQuery(queryArgs);
  // Paginated response: { data: { data: [...], total, last_page, from, to } }.
  // Older API returned a plain array in data; both are handled.
  const pagination = data?.data && !Array.isArray(data.data) ? data.data : {};
  const logs = Array.isArray(pagination.data) ? pagination.data : Array.isArray(data?.data) ? data.data : [];
  const lastPage = Number(pagination.last_page || 1);
  const total = pagination.total ?? logs.length;

  const { data: vendorData } = useGetVendorListQuery();
  const vendors = useMemo(() => {
    const list = vendorData?.data?.data || vendorData?.data || [];
    return (Array.isArray(list) ? list : []).slice().sort((a, b) => (a.shop_name || "").localeCompare(b.shop_name || ""));
  }, [vendorData]);
  const selectedVendor = vendors.find((v) => String(v.id) === vendorId);

  const hasFilters = Boolean(urlSearch || vendorId || dateFrom || dateTo);
  const goToPage = (p) => {
    updateUrl({ page: p > 1 ? p : null }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Price Update Logs</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ListChecks className="h-4 w-4" />
          <span>Newest changes first</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search product name, SKU or ID…"
            aria-label="Search product"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={vendorId}
            onChange={(e) => updateUrl({ vendor_id: e.target.value })}
            aria-label="Supplier"
            className="max-w-[240px] rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All suppliers</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.shop_name || `Vendor #${v.id}`} (#{v.id})
              </option>
            ))}
          </select>
        </div>

        <OrderDateFilter dateFrom={dateFrom} dateTo={dateTo} onChange={(f, t) => updateUrl({ date_from: f, date_to: t })} />

        <label className="ml-auto flex items-center gap-2 text-xs font-medium text-gray-600">
          Show
          <select
            value={perPage}
            onChange={(e) => updateUrl({ per_page: Number(e.target.value) === 20 ? null : e.target.value })}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          per page
        </label>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>Filtered by:</span>
          {urlSearch && <ClearFilterChip label={`Product: ${urlSearch}`} onClear={() => setSearchInput("")} />}
          {vendorId && (
            <ClearFilterChip label={`Supplier: ${selectedVendor?.shop_name || `#${vendorId}`}`} onClear={() => updateUrl({ vendor_id: null })} />
          )}
          {(dateFrom || dateTo) && (
            <ClearFilterChip label={`Date: ${describeDateRange(dateFrom, dateTo)}`} onClear={() => updateUrl({ date_from: null, date_to: null })} />
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <p className="mb-3 text-sm text-gray-600" aria-live="polite">
          {isLoading ? "Loading…" : total ? (
            <>
              Showing <b className="text-gray-800">{pagination.from ?? 1}–{pagination.to ?? logs.length}</b> of{" "}
              <b className="text-gray-800">{total}</b> {total === 1 ? "change" : "changes"}
              {lastPage > 1 && <> · Page {page} of {lastPage}</>}
            </>
          ) : "0 changes"}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-600">
            Could not load the price logs.{" "}
            <button type="button" onClick={refetch} className="font-semibold underline">Try again</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ListChecks className="mx-auto mb-3 h-14 w-14 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              {hasFilters ? "No price changes match these filters." : "No price update logs found."}
            </p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-50" : ""} aria-busy={isFetching}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Supplier</th>
                    <th className="pb-3 font-medium">Before Price</th>
                    <th className="pb-3 font-medium">New Price</th>
                    <th className="pb-3 font-medium">Change</th>
                    <th className="pb-3 font-medium">Updated By</th>
                    <th className="pb-3 font-medium">Note</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const diff = Number(log.new_price) - Number(log.before_price);
                    const vendor = log.product?.vendor;
                    const updatedBy = log.updated_by && typeof log.updated_by === "object" ? log.updated_by : null;
                    return (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 text-gray-500">{(page - 1) * perPage + i + 1}</td>
                        <td className="py-3">
                          <div className="max-w-[240px]">
                            {log.product_id ? (
                              <Link
                                to={`/admin-panel/products/${log.product_id}`}
                                className="block truncate font-medium text-blue-700 hover:underline"
                                title={log.product?.name || `Product #${log.product_id}`}
                              >
                                {log.product?.name || `Product #${log.product_id}`}
                              </Link>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                            <p className="text-xs text-gray-400">
                              ID: {log.product_id}
                              {log.product?.sku ? ` · SKU ${log.product.sku}` : ""}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 text-gray-700">
                          {vendor ? (
                            <button
                              type="button"
                              onClick={() => updateUrl({ vendor_id: vendor.id })}
                              className="text-left hover:text-red-700 hover:underline"
                              title="Show only this supplier"
                            >
                              {vendor.shop_name || `Vendor #${vendor.id}`}
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 text-gray-600">{taka(log.before_price)}</td>
                        <td className="py-3 font-medium text-gray-800">{taka(log.new_price)}</td>
                        <td className="py-3">
                          {diff > 0 ? (
                            <span className="inline-flex items-center gap-1 font-medium text-red-600">
                              <TrendingUp className="h-3.5 w-3.5" /> +{taka(diff)}
                            </span>
                          ) : diff < 0 ? (
                            <span className="inline-flex items-center gap-1 font-medium text-green-600">
                              <TrendingDown className="h-3.5 w-3.5" /> -{taka(Math.abs(diff))}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <Minus className="h-3.5 w-3.5" /> No change
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-600">
                          {updatedBy ? (
                            <div>
                              <p className="font-medium text-gray-700">{updatedBy.name}</p>
                              <p className="text-xs text-gray-400">ID: {updatedBy.id}</p>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="max-w-[180px] truncate py-3 text-xs text-gray-500" title={log.note || ""}>
                          {log.note || "—"}
                        </td>
                        <td className="whitespace-nowrap py-3 text-xs text-gray-500">{formatDateTime(log.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {lastPage > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || isFetching}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} / {lastPage}</span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= lastPage || isFetching}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPriceUpdateLogs;
