import { useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/shared/Pagination";
import { useGetResellerAdvanceHistoryQuery } from "../../../redux/features/accounting";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  dateStyle: "medium",
  timeStyle: "short",
});

const amountFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
});

const columns = ["Date & Time", "Reseller", "Order", "Transaction ID", "Amount", "Type", "Status", "Note"];
const eventLabels = {
  order_advance: "Advance payment",
  advance_refund: "Refund / release",
  advance_reversal: "Approval reversal",
};

export default function ResellerAdvancePaymentHistory() {
  const [page, setPage] = useState(1);
  const { currentData, isFetching, isError, error, refetch } = useGetResellerAdvanceHistoryQuery(page, {
    refetchOnMountOrArgChange: true,
  });
  const pagination = currentData?.data?.items;
  const transactions = pagination?.data ?? [];

  return (
    <section className="space-y-4 p-4 sm:p-6" aria-labelledby="advance-payment-history-heading">
      <div>
        <h1 id="advance-payment-history-heading" className="text-xl font-bold text-gray-900 sm:text-2xl">
          Reseller Advance Payment History
        </h1>
        <p className="mt-1 text-sm text-gray-600">Approved Reliability Balance payments, including admin-entered advances, plus refunds, releases, and approval reversals.</p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700" role="alert">
          {error?.status === 403 ? "You do not have permission to view this history." : (
            <>
              Could not load the advance payment history.{" "}
              <button type="button" onClick={refetch} className="font-semibold text-blue-700 underline">Try again</button>
            </>
          )}
        </div>
      ) : isFetching && !pagination ? (
        <p role="status" className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading history…</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto" aria-busy={isFetching}>
            <table className="w-full text-left text-sm text-gray-700">
              <caption className="sr-only">Reseller advance payment history</caption>
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
                <tr>
                  {columns.map((column) => (
                    <th key={column} scope="col" className="whitespace-nowrap px-4 py-3">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">No advance activity found.</td>
                  </tr>
                )}
                {transactions.map((transaction) => (
                  <tr key={`${transaction.type}-${transaction.id}`}>
                    <td className="whitespace-nowrap px-4 py-3">
                      {transaction.created_at ? dateFormatter.format(new Date(transaction.created_at)) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {transaction.reseller_name ?? (transaction.reseller_id ? `#${transaction.reseller_id}` : "—")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {transaction.order_number ? (
                        <Link to={`/admin-panel/orders/${transaction.order_id}`} className="font-medium text-blue-700 hover:underline">
                          {transaction.order_number}
                        </Link>
                      ) : transaction.order_id ? `#${transaction.order_id}` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{transaction.trx_id || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">{amountFormatter.format(transaction.amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{eventLabels[transaction.type] ?? transaction.type}</td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize">{transaction.status || "—"}</td>
                    <td className="min-w-48 px-4 py-3">{transaction.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination?.last_page > 1 && (
            <div className="border-t border-gray-200 px-4 pb-4">
              <Pagination currentPage={page} totalPages={pagination.last_page} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
