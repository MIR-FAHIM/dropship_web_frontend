import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCarrybeeWebhookHealthQuery,
  useRunCarrybeeCatchUpMutation,
} from "../../../redux/features/delivery_company/carrybeeWebhookApi";

const fmt = (value) => {
  if (!value) return "Never";
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// Labels for events that did NOT come from CarryBee (see CarrybeeWebhookEvent::source()).
const OTHER_SOURCE_LABELS = {
  sync: "sync",
  manual: "manual",
  simulator: "simulator",
  reprocess: "reprocess",
  dev_test: "dev test",
};

const STATES = {
  receiving: {
    label: "Receiving",
    className: "text-emerald-700",
    Icon: CheckCircle2,
    help: "CarryBee is sending this account's events and they pass the signature check.",
  },
  secret_wrong: {
    label: "Secret wrong",
    className: "text-red-700",
    Icon: XCircle,
    help: "CarryBee is calling our URL but the signature doesn't match. Make the secret in this CarryBee account exactly CARRYBEE_WEBHOOK_SECRET (no spaces or quotes).",
  },
  quiet: {
    label: "Quiet",
    className: "text-amber-700",
    Icon: Clock,
    help: "CarryBee has sent events before, but none in this period. Fine if the account had no parcels moving; otherwise check its webhook settings.",
  },
  never: {
    label: "Never received",
    className: "text-red-700",
    Icon: AlertTriangle,
    help: "CarryBee has never sent this account's events to us. Save our webhook URL and secret in this CarryBee account and turn all events on.",
  },
};

/**
 * Is CarryBee actually sending us webhooks? Counts only events CarryBee itself
 * POSTed: our sync job, the simulator and manual "mark as paid" are shown apart,
 * so they can't make an account look connected.
 */
const CarrybeeWebhookHealthPanel = () => {
  const [days, setDays] = useState(7);
  const { data, isFetching, refetch } = useGetCarrybeeWebhookHealthQuery(days);
  const [runCatchUp, { isLoading: syncing }] = useRunCarrybeeCatchUpMutation();
  const health = data?.data;
  const vendors = health?.own_account_vendors || [];
  const stores = health?.stores || [];

  const handleCatchUp = async () => {
    try {
      const res = await runCatchUp({ limit: 50 }).unwrap();
      toast.success(res?.message || "Catch-up finished");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Catch-up failed");
    }
  };

  const otherText = (other = {}) =>
    Object.entries(other)
      .map(([source, n]) => `${n} ${OTHER_SOURCE_LABELS[source] || source}`)
      .join(", ");

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Webhook health</h2>
          <p className="text-xs text-gray-500">
            Real webhooks CarryBee sent us. Sync, manual and test events are listed separately and don't count.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="webhook-health-days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
            aria-label="Period"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={handleCatchUp}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Sync from CarryBee now
          </button>
        </div>
      </div>

      {isFetching && !health ? (
        <div className="flex items-center gap-2 text-xs text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <>
          {health && !health.secret_configured && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p><b>CARRYBEE_WEBHOOK_SECRET is not set on the server.</b> Every CarryBee webhook is rejected until it is set and the same value is registered in each CarryBee account.</p>
            </div>
          )}

          {health && (
            <div
              className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-xs ${
                health.last_real_event_at ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <span className="font-semibold">Last real CarryBee event (any account): {fmt(health.last_real_event_at)}</span>
              <span className="opacity-80">{health.real_events ?? 0} real events in the last {health.days} days</span>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Vendor (own CarryBee account)</th>
                  <th className="px-3 py-2 font-semibold">Store</th>
                  <th className="px-3 py-2 font-semibold">Last real CarryBee event</th>
                  <th className="px-3 py-2 font-semibold">Real events</th>
                  <th className="px-3 py-2 font-semibold">Not from CarryBee</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">No vendor uses its own CarryBee account.</td></tr>
                ) : (
                  vendors.map((v) => {
                    const state = STATES[v.state] || STATES.never;
                    const StateIcon = state.Icon;
                    return (
                      <tr key={v.vendor_id} className="border-t border-gray-100 align-top">
                        <td className="px-3 py-2 font-medium text-gray-800">{v.shop_name}</td>
                        <td className="px-3 py-2 font-mono text-gray-600">
                          {v.carryb_store_id || "—"}
                          {v.store_mismatch && (
                            <p className="mt-0.5 font-sans text-[11px] font-semibold text-red-700">
                              CarryBee says {v.seen_store_ids?.join(", ")}. Fix the saved store id.
                            </p>
                          )}
                        </td>
                        <td className={`px-3 py-2 ${v.last_real_event_at ? "text-gray-800" : "font-semibold text-red-700"}`}>
                          {fmt(v.last_real_event_at)}
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {v.events}
                          {v.by_status?.rejected ? <span className="ml-1 text-red-600">({v.by_status.rejected} rejected)</span> : null}
                          {v.by_status?.ignored ? <span className="ml-1 text-amber-700">({v.by_status.ignored} unmatched)</span> : null}
                        </td>
                        <td className="px-3 py-2 text-gray-500">
                          {otherText(v.other_events) || "—"}
                          {v.last_other_event_at && <p className="text-[11px] text-gray-400">last {fmt(v.last_other_event_at)}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 font-semibold ${state.className}`} title={state.help}>
                            <StateIcon className="h-3.5 w-3.5" /> {state.label}
                          </span>
                          {v.state !== "receiving" && <p className="mt-0.5 max-w-[220px] text-[11px] text-gray-500">{state.help}</p>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {stores.length > 0 && (
            <p className="text-[11px] text-gray-500">
              All stores, last {health?.days} days (real CarryBee / all logged):{" "}
              {stores.map((s) => `${s.store_id || "no store"} (${s.real_events ?? 0}/${s.total})`).join(" · ")}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CarrybeeWebhookHealthPanel;
