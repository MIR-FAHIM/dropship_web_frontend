import PropTypes from "prop-types";
import { AlertTriangle, Loader2, Wallet, ArrowDownToLine, CreditCard } from "lucide-react";
import { useGetDropshipperPayoutReviewQuery } from "../../../redux/features/order";

const bdt = (n) =>
  `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const STATUS_CLS = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  transferred: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

const Pill = ({ status }) => (
  <span className={`rounded px-1.5 py-px text-[10px] font-semibold capitalize ${STATUS_CLS[status] || "bg-gray-100 text-gray-600"}`}>
    {status || "—"}
  </span>
);
Pill.propTypes = { status: PropTypes.string };

/**
 * Pre-payout check shown inside the direct-profit modal: the dropshipper's
 * current wallet balance, open withdraw requests and past advance payments.
 * The admin must tick the confirmation box before the payout is allowed.
 */
const DropshipperPayoutReview = ({ userId, confirmed, onConfirmChange }) => {
  const { data, isFetching, isError, refetch } = useGetDropshipperPayoutReviewQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });
  const r = data?.data;

  if (!userId) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700">
        ড্রপশিপার আইডি পাওয়া যায়নি, তাই যাচাই করা সম্ভব নয়।
      </p>
    );
  }

  if (isFetching && !r) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> ড্রপশিপারের হিসাব যাচাই করা হচ্ছে…
      </div>
    );
  }

  if (isError || !r) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-red-700">
        হিসাব লোড করা যায়নি।{" "}
        <button type="button" onClick={refetch} className="font-semibold underline">
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  const balance = Number(r.balance?.balance || 0);
  const openWithdraws = Number(r.withdraws?.open_count || 0);
  const pendingAdvances = Number(r.advances?.pending_count || 0);
  const hasWarnings = openWithdraws > 0 || pendingAdvances > 0 || balance < 0;

  return (
    <div className="space-y-2.5 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">প্রদানের আগে যাচাই</p>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`rounded-lg border bg-white p-2 ${balance < 0 ? "border-red-300" : "border-gray-200"}`}>
          <p className="flex items-center gap-1 text-[10px] text-gray-500"><Wallet className="h-3 w-3" /> বর্তমান ব্যালেন্স</p>
          <p className={`mt-0.5 font-mono text-sm font-bold ${balance < 0 ? "text-red-600" : "text-gray-900"}`}>{bdt(balance)}</p>
        </div>
        <div className={`rounded-lg border bg-white p-2 ${openWithdraws > 0 ? "border-amber-300" : "border-gray-200"}`}>
          <p className="flex items-center gap-1 text-[10px] text-gray-500"><ArrowDownToLine className="h-3 w-3" /> চলমান উইথড্র</p>
          <p className={`mt-0.5 font-mono text-sm font-bold ${openWithdraws > 0 ? "text-amber-700" : "text-gray-900"}`}>
            {openWithdraws} <span className="text-[10px] font-medium">({bdt(r.withdraws?.open_amount)})</span>
          </p>
        </div>
        <div className={`rounded-lg border bg-white p-2 ${pendingAdvances > 0 ? "border-amber-300" : "border-gray-200"}`}>
          <p className="flex items-center gap-1 text-[10px] text-gray-500"><CreditCard className="h-3 w-3" /> অ্যাডভান্স পেমেন্ট</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-gray-900">
            {r.advances?.total_count || 0}
            {pendingAdvances > 0 && <span className="text-[10px] font-medium text-amber-700"> ({pendingAdvances} pending)</span>}
          </p>
        </div>
      </div>

      {hasWarnings && (
        <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          {[
            openWithdraws > 0 && `${openWithdraws}টি উইথড্র রিকোয়েস্ট এখনো পরিশোধ হয়নি`,
            pendingAdvances > 0 && `${pendingAdvances}টি অ্যাডভান্স পেমেন্ট যাচাই বাকি`,
            balance < 0 && "ব্যালেন্স ঋণাত্মক",
          ].filter(Boolean).join(" · ")}
          । দ্বিগুণ পেমেন্ট এড়াতে যাচাই করুন।
        </p>
      )}

      {/* Recent lists */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold text-gray-500">সাম্প্রতিক উইথড্র</p>
          {r.withdraws?.recent?.length ? (
            <ul className="space-y-1">
              {r.withdraws.recent.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-1 rounded border bg-white px-1.5 py-1">
                  <span className="font-mono text-[11px] font-semibold">{bdt(w.amount)}</span>
                  <span className="text-[10px] text-gray-400">{fmtDate(w.created_at)}</span>
                  <Pill status={w.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-gray-400">কোনো উইথড্র রিকোয়েস্ট নেই</p>
          )}
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold text-gray-500">সাম্প্রতিক অ্যাডভান্স</p>
          {r.advances?.recent?.length ? (
            <ul className="space-y-1">
              {r.advances.recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-1 rounded border bg-white px-1.5 py-1">
                  <span className="truncate text-[10px] text-gray-500" title={a.order_number}>{a.order_number}</span>
                  <span className="font-mono text-[11px] font-semibold">{bdt(a.advance_amount)}</span>
                  <Pill status={a.advance_status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-gray-400">কোনো অ্যাডভান্স পেমেন্ট নেই</p>
          )}
        </div>
      </div>

      {/* Required confirmation */}
      <label className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 ${confirmed ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-white"}`}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-emerald-600"
        />
        <span className="text-[11px] font-medium leading-snug text-gray-800">
          আমি ড্রপশিপারের ব্যালেন্স, উইথড্র রিকোয়েস্ট ও অ্যাডভান্স পেমেন্ট যাচাই করেছি এবং নিশ্চিত যে এই প্রফিট আগে পরিশোধ করা হয়নি।
        </span>
      </label>
    </div>
  );
};

DropshipperPayoutReview.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  confirmed: PropTypes.bool.isRequired,
  onConfirmChange: PropTypes.func.isRequired,
};

export default DropshipperPayoutReview;
