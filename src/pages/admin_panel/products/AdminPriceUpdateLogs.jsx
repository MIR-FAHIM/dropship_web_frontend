import React, { useState } from "react";
import { ListChecks, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useGetPriceUpdateLogsQuery } from "../../../redux/features/product";

const AdminPriceUpdateLogs = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useGetPriceUpdateLogsQuery({ page: currentPage });

  const logs = data?.data || [];
  const totalPages = data?.meta?.last_page || data?.data?.last_page || 1;

  const getPriceDiff = (before, after) => {
    const diff = parseFloat(after) - parseFloat(before);
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Price Update Logs</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ListChecks className="w-4 h-4" />
          <span>View all price changes</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ListChecks className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No price update logs found.</p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-50" : ""}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Before Price</th>
                    <th className="pb-3 font-medium">New Price</th>
                    <th className="pb-3 font-medium">Change</th>
                    <th className="pb-3 font-medium">Updated By</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Note</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const diff = getPriceDiff(log.before_price, log.new_price);
                    return (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 text-gray-500">{(currentPage - 1) * 20 + i + 1}</td>
                        <td className="py-3">
                          <div className="max-w-[220px]">
                            <p className="font-medium text-gray-800 truncate" title={log.product?.name}>
                              {log.product?.name || "—"}
                            </p>
                            <p className="text-xs text-gray-400">ID: {log.product_id}</p>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600">${parseFloat(log.before_price).toFixed(2)}</td>
                        <td className="py-3 font-medium text-gray-800">${parseFloat(log.new_price).toFixed(2)}</td>
                        <td className="py-3">
                          {diff > 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                              <TrendingUp className="w-3.5 h-3.5" />
                              +${diff.toFixed(2)}
                            </span>
                          ) : diff < 0 ? (
                            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                              <TrendingDown className="w-3.5 h-3.5" />
                              -${Math.abs(diff).toFixed(2)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <Minus className="w-3.5 h-3.5" />
                              No Change
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-gray-600">
                          {log.updated_by ? (
                            <div>
                              <p className="font-medium text-gray-700">{log.updated_by.name}</p>
                              <p className="text-xs text-gray-400">ID: {log.updated_by.id}</p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.status === "updated"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs max-w-[180px] truncate" title={log.note}>
                          {log.note || "—"}
                        </td>
                        <td className="py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(log.created_at).toLocaleDateString("bn-BD")}{" "}
                          <span className="text-gray-400">
                            {new Date(log.created_at).toLocaleTimeString("bn-BD", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPriceUpdateLogs;
