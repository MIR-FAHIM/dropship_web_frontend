import { useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, Bike, CheckCircle2, ClipboardCheck, Loader2, Phone, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { useApproveCourierReviewMutation, useGetOrderCourierEventsQuery } from "../../redux/features/order";

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
};

const ISSUE_LABELS = {
  delivery: "Delivery problem",
  pickup: "Pickup problem",
  create_failed: "CarryBee could not create the consignment",
};

const PROBLEM_EVENTS = ["order.delivery-failed", "order.delivery-on-hold", "order.pickup-failed", "order.create-failed"];
const RETURN_EVENTS = ["order.returned", "order.paid-return", "order.returned-at-sorting", "order.returned-in-transit", "order.returned-to-merchant", "order.pickup-cancelled"];

const dotClass = (event) => {
  if (PROBLEM_EVENTS.includes(event)) return "bg-red-500";
  if (RETURN_EVENTS.includes(event)) return "bg-pink-500";
  if (event === "order.delivered" || event === "order.paid") return "bg-emerald-500";
  return "bg-sky-500";
};

/**
 * CarryBee courier status for one order: current stage, rider, delivery problems,
 * review hold (admins can approve) and the full event timeline.
 */
const CourierTrackingCard = ({ orderId, isAdmin = false, onReviewApproved }) => {
  const { data, isLoading, isError } = useGetOrderCourierEventsQuery(orderId, { skip: !orderId });
  const [approveReview, { isLoading: approving }] = useApproveCourierReviewMutation();
  const [showAll, setShowAll] = useState(false);

  const info = data?.data;
  const tracking = info?.tracking;
  const events = info?.events || [];

  if (!orderId || isError) return null;
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading courier tracking…
      </div>
    );
  }
  if (!info?.consignment_id && events.length === 0) return null;

  const handleApprove = async () => {
    const note = window.prompt("Approve this courier review? Add a note (optional):", "");
    if (note === null) return;
    try {
      const res = await approveReview({ id: orderId, note: note.trim() || undefined }).unwrap();
      toast.success(res?.message || "Review approved");
      onReviewApproved?.();
    } catch (err) {
      toast.error(err?.data?.message || "Could not approve the review");
    }
  };

  const ordered = [...events].reverse(); // newest first
  const visible = showAll ? ordered : ordered.slice(0, 6);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Truck className="h-4 w-4 text-sky-600" /> CarryBee Tracking
        </h2>
        {info?.consignment_id && <span className="font-mono text-[11px] text-gray-500">{info.consignment_id}</span>}
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        {tracking?.stage_label && (
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold text-gray-900">{tracking.stage_label}</span>
            <span className="text-xs text-gray-500">
              {fmt(tracking.stage_at)}
              {tracking.attempt ? ` · attempt ${tracking.attempt}` : ""}
            </span>
          </div>
        )}

        {tracking?.rider_name && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">
            <span className="flex items-center gap-1.5 font-medium"><Bike className="h-3.5 w-3.5" /> {tracking.rider_name}</span>
            {tracking.rider_phone && (
              <span className="flex items-center gap-1.5 font-mono"><Phone className="h-3.5 w-3.5" /> {tracking.rider_phone}</span>
            )}
          </div>
        )}

        {tracking?.issue_flag && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">{ISSUE_LABELS[tracking.issue_flag] || tracking.issue_flag}</p>
              {tracking.issue_reason && <p className="mt-0.5 break-words">{tracking.issue_reason}</p>}
            </div>
          </div>
        )}

        {tracking?.needs_review && (
          <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Settlement on hold for review</p>
                {tracking.review_reason && <p className="mt-0.5 break-words">{tracking.review_reason}</p>}
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Approve
              </button>
            )}
          </div>
        )}

        {tracking?.collected_amount !== null && tracking?.collected_amount !== undefined && (
          <p className="text-xs text-gray-600">
            CarryBee collected: <span className="font-mono font-semibold text-gray-900">৳{Number(tracking.collected_amount).toLocaleString("en-BD")}</span>
          </p>
        )}

        {visible.length > 0 ? (
          <ol className="relative space-y-3 border-l border-gray-200 pl-4">
            {visible.map((e) => (
              <li key={e.id} className="relative">
                <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${dotClass(e.event)}`} />
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="text-xs font-semibold text-gray-800">{e.label}</span>
                  <span className="text-[11px] text-gray-400">{fmt(e.time)}</span>
                </div>
                {(e.reason || e.remarks) && (
                  <p className="mt-0.5 break-words text-[11px] text-gray-600">{[e.reason, e.remarks].filter(Boolean).join(" — ")}</p>
                )}
                {(e.attempt || e.collected_amount || e.source === "catch-up") && (
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {[e.attempt ? `attempt ${e.attempt}` : null, e.collected_amount ? `collected ৳${e.collected_amount}` : null, e.source === "catch-up" ? "synced from CarryBee" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-gray-400">No CarryBee updates received yet.</p>
        )}

        {ordered.length > 6 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="text-xs font-medium text-sky-700 hover:underline">
            {showAll ? "Show less" : `Show all ${ordered.length} updates`}
          </button>
        )}
      </div>
    </div>
  );
};

CourierTrackingCard.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isAdmin: PropTypes.bool,
  onReviewApproved: PropTypes.func,
};

export default CourierTrackingCard;
