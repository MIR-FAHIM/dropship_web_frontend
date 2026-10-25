import test from "node:test";
import assert from "node:assert/strict";
import { getOrdersSection, groupOrderParams, historyRequestParams, isHistoryEnvelope, historyErrorMessage, isVendorHistoryUser, readHistoryFilters, validateHistoryFilters } from "../src/utils/vendorOrderHistory.utils.js";

test("Orders active section handles old routes, order details and the new page", () => {
  assert.equal(getOrdersSection("/vendor-panel/orders"), "history");
  assert.equal(getOrdersSection("/vendor-panel/orders/123"), "history");
  assert.equal(getOrdersSection("/vendor-panel/orders/product-history"), "product-history");
  assert.equal(getOrdersSection("/vendor-panel/products"), null);
  assert.equal(getOrdersSection("/vendor-panel/orders-unrelated"), null);
});

test("only documented API parameters are sent, never vendor identity or session tokens", () => {
  const params = historyRequestParams({ product_id: 40, shop_id: 3, vendor_id: 999, user_id: 888, _sessionKey: "private", status: "", page: 2, per_page: 10 });
  assert.deepEqual(params, { product_id: 40, shop_id: 3, page: 2, per_page: 10 });
});

test("URL filters survive direct navigation and omit unknown fields", () => {
  const filters = readHistoryFilters(new URLSearchParams("product_id=40&shop_id=3&status=9&payment_status=paid&date_from=2026-10-01&date_to=2026-10-25&vendor_id=999"));
  assert.deepEqual(filters, { product_id: "40", shop_id: "3", status: "9", payment_status: "paid", date_from: "2026-10-01", date_to: "2026-10-25" });
});

test("invalid dates, reversed ranges and non-positive IDs are rejected", () => {
  for (const filters of [{ product_id: "0" }, { shop_id: "-1" }, { status: "1.5" }, { date_from: "2026-02-30" }, { date_to: "not-a-date" }, { date_from: "2026-10-25", date_to: "2026-10-01" }]) assert.ok(validateHistoryFilters(filters));
  assert.equal(validateHistoryFilters({ date_to: "2026-10-25" }), "");
  assert.equal(validateHistoryFilters({ product_id: "40", date_from: "2026-10-01", date_to: "2026-10-25" }), "");
});

test("group expansion fixes product and shop IDs while retaining date/status filters", () => {
  assert.deepEqual(groupOrderParams({ product_id: 40, shop_id: 3 }, { product_id: 999, shop_id: 999, status: "9", payment_status: "paid", date_from: "2026-10-01" }, 2), {
    product_id: 40, shop_id: 3, status: "9", payment_status: "paid", date_from: "2026-10-01", unlinked_product: undefined, page: 2, per_page: 10,
  });
});

test("deleted products expand using the documented unlinked-product bucket", () => {
  const params = historyRequestParams(groupOrderParams({ product_id: null, shop_id: 3 }, { product_id: "40" }));
  assert.deepEqual(params, { shop_id: 3, page: 1, per_page: 10, unlinked_product: 1 });
});

test("response validation distinguishes empty history from a missing or incompatible endpoint", () => {
  const pagination = { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
  assert.equal(isHistoryEnvelope({ status: "success", data: { groups: pagination } }, "groups"), true);
  assert.equal(isHistoryEnvelope({ status: "success", data: { orders: pagination } }, "orders"), true);
  for (const response of [null, { status: "failed" }, { status: "success", data: [] }, { status: "success", data: { groups: { ...pagination, total: "0" } } }, { status: "success", data: { groups: { ...pagination, data: [{ product_id: 1, shop_id: 3 }] } } }]) assert.equal(isHistoryEnvelope(response, "groups"), false);
  assert.equal(isHistoryEnvelope({ status: "success", data: { orders: { ...pagination, data: [{ order_id: 1 }] } } }, "orders"), false);
});

test("errors explicitly report a missing API, permission failure and validation messages", () => {
  assert.match(historyErrorMessage({ status: 404 }), /not available/);
  assert.match(historyErrorMessage({ status: 403 }), /permission/);
  assert.match(historyErrorMessage({ status: 200 }), /contract/);
  assert.equal(historyErrorMessage({ status: 422, data: { errors: { shop_id: ["The selected shop is invalid."] } } }), "The selected shop is invalid.");
});

test("vendor page eligibility recognizes existing vendor/seller roles only", () => {
  assert.equal(isVendorHistoryUser({ user_type: "vendor" }), true);
  assert.equal(isVendorHistoryUser({ role: "seller" }), true);
  for (const user of [null, {}, { user_type: "admin" }, { role: "dropshipper" }]) assert.equal(isVendorHistoryUser(user), false);
});
