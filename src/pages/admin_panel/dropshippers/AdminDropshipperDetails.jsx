import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Headset,
  History,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { useGetUserDetailsQuery } from "../../../redux/features/user";
import { useGetUserBalanceQuery, useListAllOrdersQuery } from "../../../redux/features/order";
import { useGetDropshipperTransactionsQuery } from "../../../redux/features/accounting";
import AdminResetPasswordCard from "./AdminResetPasswordCard";
import PasswordLogTable from "./PasswordLogTable";
import LoginAsDropshipperButton from "./LoginAsDropshipperButton";
import DropshipperSupportTicketsTab from "./DropshipperSupportTicketsTab";

const PAGE_SIZE = 20;

const formatCurrency = (amount) =>
  `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const labelType = (value) =>
  String(value || "transaction").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const AdminDropshipperDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [page, setPage] = useState(1);

  const { data: detailsResponse, isLoading: profileLoading, isError: profileError } =
    useGetUserDetailsQuery(id, { skip: !id });
  const { data: balanceResponse, isLoading: balanceLoading } =
    useGetUserBalanceQuery(id, { skip: !id });
  const { data: transactionsResponse, isLoading: transactionsLoading, isFetching } =
    useGetDropshipperTransactionsQuery(
      {
        dropshipperId: id,
        page,
        per_page: PAGE_SIZE,
      },
      { skip: !id }
    );

  const user = detailsResponse?.data?.data || detailsResponse?.data || detailsResponse?.user || null;
  // Updated account-history endpoint is authoritative for the wallet summary.
  const responseData = transactionsResponse?.data;
  const accountHistory = responseData?.summary
    ? responseData
    : responseData?.data;
  const summary = accountHistory?.summary || {};
  const balancePayload = balanceResponse?.data?.balance;
  const balance = Number(
    summary.net_wallet_balance ??
      (typeof balancePayload === "object" ? balancePayload?.balance : balancePayload) ??
      0
  );
  // API envelope: data.summary, data.transactions.data, and separate request lists.
  const pagination = accountHistory?.transactions || {};
  const transactions = useMemo(() => {
    if (Array.isArray(pagination.data)) return pagination.data;
    return [];
  }, [pagination.data]);
  const withdrawalRequests = Array.isArray(accountHistory?.withdrawal_requests?.data)
    ? accountHistory.withdrawal_requests.data
    : [];
  const topupRequests = Array.isArray(accountHistory?.wallet_topup_requests?.data)
    ? accountHistory.wallet_topup_requests.data
    : [];
  const currentPage = Number(pagination.current_page || page);
  const lastPage = Number(pagination.last_page || 1);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/admin-panel/dropshippers"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          aria-label="ড্রপশিপার তালিকায় ফিরে যান"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-medium text-gray-500">ড্রপশিপার অ্যাকাউন্ট</p>
          <h1 className="text-xl font-bold text-gray-900">{user?.name || `Dropshipper #${id}`}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs font-semibold text-gray-600">
            ID #{id}
          </span>
          <LoginAsDropshipperButton user={user || { id: Number(id) }} size="md" />
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">বর্তমান ব্যালেন্স</p>
              <p className="text-xs text-emerald-700">ড্রপশিপারের ওয়ালেট ব্যালেন্স</p>
            </div>
          </div>
          <p className="text-3xl font-extrabold tracking-tight text-emerald-800">
            {balanceLoading && summary.net_wallet_balance == null ? "লোড হচ্ছে…" : formatCurrency(balance)}
          </p>
        </div>
      </section>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto whitespace-nowrap" aria-label="ড্রপশিপার বিস্তারিত ট্যাব">
          {[
            { key: "profile", label: "Profile", Icon: UserRound },
            { key: "transactions", label: "All Transactions", Icon: ReceiptText },
            { key: "orders", label: "Orders", Icon: ClipboardList },
            { key: "support", label: "Support Tickets", Icon: Headset },
            { key: "password", label: "Password", Icon: KeyRound },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "profile" ? (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">প্রোফাইল তথ্য</h2>
            <p className="mt-1 text-xs text-gray-500">ড্রপশিপারের অ্যাকাউন্ট ও যোগাযোগের তথ্য</p>
          </div>
          {profileLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">প্রোফাইল লোড হচ্ছে…</div>
          ) : profileError || !user ? (
            <div className="p-8 text-center text-sm text-rose-600">প্রোফাইল তথ্য লোড করা যায়নি।</div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <ProfileField icon={UserRound} label="নাম" value={user.name} />
              <ProfileField icon={Mail} label="ইমেইল" value={user.email} />
              <ProfileField icon={Phone} label="ফোন" value={user.phone || user.mobile} />
              <ProfileField icon={MapPin} label="ঠিকানা" value={user.address || user.full_address} />
              <ProfileField icon={CreditCard} label="ব্যবসার নাম" value={user.business_name} />
              <ProfileField icon={CalendarDays} label="নিবন্ধনের তারিখ" value={formatDate(user.created_at)} />
              <ProfileField
                icon={ShieldCheck}
                label="অ্যাকাউন্ট স্ট্যাটাস"
                value={user.banned ? "নিষিদ্ধ" : "সক্রিয়"}
                valueClass={user.banned ? "text-rose-700" : "text-emerald-700"}
              />
            </div>
          )}
        </section>
      ) : activeTab === "transactions" ? (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900">All Transactions</h2>
              <p className="mt-1 text-xs text-gray-500">এই ড্রপশিপারের সব ওয়ালেট লেনদেন</p>
            </div>
            {pagination.total != null && (
              <span className="text-xs text-gray-500">মোট {pagination.total}টি ওয়ালেট এন্ট্রি</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 border-b border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-4">
            <SummaryMetric label="নিট ওয়ালেট ব্যালেন্স" value={summary.net_wallet_balance} color="text-gray-900" />
            <SummaryMetric label="উত্তোলনযোগ্য" value={summary.available_balance} color="text-emerald-700" />
            <SummaryMetric label="সম্পন্ন ক্রেডিট" value={summary.completed_credits} color="text-emerald-700" />
            <SummaryMetric label="সম্পন্ন ডেবিট" value={summary.completed_debits} color="text-rose-700" />
            <SummaryMetric label="উত্তোলনে সংরক্ষিত" value={summary.pending_withdrawal_reserved} color="text-amber-700" />
            <SummaryMetric label="অপেক্ষমাণ ক্রেডিট" value={summary.pending_credits_not_yet_in_balance} color="text-blue-700" />
            <SummaryMetric label="উত্তোলন অনুরোধ" value={summary.withdrawal_request_count} count />
            <SummaryMetric label="টপ-আপ অনুরোধ" value={summary.topup_request_count} count />
          </div>
          {transactionsLoading && !transactions.length ? (
            <div className="p-10 text-center text-sm text-gray-500">লেনদেন লোড হচ্ছে…</div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center">
              <ReceiptText className="mx-auto mb-2 h-9 w-9 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">কোনো ওয়ালেট লেজার এন্ট্রি পাওয়া যায়নি</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                    <tr>
                      <th className="px-4 py-3">তারিখ / Transaction ID</th>
                      <th className="px-4 py-3">ক্যাটাগরি / বিবরণ</th>
                      <th className="px-4 py-3">অর্ডার</th>
                      <th className="px-4 py-3">উৎস</th>
                      <th className="px-4 py-3 text-right">ওয়ালেট প্রভাব</th>
                      <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction) => {
                      const isCredit = transaction.direction === "credit";
                      const balanceEffect = Number(transaction.balance_effect ?? (isCredit ? transaction.amount : -transaction.amount));
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50/70">
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                            <p className="mt-1 max-w-40 truncate font-mono text-xs text-gray-700" title={transaction.transaction_id || ""}>
                              {transaction.transaction_id || `ID: #${transaction.id}`}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${isCredit ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                              {transaction.category_label || labelType(transaction.category)}
                            </span>
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500" title={transaction.note || ""}>{transaction.note || "—"}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">
                            {transaction.order?.order_number || transaction.order_id || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{transaction.source || "System"}</td>
                          <td className={`px-4 py-3 text-right font-bold tabular-nums ${balanceEffect >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {balanceEffect >= 0 ? "+" : "−"}{formatCurrency(Math.abs(balanceEffect))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${transaction.status_affects_balance ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                              {transaction.status || "unknown"}{transaction.status_affects_balance ? " · ব্যালেন্সে গণ্য" : " · ব্যালেন্সে গণ্য নয়"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {lastPage > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                  <span className="text-xs text-gray-500">পৃষ্ঠা {currentPage} / {lastPage}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isFetching}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> আগের
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= lastPage || isFetching}
                      onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
                    >
                      পরের <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid gap-4 border-t border-gray-100 p-4 lg:grid-cols-2">
            <RequestSection
              title="উত্তোলনের অনুরোধ"
              requests={withdrawalRequests}
              emptyText="কোনো উত্তোলন অনুরোধ নেই"
              kind="withdrawal"
            />
            <RequestSection
              title="ওয়ালেট টপ-আপ অনুরোধ"
              requests={topupRequests}
              emptyText="কোনো টপ-আপ অনুরোধ নেই"
              kind="topup"
            />
          </div>
        </section>
      ) : activeTab === "support" ? (
        <DropshipperSupportTicketsTab dropshipperId={id} />
      ) : activeTab === "password" ? (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-bold text-gray-900">পাসওয়ার্ড রিসেট</h2>
              <p className="mt-1 text-xs text-gray-500">এই ড্রপশিপারের জন্য নতুন পাসওয়ার্ড সেট করুন</p>
            </div>
            <AdminResetPasswordCard dropshipper={user || { id: Number(id) }} />
          </section>
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <History className="h-4 w-4 text-gray-500" />
              <div>
                <h2 className="font-bold text-gray-900">পাসওয়ার্ড পরিবর্তনের ইতিহাস</h2>
                <p className="mt-1 text-xs text-gray-500">নিজে পরিবর্তন, অ্যাডমিন রিসেট ও OTP রিসেট</p>
              </div>
              <Link to="/admin-panel/dropshippers/password-logs" className="ml-auto text-xs font-semibold text-blue-700 hover:underline">
                সব লগ দেখুন →
              </Link>
            </div>
            <PasswordLogTable userId={id} />
          </section>
        </div>
      ) : (
        <DropshipperOrdersTab dropshipperId={id} />
      )}
    </div>
  );
};

const SummaryMetric = ({ label, value, color = "text-gray-800", count = false }) => (
  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
    <p className="text-[11px] font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-sm font-bold tabular-nums ${color}`}>
      {value == null ? "—" : count ? Number(value).toLocaleString("en-BD") : formatCurrency(value)}
    </p>
  </div>
);

const RequestSection = ({ title, requests, emptyText, kind }) => (
  <section className="overflow-hidden rounded-xl border border-gray-200">
    <div className="flex items-center justify-between gap-2 bg-gray-50 px-4 py-3">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-gray-200">
        {requests.length}
      </span>
    </div>
    {requests.length === 0 ? (
      <p className="px-4 py-5 text-center text-xs text-gray-400">{emptyText}</p>
    ) : (
      <div className="divide-y divide-gray-100">
        {requests.map((request) => (
          <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800">
                {kind === "withdrawal" ? `অনুরোধ #${request.id}` : `টপ-আপ #${request.id}`}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {request.payment_method || "—"}
                {request.bank_reference ? ` · ${request.bank_reference}` : ""}
                {request.trx_id ? ` · ${request.trx_id}` : ""}
              </p>
              {request.admin_note && <p className="mt-1 text-[11px] text-gray-500">{request.admin_note}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-800">
                {formatCurrency(kind === "withdrawal" ? request.reserved_amount ?? request.amount : request.amount)}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${String(request.status).toLowerCase() === "pending" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                {request.status || "unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const DropshipperOrdersTab = ({ dropshipperId }) => {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isFetching, isError } = useListAllOrdersQuery(
    // Full order history of this dropshipper, cancelled orders included.
    { page, dropshipper_id: dropshipperId, cancelled: "include" },
    { skip: !dropshipperId }
  );

  // Admin orders response: { data: { current_page, data: [...], last_page, ... } }
  const pagination = response?.data || {};
  const orders = Array.isArray(pagination.data) ? pagination.data : [];
  const currentPage = Number(pagination.current_page || page);
  const lastPage = Number(pagination.last_page || 1);

  const statusClass = (status) => {
    const name = String(status?.name || status || "").toLowerCase();
    if (/cancel|return|বাতিল|ফেরত/.test(name)) return "border-red-200 bg-red-50 text-red-700";
    if (/deliver|complete|paid|settle|সম্পন্ন/.test(name)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (/pending|অপেক্ষ/.test(name)) return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-blue-200 bg-blue-50 text-blue-700";
  };

  const orderStatus = (order) => order.status?.name || order.status_name || "Unknown";

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-gray-900">অর্ডার তালিকা</h2>
          <p className="mt-1 text-xs text-gray-500">এই ড্রপশিপারের অর্ডারসমূহ</p>
        </div>
        {pagination.total != null && <span className="text-xs text-gray-500">মোট {pagination.total}টি অর্ডার</span>}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-sm text-gray-500">অর্ডার লোড হচ্ছে…</div>
      ) : isError ? (
        <div className="p-10 text-center text-sm text-rose-600">অর্ডার লোড করা যায়নি।</div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center">
          <ClipboardList className="mx-auto mb-2 h-9 w-9 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-3">অর্ডার</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3">কাস্টমার</th>
                  <th className="px-4 py-3">পণ্য</th>
                  <th className="px-4 py-3">তারিখ</th>
                  <th className="px-4 py-3 text-right">মোট</th>
                  <th className="px-4 py-3 text-center">পেমেন্ট</th>
                  <th className="px-4 py-3 text-center">বিস্তারিত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3">
                      <Link to={`/admin-panel/orders/${order.id}`} className="font-semibold text-blue-700 hover:underline">
                        {order.order_number || `#${order.id}`}
                      </Link>
                      {order.consignment_id && <p className="mt-0.5 font-mono text-[10px] text-gray-400">{order.consignment_id}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(order.status)}`}>
                        {orderStatus(order)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-800">{order.customer_name || "—"}</p>
                      <p className="mt-0.5 text-[11px] text-gray-500">{order.customer_phone || "—"}</p>
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      {order.items?.length ? (
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <p key={item.id} className="truncate text-xs text-gray-700" title={item.product_name}>
                              {item.product_name} <span className="text-gray-400">×{item.qty || 1}</span>
                            </p>
                          ))}
                          {order.items.length > 2 && <p className="text-[10px] text-gray-400">+{order.items.length - 2}টি পণ্য</p>}
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${String(order.payment_status).toLowerCase() === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {order.payment_status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/admin-panel/orders/${order.id}`} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                        <ReceiptText className="h-3.5 w-3.5" /> দেখুন
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 bg-gray-50/60 p-3 md:hidden">
            {orders.map((order) => (
              <article key={order.id} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/admin-panel/orders/${order.id}`} className="text-sm font-bold text-blue-700">{order.order_number || `#${order.id}`}</Link>
                    <p className="mt-1 text-[11px] text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${statusClass(order.status)}`}>{orderStatus(order)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-800">{order.customer_name || "—"}</p>
                    <p className="text-[11px] text-gray-500">{order.customer_phone || "—"}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-bold text-gray-800">{formatCurrency(order.total)}</p>
                </div>
                {order.items?.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-700">
                    {order.items.slice(0, 2).map((item) => <p key={item.id} className="truncate">{item.product_name} ×{item.qty || 1}</p>)}
                    {order.items.length > 2 && <p className="mt-1 text-[10px] text-gray-400">+{order.items.length - 2}টি পণ্য</p>}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${String(order.payment_status).toLowerCase() === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{order.payment_status || "—"}</span>
                  <Link to={`/admin-panel/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><ReceiptText className="h-3.5 w-3.5" /> বিস্তারিত</Link>
                </div>
              </article>
            ))}
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-xs text-gray-500">মোট {pagination.total}টির মধ্যে {pagination.from}–{pagination.to} · পৃষ্ঠা {currentPage}/{lastPage}</span>
              <div className="flex gap-2">
                <button type="button" disabled={currentPage <= 1 || isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-40">আগের</button>
                <button type="button" disabled={currentPage >= lastPage || isFetching} onClick={() => setPage((value) => Math.min(lastPage, value + 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 disabled:opacity-40">পরের</button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

const ProfileField = ({ icon: Icon, label, value, valueClass = "text-gray-900" }) => (
  <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500">
      <Icon className="h-4 w-4 text-gray-400" />
      {label}
    </div>
    <p className={`break-words text-sm font-semibold ${valueClass}`}>{value || "—"}</p>
  </div>
);

export default AdminDropshipperDetails;
