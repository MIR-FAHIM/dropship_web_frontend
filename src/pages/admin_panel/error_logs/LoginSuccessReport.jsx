/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetLoginSuccessLogsQuery,
  useGetLoginSuccessReportQuery,
} from "../../../redux/features/errorLog";

const initialFilters = {
  user_id: "",
  user_type: "",
  role: "",
  login_type: "",
  search: "",
  from: "",
  to: "",
  per_page: 20,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const getPayload = (response) => response?.data?.data || response?.data || response || {};

const getPagedPayload = (response) => {
  const payload = getPayload(response);
  if (Array.isArray(payload)) return { data: payload, current_page: 1, last_page: 1, total: payload.length };
  if (Array.isArray(payload?.data)) return payload;
  if (Array.isArray(payload?.items?.data)) return payload.items;
  if (Array.isArray(payload?.items)) return { data: payload.items, current_page: 1, last_page: 1, total: payload.items.length };
  return { data: [], current_page: 1, last_page: 1, total: 0 };
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  if (!value && value !== 0) return "-";
  return String(value).replace(/_/g, " ");
};

const normalizeBreakdownRows = (data, labelKeys = ["label", "name", "key"], valueKeys = ["total", "count", "value"]) => {
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const labelKey = labelKeys.find((key) => item?.[key] !== undefined && item?.[key] !== null);
      const valueKey = valueKeys.find((key) => item?.[key] !== undefined && item?.[key] !== null);

      return {
        label: item?.[labelKey] ?? `Item ${index + 1}`,
        value: Number(item?.[valueKey] || 0),
      };
    });
  }

  return Object.entries(data || {}).map(([label, value]) => ({
    label,
    value: Number(value || 0),
  }));
};

const getUserName = (item) => item?.user?.name || item?.user_name || item?.name || "-";
const getUserEmail = (item) => item?.user?.email || item?.email || "-";
const getUserPhone = (item) => item?.user?.phone || item?.user?.mobile || item?.phone || item?.mobile || "-";

