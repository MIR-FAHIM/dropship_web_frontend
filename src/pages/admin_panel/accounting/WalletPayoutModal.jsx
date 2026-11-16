import { useState } from "react";
import PropTypes from "prop-types";
import { Loader2, Wallet, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAdminWalletPayoutMutation } from "../../../redux/features/withdraw";
import { useGetDropshipperPayoutReviewQuery } from "../../../redux/features/order";
import { DropshipperFilter } from "../orders/OrderListFilters";
import DropshipperPayoutReview from "../orders/DropshipperPayoutReview";
import { METHOD_LABELS, bdt } from "../../../components/shared/PayoutInvoiceDocument";

const METHODS = ["bkash", "nagad", "rocket", "bank_transfer", "cash"];

/**
 * Record a wallet payout the admin made by hand (bKash, bank, cash). Without this,
 * money paid outside the system stays in the dropshipper's wallet and can be
 * withdrawn a second time. The amount can't exceed the available balance.
 */
const WalletPayoutModal = ({ initialDropshipper = null, onClose, onPaid }) => {
  const [dropshipper, setDropshipper] = useState(initialDropshipper);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [payout, { isLoading }] = useAdminWalletPayoutMutation();

  const { data: reviewData } = useGetDropshipperPayoutReviewQuery(dropshipper?.id, { skip: !dropshipper?.id });
  const balance = Number(reviewData?.data?.balance?.balance || 0);
  const held = Number(reviewData?.data?.withdraws?.open_amount || 0);
  const available = Math.max(0, Math.round((balance - held) * 100) / 100);

  const value = Number(amount || 0);
  const needsRef = method !== "cash";
  const tooMuch = value > available + 0.001;
  const canSubmit = dropshipper?.id && value > 0 && !tooMuch && confirmed && (!needsRef || reference.trim()) && !isLoading;

  const changeDropshipper = (user) => {
    setDropshipper(user);
    setAmount("");
    setConfirmed(false);
  };

  const submit = async () => {
    try {
      const res = await payout({
        user_id: dropshipper.id,
        amount: value,
        payment_method: method,
        bank_reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      }).unwrap();
      toast.success(`${bdt(value)} wallet payout recorded. New balance ${bdt(res?.balance?.net_balance)}`);
      onPaid?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not record the payout");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true">
      <div className="relative flex max-h-[94vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900"><Wallet className="h-4 w-4 text-emerald-600" /> Record wallet payout</h3>
            <p className="text-xs text-gray-500">Use this when you paid a dropshipper&apos;s wallet balance by hand, so it is deducted and can&apos;t be withdrawn again.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-700">Dropshipper</span>
            <DropshipperFilter selected={dropshipper} onSelect={changeDropshipper} />
            {dropshipper?.phone && <span className="font-mono text-gray-500">{dropshipper.phone}</span>}
          </div>

          {!dropshipper?.id ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">Choose the dropshipper you paid.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-gray-700">Available to pay out{held > 0 ? ` (${bdt(held)} held by open withdraw requests)` : ""}</span>
                <button type="button" onClick={() => setAmount(String(available))} className="font-mono text-sm font-extrabold text-emerald-800 hover:underline" title="Use the full amount">
                  {bdt(available)}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="font-semibold text-gray-700" htmlFor="wallet-payout-amount">
                  Amount paid (৳)
                  <input
                    id="wallet-payout-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 font-mono font-bold ${tooMuch ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                  />
                  {tooMuch && <span className="mt-1 block font-normal text-red-700">More than the available {bdt(available)}.</span>}
                </label>
                <label className="font-semibold text-gray-700" htmlFor="wallet-payout-method">
                  Paid by
                  <select id="wallet-payout-method" value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal">
                    {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                  </select>
                </label>
                <label className="font-semibold text-gray-700" htmlFor="wallet-payout-ref">
                  Transaction ID{needsRef ? " *" : ""}
                  <input id="wallet-payout-ref" type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. BL92KJ189A" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono font-normal" />
                </label>
                <label className="font-semibold text-gray-700" htmlFor="wallet-payout-note">
                  Note
                  <input id="wallet-payout-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid on WhatsApp request" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal" />
                </label>
              </div>

              <DropshipperPayoutReview userId={dropshipper.id} confirmed={confirmed} onConfirmChange={setConfirmed} />
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Record {value > 0 ? bdt(value) : ""} payout
          </button>
        </div>
      </div>
    </div>
  );
};

WalletPayoutModal.propTypes = {
  initialDropshipper: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string, phone: PropTypes.string }),
  onClose: PropTypes.func.isRequired,
  onPaid: PropTypes.func,
};

export default WalletPayoutModal;
