export const HISTORY_PATH = "/vendor-panel/orders/product-history";
export const HISTORY_FIELDS = ["product_id", "shop_id", "status", "payment_status", "date_from", "date_to"];
const REQUEST_FIELDS = [...HISTORY_FIELDS, "page", "per_page", "unlinked_product", "history_page", "history_per_page"];

export const getOrdersSection = (pathname) => {
  if (pathname === HISTORY_PATH) return "product-history";
  if (pathname === "/vendor-panel/orders" || pathname.startsWith("/vendor-panel/orders/")) return "history";
  return null;
};

export const readHistoryFilters = (params) =>
  Object.fromEntries(HISTORY_FIELDS.map((field) => [field, params.get(field) || ""]));

export const historyRequestParams = (input = {}) =>
  Object.fromEntries(REQUEST_FIELDS.filter((field) => input[field] !== "" && input[field] != null).map((field) => [field, input[field]]));

export const validateHistoryFilters = (filters) => {
  for (const field of ["product_id", "shop_id", "status"]) {
    if (filters[field] && !/^[1-9]\d*$/.test(String(filters[field]))) return "Product, shop, and status IDs must be positive whole numbers.";
  }
  for (const field of ["date_from", "date_to"]) {
    const date = filters[field];
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) return "Enter a valid date.";
  }
  if (filters.date_from && filters.date_to && filters.date_from > filters.date_to) return "End date cannot be before start date.";
  return "";
};

export const groupOrderParams = (group, filters, page = 1) => ({
  ...historyRequestParams(filters),
  product_id: group.product_id ?? undefined,
  unlinked_product: group.product_id == null ? 1 : undefined,
  shop_id: group.shop_id,
  page,
  per_page: 10,
});

export const isHistoryEnvelope = (body, field) => {
  const paginator = body?.data?.[field];
  return body?.status === "success" && Array.isArray(paginator?.data) &&
    Number.isInteger(paginator.current_page) && paginator.current_page > 0 &&
    Number.isInteger(paginator.last_page) && paginator.last_page > 0 &&
    Number.isInteger(paginator.total) && paginator.total >= 0 &&
    Number.isInteger(paginator.per_page) && paginator.per_page > 0 &&
    paginator.data.every((row) => field === "groups"
      ? row && (row.product_id === null || Number.isInteger(row.product_id)) && Number.isInteger(row.shop_id) &&
        row.totals && ["order_count", "total_quantity", "total_product_sales"].every((key) => typeof row.totals[key] === "number" && Number.isFinite(row.totals[key]))
      : row && Number.isInteger(row.order_id) && Array.isArray(row.items) &&
        row.items.every((item) => item && Number.isInteger(item.id)));
};

export const historyErrorMessage = (error) => {
  if (error?.status === 404) return "The order history API is not available on the configured backend.";
  if (error?.status === 403) return error.data?.message || "You do not have permission to view this vendor history.";
  if (error?.status === 200) return "The order history response does not match the expected API contract.";
  const validation = Object.values(error?.data?.errors || {}).flat().filter((value) => typeof value === "string");
  return validation.join(" ") || error?.data?.message || "Unable to load order history. Please try again.";
};

export const isVendorHistoryUser = (user) =>
  [user?.role, user?.user_type].some((role) => ["vendor", "seller"].includes(String(role || "").toLowerCase()));
