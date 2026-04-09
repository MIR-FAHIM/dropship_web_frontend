import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Wallet,
} from "lucide-react";
import {
  useGetCreditTransactionsQuery,
  useGetDebitTransactionsQuery,
  useGetTransactionReportQuery,
} from "../../../redux/features/accounting";

const statusColors = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const AdminAccounting = () => {
  const { data: creditData, isLoading: creditLoading } =
    useGetCreditTransactionsQuery();
  const { data: debitData, isLoading: debitLoading } =
    useGetDebitTransactionsQuery();
  const { data: reportData, isLoading: reportLoading } =
    useGetTransactionReportQuery();

  const report = reportData?.data || {};
  const creditItems = creditData?.data?.items?.data || [];
  const debitItems = debitData?.data?.items?.data || [];
  const totalCredit = creditData?.data?.total || 0;
  const totalDebit = debitData?.data?.total || 0;

  const isLoading = creditLoading || debitLoading || reportLoading;

  const formatCurrency = (amount) =>
    `৳${Number(amount || 0).toLocaleString("bn-BD")}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const TransactionRow = ({ item }) => (
    <tr className="border-b last:border-0 hover:bg-gray-50 transition">
      <td className="py-3 px-4">
        <p className="font-medium text-gray-800 text-xs sm:text-sm line-clamp-1">
          {item.note || "—"}
        </p>
        {item.trx_id && (
          <p className="text-[11px] text-gray-400 mt-0.5">{item.trx_id}</p>
        )}
      </td>
      <td className="py-3 px-4 text-xs text-gray-500 hidden sm:table-cell">
        {item.source}
      </td>
      <td className="py-3 px-4 text-right font-semibold text-sm text-gray-800">
        {formatCurrency(item.amount)}
      </td>
      <td className="py-3 px-4 text-center">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
            statusColors[item.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {item.status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500 hidden md:table-cell">
        {formatDate(item.created_at)}
      </td>
    </tr>
  );

  const TransactionCard = ({ item, type }) => (
    <div className="p-4 border-b last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 line-clamp-2">
            {item.note || "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {item.source}
            </span>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                statusColors[item.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {item.status}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {formatDate(item.created_at)}
          </p>
        </div>
        <p
          className={`text-sm font-bold flex-shrink-0 ${
            type === "credit" ? "text-green-600" : "text-red-600"
          }`}
        >
          {type === "credit" ? "+" : "-"}
          {formatCurrency(item.amount)}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800">হিসাব-নিকাশ</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              মোট ক্রেডিট
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {formatCurrency(report.total_credit || totalCredit)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
              <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              মোট ডেবিট
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-600">
            {formatCurrency(report.total_debit || totalDebit)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              নিট মুনাফা
            </span>
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold ${
              (report.profit || 0) >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatCurrency(report.profit || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              মার্জিন
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">
            {(report.margin_percent || 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Credit & Debit Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit (Left) */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-green-500" />
              ক্রেডিট (আয়)
            </h2>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {formatCurrency(totalCredit)}
            </span>
          </div>

          {creditItems.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">কোনো ক্রেডিট ট্রানজেকশন নেই।</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-green-50/50 text-gray-600">
                      <th className="text-left py-2.5 px-4 font-medium text-xs">
                        বিবরণ
                      </th>
                      <th className="text-left py-2.5 px-4 font-medium text-xs hidden sm:table-cell">
                        উৎস
                      </th>
                      <th className="text-right py-2.5 px-4 font-medium text-xs">
                        পরিমাণ
                      </th>
                      <th className="text-center py-2.5 px-4 font-medium text-xs">
                        স্ট্যাটাস
                      </th>
                      <th className="text-left py-2.5 px-4 font-medium text-xs hidden md:table-cell">
                        তারিখ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditItems.map((item) => (
                      <TransactionRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="sm:hidden">
                {creditItems.map((item) => (
                  <TransactionCard key={item.id} item={item} type="credit" />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Debit (Right) */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-red-500" />
              ডেবিট (ব্যয়)
            </h2>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {formatCurrency(totalDebit)}
            </span>
          </div>

          {debitItems.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">কোনো ডেবিট ট্রানজেকশন নেই।</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-red-50/50 text-gray-600">
                      <th className="text-left py-2.5 px-4 font-medium text-xs">
                        বিবরণ
                      </th>
                      <th className="text-left py-2.5 px-4 font-medium text-xs hidden sm:table-cell">
                        উৎস
                      </th>
                      <th className="text-right py-2.5 px-4 font-medium text-xs">
                        পরিমাণ
                      </th>
                      <th className="text-center py-2.5 px-4 font-medium text-xs">
                        স্ট্যাটাস
                      </th>
                      <th className="text-left py-2.5 px-4 font-medium text-xs hidden md:table-cell">
                        তারিখ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitItems.map((item) => (
                      <TransactionRow key={item.id} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Cards */}
              <div className="sm:hidden">
                {debitItems.map((item) => (
                  <TransactionCard key={item.id} item={item} type="debit" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccounting;
