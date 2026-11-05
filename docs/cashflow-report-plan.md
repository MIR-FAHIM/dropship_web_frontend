# Cashflow Report — Flow Audit & Report Plan (frontend reference)

Short mirror of `dropship_api/docs/cashflow-report-plan.md` — read that one
for the full audit and reasoning. Planning doc only, nothing built yet.

## The core rule

A stakeholder's money is **projected** (order placed, not delivered) →
**settled** (delivered, confirmed as a liability ResellerBrain owes but
hasn't paid) → **paid out** (reseller withdraws / vendor invoice paid). Every
report below is this same three-state model.

## Three planned reports

- **Plan A — Admin panel cashflow report**: platform's full position —
  realized earnings, total owed to dropshippers, total owed to vendors,
  projected/settled/paid breakdown, day-wise growth, cash-in-hand.
- **Plan B — Dropshipper panel cashflow report**: available balance
  (withdrawable now), pending, projected profit, per-order breakdown, day-
  wise earnings growth, withdrawal history. Needs the least new backend work.
- **Plan C — Vendor panel cashflow report**: blocked on a decision — vendors
  currently have no wallet/withdraw system (paid via admin-created invoices
  instead). Either build one (mirrors Plan B) or report read-only off
  existing settlement/invoice data.

## Flow issues the backend audit found (see backend doc for detail)

1. ✅ Fixed — vendor settlement direction was inverted for the vendor-owned-
   courier case. Also found and fixed the deeper root cause: `orders.status`
   id 10 ("Carrybee Paid") collided with two unrelated cancelled/returned
   checks, which silently broke the "paid" signal; disbursement now gates
   correctly on CarryBee's `order.paid` webhook, not merely "delivered".
2. ✅ Fixed — the legacy `settle/reseller-profit/{id}` double-payment route
   is removed. Also added a guard against double-disbursement and a DB
   unique index against duplicate reseller transactions.
3. Still open — the full double-entry ledger (`order_accounting_ledgers`) is
   now correct but still never read/summed anywhere. Needs a decision before
   Plan A's cash-in-hand section.
4. ✅ Fixed — the ledger's vendor entry now splits correctly per vendor.
5. Still open — no vendor wallet exists. This is Plan C's blocking decision.

Backend fix commits are in `dropship_api`'s git log. Nothing in this repo
changed as part of those fixes. The admin Documentation UI has a tab for
this plan — see `src/pages/admin_panel/documentation/`.
