import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet, Lock, CheckCircle2, PlusCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { useGetResellerTransactionsQuery, useRequestWalletTopupMutation } from "../../../redux/features/accounting";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";

const statusColors = {
  completed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const typeLabels = {
  order_settlement: { label: "অর্ডার মুনাফা", color: "bg-blue-50 text-blue-700 border-blue-200" },
  wallet_topup: { label: "ব্যালেন্স রিচার্জ", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  order_advance: { label: "অগ্রিম ডেলিভারি ফি", color: "bg-amber-50 text-amber-800 border-amber-200" },
  advance_refund: { label: "অগ্রিম ফেরত", color: "bg-teal-50 text-teal-700 border-teal-200" },
  withdraw: { label: "উইথড্রয়াল", color: "bg-purple-50 text-purple-700 border-purple-200" },
  courier_loss: { label: "কুরিয়ার ক্ষতিপূরণ", color: "bg-rose-50 text-rose-700 border-rose-200" },
  penalty: { label: "পেনাল্টি", color: "bg-red-50 text-red-700 border-red-200" },
};

const formatCurrency = (amount) =>
  `BDT ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPageFromUrl = (url) => {
  try {
    return Number(new URL(url).searchParams.get("page")) || 1;
  } catch {
    return 1;
  }
};

const paginationLabel = (label) =>
  String(label || "")
    .replace("&laquo;", "")
    .replace("&raquo;", "")
    .trim();

const SummaryCard = ({ label, value, tone, icon }) => {
  const styles = {
    available: "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm",
    reserved: "bg-amber-50 border-amber-200 text-amber-800",
    debit: "bg-red-50 border-red-100 text-red-700",
    credit: "bg-green-50 border-green-100 text-green-700",
    balance: "bg-blue-50 border-blue-100 text-blue-700",
  };

  return (
    <div className={`rounded-lg border p-4 sm:p-5 ${styles[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    </div>
  );
};

const Payments = () => {
  const navigate = useNavigate();
  const userId = getFromLocalstorage("userId");
  const [currentPage, setCurrentPage] = useState(1);
  const [requestTopup, { isLoading: isRequestingTopup }] = useRequestWalletTopupMutation();

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(1000);
  const [rechargeMethod, setRechargeMethod] = useState("bkash");
  const [rechargeTrxId, setRechargeTrxId] = useState("");
  const [rechargePhone, setRechargePhone] = useState("");

  const { data, error, isLoading, isFetching, refetch } =
    useGetResellerTransactionsQuery(
      { page: currentPage, reseller_id: userId },
      { skip: !userId }
    );

  const report = data?.data || {};
  const pagination = report.items || {};
  const items = pagination.data || [];

  const handlePageClick = (link) => {
    if (!link?.url) return;
    setCurrentPage(getPageFromUrl(link.url));
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    if (!rechargeAmount || Number(rechargeAmount) < 50) {
      toast.error("ন্যূনতম রিচার্জ পরিমাণ ৳৫০");
      return;
    }
    if (!rechargeTrxId.trim()) {
      toast.error("অনুগ্রহ করে Trx ID দিন");
      return;
    }
    try {
      await requestTopup({
        user_id: userId,
        amount: Number(rechargeAmount),
        payment_method: rechargeMethod,
        trx_id: rechargeTrxId.trim(),
        sender_phone: rechargePhone.trim(),
      }).unwrap();
      toast.success("ব্যালেন্স রিচার্জ রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে! অ্যাডমিন অনুমোদনের পর ব্যালেন্স যোগ হবে।");
      setShowRechargeModal(false);
      setRechargeTrxId("");
      setRechargePhone("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "রিচার্জ রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে");
    }
  };

  if (!userId) {
    return (
      <div className="p-6 text-sm font-medium text-red-600">
        User id not found. Please login again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-medium text-red-600">
          Error loading transactions.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">ব্যালেন্স স্টেটমেন্ট (Balance Statement)</h2>
          <p className="mt-1 text-sm text-gray-500">
            রিসেলার ওয়ালেট ব্যালেন্স, উইথড্রযোগ্য ফান্ড ও লেনদেনের ইতিহাস।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRechargeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            ব্যালেন্স রিচার্জ (Recharge Wallet)
          </button>
          <button
            type="button"
            onClick={() => navigate('/withdraw')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <Wallet className="w-4 h-4" />
            উইথড্র রিকোয়েস্ট পাঠান
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          label="উইথড্রযোগ্য ব্যালেন্স (Available)"
          value={report.available_balance ?? report.balance}
          tone="available"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        />
        <SummaryCard
          label="পেন্ডিং সংরক্ষিত (Reserved)"
          value={report.pending_reserved || 0}
          tone="reserved"
          icon={<Lock className="h-5 w-5 text-amber-600" />}
        />
        <SummaryCard
          label="মোট ওয়ালেট ব্যালেন্স"
          value={report.balance}
          tone="balance"
          icon={<Wallet className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          label="সর্বমোট ক্রেডিট (আয়)"
          value={report.credit}
          tone="credit"
          icon={<ArrowDownLeft className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          label="সর্বমোট ডেবিট (উইথড্র)"
          value={report.debit}
          tone="debit"
          icon={<ArrowUpRight className="h-5 w-5 text-red-600" />}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-800">
            Transaction History
          </h3>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
            {pagination.total || 0} transactions
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No transactions found.
            </p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-60" : ""}>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Transaction
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Source</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((trx) => {
                    const isDebit = trx.trx_type === "debit";

                    return (
                      <tr key={trx.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          {formatDate(trx.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-gray-800">
                              {trx.note || trx.type || "-"}
                            </p>
                            {trx.type && typeLabels[trx.type] && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeLabels[trx.type].color}`}>
                                {typeLabels[trx.type].label}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-400 font-mono">
                            {trx.trx_id || "-"}
                          </p>
                          {trx.order_id && (
                            <button
                              type="button"
                              onClick={() => navigate(`/orders/${trx.order_id}`)}
                              className="mt-0.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline block text-left"
                            >
                              Order #{trx.order?.order_number || trx.order_id} →
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {trx.source || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              isDebit
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {trx.trx_type || "-"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${
                            isDebit ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isDebit ? "-" : "+"}
                          {formatCurrency(trx.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                              statusColors[trx.status] ||
                              "border-gray-200 bg-gray-100 text-gray-600"
                            }`}
                          >
                            {trx.status || "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {items.map((trx) => {
                const isDebit = trx.trx_type === "debit";

                return (
                  <div key={trx.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {trx.note || trx.type || "-"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(trx.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {trx.trx_id || "-"}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-bold ${
                          isDebit ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isDebit ? "-" : "+"}
                        {formatCurrency(trx.amount)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {trx.type && typeLabels[trx.type] && (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${typeLabels[trx.type].color}`}>
                          {typeLabels[trx.type].label}
                        </span>
                      )}
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 capitalize">
                        {trx.source || "-"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          isDebit
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {trx.trx_type || "-"}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusColors[trx.status] ||
                          "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {trx.status || "-"}
                      </span>
                      {trx.order_id && (
                        <button
                          type="button"
                          onClick={() => navigate(`/orders/${trx.order_id}`)}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:underline"
                        >
                          Order #{trx.order?.order_number || trx.order_id} →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {pagination.last_page > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
          <p>
            Showing {pagination.from || 0}-{pagination.to || 0} of{" "}
            {pagination.total || 0}
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {pagination.links?.map((link, index) => (
              <button
                key={`${link.label}-${index}`}
                type="button"
                disabled={!link.url}
                onClick={() => handlePageClick(link)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  link.active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : link.url
                    ? "border-gray-300 hover:bg-gray-50"
                    : "cursor-not-allowed border-gray-200 text-gray-400"
                }`}
              >
                {paginationLabel(link.label)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recharge Wallet Modal ── */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowRechargeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">ব্যালেন্স রিচার্জ (Recharge Wallet)</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              আপনার অ্যাকাউন্টে ব্যালেন্স যুক্ত করুন, যেন প্রতিটি অর্ডারে আলাদাভাবে bKash করতে না হয়।
            </p>

            <form onSubmit={handleRechargeSubmit} className="space-y-4">
              {/* Quick Amount Chips */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  রিচার্জের পরিমাণ (BDT)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                        Number(rechargeAmount) === amt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      ৳{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50"
                  step="1"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="অন্যান্য পরিমাণ লিখুন (ন্যূনতম ৳৫০)"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* MFS Instructions Box */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  📢 পেমেন্ট নির্দেশনা:
                </p>
                <p>
                  আমাদের বিকাশ নম্বরে পেমেন্ট করুন:{" "}
                  <span className="font-mono font-bold text-green-700 text-sm bg-white px-2 py-0.5 rounded border border-amber-200">
                    01941606310
                  </span>
                </p>
                <p className="text-[11px] font-bold text-red-600">
                  ⚠️ শুধুমাত্র বিকাশ পেমেন্ট (Bkash Payment ✅) করুন। সেন্ড মানি (Send money ❌) করবেন না।
                </p>
                <p className="text-[11px] text-amber-800/80">
                  পেমেন্ট সম্পন্ন করার পর প্রাপ্ত ট্রানজেকশন আইডি (Trx ID) ও আপনার সেন্ডার নম্বর নিচে দিন।
                </p>
              </div>

              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "bkash", name: "bKash" },
                  { id: "nagad", name: "Nagad" },
                  { id: "rocket", name: "Rocket" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRechargeMethod(m.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                      rechargeMethod === m.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {/* Sender Phone & Trx ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    সেন্ডার ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    value={rechargePhone}
                    onChange={(e) => setRechargePhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Transaction ID (Trx ID) *
                  </label>
                  <input
                    type="text"
                    value={rechargeTrxId}
                    onChange={(e) => setRechargeTrxId(e.target.value)}
                    placeholder="যেমন: BKL998811"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 uppercase"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isRequestingTopup}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {isRequestingTopup ? "পাঠানো হচ্ছে..." : "রিচার্জ নিশ্চিত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
