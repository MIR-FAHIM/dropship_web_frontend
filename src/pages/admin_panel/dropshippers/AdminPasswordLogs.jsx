import { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import PasswordLogTable, { PASSWORD_CHANGE_TYPES } from "./PasswordLogTable";

// Report of every password change: self change, admin reset, and forgot-password (OTP) reset.
const AdminPasswordLogs = () => {
  const [changeType, setChangeType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      change_type: changeType === "all" ? undefined : changeType,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [changeType, search, dateFrom, dateTo]
  );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">পাসওয়ার্ড পরিবর্তন লগ</h1>
          <p className="text-xs text-gray-500">Password change log: self change, admin reset and OTP reset</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor="pwlog-search" className="mb-1 block text-xs font-medium text-gray-600">ড্রপশিপার খুঁজুন</label>
          <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-gray-400" />
          <input
            id="pwlog-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="নাম / ফোন / ইমেইল"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label htmlFor="pwlog-type" className="mb-1 block text-xs font-medium text-gray-600">ধরন</label>
          <select
            id="pwlog-type"
            value={changeType}
            onChange={(e) => setChangeType(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">সব ধরন</option>
            {Object.entries(PASSWORD_CHANGE_TYPES).map(([value, type]) => (
              <option key={value} value={value}>{type.label} ({type.legend})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pwlog-from" className="mb-1 block text-xs font-medium text-gray-600">শুরুর তারিখ</label>
          <input id="pwlog-from" type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label htmlFor="pwlog-to" className="mb-1 block text-xs font-medium text-gray-600">শেষ তারিখ</label>
          <input id="pwlog-to" type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        {(changeType !== "all" || searchInput || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => { setChangeType("all"); setSearchInput(""); setDateFrom(""); setDateTo(""); }}
            className="py-2.5 text-xs font-semibold text-red-600 underline hover:text-red-700"
          >
            ফিল্টার রিসেট
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <PasswordLogTable filters={filters} />
      </div>
    </div>
  );
};

export default AdminPasswordLogs;
