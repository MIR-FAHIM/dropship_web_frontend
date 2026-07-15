/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { Bell, CheckCheck, Clock3, Loader2, Mail, MailOpen, Search } from "lucide-react";
import { toast } from "sonner";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import {
  useGetUserNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useReadUnreadNotificationMutation,
} from "../../../redux/features/notification";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const getPayload = (response) => response?.data?.data || response?.data || response || {};

const getNotificationsPage = (response) => {
  const payload = getPayload(response);
  const notifications = payload.notifications || payload;
  if (Array.isArray(notifications)) {
    return { data: notifications, current_page: 1, last_page: 1, total: notifications.length };
  }
  if (Array.isArray(notifications?.data)) return notifications;
  return { data: [], current_page: 1, last_page: 1, total: 0 };
};

const getSummary = (response) => {
  const payload = getPayload(response);
  return payload.summary || {
    total_count: 0,
    unread_count: 0,
    read_count: 0,
  };
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationItem = ({ item, onToggle, busy }) => {
  const isSeen = item.is_seen;

  return (
    <div className={`rounded-xl border p-4 transition ${isSeen ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50"}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900">{item.title || "Notification"}</h3>
            {!isSeen && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">Unread</span>}
          </div>
          <p className="mt-1 text-sm leading-6 text-gray-600">{item.subtitle || item.message || "-"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {item.type && <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700">Type: {item.type}</span>}
            {item.module && <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-700">Module: {item.module}</span>}
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDateTime(item.created_at)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggle(item)}
          disabled={busy}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
            isSeen ? "border border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSeen ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
          {isSeen ? "Mark unread" : "Mark read"}
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const userId = getFromLocalstorage("userId");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ type: "", module: "", search: "" });
  const [appliedFilters, setAppliedFilters] = useState({ type: "", module: "", search: "" });

  const queryParams = useMemo(() => {
    const params = {
      userId,
      page: currentPage,
      per_page: 20,
      ...appliedFilters,
    };
    if (activeTab === "unread") params.is_seen = 0;
    if (activeTab === "read") params.is_seen = 1;
    return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));
  }, [activeTab, appliedFilters, currentPage, userId]);

  const { data, isLoading, isFetching, isError, error } = useGetUserNotificationsQuery(queryParams, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });
  const [toggleReadUnread, { isLoading: toggling }] = useReadUnreadNotificationMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const page = getNotificationsPage(data);
  const summary = getSummary(data);
  const rows = page.data || [];
  const totalPages = page.last_page || 1;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleToggle = async (item) => {
    try {
      await toggleReadUnread({
        notificationId: item.id,
        is_seen: !item.is_seen,
        user_id: Number(userId),
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Notification update failed");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(userId).unwrap();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to mark all notifications as read");
    }
  };

  if (!userId) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
        Please login again. User id was not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">Track your order, settlement, and account updates.</p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || Number(summary.unread_count || 0) === 0}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          Mark all as read
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-black text-gray-900">{summary.total_count || 0}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-600">Unread</p>
          <p className="mt-1 text-2xl font-black text-blue-700">{summary.unread_count || 0}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase text-green-600">Read</p>
          <p className="mt-1 text-2xl font-black text-green-700">{summary.read_count || 0}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "read", label: "Read" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search notifications"
              className={`${inputClass} pl-9`}
            />
          </div>
          <input name="type" value={filters.type} onChange={handleFilterChange} placeholder="Type" className={inputClass} />
          <input name="module" value={filters.module} onChange={handleFilterChange} placeholder="Module" className={inputClass} />
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
            Filter
          </button>
        </form>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error?.data?.message || "Failed to load notifications."}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className={`space-y-3 ${isFetching ? "opacity-60" : ""}`}>
          {rows.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No notifications found.</p>
            </div>
          ) : (
            rows.map((item) => (
              <NotificationItem key={item.id} item={item} onToggle={handleToggle} busy={toggling} />
            ))
          )}
        </div>
      )}

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
    </div>
  );
};

export default Notifications;
