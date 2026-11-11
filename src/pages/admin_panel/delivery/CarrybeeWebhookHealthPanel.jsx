import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
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
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

/**
 * Is CarryBee actually sending us events? Shows the secret status, every vendor
 * with its own CarryBee account (and whether events arrive from its store), and
 * a button to run the catch-up sync now.
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

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Webhook health</h2>
          <p className="text-xs text-gray-500">Which CarryBee accounts are sending events to ResellerBrain.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="webhook-health-days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
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

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Vendor (own CarryBee account)</th>
                  <th className="px-3 py-2 font-semibold">Store</th>
                  <th className="px-3 py-2 font-semibold">Events</th>
                  <th className="px-3 py-2 font-semibold">Last event</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-400">No vendor uses its own CarryBee account.</td></tr>
                ) : (
                  vendors.map((v) => (
                    <tr key={v.vendor_id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-800">{v.shop_name}</td>
                      <td className="px-3 py-2 font-mono text-gray-600">{v.carryb_store_id || "—"}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {v.events}
                        {v.by_status?.rejected ? <span className="ml-1 text-red-600">({v.by_status.rejected} rejected)</span> : null}
                        {v.by_status?.ignored ? <span className="ml-1 text-amber-700">({v.by_status.ignored} unmatched)</span> : null}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{fmt(v.last_seen)}</td>
                      <td className="px-3 py-2">
                        {v.healthy ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Receiving</span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 font-semibold text-red-700"
                            title={!v.carryb_store_id ? "Set the vendor's default CarryBee store to match its events" : "Register our webhook URL and secret in this vendor's CarryBee account"}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> {v.events === 0 ? "No events" : "Signature problem"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {stores.length > 0 && (
            <p className="text-[11px] text-gray-500">
              All stores, last {health?.days} days:{" "}
              {stores.map((s) => `${s.store_id || "no store"} (${s.total})`).join(" · ")}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CarrybeeWebhookHealthPanel;
