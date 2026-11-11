import PropTypes from "prop-types";
import { AlertTriangle, ClipboardCheck } from "lucide-react";

const ISSUE_LABELS = {
  delivery: "Delivery issue",
  pickup: "Pickup issue",
  create_failed: "Consignment failed",
};

/**
 * Small red/amber chips for order lists, from order.delivery_information:
 * a CarryBee delivery/pickup problem, or a courier review waiting for an admin.
 */
const CourierIssueBadge = ({ deliveryInfo }) => {
  if (!deliveryInfo) return null;
  const { issue_flag: issueFlag, issue_reason: issueReason, attempt, needs_review: needsReview, review_reason: reviewReason } = deliveryInfo;
  if (!issueFlag && !needsReview) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {issueFlag && (
        <span
          title={issueReason || ISSUE_LABELS[issueFlag] || issueFlag}
          className="inline-flex max-w-[180px] items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700"
        >
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {ISSUE_LABELS[issueFlag] || issueFlag}
            {issueFlag === "delivery" && attempt ? ` · attempt ${attempt}` : ""}
          </span>
        </span>
      )}
      {needsReview && (
        <span
          title={reviewReason || "Courier review needed"}
          className="inline-flex max-w-[180px] items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
        >
          <ClipboardCheck className="h-3 w-3 shrink-0" />
          <span className="truncate">Needs review</span>
        </span>
      )}
    </div>
  );
};

CourierIssueBadge.propTypes = {
  deliveryInfo: PropTypes.shape({
    issue_flag: PropTypes.string,
    issue_reason: PropTypes.string,
    attempt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    needs_review: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    review_reason: PropTypes.string,
  }),
};

export default CourierIssueBadge;
