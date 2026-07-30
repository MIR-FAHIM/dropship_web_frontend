import React, { useMemo, useState } from "react";
import { AlertTriangle, Loader2, User, Globe, CalendarClock, Activity } from "lucide-react";
import {
  useGetLoginErrorLogsQuery,
  useGetOverallErrorLogsReportQuery,
  useGetOrderErrorLogsQuery,
  useGetProductCreateErrorLogsQuery,
  useGetRegistrationErrorLogsQuery,
} from "../../../redux/features/errorLog";

const TABS = [
  { key: "product_create", label: "Product create" },
  { key: "login", label: "Login" },
  { key: "register", label: "Register" },
  { key: "order", label: "Order" },
  { key: "others", label: "Others" },
];

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

const parseRequestData = (raw) => {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
};

const getValidationMessage = (requestData) => {
  const validationErrors = requestData?.validation_errors;
  if (!validationErrors || typeof validationErrors !== "object") return "-";

  const firstKey = Object.keys(validationErrors)[0];
  const firstValue = validationErrors[firstKey];
  if (Array.isArray(firstValue) && firstValue.length > 0) return firstValue[0];
  if (typeof firstValue === "string") return firstValue;
  return "-";
};

const maskSensitiveRequestData = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  return Object.entries(value).reduce((acc, [key, itemValue]) => {
    if (/password|token|secret/i.test(key)) {
      acc[key] = "***";
      return acc;
    }

    acc[key] = itemValue && typeof itemValue === "object" ? maskSensitiveRequestData(itemValue) : itemValue;
    return acc;
  }, {});
};

const formatRequestData = (requestData, raw) => {
  if (requestData) {
    return JSON.stringify(maskSensitiveRequestData(requestData), null, 2);
  }

  return raw ? String(raw) : "-";
};

