/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, HandCoins, Loader2, RefreshCw, Truck } from "lucide-react";
import { useGetMoneyBoardQuery, useLazyGetMoneyBoardQuery } from "../../../redux/features/moneyBoard";

/**
 * Admin dashboard → Money board.
 * 1 Waiting for CarryBee → 2 CarryBee paid, settling (everyone owes each other) → 3 Completed (admin income is final).
 * Final income = CarryBee cash − CarryBee fees − supplier price − dropshipper profit, using what was actually paid.
 */
const tk = (n) => `৳${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const Line = ({ label, value, strong, tone = "text-gray-900" }) => (
  <div className="flex justify-between gap-3 text-xs">
    <span className="text-gray-600">{label}</span>
    <span className={`${strong ? "font-bold" : "font-medium"} ${tone}`}>{value}</span>
  </div>
);

const StageCard = ({ step, icon, title, subtitle, accent, children }) => (
  <div className={`rounded-xl border bg-white p-4 shadow-sm ${accent}`}>
    <div className="mb-3 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">{icon}</div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Step {step}</div>
        <div className="text-sm font-bold text-gray-900">{title}</div>
        <div className="text-[11px] text-gray-500">{subtitle}</div>
      </div>
    </div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const PartyList = ({ title, rows, tone, empty }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <div className="mb-2 flex items-baseline justify-between">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <span className={`text-sm font-bold ${tone}`}>{tk(rows.reduce((s, r) => s + r.amount, 0))}</span>
    </div>
    {rows.length === 0 ? (
      <p className="py-2 text-xs text-gray-400">{empty}</p>
    ) : (
      <ul className="space-y-1">
        {rows.slice(0, 6).map((r) => (
          <li key={`${r.id}-${r.name}`} className="flex justify-between gap-2 text-xs">
            <span className="truncate text-gray-700">{r.name} <span className="text-gray-400">· {r.orders} order{r.orders > 1 ? "s" : ""}</span></span>
            <span className="font-semibold text-gray-900">{tk(r.amount)}</span>
          </li>
        ))}
        {rows.length > 6 && <li className="text-[11px] text-gray-400">+{rows.length - 6} more</li>}
      </ul>
    )}
  </div>
);

const MoneyBoard = () => {
  const { data, isLoading, isError, error } = useGetMoneyBoardQuery(undefined, { pollingInterval: 120000 });
  const [refresh, { isFetching: refreshing }] = useLazyGetMoneyBoardQuery();
  const [fresh, setFresh] = useState(null);
  const b = fresh || data?.data;

  const onRefresh = async () => {
    const res = await refresh({ refresh: 1 });
    if (res.data?.data) setFresh(res.data.data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading money board…</div>;
  }
  // Product managers can't see money (admin:orders only).
  if (error?.status === 403) return null;
  if (isError || !b) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Could not load the money board.</div>;
  }

  const { waiting_carrybee: w, settling: s, completed: c, owes, alerts: a } = b;
  const alertItems = [
    a.open_flags > 0 && { text: `${a.open_flags} payout flag(s) open — overpaid ${tk(a.overpaid_open)}`, tone: "rose" },
    a.penalties_undecided > 0 && { text: `${a.penalties_undecided} return charge(s) not decided (${tk(a.penalties_undecided_amount)})`, tone: "amber" },
    a.paid_not_synced > 0 && { text: `${a.paid_not_synced} paid order(s) not synced with CarryBee yet — figures are estimates`, tone: "amber" },
    a.penalties_admin_paid > 0 && { text: `Return charges carried by admin: ${tk(a.penalties_admin_paid)}`, tone: "gray" },
    a.absorbed_by_platform > 0 && { text: `COD fees absorbed (dropshipper profit kept at ৳0): ${tk(a.absorbed_by_platform)}`, tone: "gray" },
  ].filter(Boolean);
  const toneClass = { rose: "border-rose-200 bg-rose-50 text-rose-800", amber: "border-amber-200 bg-amber-50 text-amber-900", gray: "border-gray-200 bg-gray-50 text-gray-700" };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800"><HandCoins className="h-5 w-5 text-teal-600" /> Money board — who owes whom</h3>
          <p className="text-xs text-gray-500">Admin income becomes final only when CarryBee has paid and both the vendor invoice and the dropshipper payout are settled.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <StageCard step={1} icon={<Truck className="h-5 w-5" />} title="Waiting for CarryBee" subtitle="Delivered, CarryBee hasn't paid — the cash is with CarryBee" accent="border-amber-200">
          <Line label="Orders" value={w.orders} />
          <Line label="Cash with CarryBee" value={tk(w.collected)} strong />
          <Line label="→ Supplier share" value={tk(w.supplier_share)} />
          <Line label="→ Dropshipper share" value={tk(w.dropshipper_share)} />
          <Line label="→ CarryBee fees (estimate)" value={tk(w.courier_fees)} />
          <Line label="→ Admin income (expected)" value={tk(w.admin_income)} strong tone="text-teal-700" />
        </StageCard>
        <StageCard step={2} icon={<Clock className="h-5 w-5" />} title="CarryBee paid — settling" subtitle="Vendor, admin and dropshipper still owe each other" accent="border-indigo-200">
          <Line label="Orders" value={s.orders} />
          <Line label="Cash in platform CarryBee account" value={tk(s.platform_account)} />
          <Line label="Cash in vendors' own accounts" value={tk(s.vendor_accounts)} />
          <Line label="Owed to admin" value={tk(owes.owed_to_admin)} tone="text-emerald-700" />
          <Line label="Admin owes" value={tk(owes.admin_owes)} tone="text-rose-700" />
          <Line label="Admin income (pending)" value={tk(s.admin_income)} strong tone="text-teal-700" />
        </StageCard>
        <StageCard step={3} icon={<CheckCircle2 className="h-5 w-5" />} title="Completed — final income" subtitle="Vendor invoice and dropshipper payout both settled" accent="border-emerald-300">
          <Line label="Orders" value={c.orders} />
          <Line label="Customer cash" value={tk(c.collected)} />
          <Line label="Paid to suppliers" value={tk(c.supplier_share)} />
          <Line label="CarryBee fees" value={tk(c.courier_fees)} />
          <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2">
            <div className="text-[11px] font-medium text-emerald-800">Admin final income</div>
            <div className="text-xl font-bold text-emerald-800">{tk(c.admin_income)}</div>
            <div className="text-[11px] text-emerald-800">This month: <b>{tk(c.income_this_month)}</b></div>
          </div>
        </StageCard>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 ${owes.net >= 0 ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
        <div className="text-sm text-gray-800">
          Net position now: owed to admin <b className="text-emerald-700">{tk(owes.owed_to_admin)}</b> − admin owes <b className="text-rose-700">{tk(owes.admin_owes)}</b>
        </div>
        <div className={`text-lg font-bold ${owes.net >= 0 ? "text-emerald-800" : "text-rose-800"}`}>{owes.net >= 0 ? "Admin receives " : "Admin pays "}{tk(Math.abs(owes.net))}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <PartyList title="Vendors owe admin" rows={owes.vendors_owe_admin} tone="text-emerald-700" empty="Nothing owed (own CarryBee account vendors)" />
        <PartyList title="Admin owes vendors" rows={owes.admin_owes_vendors} tone="text-rose-700" empty="No supplier payments due" />
        <PartyList title="Admin owes dropshippers" rows={owes.admin_owes_dropshippers} tone="text-rose-700" empty="No dropshipper profit due" />
        <PartyList title="Dropshippers owe admin" rows={owes.dropshippers_owe_admin} tone="text-emerald-700" empty="No return charges owed" />
      </div>

      {alertItems.length > 0 && (
        <div className="space-y-1.5">
          {alertItems.map((it) => (
            <div key={it.text} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${toneClass[it.tone]}`}>
              <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {it.text}</span>
              <Link to="/admin-panel/delivery/carrybee-invoices" className="flex shrink-0 items-center gap-1 font-semibold hover:underline">Open <ArrowRight className="h-3 w-3" /></Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MoneyBoard;
