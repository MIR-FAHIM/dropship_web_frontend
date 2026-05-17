import React from "react";
import { BarChart2, MousePointerClick, TrendingUp, Trophy, Package, Loader2 } from "lucide-react";
import {
  useGetProductClicksMonthwiseReportQuery,
  useGetProductClicksLast7DaysReportQuery,
  useGetProductClicksLeaderboardQuery,
} from "../../../redux/features/report";

/* ── helpers ── */
const formatDay = (key) => {
  if (!key) return key;
  try {
    return new Date(key).toLocaleDateString("en-BD", { month: "short", day: "numeric" });
  } catch {
    return key;
  }
};

/* ── Sub-components ── */

const SectionLoader = () => (
  <div className="flex justify-center items-center py-16">
    <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
  </div>
);

const SectionError = ({ message }) => (
  <div className="py-10 text-center text-red-500 text-sm">{message ?? "Failed to load data."}</div>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-2">
    <Icon className="w-10 h-10 text-gray-300" />
    <p className="text-sm text-gray-400">{text}</p>
  </div>
);

/** Generic horizontal or vertical bar chart rendered with divs */
const BarChartBlock = ({ items, labelKey, valueKey, labelFormatter, color = "bg-blue-500" }) => {
  if (!items || items.length === 0) return <EmptyState icon={BarChart2} text="No data available." />;

  const max = Math.max(...items.map((d) => Number(d[valueKey] ?? 0)), 1);

  return (
    <div className="space-y-3 mt-1">
      {items.map((item, idx) => {
        const value = Number(item[valueKey] ?? 0);
        const pct = Math.round((value / max) * 100);
        const label = labelFormatter ? labelFormatter(item[labelKey]) : item[labelKey];
        return (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 shrink-0 text-right">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`${color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-10 text-right">
              {value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Monthwise Chart ── */
const MonthwiseChart = () => {
  const { data, isLoading, isError } = useGetProductClicksMonthwiseReportQuery();

  const year = data?.data?.year;
  const items = React.useMemo(() => {
    const raw = data?.data?.report ?? [];
    return raw.map((d) => ({
      month: d.month_name ?? d.month,
      clicks: Number(d.total_clicks ?? 0),
    }));
  }, [data]);

  const totalClicks = items.reduce((s, d) => s + d.clicks, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          Monthly Clicks {year ? `(${year})` : ""}
        </h3>
        {totalClicks > 0 && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {totalClicks.toLocaleString()} total
          </span>
        )}
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : isError ? (
        <SectionError />
      ) : (
        <BarChartBlock
          items={items}
          labelKey="month"
          valueKey="clicks"
          color="bg-blue-500"
        />
      )}
    </div>
  );
};

/* ── Last 7 Days Chart ── */
const Last7DaysChart = () => {
  const { data, isLoading, isError } = useGetProductClicksLast7DaysReportQuery();

  const apiTotal = data?.data?.total_clicks ?? 0;
  const items = React.useMemo(() => {
    const raw = data?.data?.report ?? [];
    return raw.map((d) => ({
      date: d.date,
      clicks: Number(d.total_clicks ?? 0),
    }));
  }, [data]);

  const totalClicks = apiTotal || items.reduce((s, d) => s + d.clicks, 0);
  const peak = items.length > 0 ? Math.max(...items.map((d) => d.clicks)) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          Last 7 Days Clicks
        </h3>
        {totalClicks > 0 && (
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
            {totalClicks.toLocaleString()} total
          </span>
        )}
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : isError ? (
        <SectionError />
      ) : (
        <>
          <BarChartBlock
            items={items}
            labelKey="date"
            valueKey="clicks"
            labelFormatter={formatDay}
            color="bg-purple-500"
          />
          {items.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-700">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Clicks</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-indigo-700">{peak.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Peak Day</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Leaderboard ── */
const RANK_STYLES = [
  { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },   // 1st
  { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-300" },     // 2nd
  { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-300" },   // 3rd
];

const Leaderboard = () => {
  const { data, isLoading, isError } = useGetProductClicksLeaderboardQuery();

  const limit = data?.data?.limit;
  const items = React.useMemo(() => {
    return data?.data?.leaderboard ?? [];
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-yellow-500" />
        Product Leaderboard
        {limit && <span className="text-xs text-gray-400 font-normal">top {limit}</span>}
        <span className="ml-auto text-xs text-gray-400 font-normal">by clicks</span>
      </h3>

      {isLoading ? (
        <SectionLoader />
      ) : isError ? (
        <SectionError />
      ) : items.length === 0 ? (
        <EmptyState icon={Package} text="No leaderboard data yet." />
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const rank = item.rank ?? idx + 1;
            const name = item.product?.name ?? item.product_name ?? item.name ?? `Product #${item.product_id ?? idx + 1}`;
            const sku = item.product?.sku;
            const clicks = Number(item.total_clicks ?? item.clicks ?? 0);
            const maxClicks = Number(items[0]?.total_clicks ?? items[0]?.clicks ?? 1);
            const pct = Math.round((clicks / maxClicks) * 100);
            const style = RANK_STYLES[idx] ?? { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" };

            return (
              <div
                key={item.product_id ?? item.id ?? idx}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                {/* Rank badge */}
                <div
                  className={`w-8 h-8 rounded-lg border ${style.bg} ${style.border} ${style.text} flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                </div>

                {/* Product icon placeholder */}
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-blue-400" />
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                  {sku && <p className="text-[10px] text-gray-400">{sku}</p>}
                  <div className="mt-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Clicks count */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-800">{clicks.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">clicks</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Summary cards ── */
const SummaryCards = () => {
  const { data: monthData } = useGetProductClicksMonthwiseReportQuery();
  const { data: last7Data } = useGetProductClicksLast7DaysReportQuery();
  const { data: leaderboardData } = useGetProductClicksLeaderboardQuery();

  const monthItems = monthData?.data?.report ?? [];
  const last7Items = last7Data?.data?.report ?? [];
  const topProduct = (leaderboardData?.data?.leaderboard ?? [])[0];

  const totalMonthlyClicks = monthItems.reduce(
    (s, d) => s + Number(d.total_clicks ?? 0), 0
  );
  const last7Total = last7Data?.data?.total_clicks
    ?? last7Items.reduce((s, d) => s + Number(d.total_clicks ?? 0), 0);

  const cards = [
    {
      label: "Total Monthly Clicks",
      value: totalMonthlyClicks.toLocaleString(),
      icon: <BarChart2 className="w-5 h-5" />,
      color: "bg-blue-500",
    },
    {
      label: "Last 7 Days Clicks",
      value: last7Total.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    {
      label: "Top Product",
      value: (() => {
        const n = topProduct?.product?.name ?? topProduct?.product_name ?? "—";
        return n.length > 22 ? n.slice(0, 22) + "…" : n;
      })(),
      icon: <Trophy className="w-5 h-5" />,
      color: "bg-yellow-500",
    },
    {
      label: "Top Product Clicks",
      value: topProduct
        ? Number(topProduct.total_clicks ?? topProduct.clicks ?? 0).toLocaleString()
        : "—",
      icon: <MousePointerClick className="w-5 h-5" />,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
        >
          <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white mb-3`}>
            {card.icon}
          </div>
          <p className="text-xl font-bold text-gray-800 truncate">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

/* ── Page ── */
const ProductClicksReport = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Product Clicks Report</h1>
            <p className="text-gray-300 text-sm mt-0.5">
              Track how often products are clicked across all time periods.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthwiseChart />
        <Last7DaysChart />
      </div>

      {/* Leaderboard */}
      <Leaderboard />
    </div>
  );
};

export default ProductClicksReport;
