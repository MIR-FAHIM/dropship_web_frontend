import React, { useState } from "react";
import {
  useGetAllWalletTopupsQuery,
  useApproveWalletTopupMutation,
  useRejectWalletTopupMutation,
} from "../../../redux/features/accounting";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Search,
  Wallet,
  ArrowUpRight,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

const statusColors = {
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const AllWalletTopupReq = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const queryParams = {
    page,
    status: activeTab === "all" ? undefined : activeTab,
    search: searchQuery.trim() || undefined,
  };

  const { data, error, isLoading, isFetching, refetch } =
    useGetAllWalletTopupsQuery(queryParams);

  const [approveTopup, { isLoading: isApproving }] =
    useApproveWalletTopupMutation();
  const [rejectTopup, { isLoading: isRejecting }] =
    useRejectWalletTopupMutation();

  const responseData = data?.data || {};
  const pagination = responseData.items || (Array.isArray(responseData.data) ? responseData : {});
  const items = Array.isArray(pagination.data)
    ? pagination.data
    : Array.isArray(responseData)
    ? responseData
    : [];
  const pendingCount =
    responseData.pending_count ??
    items.filter((i) => i.status === "pending").length;
  const approvedTotal =
    responseData.approved_total ??
    items
      .filter((i) => i.status === "approved")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const formatCurrency = (val) =>
    `৳${Number(val || 0).toLocaleString("bn-BD", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async (item) => {
    if (
      !window.confirm(
        `আপনি কি নিশ্চিত যে ৳${item.amount} (${item.user?.name || "Reseller"}) রিচার্জ অনুমোদন করতে চান?`
      )
    ) {
      return;
    }
    try {
      await approveTopup({ id: item.id, admin_note: "Approved by Admin" }).unwrap();
      toast.success("রিচার্জ সফলভাবে অনুমোদন করা হয়েছে!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "অনুমোদন ব্যর্থ হয়েছে");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("অনুগ্রহ করে বাতিলের কারণ উল্লেখ করুন");
      return;
    }
    try {
      await rejectTopup({
        id: rejectModalItem.id,
        reason: rejectReason.trim(),
      }).unwrap();
      toast.success("রিচার্জ রিকোয়েস্ট বাতিল করা হয়েছে");
      setRejectModalItem(null);
      setRejectReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "বাতিল করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Wallet Top-ups (ব্যালেন্স রিচার্জ রিকোয়েস্ট)
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ড্রপশিপারদের অগ্রিম ওয়ালেট ব্যালেন্স রিচার্জ পর্যালোচনা ও অনুমোদন করুন।
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              যাচাই অপেক্ষমাণ (Pending)
            </p>
            <p className="text-2xl font-black text-amber-900 mt-1">
              {pendingCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              মোট অনুমোদিত রিচার্জ
            </p>
            <p className="text-2xl font-black text-emerald-900 mt-1">
              {formatCurrency(approvedTotal)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
              সর্বমোট রিকোয়েস্ট
            </p>
            <p className="text-2xl font-black text-indigo-900 mt-1">
              {pagination.total || 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "pending", label: `অপেক্ষমাণ (${pendingCount})` },
            { id: "approved", label: "অনুমোদিত (Approved)" },
            { id: "rejected", label: "বাতিল (Rejected)" },
            { id: "all", label: "সকল (All)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Trx ID, নাম বা ফোন..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm space-y-2">
            <p className="font-medium">তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।</p>
            {error?.data?.message && (
              <p className="text-xs text-gray-500 font-mono">
                {error.data.message}
              </p>
            )}
            <button
              onClick={() => refetch()}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">কোনো রিচার্জ রিকোয়েস্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className={`overflow-x-auto ${isFetching ? "opacity-60" : ""}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-500">
                <tr>
                  <th className="py-3 px-4">ড্রপশিপার</th>
                  <th className="py-3 px-4">পরিমাণ</th>
                  <th className="py-3 px-4">মেথড</th>
                  <th className="py-3 px-4">Trx ID ও সেন্ডার</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4">
                      {item.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-xs sm:text-sm">
                              {item.user.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {item.user.phone || item.user.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">User #{item.user_id}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-gray-900 text-sm">
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase bg-gray-100 text-gray-700">
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-gray-800 text-xs bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block">
                        {item.trx_id}
                      </p>
                      {item.sender_phone && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          সেন্ডার: {item.sender_phone}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${
                          statusColors[item.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.status === "pending" ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={isApproving}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectModalItem(item);
                              setRejectReason("");
                            }}
                            disabled={isRejecting}
                            className="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">
                          {item.status === "approved" ? "অনুমোদিত" : "বাতিল"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <p>
              Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0}
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-gray-50 border rounded font-bold">
                {page} / {pagination.last_page}
              </span>
              <button
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setRejectModalItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              রিচার্জ রিকোয়েস্ট বাতিল
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {rejectModalItem.user?.name} এর ৳{rejectModalItem.amount} রিচার্জ বাতিলের কারণ লিখুন:
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="যেমন: Trx ID ভুল অথবা ব্যাংক স্টেটমেন্টে টাকা জমা হয়নি"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-red-500"
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold"
                >
                  ফিরে যান
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                >
                  {isRejecting ? "বাতিল হচ্ছে..." : "বাতিল নিশ্চিত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWalletTopupReq;
