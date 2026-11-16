import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useGetPasswordLogsQuery } from "../../../redux/features/user";

export const PASSWORD_CHANGE_TYPES = {
  self_change: { label: "নিজে পরিবর্তন", legend: "Self change", className: "border-blue-200 bg-blue-50 text-blue-700" },
  admin_reset: { label: "অ্যাডমিন রিসেট", legend: "Admin reset", className: "border-amber-200 bg-amber-50 text-amber-800" },
  otp_reset: { label: "OTP রিসেট", legend: "Forgot password (OTP)", className: "border-violet-200 bg-violet-50 text-violet-700" },
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChangedBy = ({ log }) => {
  if (log.change_type === "otp_reset") return <span className="text-gray-500">OTP যাচাই করে</span>;
  const actor = log.changed_by;
  if (!actor) return <span className="text-gray-400">—</span>;
  if (actor.id === log.user_id) return <span className="text-gray-700">নিজে</span>;
  return (
    <div>
      <p className="font-medium text-gray-800">{actor.name || `User #${actor.id}`}</p>
      <p className="text-[11px] text-gray-500">{actor.role || actor.user_type}{actor.phone ? ` · ${actor.phone}` : ""}</p>
    </div>
  );
};

/**
 * Paginated password change log. Pass userId to show one dropshipper's history;
 * filters (change_type, search, date_from, date_to) come from the parent.
 */
const PasswordLogTable = ({ userId, filters = {}, showUser = !userId }) => {
  const [page, setPage] = useState(1);
  const [lastFilters, setLastFilters] = useState(filters);
  // Reset to page 1 when filters change.
  if (JSON.stringify(lastFilters) !== JSON.stringify(filters)) {
    setLastFilters(filters);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError } = useGetPasswordLogsQuery({ ...filters, user_id: userId, page });
  const pagination = data?.data || {};
  const logs = Array.isArray(pagination.data) ? pagination.data : [];
  const currentPage = Number(pagination.current_page || page);
  const lastPage = Number(pagination.last_page || 1);

  if (isLoading) return <div className="p-8 text-center text-sm text-gray-500">লগ লোড হচ্ছে…</div>;
  if (isError) return <div className="p-8 text-center text-sm text-rose-600">পাসওয়ার্ড লগ লোড করা যায়নি।</div>;
  if (!logs.length) {
    return (
      <div className="p-8 text-center">
        <History className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">কোনো পাসওয়ার্ড পরিবর্তনের রেকর্ড নেই</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
            <tr>
              <th className="px-4 py-3">তারিখ ও সময়</th>
              {showUser && <th className="px-4 py-3">ড্রপশিপার</th>}
              <th className="px-4 py-3">ধরন</th>
              <th className="px-4 py-3">কে পরিবর্তন করেছে</th>
              <th className="px-4 py-3">নোট</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => {
              const type = PASSWORD_CHANGE_TYPES[log.change_type] || { label: log.change_type, className: "border-gray-200 bg-gray-50 text-gray-600" };
              return (
                <tr key={log.id} className="hover:bg-gray-50/70">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{formatDateTime(log.created_at)}</td>
                  {showUser && (
                    <td className="px-4 py-3">
                      {log.user ? (
                        <Link to={`/admin-panel/dropshippers/${log.user_id}`} className="font-medium text-blue-700 hover:underline">
                          {log.user.name || `User #${log.user_id}`}
                        </Link>
                      ) : (
                        <span className="text-gray-500">User #{log.user_id}</span>
                      )}
                      {log.user?.phone && <p className="text-[11px] text-gray-500">{log.user.phone}</p>}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span title={type.legend} className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${type.className}`}>
                      {type.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs"><ChangedBy log={log} /></td>
                  <td className="max-w-xs px-4 py-3 text-xs text-gray-600">
                    <span className="line-clamp-2" title={log.note || ""}>{log.note || "—"}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500" title={log.user_agent || ""}>{log.ip_address || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-xs text-gray-500">মোট {pagination.total ?? logs.length}টি রেকর্ড</span>
        {lastPage > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">পৃষ্ঠা {currentPage} / {lastPage}</span>
            <button
              type="button"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> আগের
            </button>
            <button
              type="button"
              disabled={currentPage >= lastPage || isFetching}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
            >
              পরের <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordLogTable;
