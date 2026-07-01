import React, { useMemo, useState } from "react";
import { ClipboardList, Eye, Loader2, Search, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListOrderSettlementsQuery } from "../../../redux/features/orderSettlement";
import {
  formatMoney,
  formatSettlementLabel,
  getSettlementStatusClass,
} from "./settlementUtils";

const paginationLabel = (label) =>
  String(label || "")
    .replace("&laquo;", "")
    .replace("&raquo;", "")
    .trim();

const getPageFromUrl = (url) => {
  try {
    return Number(new URL(url).searchParams.get("page")) || 1;
  } catch {
    return 1;
  }
};

const getSettlementEntries = (orderSettlement) =>
  Object.entries(orderSettlement?.settlement_status || {}).filter(
    ([, status]) => status?.exists
  );

const getOrderSettlementSummary = (orderSettlement) => {
  const entries = getSettlementEntries(orderSettlement);
  const settledCount = entries.filter(([, status]) => status?.is_settled).length;
  const pendingCount = entries.length - settledCount;

  return {
    totalCount: entries.length,
    settledCount,
    pendingCount,
    isFullySettled: entries.length > 0 && pendingCount === 0,
  };
};

const SettlementStatusChips = ({ settlement }) => {
  const entries = getSettlementEntries(settlement);

  if (entries.length === 0) {
    return <span className="text-xs text-gray-400">No settlement status</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([type, status]) => (
        <span
          key={type}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${getSettlementStatusClass(
            status?.status
          )}`}
          title={`${formatSettlementLabel(type)}: ${formatMoney(
            status?.settleable_amount
          )}`}
        >
          <span className="max-w-[130px] truncate">
            {formatSettlementLabel(type)}
          </span>
          <span className="capitalize">({status?.status || "-"})</span>
        </span>
      ))}
    </div>
  );
};

const AdminSettlementOrders = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isFetching, isError, refetch } =
    useListOrderSettlementsQuery(currentPage);

  const orderSettlements = data?.data?.data || [];
  const pagination = data?.data || {};

  const filteredSettlements = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orderSettlements;

    return orderSettlements.filter((settlement) => {
      const settlementStatuses = getSettlementEntries(settlement).flatMap(
        ([type, status]) => [type, status?.status]
      );
      const values = [
        settlement?.order_id,
        settlement?.order_number,
        settlement?.order_status,
        settlement?.payment_status,
        settlement?.latest_settlement_id,
        ...settlementStatuses,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [orderSettlements, searchQuery]);

  const pageStats = useMemo(() => {
    return orderSettlements.reduce(
      (acc, settlement) => {
        acc.totalSettleable += Number(settlement?.total_settleable_amount || 0);
        acc.totalPending += Number(settlement?.total_pending_amount || 0);
        acc.totalSettled += Number(settlement?.total_settled_amount || 0);

        if (getOrderSettlementSummary(settlement).isFullySettled) {
          acc.fullySettledOrders += 1;
        }

        return acc;
      },
      {
        totalSettleable: 0,
        totalPending: 0,
        totalSettled: 0,
        fullySettledOrders: 0,
      }
    );
  }, [orderSettlements]);

  const goToDetails = (settlement) => {
    if (settlement?.order_id) {
      navigate(`/admin-panel/settlement-orders/${settlement.order_id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settlement Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total || 0} orders with settlements
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search order or status..."
            className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {pagination.total || orderSettlements.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Settleable</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {formatMoney(pageStats.totalSettleable)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatMoney(pageStats.totalPending)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Settled</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatMoney(pageStats.totalSettled)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <ClipboardList className="w-14 h-14 text-red-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-red-500">
              Failed to load settlement orders.
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 text-sm font-medium text-red-600 underline hover:text-red-700"
            >
              Try again
            </button>
          </div>
        ) : filteredSettlements.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">
              No settlement orders found.
            </p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-60" : ""}>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-semibold">Order</th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Settleable
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Pending
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Settled
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Settlement Status
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      Payment
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSettlements.map((settlement) => {
                    const summary = getOrderSettlementSummary(settlement);

                    return (
                      <tr
                        key={settlement.order_id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => goToDetails(settlement)}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {settlement.order_number ||
                              `Order #${settlement.order_id}`}
                          </button>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Order ID: {settlement.order_id} - Status:{" "}
                            {settlement.order_status || "-"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Order total: {formatMoney(settlement.order_total)}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800">
                          {formatMoney(settlement.total_settleable_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-700">
                          {formatMoney(settlement.total_pending_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-700">
                          {formatMoney(settlement.total_settled_amount)}
                        </td>
                        <td className="py-3 px-4 min-w-[360px]">
                          <div className="space-y-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                summary.isFullySettled
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}
                            >
                              {summary.settledCount}/{summary.totalCount} settled
                            </span>
                            <SettlementStatusChips settlement={settlement} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold capitalize bg-blue-50 text-blue-700 border-blue-100">
                            {settlement.payment_status || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => goToDetails(settlement)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-gray-100">
              {filteredSettlements.map((settlement) => {
                const summary = getOrderSettlementSummary(settlement);

                return (
                  <div key={settlement.order_id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => goToDetails(settlement)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {settlement.order_number ||
                            `Order #${settlement.order_id}`}
                        </button>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Status: {settlement.order_status || "-"}
                        </p>
                      </div>
                      <span className="inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold capitalize bg-blue-50 text-blue-700 border-blue-100 shrink-0">
                        {settlement.payment_status || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Settleable</p>
                        <p className="font-bold text-gray-800">
                          {formatMoney(settlement.total_settleable_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pending</p>
                        <p className="font-bold text-red-700">
                          {formatMoney(settlement.total_pending_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Settled</p>
                        <p className="font-bold text-green-700">
                          {formatMoney(settlement.total_settled_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          summary.isFullySettled
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {summary.settledCount}/{summary.totalCount} settled
                      </span>
                      <SettlementStatusChips settlement={settlement} />
                    </div>

                    <button
                      type="button"
                      onClick={() => goToDetails(settlement)}
                      className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {pagination.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <p>
            Showing {pagination.from || 0}-{pagination.to || 0} of{" "}
            {pagination.total || 0}
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {pagination.links?.length ? (
              pagination.links.map((link, index) => (
                <button
                  key={`${link.label}-${index}`}
                  type="button"
                  disabled={!link.url}
                  onClick={() => setCurrentPage(getPageFromUrl(link.url))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                    link.active
                      ? "bg-red-600 text-white border-red-600"
                      : link.url
                      ? "border-gray-300 hover:bg-gray-50"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {paginationLabel(link.label)}
                </button>
              ))
            ) : (
              <>
                <button
                  type="button"
                  disabled={!pagination.prev_page_url && currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  Page {pagination.current_page || currentPage} /{" "}
                  {pagination.last_page}
                </span>
                <button
                  type="button"
                  disabled={
                    !pagination.next_page_url &&
                    currentPage >= Number(pagination.last_page || 1)
                  }
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(Number(pagination.last_page || page), page + 1)
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettlementOrders;
