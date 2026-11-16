import PropTypes from "prop-types";

const bdt = (n) =>
  `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Final amount the admin entered, or the calculated one when not overriding. */
export const resolveFinalAmount = (calculated, value) => {
  const { enabled, amount } = value || {};
  if (!enabled || amount === "" || amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return Number(calculated || 0);
  }
  return Math.round(Number(amount) * 100) / 100;
};

/** True when the override needs a reason that is still missing. */
export const finalAmountMissingReason = (calculated, value) => {
  if (!value?.enabled) return false;
  const diff = Math.abs(resolveFinalAmount(calculated, value) - Number(calculated || 0));
  return diff >= 0.01 && !(value.reason || "").trim();
};

/** API fields for the override (empty when not overriding). */
export const finalAmountPayload = (calculated, value) => {
  if (!value?.enabled || value.amount === "" || value.amount === null || value.amount === undefined) return {};
  return { final_amount: resolveFinalAmount(calculated, value), adjustment_reason: (value.reason || "").trim() || undefined };
};

/**
 * "Set the final amount manually" block for invoices: shows the calculated sum,
 * lets the admin type the real amount, shows the difference and requires a
 * reason when it differs. value = { enabled, amount, reason }.
 */
const FinalAmountField = ({ id, calculated, value, onChange, label = "Invoice total" }) => {
  const final = resolveFinalAmount(calculated, value);
  const diff = Math.round((final - Number(calculated || 0)) * 100) / 100;
  const changed = value?.enabled && Math.abs(diff) >= 0.01;
  const needsReason = finalAmountMissingReason(calculated, value);
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-gray-600">Calculated total</span>
        <span className="font-mono font-semibold text-gray-800">{bdt(calculated)}</span>
      </div>

      <label className="flex cursor-pointer items-center gap-2 font-medium text-gray-700" htmlFor={`${id}-toggle`}>
        <input
          id={`${id}-toggle`}
          type="checkbox"
          checked={Boolean(value?.enabled)}
          onChange={(e) => set({ enabled: e.target.checked, amount: e.target.checked ? (value?.amount || String(calculated || 0)) : "" })}
          className="h-4 w-4 accent-amber-600"
        />
        Set the final amount manually
      </label>

      {value?.enabled && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="font-semibold text-gray-700" htmlFor={`${id}-amount`}>
              Final amount (৳)
              <input
                id={`${id}-amount`}
                type="number"
                min="0"
                step="0.01"
                value={value?.amount ?? ""}
                onChange={(e) => set({ amount: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 font-mono font-bold"
              />
            </label>
            <div className="self-end pb-1.5">
              <span className="text-gray-500">Adjustment </span>
              <span className={`font-mono font-bold ${diff < 0 ? "text-red-700" : diff > 0 ? "text-emerald-700" : "text-gray-500"}`}>
                {diff > 0 ? "+" : diff < 0 ? "−" : ""}{bdt(Math.abs(diff))}
              </span>
            </div>
          </div>
          {changed && (
            <label className="block font-semibold text-gray-700" htmlFor={`${id}-reason`}>
              Reason * <span className="font-normal text-gray-500">(shown on the invoice)</span>
              <input
                id={`${id}-reason`}
                type="text"
                value={value?.reason || ""}
                onChange={(e) => set({ reason: e.target.value })}
                placeholder="e.g. CarryBee charged extra return fee on 2 orders"
                className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 ${needsReason ? "border-red-300 bg-red-50" : "border-gray-300"}`}
              />
            </label>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <span className="font-semibold text-gray-800">{label}</span>
        <span className="font-mono text-sm font-extrabold text-gray-900">{bdt(final)}</span>
      </div>
    </div>
  );
};

FinalAmountField.propTypes = {
  id: PropTypes.string.isRequired,
  calculated: PropTypes.number.isRequired,
  value: PropTypes.shape({ enabled: PropTypes.bool, amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), reason: PropTypes.string }).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default FinalAmountField;
