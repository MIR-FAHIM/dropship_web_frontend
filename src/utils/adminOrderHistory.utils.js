export const ADMIN_HISTORY_PATH = "/admin-panel/orders/group-history";
export const ADMIN_HISTORY_FIELDS = [
  "vendor_id",
  "product_id",
  "shop_id",
  "status",
  "payment_status",
  "date_from",
  "date_to",
];

const REQUEST_FIELDS = [
  ...ADMIN_HISTORY_FIELDS,
  "page",
  "per_page",
  "unlinked_product",
  "history_page",
  "history_per_page",
  "group_by",
];

export const readAdminHistoryFilters = (params) =>
  Object.fromEntries(
    ADMIN_HISTORY_FIELDS.map((field) => [field, params.get(field) || ""])
  );

export const adminHistoryRequestParams = (input = {}) =>
  Object.fromEntries(
    REQUEST_FIELDS.filter(
      (field) => input[field] !== "" && input[field] != null
    ).map((field) => [field, input[field]])
  );

export const validateAdminHistoryFilters = (filters) => {
  for (const field of ["vendor_id", "product_id", "shop_id", "status"]) {
    if (filters[field] && !/^[1-9]\d*$/.test(String(filters[field]))) {
      return "Vendor, product, shop, and status IDs must be positive whole numbers.";
    }
  }
  for (const field of ["date_from", "date_to"]) {
    const date = filters[field];
    if (
      date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date)
    ) {
      return "Enter a valid date in YYYY-MM-DD format.";
    }
  }
  if (
    filters.date_from &&
    filters.date_to &&
    filters.date_from > filters.date_to
  ) {
    return "End date cannot be before start date.";
  }
  return "";
};

export const adminGroupOrderParams = (group, filters, page = 1) => {
  const explicitShopId = group.shop_id ?? group.vendor_id;
  const inferredShopId =
    explicitShopId ??
    (Array.isArray(group.shops) && group.shops.length === 1
      ? group.shops[0]?.id ?? group.shops[0]?.vendor?.id
      : undefined);

  return {
    ...adminHistoryRequestParams(filters),
    product_id: group.product_id ?? undefined,
    unlinked_product: group.product_id == null ? 1 : undefined,
    ...(inferredShopId ? { shop_id: inferredShopId } : {}),
    page,
    per_page: 10,
  };
};

export const isAdminHistoryEnvelope = (body, field) => {
  const paginator = body?.data?.[field];
  if (!paginator || body?.status !== "success" || !Array.isArray(paginator?.data)) {
    return false;
  }
  return (
    Number.isInteger(paginator.current_page) &&
    paginator.current_page > 0 &&
    Number.isInteger(paginator.last_page) &&
    paginator.last_page > 0 &&
    Number.isInteger(paginator.total) &&
    paginator.total >= 0 &&
    Number.isInteger(paginator.per_page) &&
    paginator.per_page > 0 &&
    paginator.data.every((row) =>
      field === "groups"
        ? row &&
          (row.product_id === null || Number.isInteger(row.product_id)) &&
          row.totals &&
          ["order_count", "total_quantity", "total_product_sales"].every(
            (key) =>
              row.totals[key] != null &&
              !Number.isNaN(Number(row.totals[key])) &&
              Number.isFinite(Number(row.totals[key]))
          )
        : row &&
          Number.isInteger(row.order_id) &&
          Array.isArray(row.items) &&
          row.items.every((item) => item && Number.isInteger(item.id))
    )
  );
};

export const adminHistoryErrorMessage = (error) => {
  if (error?.status === 404)
    return "The order history API is not available on the configured backend.";
  if (error?.status === 403)
    return (
      error.data?.message ||
      "You do not have permission to view admin order history."
    );
  if (error?.status === 200)
    return "The order history response does not match the expected API contract.";
  const validation = Object.values(error?.data?.errors || {})
    .flat()
    .filter((value) => typeof value === "string");
  return (
    validation.join(" ") ||
    error?.data?.message ||
    "Unable to load order history. Please try again."
  );
};
