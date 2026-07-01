export const settlementLabels = {
  supplier_product_price: "Supplier Product Price",
  reseller_profit: "Reseller Profit",
  shipping_charge: "Shipping Charge",
  company_logistic_earning: "Company Logistic Earning",
  company_product_commission: "Company Product Commission",
};

export const statusClasses = {
  pending: "bg-red-100 text-red-700 border-red-200",
  settled: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export const formatSettlementLabel = (value) => {
  if (!value) return "-";

  return (
    settlementLabels[value] ||
    String(value)
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
};

export const formatMoney = (amount, currency = "BDT") => {
  const numberValue = Number(amount || 0);
  const formatted = Number.isFinite(numberValue)
    ? numberValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return `${currency || "BDT"} ${formatted}`;
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getSettlementStatusClass = (status) =>
  statusClasses[String(status || "").toLowerCase()] ||
  "bg-gray-100 text-gray-700 border-gray-200";

export const getPayableName = (settlement) => {
  if (settlement?.payable_user?.name) return settlement.payable_user.name;
  if (settlement?.vendor?.shop_name) return settlement.vendor.shop_name;
  if (settlement?.user_type === "company") return "Company";
  if (settlement?.user_type === "shipping") return "Shipping";
  return "-";
};

export const isSettlementSettled = (settlement) =>
  String(settlement?.status || "").toLowerCase() === "settled" ||
  Boolean(settlement?.settled_at);