const ErrorLogTable = ({ rows, isFetching }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${isFetching ? "opacity-70" : ""}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Error</th>
              <th className="px-4 py-3 font-medium">Request</th>
              <th className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const requestData = parseRequestData(item.request_data);
              const payload = requestData?.payload || {};
              const validationMessage = getValidationMessage(requestData);
              const formattedRequestData = formatRequestData(requestData, item.request_data);

              return (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 align-top">
                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{formatDateTime(item.created_at)}</td>

                  <td className="px-4 py-4 text-gray-700">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{item.user?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{item.user?.email || "-"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 max-w-sm">
                    <p className="font-medium text-red-600">{item.message || "-"}</p>
                    {validationMessage !== "-" && (
                      <p className="text-xs text-gray-500 mt-1">Validation: {validationMessage}</p>
                    )}
                    <p className="text-xs mt-2 text-gray-500">Level: {item.level || "-"}</p>
                  </td>

                  <td className="px-4 py-4 text-gray-700 max-w-sm">
                    <p className="font-medium">{item.method || "-"}</p>
                    <p className="text-xs text-gray-500 break-all">{item.url || "-"}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {payload?.name && (
                        <span className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700">
                          Name: {payload.name}
                        </span>
                      )}
                      {payload?.unit_price && (
                        <span className="text-[11px] px-2 py-1 rounded bg-green-50 text-green-700">
                          Price: {payload.unit_price}
                        </span>
                      )}
                      {payload?.current_stock && (
                        <span className="text-[11px] px-2 py-1 rounded bg-amber-50 text-amber-700">
                          Stock: {payload.current_stock}
                        </span>
                      )}
                    </div>
                    {formattedRequestData !== "-" && (
                      <pre className="mt-3 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-2 text-[11px] leading-5 text-gray-700">
                        {formattedRequestData}
                      </pre>
                    )}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <Globe className="w-3.5 h-3.5" />
                      {item.ip_address || "-"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ErrorLogTabContent = ({ title, useQueryHook }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useQueryHook(
    { page: currentPage },
    { refetchOnMountOrArgChange: true }
  );

  const pagedData = data?.data;
  const rows = useMemo(() => pagedData?.data || [], [pagedData]);

  const totalPages = pagedData?.last_page || 1;
  const totalItems = pagedData?.total || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
        Failed to load {title.toLowerCase()} error logs.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No {title.toLowerCase()} error logs found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            Total: {totalItems}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
            <CalendarClock className="w-3.5 h-3.5" />
            Page: {currentPage}/{totalPages}
          </span>
        </div>
      </div>

      <ErrorLogTable rows={rows} isFetching={isFetching} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const ProductCreateTab = () => (
  <ErrorLogTabContent title="Product Create" useQueryHook={useGetProductCreateErrorLogsQuery} />
);

const LoginTab = () => (
  <ErrorLogTabContent title="Login" useQueryHook={useGetLoginErrorLogsQuery} />
);

const RegistrationTab = () => (
  <ErrorLogTabContent title="Registration" useQueryHook={useGetRegistrationErrorLogsQuery} />
);

const OrderTab = () => (
  <ErrorLogTabContent title="Order" useQueryHook={useGetOrderErrorLogsQuery} />
);

const CountBadge = ({ label, value, colorClass = "bg-gray-100 text-gray-700" }) => (
  <div className={`rounded-lg px-3 py-2 ${colorClass}`}>
    <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80">{label}</p>
    <p className="text-xl font-bold mt-0.5">{value ?? 0}</p>
  </div>
);

const SeparatedBlock = ({ title, data }) => (
  <div className="border border-gray-200 rounded-xl p-4 bg-white">
    <p className="text-sm font-semibold text-gray-800 mb-3">{title}</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <CountBadge label="Product Create" value={data?.product_create ?? 0} colorClass="bg-blue-50 text-blue-700" />
      <CountBadge label="Login" value={data?.login ?? 0} colorClass="bg-purple-50 text-purple-700" />
      <CountBadge label="Registration" value={data?.registration ?? 0} colorClass="bg-emerald-50 text-emerald-700" />
      <CountBadge label="Order" value={data?.order ?? 0} colorClass="bg-amber-50 text-amber-700" />
    </div>
  </div>
);

const OverallErrorReport = () => {
  const { data, isLoading, isError, isFetching } = useGetOverallErrorLogsReportQuery();
  const report = data?.data;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
        Failed to load overall error report.
      </div>
    );
  }

  return (
    <div className={`space-y-4 bg-white rounded-xl border border-gray-200 p-4 sm:p-5 ${isFetching ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-600" />
          <h2 className="text-base font-semibold text-gray-800">Overall Error Report</h2>
        </div>
        <p className="text-xs text-gray-500">Now: {formatDateTime(report?.time_window?.now)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CountBadge label="Today Total Errors" value={report?.today_total_errors ?? 0} colorClass="bg-red-50 text-red-700" />
        <CountBadge label="Last Hour Total" value={report?.last_hour_errors?.total ?? 0} colorClass="bg-indigo-50 text-indigo-700" />
        <CountBadge label="Others Today Total" value={report?.others_errors_today?.total ?? 0} colorClass="bg-slate-100 text-slate-700" />
      </div>

      <SeparatedBlock title="Today Separated Error Count" data={report?.today_separated_error_count} />
      <SeparatedBlock title="Last Hour Separated Error Count" data={report?.last_hour_errors?.separated} />
    </div>
  );
};

const ErrorLog = () => {
  const [activeTab, setActiveTab] = useState("product_create");

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Error Log</h1>
            <p className="text-gray-300 text-sm mt-0.5">
              Track important system errors from admin actions.
            </p>
          </div>
        </div>
      </div>

      <OverallErrorReport />

      <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "product_create" ? (
        <ProductCreateTab />
      ) : activeTab === "login" ? (
        <LoginTab />
      ) : activeTab === "register" ? (
        <RegistrationTab />
      ) : activeTab === "order" ? (
        <OrderTab />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-sm font-medium text-gray-700">{TABS.find((t) => t.key === activeTab)?.label}</p>
          <p className="text-sm text-gray-500 mt-1">This tab is ready in UI and will be connected next.</p>
        </div>
      )}
    </div>
  );
};

export default ErrorLog;
