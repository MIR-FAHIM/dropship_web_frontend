import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { useGetResellerTransactionsQuery } from "../../../redux/features/accounting";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";

const statusColors = {
  completed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  failed: "bg-red-100 text-red-700 border-red-200",
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
  const userId = getFromLocalstorage("userId");
  const [currentPage, setCurrentPage] = useState(1);

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
      <div>
        <h2 className="text-xl font-bold text-gray-800">Balance Statement</h2>
        <p className="mt-1 text-sm text-gray-500">
          Credit, debit, and wallet balance for your reseller transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          label="Debit"
          value={report.debit}
          tone="debit"
          icon={<ArrowUpRight className="h-5 w-5 text-red-600" />}
        />
        <SummaryCard
          label="Credit"
          value={report.credit}
          tone="credit"
          icon={<ArrowDownLeft className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          label="Balance"
          value={report.balance}
          tone="balance"
          icon={<Wallet className="h-5 w-5 text-blue-600" />}
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
                          <p className="font-medium text-gray-800">
                            {trx.note || trx.type || "-"}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {trx.trx_id || "-"}
                          </p>
                          {trx.order_id && (
                            <p className="mt-0.5 text-xs text-blue-600">
                              Order #{trx.order_id}
                            </p>
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
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Order #{trx.order_id}
                        </span>
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
    </div>
  );
};

export default Payments;
