import { Link } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useLeadFromDropshipperMutation } from "../../../redux/features/leads";

const LEAD_STATUS_TEXT = { new: "New", contacted: "Contacted", converted: "Converted", cancelled: "Cancelled" };

/**
 * Dropshipper list / details: "Convert to lead" for an inactive dropshipper, or a
 * "Lead" badge (with its status) that opens the Lead Manager filtered to them.
 */
const ConvertToLeadButton = ({ user, leadId, leadStatus, size = "sm" }) => {
  const [convert, { isLoading }] = useLeadFromDropshipperMutation();
  const sizes = size === "md" ? "px-3 py-2 text-sm gap-1.5" : "px-2.5 py-1 text-xs gap-1";
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  if (leadId) {
    return (
      <Link
        to={`/admin-panel/leads/manage?q=${encodeURIComponent(user?.phone || user?.name || "")}`}
        className={`inline-flex items-center whitespace-nowrap rounded-lg border border-indigo-200 bg-indigo-50 font-semibold text-indigo-700 hover:bg-indigo-100 ${sizes}`}
        title="Open in Lead Manager"
      >
        <UserPlus className={icon} /> Lead{leadStatus ? ` · ${LEAD_STATUS_TEXT[leadStatus] || leadStatus}` : ""}
      </Link>
    );
  }

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!user?.id) return;
    if (!window.confirm(`Add ${user.name || "this dropshipper"} to the Lead Manager for follow-up?`)) return;
    try {
      const res = await convert({ userId: user.id }).unwrap();
      toast.success(res?.data?.already_exists ? "Already a lead" : "Added to Lead Manager");
    } catch (err) {
      toast.error(err?.data?.message || "Could not convert to lead");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center whitespace-nowrap rounded-lg border border-gray-300 bg-white font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 ${sizes}`}
      title="Add this dropshipper to the Lead Manager for follow-up"
    >
      {isLoading ? <Loader2 className={`${icon} animate-spin`} /> : <UserPlus className={icon} />}
      Convert to lead
    </button>
  );
};

export default ConvertToLeadButton;
