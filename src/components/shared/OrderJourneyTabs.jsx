import { Link } from "react-router-dom";
import { Ban, Box, PackageCheck, Truck, Undo2, CornerDownLeft, ShoppingBag, Inbox } from "lucide-react";

// CarryBee-style order sections. Keys match OrderJourneyService on the API
// (order "journey" = "section.stage", from the order status + CarryBee's last event).
export const JOURNEY_SECTIONS = [
  { key: "all", label: "All", Icon: ShoppingBag, stages: [] },
  {
    key: "new", label: "New", Icon: Inbox,
    stages: [
      { key: "pending", label: "Pending" },
      { key: "assigned_to_vendor", label: "Assigned to Vendor" },
      { key: "ready_for_pickup", label: "Ready for Pickup" },
      { key: "pickup_failed", label: "Pickup Failed" },
    ],
  },
  {
    key: "active", label: "Active", Icon: Truck,
    stages: [
      { key: "at_sorting", label: "At Sorting" },
      { key: "in_transit", label: "In Transit" },
      { key: "at_delivery_hub", label: "At Delivery Hub" },
      { key: "assigned_for_delivery", label: "Assigned for Delivery" },
      { key: "on_hold", label: "Delivery on Hold" },
    ],
  },
  {
    key: "delivered", label: "Delivered", Icon: PackageCheck,
    stages: [
      { key: "delivered", label: "Delivered" },
      { key: "partial", label: "Partial Delivery" },
      { key: "exchanged", label: "Exchanged" },
    ],
  },
  {
    key: "returning", label: "Returning", Icon: CornerDownLeft,
    stages: [
      { key: "at_sorting", label: "At Sorting" },
      { key: "in_transit", label: "In Transit" },
    ],
  },
  {
    key: "returned", label: "Returned", Icon: Undo2,
    stages: [
      { key: "returned", label: "Returned" },
      { key: "paid_return", label: "Paid Return" },
    ],
  },
  {
    key: "closed", label: "Cancelled & Lost", Icon: Ban,
    stages: [
      { key: "cancelled", label: "Cancelled" },
      { key: "lost", label: "Lost / Damaged" },
    ],
  },
];

/** "active.at_delivery_hub" -> "At Delivery Hub" (for the status column). */
export const journeyStageLabel = (journey) => {
  if (!journey || !journey.includes(".")) return null;
  const [section, stage] = journey.split(".");
  return JOURNEY_SECTIONS.find((s) => s.key === section)?.stages.find((s) => s.key === stage)?.label || null;
};

const TOTAL_LABELS = { delivered: "Total Delivery", returned: "Total Returned" };

/**
 * @param counts   journey_counts from the list API: { sections: {...}, stages: {"active.at_sorting": n} }
 * @param section  current section key ("" = all)
 * @param stage    current stage key ("" = whole section)
 * @param onChange ({section, stage}) => void
 * @param hideSections section keys not shown in this panel
 * @param stageLinks { "closed.cancelled": "/admin-panel/orders/cancelled" } cards that open another page
 */
const OrderJourneyTabs = ({ counts, section, stage, onChange, hideSections = [], stageLinks = {} }) => {
  const sections = JOURNEY_SECTIONS.filter((s) => !hideSections.includes(s.key));
  const current = sections.find((s) => s.key === (section || "all")) || sections[0];
  const sectionCount = (key) => counts?.sections?.[key] ?? 0;
  const stageCount = (sec, key) => counts?.stages?.[`${sec}.${key}`] ?? 0;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-1 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm" role="tablist" aria-label="Order sections">
          {sections.map(({ key, label, Icon }) => {
            const active = current.key === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange({ section: key === "all" ? "" : key, stage: "" })}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  active ? "bg-yellow-400 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-yellow-200 text-gray-900" : "bg-gray-100 text-gray-500"}`}>
                  {sectionCount(key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {current.stages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[{ key: "", label: TOTAL_LABELS[current.key] || "Total" }, ...current.stages].map(({ key, label }) => {
            const active = (stage || "") === key;
            const count = key === "" ? sectionCount(current.key) : stageCount(current.key, key);
            const href = key ? stageLinks[`${current.key}.${key}`] : null;
            const className = `flex min-w-[120px] flex-col items-center rounded-lg border px-4 py-2.5 text-center transition ${
              active ? "border-yellow-400 bg-yellow-50" : "border-transparent bg-gray-100 hover:bg-gray-200"
            }`;
            const body = (
              <>
                <span className="text-xl font-semibold tabular-nums text-gray-900">{count}</span>
                <span className="text-xs font-medium text-gray-600">{label}{href ? " →" : ""}</span>
              </>
            );
            return href ? (
              <Link key={key || "total"} to={href} className={className}>{body}</Link>
            ) : (
              <button
                key={key || "total"}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ section: current.key, stage: key })}
                className={className}
              >
                {body}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderJourneyTabs;
