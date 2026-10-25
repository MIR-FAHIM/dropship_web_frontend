# Vendor Product-Wise Order History

## Navigation

The vendor sidebar now contains an expandable Orders menu:
- Order History: /vendor-panel/orders (existing implementation and details routes unchanged).
- Product-Wise Order History: /vendor-panel/orders/product-history.

The Orders parent expands on either route, including direct navigation and refresh.
The existing order-details route continues to highlight Order History.

## Integration

The page uses the existing RTK Query baseApi and configured base URL. No token handling or global interceptors were replaced.

Backend dependencies:
- GET /api/vendor/orders/history: groups paginator; product filters also return embedded orders.
- GET /api/vendor/orders/history/orders: orders paginator for a product/shop expansion.
- GET /api/orders/status-summary: existing dynamic order-status choices (counts are not displayed).
- Existing user-details and vendor-ID queries for UI role checking and the shop selector.

The backend derives the vendor from the bearer token. Neither vendor_id nor user_id is sent to history endpoints. The shop selector uses a fulfillment vendor ID, not a shops-table profile ID.

Filters use product_id, shop_id, status, payment_status, date_from, date_to, page and per_page.
Filters and group pagination are persisted in the URL. An expanded group's history has independent ten-order pagination.
When a product filter returns embedded orders, expansion reuses that first page instead of making a duplicate history request.
History queries are cached separately per login session; the session cache key is never sent as a query parameter.
Only the expanded group subscribes to its orders query. Collapsing and reopening uses RTK Query's cache.

Totals and item snapshots are displayed as returned by the backend, not recomputed from entire order totals.
Vendor unit price and customer selling price are separate columns.
Group sales exclude shipping and unallocated order discounts.
Deleted products use the documented unlinked_product=1 expansion, preserving their stored snapshots.

## Authorization And Errors

The new route checks the existing local session and server user-details response for vendor/seller eligibility before mounting the reporting page.
The existing Order History route is not wrapped or altered.
The backend remains the authority for vendor isolation and rejects foreign shop filters.
401 responses redirect to vendor login; 403/422 errors are shown without falling back to another endpoint.
Missing endpoints and incompatible paginator/record formats produce explicit errors, not an empty-success state.
No mock data or seeded orders are used by the page.

## Checks

Run:
```sh
node --test tests/vendorOrderHistory.test.mjs
node node_modules/eslint/bin/eslint.js src/pages/vendor/vendor_panel/VendorPanelLayout.jsx src/pages/vendor/vendor_panel/VendorProductOrderHistory.jsx src/routes/VendorHistoryRoute.jsx src/utils/vendorOrderHistory.utils.js src/redux/features/orderHistory/index.js
npm run build
```

Nine focused tests cover active-route matching, parameter whitelisting, URL filters, invalid dates/IDs, group identity, deleted-product expansion, strict response envelopes, error handling and vendor-role eligibility.
The production backend was reached through the signed-in vendor test session and returned a valid empty result for that vendor.
Populated-history expansion and pagination still require a vendor account with existing orders for a live browser check.

No backend files or order mutations are changed by this frontend feature.
