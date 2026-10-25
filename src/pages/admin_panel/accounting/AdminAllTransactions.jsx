import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Wallet,
  Store,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Calendar,
  ArrowLeftRight,
  Receipt,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetAllTransactionsQuery,
  useGetResellerTransactionsQuery,
  useGetTransactionReportQuery,
} from "../../../redux/features/accounting";
import { toast } from "react-toastify";

const PLATFORM_TYPE_LABELS = {
  order_status: "অর্ডার ডেলিভারি / COD",
  reseller_withdraw: "রিসেলার উইথড্র পরিশোধ",
  vendor_settlement: "ভেন্ডর সেটেলমেন্ট প্রদান",
  shipping_charge: "কুরিয়ার ডেলিভারি চার্জ",
  wallet_topup: "ওয়ালেট ব্যালেন্স রিচার্জ (আমানত)",
};

const RESELLER_TYPE_LABELS = {
  order_profit: "অর্ডার প্রফিট",
  order_settlement: "অর্ডার সেটেলমেন্ট প্রফিট",
  order_status: "অর্ডার মার্জিন",
  wallet_topup: "ওয়ালেট রিচার্জ",
  order_advance: "অর্ডার অগ্রিম চার্জ প্রদান",
  advance_refund: "অগ্রিম পেমেন্ট রিফান্ড",
  withdraw: "ব্যালেন্স উত্তোলন (উইথড্র)",
};

