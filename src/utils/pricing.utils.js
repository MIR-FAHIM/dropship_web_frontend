export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const getAdminBasePrice = (productOrItem = {}) => {
  const product = productOrItem?.product || productOrItem;
  const adminPrice = toNumber(productOrItem?.admin_price ?? product?.admin_price, NaN);
  if (Number.isFinite(adminPrice) && adminPrice > 0) return adminPrice;

  const unitPrice = toNumber(product?.unit_price ?? productOrItem?.unit_price, 0);
  if (unitPrice > 0) return Math.round(unitPrice * 1.05 * 100) / 100;

  return unitPrice;
};

export const getVendorPrice = (productOrItem = {}) => {
  const product = productOrItem?.product || productOrItem;
  return toNumber(productOrItem?.unit_price ?? product?.unit_price, 0);
};

export const getResellerSellingPrice = (item = {}) =>
  toNumber(item?.reseller_price ?? item?.selling_price ?? getAdminBasePrice(item), 0);

export const getResellerProfit = ({ resellerPrice, adminPrice, qty = 1 }) =>
  (toNumber(resellerPrice, 0) - toNumber(adminPrice, 0)) * toNumber(qty, 1);

export const getAdminCommission = ({ adminPrice, unitPrice, qty = 1 }) =>
  (toNumber(adminPrice, 0) - toNumber(unitPrice, 0)) * toNumber(qty, 1);
