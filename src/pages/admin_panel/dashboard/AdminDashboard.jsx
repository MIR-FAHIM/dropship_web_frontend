import React, { useMemo, useState } from "react";
import { useGetAdminDashboardReportQuery } from "../../../redux/features/report";
import { useGetUnacknowledgedPaidOrdersQuery } from "../../../redux/features/delivery_company/carrybeeWebhookApi";
import CarrybeePaidOrderModal from "./CarrybeePaidOrderModal";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Store,
  Users,
  Truck,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Table2,
} from "lucide-react";

const money = (n) => `৳${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/* ── growth badge (used on stat cards + growth summary) ── */
const GrowthBadge = ({ percent }) => {
  if (percent === undefined || percent === null) return null;
  const isUp = percent > 0;
  const isFlat = percent === 0;
  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;
  const color = isFlat ? "text-gray-400" : isUp ? "text-green-600" : "text-red-500";
  return (
    <span className={`flex items-center text-xs font-bold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(percent)}%
    </span>
  );
};

const getStatCards = (data) => [
  {
    label: "মোট বিক্রয়",
    value: money(data?.total_sell),
    change: data?.growth?.month?.sell_growth_percent,
    icon: <DollarSign className="w-6 h-6" />,
    color: "bg-green-500",
  },
  {
    label: "মোট অর্ডার",
    value: `${data?.orders_count ?? 0}`,
    change: data?.growth?.month?.orders_growth_percent,
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    label: "মোট পণ্য",
    value: `${data?.products_count ?? 0}`,
    icon: <Package className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    label: "মোট ভেন্ডর",
    value: `${data?.total_vendor ?? 0}`,
    icon: <Store className="w-6 h-6" />,
    color: "bg-orange-500",
  },
  {
    label: "মোট ড্রপশিপার",
    value: `${data?.total_dropshipper ?? 0}`,
    icon: <Truck className="w-6 h-6" />,
    color: "bg-teal-500",
  },
  {
    label: "মোট কর্মচারী",
    value: `${data?.total_admin ?? 0}`,
    icon: <Users className="w-6 h-6" />,
    color: "bg-indigo-500",
  },
];

/* ── order status breakdown: pick an icon/color by keyword, since the
   actual set of statuses is whatever admin has seeded, not fixed ── */
const STATUS_VISUALS = [
  { test: /cancel|বাতিল/i, icon: XCircle, bg: "bg-red-50", text: "text-red-500" },
  { test: /return|ফেরত/i, icon: RotateCcw, bg: "bg-pink-50", text: "text-pink-500" },
  { test: /deliver|complet|paid|settle|সম্পন্ন/i, icon: CheckCircle2, bg: "bg-green-50", text: "text-green-500" },
  { test: /transit|ship|pick|দিকে|পিক/i, icon: Send, bg: "bg-indigo-50", text: "text-indigo-500" },
  { test: /process|প্রসেসিং/i, icon: ClipboardList, bg: "bg-blue-50", text: "text-blue-500" },
  { test: /pending|পেন্ডিং/i, icon: Clock, bg: "bg-yellow-50", text: "text-yellow-500" },
];
const getStatusVisual = (type, name) => {
  const haystack = `${type || ""} ${name || ""}`;
  return (
    STATUS_VISUALS.find((v) => v.test.test(haystack)) || {
      icon: ClipboardList,
      bg: "bg-gray-50",
      text: "text-gray-500",
    }
  );
};