const STATUS_CONFIG = {
  completed: {
    label: "সফল (Completed)",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  approved: {
    label: "অনুমোদিত (Approved)",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  pending: {
    label: "অপেক্ষমান (Pending)",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  },
  failed: {
    label: "ব্যর্থ (Failed)",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  },
  rejected: {
    label: "বাতিল (Rejected)",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
  },
};

const AdminAllTransactions = () => {
  // Active Ledger Tab: 'platform' (Company Cashbook) | 'reseller' (Dropshipper Wallets)
  const [activeLedger, setActiveLedger] = useState("platform");

  // Filters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [trxType, setTrxType] = useState("all"); // 'all' | 'credit' | 'debit'
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Copy tracking state
  const [copiedId, setCopiedId] = useState(null);

  // Financial Report Query for Stat Cards
  const { data: reportData, isLoading: reportLoading, refetch: refetchReport } =
    useGetTransactionReportQuery();
  const report = reportData?.data || {};

  // Build Query Params
  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: perPage,
    };
    if (search.trim()) params.search = search.trim();
    if (trxType !== "all") params.trx_type = trxType;
    if (selectedType !== "all") params.type = selectedType;
    if (selectedStatus !== "all") params.status = selectedStatus;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return params;
  }, [page, perPage, search, trxType, selectedType, selectedStatus, startDate, endDate]);

  // Platform Ledger Query
  const {
    data: platformData,
    isLoading: platformLoading,
    isFetching: platformFetching,
    refetch: refetchPlatform,
  } = useGetAllTransactionsQuery(queryParams, {
    skip: activeLedger !== "platform",
  });

  // Reseller Ledger Query
  const {
    data: resellerData,
    isLoading: resellerLoading,
    isFetching: resellerFetching,
    refetch: refetchReseller,
  } = useGetResellerTransactionsQuery(queryParams, {
    skip: activeLedger !== "reseller",
  });

  const isLoading =
    activeLedger === "platform"
      ? platformLoading || platformFetching
      : resellerLoading || resellerFetching;

  // Extract Paginated Data
  const currentResponse =
    activeLedger === "platform" ? platformData?.data : resellerData?.data;
  const pagination = currentResponse?.items || {};
  const transactions = Array.isArray(pagination.data) ? pagination.data : [];

  const totalCredit = Number(currentResponse?.total_credit ?? currentResponse?.credit ?? 0);
  const totalDebit = Number(currentResponse?.total_debit ?? currentResponse?.debit ?? 0);
  const balance = Number(currentResponse?.balance ?? currentResponse?.available_balance ?? (totalCredit - totalDebit));

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setTrxType("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveLedger(tab);
    setSelectedType("all");
    setPage(1);
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.info("ট্রানজেকশন আইডি কপি করা হয়েছে");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (val) =>
    `৳${Number(val || 0).toLocaleString("bn-BD", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("bn-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeLabel = (type) => {
    if (activeLedger === "platform") {
      return PLATFORM_TYPE_LABELS[type] || type || "সাধারন";
    }
    return RESELLER_TYPE_LABELS[type] || type || "সাধারন";
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              সকল লেনদেন (All Transactions)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            প্ল্যাটফর্ম ক্যাশবুক ও ড্রপশিপার ওয়ালেটের সমস্ত আর্থিক জমা-খরচ নিরীক্ষা করুন
          </p>
        </div>

        <button
          onClick={() => {
            refetchReport();
            if (activeLedger === "platform") refetchPlatform();
            else refetchReseller();
            toast.success("তথ্য রিফ্রেশ করা হয়েছে");
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-xs disabled:opacity-60"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Summary Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Inflow / Credit */}
        <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
            <ArrowDownToLine className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
              মোট জমা (Credit)
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-emerald-600 truncate">
            {formatCurrency(report.total_credit || totalCredit)}
          </p>
        </div>

        {/* Total Outflow / Debit */}
        <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-2 text-rose-600 mb-1.5">
            <ArrowUpFromLine className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
              মোট খরচ (Debit)
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-rose-600 truncate">
            {formatCurrency(report.total_debit || totalDebit)}
          </p>
        </div>

        {/* Net Profit / Cashflow */}
        <div className="bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
              নেট ক্যাশফ্লো
            </span>
          </div>
          <p
            className={`text-base sm:text-xl font-bold truncate ${
              (report.profit || 0) >= 0 ? "text-blue-600" : "text-rose-600"
            }`}
          >
            {formatCurrency(report.profit || balance)}
          </p>
        </div>

        {/* Advances in Custody */}
        <div className="bg-indigo-50/50 rounded-xl border border-indigo-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-900">
              কাস্টডিতে অগ্রিম
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-indigo-700 truncate">
            {formatCurrency(report.advances_in_custody || 0)}
          </p>
        </div>

        {/* Reseller Liability */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 mb-1.5">
            <Wallet className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-900">
              রিসেলার ওয়ালেট দায়
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-amber-700 truncate">
            {formatCurrency(
              report.reseller_liability_balance ?? report.reseller_liablity_balance ?? 0
            )}
          </p>
        </div>

        {/* Vendor Liability */}
        <div className="bg-orange-50/50 rounded-xl border border-orange-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center gap-2 text-orange-700 mb-1.5">
            <Store className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-orange-900">
              ভেন্ডর বকেয়া
            </span>
          </div>
          <p className="text-base sm:text-xl font-bold text-orange-700 truncate">
            {formatCurrency(report.vendor_liability_balance || 0)}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Ledger View Tabs */}
        <div className="border-b border-gray-200 bg-gray-50/70 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange("platform")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeLedger === "platform"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>প্ল্যাটফর্ম ক্যাশবুক (Platform Cashbook)</span>
            </button>

            <button
              onClick={() => handleTabChange("reseller")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeLedger === "reseller"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>ড্রপশিপার ওয়ালেট লেনদেন (Reseller Ledger)</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            মোট রেকর্ড: <span className="font-bold text-gray-800">{pagination.total ?? 0}</span> টি
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  activeLedger === "platform"
                    ? "Trx ID, Order #, নোট দিয়ে খুঁজুন..."
                    : "Trx ID, Order #, রিসেলার নাম/ফোন..."
                }
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition"
              />
            </div>

            {/* Trx Direction (Credit / Debit) */}
            <div className="lg:col-span-2">
              <select
                value={trxType}
                onChange={(e) => {
                  setTrxType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white outline-hidden"
              >
                <option value="all">সব দিক (Credit/Debit)</option>
                <option value="credit">ক্রেডিট / জমা (+ Credit)</option>
                <option value="debit">ডেবিট / খরচ (- Debit)</option>
              </select>
            </div>

            {/* Category / Type Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white outline-hidden"
              >
                <option value="all">সব ধরন (All Types)</option>
                {activeLedger === "platform" ? (
                  <>
                    <option value="order_status">অর্ডার ডেলিভারি / COD</option>
                    <option value="reseller_withdraw">রিসেলার উইথড্র পরিশোধ</option>
                    <option value="vendor_settlement">ভেন্ডর সেটেলমেন্ট প্রদান</option>
                    <option value="shipping_charge">কুরিয়ার ডেলিভারি চার্জ</option>
                    <option value="wallet_topup">ওয়ালেট রিচার্জ (আমানত)</option>
                  </>
                ) : (
                  <>
                    <option value="order_profit">অর্ডার প্রফিট</option>
                    <option value="order_settlement">অর্ডার সেটেলমেন্ট প্রফিট</option>
                    <option value="wallet_topup">ওয়ালেট রিচার্জ</option>
                    <option value="order_advance">অর্ডার অগ্রিম চার্জ প্রদান</option>
                    <option value="advance_refund">অগ্রিম রিফান্ড</option>
                    <option value="withdraw">ব্যালেন্স উত্তোলন (উইথড্র)</option>
                  </>
                )}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white outline-hidden"
              >
                <option value="all">সকল স্ট্যাটাস (All Status)</option>
                <option value="completed">সম্পন্ন (Completed)</option>
                <option value="pending">অপেক্ষমান (Pending)</option>
                <option value="failed">ব্যর্থ (Failed)</option>
              </select>
            </div>
          </div>

          {/* Date Range & Reset Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="font-medium flex items-center gap-1 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                তারিখ ফিল্টার:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
              />
              <span className="text-gray-400">থেকে</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Per Page */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>প্রতি পেজে:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs outline-hidden"
                >
                  <option value={10}>১০</option>
                  <option value={20}>২০</option>
                  <option value={50}>৫০</option>
                  <option value={100}>১০০</option>
                </select>
              </div>

              {/* Reset */}
              {(search ||
                trxType !== "all" ||
                selectedType !== "all" ||
                selectedStatus !== "all" ||
                startDate ||
                endDate) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium underline flex items-center gap-1"
                >
                  ফিল্টার রিসেট
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs sm:text-sm text-gray-500">লেনদেন লোড হচ্ছে...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
              কোনো লেনদেন পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              আপনার নির্বাচিত ফিল্টারে কোনো লেনদেনের রেকর্ড মেলেনি। অনুসন্ধান পরিবর্তন করুন বা ফিল্টার রিসেট করুন।
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              সকল ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-gray-600">
                <thead className="bg-gray-50/80 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">তারিখ ও আইডি</th>
                    <th className="py-3 px-4">ধরন / বিবরণ</th>
                    <th className="py-3 px-4">অর্ডার / গ্রাহক</th>
                    {activeLedger === "reseller" && (
                      <th className="py-3 px-4">ড্রপশিপার</th>
                    )}
                    <th className="py-3 px-4">পেমেন্ট সোর্স</th>
                    <th className="py-3 px-4 text-right">পরিমাণ (Amount)</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((trx) => {
                    const isCredit = trx.trx_type === "credit";
                    const statusObj =
                      STATUS_CONFIG[trx.status] || STATUS_CONFIG.completed;

                    return (
                      <tr
                        key={trx.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Date & Trx ID */}
                        <td className="py-3.5 px-4 align-top">
                          <p className="text-xs text-gray-500">
                            {formatDate(trx.created_at)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-gray-800 font-medium">
                            <span className="truncate max-w-[140px]" title={trx.trx_id || `#${trx.id}`}>
                              {trx.trx_id || `ID: #${trx.id}`}
                            </span>
                            {trx.trx_id && (
                              <button
                                onClick={() => handleCopy(trx.trx_id, trx.id)}
                                title="কপি করুন"
                                className="text-gray-400 hover:text-gray-700 transition"
                              >
                                {copiedId === trx.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Type & Note */}
                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium mb-1 ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {getTypeLabel(trx.type)}
                          </span>
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {trx.note || "—"}
                          </p>
                        </td>

                        {/* Order Number / Customer */}
                        <td className="py-3.5 px-4 align-top">
                          {trx.order_id ? (
                            <Link
                              to={`/admin-panel/orders/${trx.order_id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              <span>
                                #{trx.order?.order_number || trx.order_id}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                          {trx.order?.customer_name && (
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[150px]">
                              {trx.order.customer_name}
                            </p>
                          )}
                        </td>

                        {/* Reseller (for Reseller Ledger tab) */}
                        {activeLedger === "reseller" && (
                          <td className="py-3.5 px-4 align-top">
                            {trx.reseller ? (
                              <div>
                                <p className="text-xs font-medium text-gray-800">
                                  {trx.reseller.name}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {trx.reseller.phone || trx.reseller.email || "—"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                #{trx.reseller_id}
                              </span>
                            )}
                          </td>
                        )}

                        {/* Payment Source */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-600 font-medium capitalize">
                            {trx.source || "System"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right align-top">
                          <span
                            className={`font-bold text-sm ${
                              isCredit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatCurrency(trx.amount)}
                          </span>
                          <span className="block text-[10px] text-gray-400 uppercase">
                            {isCredit ? "Credit" : "Debit"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center align-top">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusObj.badge}`}
                          >
                            {statusObj.icon}
                            <span>{statusObj.label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Distinct Bordered Cards for Each Transaction */}
            <div className="md:hidden p-3 space-y-3 bg-gray-50/50">
              {transactions.map((trx) => {
                const isCredit = trx.trx_type === "credit";
                const statusObj =
                  STATUS_CONFIG[trx.status] || STATUS_CONFIG.completed;

                return (
                  <div
                    key={trx.id}
                    className="border border-gray-200 rounded-xl bg-white shadow-xs p-4 space-y-3"
                  >
                    {/* Top Row: Type & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {getTypeLabel(trx.type)}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusObj.badge}`}
                      >
                        {statusObj.icon}
                        <span>{statusObj.label}</span>
                      </span>
                    </div>

                    {/* Middle: Note & Trx ID */}
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">
                        {trx.note || "—"}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                        <span className="font-mono text-gray-600">
                          {trx.trx_id || `ID: #${trx.id}`}
                        </span>
                        {trx.trx_id && (
                          <button
                            onClick={() => handleCopy(trx.trx_id, trx.id)}
                            className="text-gray-400 hover:text-gray-700 p-1"
                          >
                            {copiedId === trx.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Details: Order & Reseller if present */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">
                          অর্ডার:
                        </span>
                        {trx.order_id ? (
                          <Link
                            to={`/admin-panel/orders/${trx.order_id}`}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
                          >
                            <span>
                              #{trx.order?.order_number || trx.order_id}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">
                          সোর্স / মাধ্যম:
                        </span>
                        <span className="font-medium text-gray-700 capitalize">
                          {trx.source || "System"}
                        </span>
                      </div>

                      {activeLedger === "reseller" && trx.reseller && (
                        <div className="col-span-2 pt-1 border-t border-gray-200/50">
                          <span className="text-[10px] text-gray-400 block uppercase">
                            ড্রপশিপার:
                          </span>
                          <span className="font-medium text-gray-800">
                            {trx.reseller.name}
                          </span>
                          <span className="text-gray-400 text-[11px] ml-1.5">
                            ({trx.reseller.phone || "—"})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Date & Amount */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">
                        {formatDate(trx.created_at)}
                      </span>
                      <p
                        className={`text-base font-bold ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(trx.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.total > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  মোট <span className="font-semibold">{pagination.total}</span> টি রেকর্ডের মধ্যে{" "}
                  <span className="font-semibold">{pagination.from || 1}</span> থেকে{" "}
                  <span className="font-semibold">{pagination.to || pagination.total}</span> দেখানো হচ্ছে
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.prev_page_url || page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>পূর্ববর্তী</span>
                  </button>

                  <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-xs">
                    {page} / {pagination.last_page || 1}
                  </span>

                  <button
                    disabled={
                      !pagination.next_page_url ||
                      page >= (pagination.last_page || 1)
                    }
                    onClick={() => setPage((prev) => prev + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
                  >
                    <span>পরবর্তী</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAllTransactions;
