import React, { useState, useMemo } from "react";
import {
  Truck,
  Search,
  Users,
  UserCheck,
  UserX,
  Loader2,
  XCircle,
  Filter,
  RotateCcw,
  X,
  SlidersHorizontal,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Hash,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Calendar,
} from "lucide-react";
import {
  useGetDropshippersQuery,
  useUserBanMutation,
  useUserUnbanMutation,
} from "../../../redux/features/user";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";

const formatWhatsAppUrl = (phone) => {
  if (!phone) return null;
  let cleanNumber = String(phone).replace(/[^0-9]/g, "");
  if (!cleanNumber) return null;
  if (cleanNumber.length === 11 && cleanNumber.startsWith("01")) {
    cleanNumber = "88" + cleanNumber;
  } else if (cleanNumber.length === 10 && cleanNumber.startsWith("1")) {
    cleanNumber = "880" + cleanNumber;
  }
  return `https://wa.me/${cleanNumber}`;
};

const AdminDropshippers = () => {
  // Input form filter states (before applying)
  const [searchDraft, setSearchDraft] = useState("");
  const [idDraft, setIdDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [perPageDraft, setPerPageDraft] = useState(20);
  const [isAllDraft, setIsAllDraft] = useState(false);

  // Applied filter state (drives API request)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    id: "",
    name: "",
    email: "",
    mobile: "",
    per_page: 20,
    all: false,
  });

  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [banUserId, setBanUserId] = useState(null);

  // Construct active query parameters
  const queryParams = useMemo(() => {
    const p = {};
    if (appliedFilters.all) {
      p.all = 1;
    } else {
      p.page = page;
      p.per_page = appliedFilters.per_page || 20;
    }

    if (appliedFilters.search?.trim()) {
      p.search = appliedFilters.search.trim();
      p.q = appliedFilters.search.trim();
    }
    if (appliedFilters.id?.trim()) {
      p.id = appliedFilters.id.trim();
    }
    if (appliedFilters.name?.trim()) {
      p.name = appliedFilters.name.trim();
    }
    if (appliedFilters.email?.trim()) {
      p.email = appliedFilters.email.trim();
    }
    if (appliedFilters.mobile?.trim()) {
      p.mobile = appliedFilters.mobile.trim();
      p.phone = appliedFilters.mobile.trim();
    }

    return p;
  }, [appliedFilters, page]);

  // RTK Query: Filtered list
  const { data, isLoading, isFetching, error, refetch } =
    useGetDropshippersQuery(queryParams);

  // Ban / Unban mutations
  const [userBan, { isLoading: isBanLoading }] = useUserBanMutation();
  const [userUnban, { isLoading: isUnbanLoading }] = useUserUnbanMutation();

  // Extract pagination & dropshipper records safely
  const rawData = data?.data;
  const dropshippers = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray(rawData?.data)) return rawData.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data, rawData]);

  const totalCount = rawData?.total ?? dropshippers.length;
  const lastPage = rawData?.last_page ?? 1;
  const currentPage = rawData?.current_page ?? page;
  const perPageActual = rawData?.per_page ?? appliedFilters.per_page ?? 20;
  const fromCount = rawData?.from ?? (dropshippers.length > 0 ? (currentPage - 1) * perPageActual + 1 : 0);
  const toCount = rawData?.to ?? (dropshippers.length > 0 ? fromCount + dropshippers.length - 1 : 0);

  // Summary counts
  const activeCount = useMemo(
    () => dropshippers.filter((d) => !d.banned).length,
    [dropshippers]
  );
  const bannedCount = useMemo(
    () => dropshippers.filter((d) => d.banned).length,
    [dropshippers]
  );

  // Handle Apply Filters
  const handleApplyFilters = (e) => {
    e?.preventDefault?.();
    setPage(1);
    setAppliedFilters({
      search: searchDraft,
      id: idDraft,
      name: nameDraft,
      email: emailDraft,
      mobile: phoneDraft,
      per_page: Number(perPageDraft) || 20,
      all: Boolean(isAllDraft),
    });
  };

  // Handle Quick Search submit
  const handleQuickSearchSubmit = (e) => {
    e?.preventDefault?.();
    setPage(1);
    setAppliedFilters((prev) => ({
      ...prev,
      search: searchDraft,
    }));
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchDraft("");
    setIdDraft("");
    setNameDraft("");
    setEmailDraft("");
    setPhoneDraft("");
    setPerPageDraft(20);
    setIsAllDraft(false);
    setPage(1);
    setAppliedFilters({
      search: "",
      id: "",
      name: "",
      email: "",
      mobile: "",
      per_page: 20,
      all: false,
    });
  };

  // Clear single filter chip
  const handleRemoveFilter = (filterKey) => {
    setPage(1);
    if (filterKey === "search") setSearchDraft("");
    if (filterKey === "id") setIdDraft("");
    if (filterKey === "name") setNameDraft("");
    if (filterKey === "email") setEmailDraft("");
    if (filterKey === "mobile") setPhoneDraft("");
    if (filterKey === "all") setIsAllDraft(false);

    setAppliedFilters((prev) => ({
      ...prev,
      [filterKey]: filterKey === "all" ? false : filterKey === "per_page" ? 20 : "",
    }));
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    appliedFilters.search ||
      appliedFilters.id ||
      appliedFilters.name ||
      appliedFilters.email ||
      appliedFilters.mobile ||
      appliedFilters.all ||
      appliedFilters.per_page !== 20
  );

  // Ban / Unban toggle handler
  const handleToggleBan = async (user) => {
    setBanUserId(user.id);
    try {
      if (user.banned) {
        await userUnban(user.id).unwrap();
        toast.success(`ব্যবহারকারী "${user.name || user.id}" আনব্যান করা হয়েছে`);
      } else {
        await userBan(user.id).unwrap();
        toast.success(`ব্যবহারকারী "${user.name || user.id}" নিষিদ্ধ (ব্যান) করা হয়েছে`);
      }
    } catch (err) {
      console.error("Ban/Unban error:", err);
      const backendError =
        err?.data?.errors?.error ||
        err?.data?.message ||
        err?.message ||
        "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।";
      toast.error(backendError);
    } finally {
      setBanUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            ড্রপশিপার ব্যবস্থাপনা (Dropshipper Management)
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            আইডি, নাম, ইমেইল, বা ফোন নম্বর দিয়ে ড্রপশিপার খুঁজুন ও ফিল্টার করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs md:text-sm font-medium shadow-xs transition disabled:opacity-50"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isFetching ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition shadow-xs ${
              showAdvanced || hasActiveFilters
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showAdvanced ? "ফিল্টার লুকান" : "উন্নত ফিল্টার"}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Search Bar */}
      <form
        onSubmit={handleQuickSearchSubmit}
        className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="সার্চ করুন (নাম, ইমেইল, ফোন নম্বর, আইডি, বা বিজনেস নাম)..."
            className="w-full pl-10 pr-9 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
          />
          {searchDraft && (
            <button
              type="button"
              onClick={() => {
                setSearchDraft("");
                if (appliedFilters.search) {
                  setAppliedFilters((prev) => ({ ...prev, search: "" }));
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>সার্চ</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-1"
              title="সকল ফিল্টার রিসেট"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          )}
        </div>
      </form>

      {/* Advanced Filter Drawer / Card */}
      {showAdvanced && (
        <form
          onSubmit={handleApplyFilters}
          className="bg-slate-50 border border-blue-100 rounded-xl p-5 shadow-xs transition-all space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>নির্দিষ্ট ফিল্টার প্যারামিটার (Query Parameters)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User ID Filter (Exact match) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ইউজার আইডি (ID)
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={idDraft}
                  onChange={(e) => setIdDraft(e.target.value)}
                  placeholder="যেমন: 42"
                  className="w-full pl-8 pr-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">সঠিক ইউজার আইডি দিয়ে খুঁজুন</p>
            </div>

            {/* Name Filter (Partial match) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                নাম (Name)
              </label>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="যেমন: John"
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">নামের অংশ দিয়ে খুঁজুন</p>
            </div>

            {/* Email Filter (Partial match) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ইমেইল (Email)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  placeholder="যেমন: user@gmail.com"
                  className="w-full pl-8 pr-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">ইমেইল অ্যাড্রেস</p>
            </div>

            {/* Phone/Mobile Filter (Partial match) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ফোন / মোবাইল (Phone / Mobile)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  placeholder="যেমন: 01812345678"
                  className="w-full pl-8 pr-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">মোবাইল নম্বরের অংশ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 items-end">
            {/* Per Page Limit */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                প্রতি পেজে সংখ্যা (per_page)
              </label>
              <select
                value={perPageDraft}
                onChange={(e) => setPerPageDraft(Number(e.target.value))}
                disabled={isAllDraft}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value={10}>১০ টি করে</option>
                <option value={20}>২০ টি করে (ডিফল্ট)</option>
                <option value={50}>৫০ টি করে</option>
                <option value={100}>১০০ টি করে</option>
              </select>
            </div>

            {/* All unpaginated toggle */}
            <div className="flex items-center h-10">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllDraft}
                  onChange={(e) => setIsAllDraft(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-xs md:text-sm font-medium text-gray-800">
                  সকল রেকর্ড আনুন (all = 1)
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs md:text-sm font-medium transition"
              >
                রিসেট
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition shadow-xs flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>ফিল্টার প্রয়োগ করুন</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">সক্রিয় ফিল্টার:</span>

          {appliedFilters.search && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              সার্চ: <strong>{appliedFilters.search}</strong>
              <button
                onClick={() => handleRemoveFilter("search")}
                className="hover:text-blue-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {appliedFilters.id && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
              আইডি: <strong>#{appliedFilters.id}</strong>
              <button
                onClick={() => handleRemoveFilter("id")}
                className="hover:text-purple-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {appliedFilters.name && (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
              নাম: <strong>{appliedFilters.name}</strong>
              <button
                onClick={() => handleRemoveFilter("name")}
                className="hover:text-green-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {appliedFilters.email && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
              ইমেইল: <strong>{appliedFilters.email}</strong>
              <button
                onClick={() => handleRemoveFilter("email")}
                className="hover:text-amber-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {appliedFilters.mobile && (
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full">
              ফোন: <strong>{appliedFilters.mobile}</strong>
              <button
                onClick={() => handleRemoveFilter("mobile")}
                className="hover:text-teal-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {appliedFilters.all && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
              সকল রেকর্ড (all=1)
              <button
                onClick={() => handleRemoveFilter("all")}
                className="hover:text-indigo-900 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-red-600 hover:text-red-800 underline font-medium ml-1"
          >
            সব মুছুন
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : totalCount}
            </p>
            <p className="text-xs text-gray-500 font-medium">মোট ড্রপশিপার</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : activeCount}
            </p>
            <p className="text-xs text-gray-500 font-medium">সক্রিয় (বর্তমান পৃষ্ঠায়)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-xs">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : bannedCount}
            </p>
            <p className="text-xs text-gray-500 font-medium">নিষিদ্ধ / নিষ্ক্রিয়</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">ড্রপশিপার তালিকা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm font-semibold">ডেটা লোড করতে সমস্যা হয়েছে।</p>
            <p className="text-gray-400 text-xs mt-1">
              {error?.data?.message || error?.message || "সার্ভারের সাথে যোগাযোগ করা যায়নি"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : dropshippers.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 text-base font-semibold">
              {hasActiveFilters
                ? "প্রদত্ত ফিল্টারে কোনো ড্রপশিপার পাওয়া যায়নি।"
                : "এখনো কোনো ড্রপশিপার নেই।"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {hasActiveFilters
                ? "ফিল্টারের মান পরিবর্তন করে পুনরায় চেষ্টা করুন।"
                : "নতুন ড্রপশিপার রেজিস্টার করলে এখানে দেখা যাবে।"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ফিল্টার রিসেট করুন</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/60">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">আইডি</th>
                  <th className="py-3 px-3">নাম ও বিবরণ</th>
                  <th className="py-3 px-3">যোগাযোগ</th>
                  <th className="py-3 px-3">হোয়াটসঅ্যাপ</th>
                  <th className="py-3 px-3">ঠিকানা</th>
                  <th className="py-3 px-3">ব্যালেন্স</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                  <th className="py-3 px-3">রেজিস্ট্রেশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dropshippers.map((user, i) => {
                  const sl = appliedFilters.all
                    ? i + 1
                    : (currentPage - 1) * perPageActual + i + 1;
                  const isActionLoading =
                    (isBanLoading || isUnbanLoading) && banUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-blue-50/40 transition-colors duration-150"
                    >
                      {/* Serial */}
                      <td className="py-3 px-3 text-gray-500 text-xs font-medium">
                        {sl}
                      </td>

                      {/* User ID Badge */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 font-mono">
                          #{user.id}
                        </span>
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs flex-shrink-0">
                            {user.name ? user.name.slice(0, 2) : "DS"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">
                              {user.name || "অজ্ঞাত নাম"}
                            </p>
                            {user.business_name && (
                              <p className="text-xs text-blue-600 font-medium mt-0.5">
                                {user.business_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="py-3 px-3 text-gray-600">
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <a
                                href={`mailto:${user.email}`}
                                className="hover:text-blue-600 hover:underline"
                              >
                                {user.email}
                              </a>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <a
                                href={`tel:${user.phone}`}
                                className="hover:text-blue-600 font-mono"
                              >
                                {user.phone}
                              </a>
                            </div>
                          )}
                          {!user.email && !user.phone && (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* WhatsApp Direct Chat */}
                      <td className="py-3 px-3">
                        {(() => {
                          const rawPhone = user.phone || user.mobile || user.whatsapp;
                          const waUrl = formatWhatsAppUrl(rawPhone);
                          if (!waUrl) {
                            return <span className="text-gray-400 text-xs">—</span>;
                          }
                          return (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:opacity-90 active:scale-95 whitespace-nowrap"
                              style={{ backgroundColor: "#25D366", color: "#ffffff" }}
                              title={`${rawPhone} নম্বরে হোয়াটসঅ্যাপে চ্যাট করুন`}
                            >
                              <FaWhatsapp size={14} color="#ffffff" style={{ color: "#ffffff", fill: "#ffffff" }} />
                              <span>WhatsApp</span>
                            </a>
                          );
                        })()}
                      </td>

                      {/* Address */}
                      <td className="py-3 px-3 text-gray-600 text-xs max-w-[200px] truncate" title={user.address || ""}>
                        {user.address ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          <span className="text-emerald-700 font-mono">
                            ৳{Number(user.balance || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>

                      {/* Status & Ban Toggle */}
                      <td className="py-3 px-3">
                        <label className="inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!user.banned}
                            disabled={isActionLoading}
                            onChange={() => handleToggleBan(user)}
                          />
                          <div
                            className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:bg-red-500 transition-colors duration-200 relative"
                          >
                            <div
                              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                                user.banned ? "translate-x-5" : ""
                              }`}
                            ></div>
                          </div>
                          <span
                            className={`ml-2 text-xs font-medium ${
                              user.banned ? "text-red-700" : "text-green-700"
                            }`}
                          >
                            {user.banned ? "নিষিদ্ধ" : "সক্রিয়"}
                          </span>
                          {isActionLoading && (
                            <Loader2 className="w-4 h-4 ml-2 text-gray-400 animate-spin" />
                          )}
                        </label>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString("bn-BD", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Status Footer */}
        {!appliedFilters.all && lastPage > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs md:text-sm text-gray-500">
              মোট <strong className="text-gray-800">{totalCount}</strong> জনের মধ্যে{" "}
              <strong>{fromCount}</strong> - <strong>{toCount}</strong> প্রদর্শিত হচ্ছে (পৃষ্ঠা {currentPage} / {lastPage})
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1 || isFetching}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                প্রথম
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isFetching}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী</span>
              </button>

              <span className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                {currentPage}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage || isFetching}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(lastPage)}
                disabled={currentPage === lastPage || isFetching}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
              >
                শেষ
              </button>
            </div>
          </div>
        )}

        {appliedFilters.all && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full font-medium">
              সব রেকর্ড একসাথে প্রদর্শিত হচ্ছে (মোট: {dropshippers.length} জন)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDropshippers;
