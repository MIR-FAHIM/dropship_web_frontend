# Payment / Settlement Flow

Frontend-side reference for the four-stakeholder settlement flow. The full
business write-up (worked example, money-direction diagrams, known issues)
lives in the backend repo at `dropship_api/docs/payment-flow.md` — this file
is the short version plus where it's surfaced here. This is documentation
only; no report UI reads from it yet.

## The four stakeholders, one order

Customer pays one COD total (`order.total` / `order.remaining_cod`) that
already includes the delivery charge and CarryBee's COD fee. On delivery it
splits four ways: **ResellerBrain** keeps its product commission + shipping
margin, **vendor** keeps his product cost, **reseller/dropshipper** keeps his
profit, **CarryBee** keeps its delivery + COD fee (cut first, automatically).

## Two flows, by `vendor.has_own_delivery_account`

- **`true`** — the CarryBee account used is the vendor's own. CarryBee pays
  the vendor directly; vendor keeps his product cost and remits the rest to
  ResellerBrain, which then pays the reseller his profit.
- **`false`** — the CarryBee account used is ResellerBrain's. CarryBee pays
  ResellerBrain directly; ResellerBrain clears every liability (vendor's cost,
  reseller's profit) out of that itself.

See the backend doc for the full worked ৳1,500 example with exact numbers.

## Estimate vs actual delivery charge

No `consignment_id` means no real logistics has started — `shipping_fee` and
the 1% COD estimate used before that are planning figures, not real costs.
Once CarryBee confirms the real charge (usually lower), the gap is extra
ResellerBrain profit on top of the shipping margin already described — e.g.
collect/estimate ৳135, CarryBee's real charge turns out to be ৳105, the extra
৳30 stays with the platform, never returned to the dropshipper. See the
backend doc's "Estimate vs actual delivery charge" section for why.

## Where this shows up in this repo

| Concept | Component / file |
|---|---|
| Live per-order breakdown (admin) | `src/pages/admin_panel/orders/FinancialStakeBreakdownCard.jsx` |
| Client-side mirror of the breakdown formula | `src/utils/orderBreakdown.utils.js::calculateOrderStakeBreakdown` |
| Per-item pricing helpers (vendor/admin/reseller price, profit) | `src/utils/pricing.utils.js` |
| `vendor.has_own_delivery_account` surfaced | vendor detail / CarryBee store tabs under `src/pages/admin_panel/vendors/vendor_details/` |
| Admin documentation UI (new) | `src/pages/admin_panel/documentation/` — "ডকুমেন্টেশন" menu item, tab-based, Payment Flow is the first tab |

## Known issue (see backend doc for detail)

The real settlement row created at delivery (`processOrderDelivery` in the
backend) models the vendor-owned-courier case in the *opposite* money
direction from the live breakdown card above. Nothing here depends on that
settlement row yet, but a future cashflow report built on it will need that
reconciled first.