const SummaryCard = ({ icon: Icon, label, value, colorClass, helper }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-black text-gray-900">{Number(value || 0).toLocaleString("en-BD")}</p>
        {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
      </div>
    </div>
  </div>
);

const BreakdownBlock = ({ title, data, labelKeys }) => {
  const rows = normalizeBreakdownRows(data, labelKeys);
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
          {rows.reduce((sum, row) => sum + row.value, 0).toLocaleString("en-BD")}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No data found.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg bg-gray-50 px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold capitalize text-gray-700">{formatLabel(row.label)}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{row.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: row.value > 0 ? `${Math.max(6, (row.value / maxValue) * 100)}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LastSevenDaysBlock = ({ data }) => {
  const rows = Array.isArray(data) ? data : Object.entries(data || {}).map(([date, count]) => ({ date, count }));
  const maxCount = Math.max(...rows.map((item) => Number(item.count || item.total || 0)), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-gray-800">Last 7 Days Breakdown</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No login success data found.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => {
            const label = item.date || item.day || item.login_date || "-";
            const count = Number(item.count || item.total || item.success_logins || 0);
            const width = count > 0 ? `${Math.max(6, (count / maxCount) * 100)}%` : "0%";

            return (
              <div key={label} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 text-sm">
                <span className="font-medium text-gray-600">{label}</span>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-green-500" style={{ width }} />
                </div>
                <span className="text-right font-bold text-gray-800">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const LoginSuccessReport = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [queryFilters, setQueryFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      ...Object.fromEntries(
        Object.entries(queryFilters).filter(([, value]) => value !== "" && value !== null && value !== undefined),
      ),
      page: currentPage,
    }),
    [queryFilters, currentPage],
  );

  const {
    data: reportData,
    isLoading: reportLoading,
    isFetching: reportFetching,
    isError: reportError,
  } = useGetLoginSuccessReportQuery();

  const {
    data: logsData,
    isLoading: logsLoading,
    isFetching: logsFetching,
    isError: logsError,
    error: logsApiError,
  } = useGetLoginSuccessLogsQuery(queryParams, { refetchOnMountOrArgChange: true });

  const report = getPayload(reportData);
  const pagedLogs = getPagedPayload(logsData);
  const rows = pagedLogs.data || [];
  const totalPages = pagedLogs.last_page || 1;
  const totalItems = pagedLogs.total || rows.length;

  useEffect(() => {
    if (reportError) toast.error("Failed to load login success report");
  }, [reportError]);

  useEffect(() => {
    if (logsError) toast.error(logsApiError?.data?.message || "Failed to load login success logs");
  }, [logsError, logsApiError]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setQueryFilters(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setQueryFilters(initialFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-green-900 to-emerald-800 p-6 ">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl text-black-800">Login Success Report</h1>
              <p className="mt-0.5 text-sm text-black-100">
                Successful login activity and token metadata without exposing token values.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs  sm:grid-cols-2 lg:min-w-[420px]">
            <div className="rounded-lg bg-white/10 px-3 py-2">
              <span className="block font-semibold text-black-100">Now</span>
              {formatDateTime(report?.time_window?.now)}
            </div>
            <div className="rounded-lg bg-white/10 px-3 py-2">
              <span className="block font-semibold text-black-100">Today Start</span>
              {formatDateTime(report?.time_window?.today_start)}
            </div>
          </div>
        </div>
      </div>

      {reportLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-14">
          <Loader2 className="h-7 w-7 animate-spin text-green-600" />
        </div>
      ) : (
        <div className={reportFetching ? "opacity-70" : ""}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Users} label="Total Success Logins" value={report.total_success_logins} colorClass="bg-green-50 text-green-700" helper="All successful login records" />
            <SummaryCard icon={CalendarClock} label="Today Success Logins" value={report.today_success_logins} colorClass="bg-blue-50 text-blue-700" helper="Since today's start" />
            <SummaryCard icon={Clock3} label="Last Hour Success" value={report.last_hour_success_logins} colorClass="bg-amber-50 text-amber-700" helper={`From ${formatDateTime(report?.time_window?.last_hour_start)}`} />
            <SummaryCard icon={Activity} label="Last 7 Days Success" value={report.last_7_days_success_logins} colorClass="bg-purple-50 text-purple-700" helper={`From ${formatDateTime(report?.time_window?.last_7_days_start)}`} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.5fr]">
            <BreakdownBlock title="By User Type" data={report.by_user_type} labelKeys={["user_type", "label", "name"]} />
            <BreakdownBlock title="By Role" data={report.by_role} labelKeys={["role", "label", "name"]} />
            <LastSevenDaysBlock data={report.last_7_days_breakdown} />
          </div>
        </div>
      )}

      <form onSubmit={applyFilters} className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">Filters</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input name="search" value={filters.search} onChange={handleFilterChange} className={inputClass} placeholder="Search name, email, phone..." />
          <input name="user_id" value={filters.user_id} onChange={handleFilterChange} className={inputClass} placeholder="User ID" />
          <select name="user_type" value={filters.user_type} onChange={handleFilterChange} className={inputClass}>
            <option value="">All user types</option>
            <option value="admin">admin</option>
            <option value="vendor">vendor</option>
            <option value="dropshipper">dropshipper</option>
            <option value="reseller">reseller</option>
          </select>
          <input name="role" value={filters.role} onChange={handleFilterChange} className={inputClass} placeholder="Role" />
          <input name="login_type" value={filters.login_type} onChange={handleFilterChange} className={inputClass} placeholder="Login type" />
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className={inputClass} />
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className={inputClass} />
          <select name="per_page" value={filters.per_page} onChange={handleFilterChange} className={inputClass}>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={resetFilters} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Reset
          </button>
          <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            Apply Filters
          </button>
        </div>
      </form>

      <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${logsFetching ? "opacity-70" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">Successful Login Activity</h2>
            <p className="text-xs text-gray-500">Total: {Number(totalItems || 0).toLocaleString("en-BD")}</p>
          </div>
          {logsLoading && <Loader2 className="h-5 w-5 animate-spin text-green-600" />}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">User type</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Login type</th>
                <th className="px-4 py-3">IP address</th>
                <th className="px-4 py-3">User agent</th>
                <th className="px-4 py-3">Token name</th>
                <th className="px-4 py-3">Token expires at</th>
                <th className="px-4 py-3">Logged in at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logsLoading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-14 text-center text-gray-500">
                    Loading login success logs...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-14 text-center">
                    <UserCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-500">No successful login logs found.</p>
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{getUserName(item)}</td>
                    <td className="px-4 py-3 text-gray-600">{getUserEmail(item)}</td>
                    <td className="px-4 py-3 text-gray-600">{getUserPhone(item)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {formatLabel(item.user_type || item.user?.user_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatLabel(item.role || item.user?.role)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatLabel(item.login_type)}</td>
                    <td className="px-4 py-3 text-gray-600">{item.ip_address || "-"}</td>
                    <td className="max-w-[320px] px-4 py-3 text-xs text-gray-500">
                      <p className="line-clamp-3 break-words">{item.user_agent || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.token_name || item.token?.name || item.token_id || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(item.token_expires_at || item.token?.expires_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(item.logged_in_at || item.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
        <ShieldCheck className="mr-2 inline h-4 w-4" />
        Token values are not displayed. Only token id, token name, and expiry are shown when returned by the API.
      </div>
    </div>
  );
};

export default LoginSuccessReport;