/* ── simple single-series day-wise bar chart (no charting lib needed) ── */
const DailyGrowthChart = ({ daily }) => {
  const [showTable, setShowTable] = useState(false);
  const [hover, setHover] = useState(null);

  const max = useMemo(
    () => Math.max(1, ...daily.map((d) => d.orders_count_gross ?? d.orders_count ?? 0)),
    [daily]
  );

  const labelEvery = daily.length > 20 ? 5 : daily.length > 10 ? 3 : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">দিনওয়ারি অর্ডার গ্রোথ</h3>
          <p className="text-xs text-gray-400 mt-0.5">প্রতিদিনের নিট অর্ডার সংখ্যা (বাতিল বাদে)</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg px-2.5 py-1.5 transition"
        >
          <Table2 className="w-3.5 h-3.5" />
          {showTable ? "চার্ট দেখুন" : "টেবিল দেখুন"}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-3 font-bold">তারিখ</th>
                <th className="py-2 pr-3 font-bold">নিট অর্ডার</th>
                <th className="py-2 pr-3 font-bold">বাতিল</th>
                <th className="py-2 pr-3 font-bold">বিক্রয়</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-b border-gray-50">
                  <td className="py-1.5 pr-3 text-gray-600">{d.date}</td>
                  <td className="py-1.5 pr-3 font-bold text-gray-800">{d.orders_count}</td>
                  <td className="py-1.5 pr-3 text-red-500">{d.cancelled_count}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{money(d.total_sell)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          {hover && (
            <div className="absolute -top-1 left-0 bg-gray-800 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg z-10 pointer-events-none">
              <p className="font-bold">{hover.date}</p>
              <p>অর্ডার: {hover.orders_count}{hover.cancelled_count > 0 ? ` (+${hover.cancelled_count} বাতিল)` : ""}</p>
              <p>বিক্রয়: {money(hover.total_sell)}</p>
            </div>
          )}
          <div className="flex items-end gap-1 h-40 border-b border-gray-100">
            {daily.map((d) => {
              const gross = d.orders_count_gross ?? d.orders_count ?? 0;
              const netHeight = max > 0 ? (d.orders_count / max) * 100 : 0;
              const cancelledHeight = max > 0 ? (d.cancelled_count / max) * 100 : 0;
              return (
                <div
                  key={d.date}
                  className="flex-1 min-w-[4px] flex flex-col items-center justify-end h-full group cursor-pointer"
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div className="w-full flex flex-col items-center justify-end h-full rounded-t-sm overflow-hidden bg-transparent">
                    {d.cancelled_count > 0 && (
                      <div
                        className="w-full bg-red-200 group-hover:bg-red-300 transition-colors"
                        style={{ height: `${cancelledHeight}%` }}
                      />
                    )}
                    <div
                      className="w-full bg-indigo-400 group-hover:bg-indigo-500 transition-colors rounded-t-sm"
                      style={{ height: `${netHeight}%`, minHeight: gross > 0 ? "2px" : 0 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1.5">
            {daily.map((d, idx) => (
              <div key={d.date} className="flex-1 min-w-[4px] text-center">
                {idx % labelEvery === 0 && (
                  <span className="text-[9px] text-gray-400 font-medium">
                    {d.date.slice(5)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" /> নিট অর্ডার
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" /> বাতিল
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const GrowthSummaryCard = ({ title, growth }) => {
  if (!growth) return null;
  const ordersUp = growth.orders_growth_percent >= 0;
  const sellUp = growth.sell_growth_percent >= 0;
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-gray-400">অর্ডার</p>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-gray-800">{growth.current_orders}</span>
            <span className={`flex items-center text-[11px] font-bold ${ordersUp ? "text-green-600" : "text-red-500"}`}>
              {ordersUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(growth.orders_growth_percent)}%
            </span>
          </div>
          <p className="text-[10px] text-gray-400">আগে: {growth.previous_orders}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">বিক্রয়</p>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-gray-800">{money(growth.current_sell)}</span>
            <span className={`flex items-center text-[11px] font-bold ${sellUp ? "text-green-600" : "text-red-500"}`}>
              {sellUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(growth.sell_growth_percent)}%
            </span>
          </div>
          <p className="text-[10px] text-gray-400">আগে: {money(growth.previous_sell)}</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data, isLoading, isError } = useGetAdminDashboardReportQuery({ days: 30 });
  const { data: paidOrdersData, refetch: refetchPaidOrders } = useGetUnacknowledgedPaidOrdersQuery(undefined, {
    pollingInterval: 30000,
  });
  const unacknowledgedPaidOrders = paidOrdersData?.data || [];
  const report = data?.data;
  const stats = getStatCards(report);
  const statusBreakdown = report?.orders?.status_breakdown || [];
  const dailyBreakdown = report?.daily_breakdown || [];

  return (
    <div className="space-y-6">
      {/* Real-time CarryBee Paid Order Modal */}
      {unacknowledgedPaidOrders.length > 0 && (
        <CarrybeePaidOrderModal
          orders={unacknowledgedPaidOrders}
          onComplete={refetchPaidOrders}
        />
      )}

      {/* Welcome */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold">স্বাগতম, অ্যাডমিন!</h1>
        <p className="mt-1 text-gray-300 text-sm">
          প্ল্যাটফর্মের সকল তথ্য এক নজরে দেখুন এবং পরিচালনা করুন।
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-gray-100 rounded-xl border border-gray-200 p-5 animate-pulse h-32" />
          ))
        ) : isError ? (
          <div className="col-span-6 text-center text-red-500">ডেটা লোড করতে সমস্যা হয়েছে।</div>
        ) : (
          stats.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className={`flex items-center justify-between mb-3`}>
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                  {card.icon}
                </div>
                <GrowthBadge percent={card.change} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Order Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown (real data) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">অর্ডার সারসংক্ষেপ</h3>
            {report?.orders && (
              <span className="text-xs text-gray-400">
                মোট {report.orders.total_gross} টি (নিট {report.orders.total_net}, বাতিল {report.orders.cancelled_count})
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : statusBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">কোনো অর্ডার স্ট্যাটাস পাওয়া যায়নি।</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statusBreakdown.map((s) => {
                const visual = getStatusVisual(s.type, s.name);
                const Icon = visual.icon;
                return (
                  <div key={s.status_id} className={`${visual.bg} rounded-lg p-4 text-center`}>
                    <Icon className={`w-6 h-6 ${visual.text} mx-auto mb-2`} />
                    <p className="text-xl font-bold text-gray-800">{s.count}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={s.name}>{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.percent_of_total}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">দ্রুত কার্যক্রম</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition">
              <Package className="w-4 h-4" />
              নতুন পণ্য যোগ করুন
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition">
              <Store className="w-4 h-4" />
              ভেন্ডর অনুমোদন
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition">
              <ClipboardList className="w-4 h-4" />
              অর্ডার পরিচালনা
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition">
              <DollarSign className="w-4 h-4" />
              পেমেন্ট রিপোর্ট
            </button>
          </div>
        </div>
      </div>

      {/* Day-wise Order Growth */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ) : dailyBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">গ্রোথ ডেটা পাওয়া যায়নি।</p>
        ) : (
          <>
            <DailyGrowthChart daily={dailyBreakdown} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <GrowthSummaryCard title="এই সপ্তাহ বনাম আগের সপ্তাহ" growth={report?.growth?.week} />
              <GrowthSummaryCard title="এই মাস বনাম আগের মাস (সমান দিন)" growth={report?.growth?.month} />
            </div>
          </>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">সাম্প্রতিক অর্ডার</h3>
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">এখনো কোনো অর্ডার পাওয়া যায়নি।</p>
        </div>
      </div>

      {/* Recent Vendors Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">সাম্প্রতিক ভেন্ডর রেজিস্ট্রেশন</h3>
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">এখনো কোনো ভেন্ডর রেজিস্টার করেননি।</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
