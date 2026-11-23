/* eslint-disable react/prop-types */
// Vendor invoice pieces shared by the admin invoice details, the create-invoice preview and the vendor's own
// invoice page. Money direction is always written as "who will give to whom" (never "owes").
// A returned parcel carries CarryBee's return charge (breakdown.return_penalty) and who pays it.

const bdt = (n) => `৳${Number(Math.abs(n || 0)).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const PAYER_TEXT = {
  admin: "অ্যাডমিন দেবে (Admin pays)",
  vendor: "ভেন্ডর দেবে (Vendor pays)",
  dropshipper: "ড্রপশিপার দেবে (Dropshipper pays)",
};

/** Vendor ↔ admin amount for one order: positive = vendor gives admin, negative = admin gives vendor. */
export function GiveCell({ amount, vendorView = false }) {
  const n = Number(amount || 0);
  const adminGives = n < 0;
  const label = adminGives
    ? (vendorView ? "অ্যাডমিন আপনাকে দেবে" : "অ্যাডমিন ভেন্ডরকে দেবে")
    : (vendorView ? "আপনি অ্যাডমিনকে দেবেন" : "ভেন্ডর অ্যাডমিনকে দেবে");
  return (
    <div className="text-right">
      <div className={`font-mono font-bold ${adminGives ? "text-rose-700" : "text-amber-900"}`}>{bdt(n)}</div>
      {n !== 0 && <div className="text-[10px] font-normal text-gray-500">{label}</div>}
    </div>
  );
}

/** Badge under the order number for a returned parcel with a CarryBee return charge. */
export function PenaltyBadge({ penalty }) {
  if (!penalty || !(Number(penalty.amount) > 0)) return null;
  return (
    <div className="mt-1 inline-flex flex-wrap items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-800">
      <span className="font-semibold">ফেরত · CarryBee রিটার্ন চার্জ {bdt(penalty.amount)}</span>
      <span>— {penalty.payer ? PAYER_TEXT[penalty.payer] || penalty.payer : "কে দেবে ঠিক হয়নি"}</span>
    </div>
  );
}

/** Net CarryBee cash for an order; for a returned parcel that is minus the return charge. */
export function courierNet(b) {
  if (b?.return_penalty && Number(b.return_penalty.amount) > 0 && !Number(b?.courier?.collectable_amount)) {
    return -Number(b.return_penalty.amount);
  }
  return Number(b?.courier?.net_received_by_supplier ?? b?.courier?.net_to_supplier ?? 0);
}

/** Totals box: return charges on this invoice and who pays them. */
export function PenaltySummary({ breakdowns, vendorView = false }) {
  const rows = (breakdowns || []).filter((b) => b?.return_penalty && Number(b.return_penalty.amount) > 0);
  if (rows.length === 0) return null;
  const by = rows.reduce((acc, b) => {
    const k = b.return_penalty.payer || "undecided";
    acc[k] = (acc[k] || 0) + Number(b.return_penalty.amount);
    return acc;
  }, {});
  const total = rows.reduce((s, b) => s + Number(b.return_penalty.amount), 0);
  const credit = (by.admin || 0) + (by.dropshipper || 0);
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
      <div className="font-semibold">CarryBee রিটার্ন চার্জ (পেনাল্টি): {bdt(total)} · {rows.length}টি ফেরত অর্ডার</div>
      <ul className="mt-1 space-y-0.5">
        {Object.entries(by).map(([k, v]) => (
          <li key={k}>{k === "undecided" ? "কে দেবে ঠিক হয়নি" : PAYER_TEXT[k] || k}: <b>{bdt(v)}</b></li>
        ))}
      </ul>
      {credit > 0 && (
        <p className="mt-1 text-[11px] text-rose-800">
          CarryBee এই চার্জ {vendorView ? "আপনার" : "ভেন্ডরের"} CarryBee অ্যাকাউন্ট থেকে কেটেছে, তাই {bdt(credit)} এই ইনভয়েসে
          {vendorView ? " আপনার" : " ভেন্ডরের"} পক্ষে বাদ দেওয়া হয়েছে (অ্যাডমিন{vendorView ? " আপনাকে" : " ভেন্ডরকে"} দেবে)।
        </p>
      )}
    </div>
  );
}
