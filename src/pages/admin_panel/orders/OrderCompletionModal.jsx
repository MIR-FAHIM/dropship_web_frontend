import { useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, CircleDashed, Loader2, MinusCircle, X, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useGetOrderCompletionCheckQuery, useUpdateOrderStatusMutation } from "../../../redux/features/order";

/**
 * Shown when an admin sets an order to Completed. Completed means everything is
 * done, so this lists each requirement (delivery, CarryBee payment, courier
 * review, vendor invoice, settlements) with its live state from the server.
 * All done -> "Yes, all done". Something pending -> blocked unless a reason is given.
 */
const OrderCompletionModal = ({ orderId, orderNumber, onClose, onCompleted }) => {
  const { data, isFetching, isError, refetch } = useGetOrderCompletionCheckQuery(orderId, {
    skip: !orderId,
    refetchOnMountOrArgChange: true,
  });
  const [updateStatus, { isLoading: saving }] = useUpdateOrderStatusMutation();
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("");

  const check = data?.data;
  const checks = check?.checks || [];
  const allDone = Boolean(check?.all_done);
  const pendingCount = check?.pending?.length || 0;
  const canSubmit = Boolean(check) && confirmed && (allDone || reason.trim().length >= 5) && !saving;

  const handleComplete = async () => {
    try {
      await updateStatus({
        id: orderId,
        status_id: 9,
        completion_confirmed: true,
        override_reason: allDone ? undefined : reason.trim(),
        changed_by: localStorage.getItem("userId") || undefined,
      }).unwrap();
      toast.success(`Order ${orderNumber || ""} marked Completed`);
      onCompleted?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not complete the order");
      refetch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-bold text-gray-900">Complete order {orderNumber}</h3>
        <p className="mt-1 text-xs text-gray-500">
          Completed means everything is done for this order. Check each item before you confirm.
        </p>

        <div className="mt-4">
          {isFetching && !check ? (
            <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking the order…
            </div>
          ) : isError || !check ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Could not load the checklist.{" "}
              <button type="button" onClick={refetch} className="font-semibold underline">Try again</button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {checks.map((c) => {
                const state = !c.required ? "skip" : c.done ? "done" : "pending";
                return (
                  <li key={c.key} className={`flex items-start gap-3 px-3.5 py-2.5 ${state === "pending" ? "bg-red-50/60" : ""}`}>
                    {state === "done" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
                    {state === "pending" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
                    {state === "skip" && <MinusCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />}
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${state === "pending" ? "text-red-800" : state === "skip" ? "text-gray-400" : "text-gray-900"}`}>
                        {c.label}
                      </p>
                      <p className="break-words text-xs text-gray-500">{c.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {check && (
          <>
            {allDone ? (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Everything is done. This order can be completed.
              </p>
            ) : (
              <div className="mt-3 space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <p className="flex items-center gap-2 text-xs font-semibold text-red-800">
                  <CircleDashed className="h-4 w-4" /> {pendingCount} item{pendingCount === 1 ? "" : "s"} not done. Finish {pendingCount === 1 ? "it" : "them"} first.
                </p>
                <label htmlFor="completion-override-reason" className="block text-[11px] font-medium text-red-900">
                  To complete anyway, write why (saved in the order history):
                </label>
                <textarea
                  id="completion-override-reason"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Vendor paid in cash, invoice not needed"
                  className="w-full rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-red-400"
                />
              </div>
            )}

            <label className={`mt-3 flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 ${confirmed ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}>
              <input
                id="completion-confirmed"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald-600"
              />
              <span className="text-xs font-medium text-gray-800">
                {allDone
                  ? "Yes, I checked: everything is done for this order."
                  : "I understand some items are not done and want to complete this order anyway."}
              </span>
            </label>
          </>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canSubmit}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              allDone ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {allDone ? "Yes, all done — mark Completed" : "Complete anyway"}
          </button>
        </div>
      </div>
    </div>
  );
};

OrderCompletionModal.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  orderNumber: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCompleted: PropTypes.func,
};

export default OrderCompletionModal;
