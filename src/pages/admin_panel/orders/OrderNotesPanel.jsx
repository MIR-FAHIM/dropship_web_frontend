import { useState } from "react";
import PropTypes from "prop-types";
import { MessageSquareText, ShieldCheck, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useUpdateOrderAdminNoteMutation } from "../../../redux/features/order";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

/**
 * Top-of-page notes for an admin order:
 *  - Customer / dropshipper note (order.note), read-only and highlighted.
 *  - Internal admin note (order.admin_note), editable. Only admins see it;
 *    saving works even when the order is locked.
 */
const OrderNotesPanel = ({ order, onSaved }) => {
  const savedNote = order?.admin_note || "";
  const [draft, setDraft] = useState(savedNote);
  const [updateAdminNote, { isLoading }] = useUpdateOrderAdminNoteMutation();

  const isDirty = draft.trim() !== savedNote.trim();
  const customerNote = order?.note?.trim();
  const updatedAt = formatDateTime(order?.admin_note_updated_at);

  const handleSave = async () => {
    try {
      await updateAdminNote({ id: order.id, admin_note: draft.trim() || null }).unwrap();
      toast.success("Admin note saved");
      onSaved?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save admin note");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Customer / dropshipper note */}
      <div
        className={`rounded-xl border p-4 shadow-sm ${
          customerNote ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
        }`}
      >
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <MessageSquareText className={`h-4 w-4 ${customerNote ? "text-amber-600" : "text-gray-400"}`} />
          Order Note / অর্ডার নোট
        </h2>
        {customerNote ? (
          <p className="whitespace-pre-line break-words text-sm font-medium text-amber-900">
            {customerNote}
          </p>
        ) : (
          <p className="text-xs text-gray-400">No note from customer or dropshipper.</p>
        )}
      </div>

      {/* Internal admin note */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Admin Note / অ্যাডমিন নোট
          </h2>
          <span className="text-[11px] text-indigo-500">Visible to admins and this order's vendor</span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Write an internal note for this order..."
          className="w-full resize-y rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-gray-500">
            {updatedAt ? `Last updated ${updatedAt}` : ""}
          </span>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                type="button"
                onClick={() => setDraft(savedNote)}
                disabled={isLoading}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderNotesPanel.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    note: PropTypes.string,
    admin_note: PropTypes.string,
    admin_note_updated_at: PropTypes.string,
  }).isRequired,
  onSaved: PropTypes.func,
};

export default OrderNotesPanel;
