import React, { useMemo, useState } from "react";
import { useGetCashflowDashboardQuery } from "../../../redux/features/report";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Truck,
  Store,
  Table2,
  Info,
  Landmark,
} from "lucide-react";

const money = (n) => `৳${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const StatCard = ({ icon, color, label, value, sub }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white mb-3`}>
      {icon}
    </div>
    <p className="text-xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

/* Projected -> Settled -> Paid funnel for one stakeholder */
const FlowStages = ({ title, icon: Icon, color, projected, settledLabel, settled, paid, extra }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm font-bold text-gray-800">{title}</p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center">
        <p className="text-[11px] text-gray-400">প্রজেক্টেড</p>
        <p className="text-base font-bold text-gray-500">{money(projected)}</p>
      </div>
      <div className="text-center border-l border-r border-gray-100">
        <p className="text-[11px] text-amber-500">{settledLabel}</p>
        <p className="text-base font-bold text-amber-600">{money(settled)}</p>
      </div>
      <div className="text-center">
        <p className="text-[11px] text-green-500">পরিশোধিত</p>
        <p className="text-base font-bold text-green-600">{money(paid)}</p>
      </div>
    </div>
    {extra}
  </div>
);

const DailyEarningsChart = ({ daily }) => {
  const [showTable, setShowTable] = useState(false);
  const [hover, setHover] = useState(null);

  const max = useMemo(
    () => Math.max(1, ...daily.map((d) => Math.max(d.platform_earnings, d.reseller_profit_settled))),
    [daily]
  );
  const labelEvery = daily.length > 20 ? 5 : daily.length > 10 ? 3 : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">দিনওয়ারি আয় গ্রোথ</h3>
          <p className="text-xs text-gray-400 mt-0.5">প্ল্যাটফর্ম আয় ও সেটেলড reseller প্রফিট</p>
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
                <th className="py-2 pr-3 font-bold">প্ল্যাটফর্ম আয়</th>
                <th className="py-2 pr-3 font-bold">Reseller প্রফিট সেটেলড</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-b border-gray-50">
                  <td className="py-1.5 pr-3 text-gray-600">{d.date}</td>
                  <td className="py-1.5 pr-3 font-bold text-gray-800">{money(d.platform_earnings)}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{money(d.reseller_profit_settled)}</td>
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
              <p>প্ল্যাটফর্ম আয়: {money(hover.platform_earnings)}</p>
              <p>Reseller প্রফিট: {money(hover.reseller_profit_settled)}</p>
            </div>
          )}
          <div className="flex items-end gap-1 h-40 border-b border-gray-100">
            {daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 min-w-[4px] flex flex-col items-center justify-end h-full group cursor-pointer gap-[2px]"
                onMouseEnter={() => setHover(d)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className="w-full bg-green-400 group-hover:bg-green-500 transition-colors rounded-t-sm"
                  style={{ height: `${(d.platform_earnings / max) * 100}%`, minHeight: d.platform_earnings > 0 ? "2px" : 0 }}
                />
                <div
                  className="w-full bg-indigo-300 group-hover:bg-indigo-400 transition-colors rounded-t-sm"
                  style={{ height: `${(d.reseller_profit_settled / max) * 100}%`, minHeight: d.reseller_profit_settled > 0 ? "2px" : 0 }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1.5">
            {daily.map((d, idx) => (
              <div key={d.date} className="flex-1 min-w-[4px] text-center">
                {idx % labelEvery === 0 && <span className="text-[9px] text-gray-400 font-medium">{d.date.slice(5)}</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" /> প্ল্যাটফর্ম আয়
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 inline-block" /> Reseller প্রফিট সেটেলড
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const GrowthSummaryCard = ({ title, growth }) => {
  if (!growth) return null;
  const up = growth.earnings_growth_percent >= 0;
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-800">{money(growth.current_earnings)}</span>
        <span className={`flex items-center gap-1 text-xs font-bold ${up ? "text-green-600" : "text-red-500"}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(growth.earnings_growth_percent)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5">আগে: {money(growth.previous_earnings)}</p>
      {growth.note && <p className="text-[10px] text-gray-400 mt-1.5">{growth.note}</p>}
    </div>
  );
};

const AdminCashflowReport = () => {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError } = useGetCashflowDashboardQuery({ days });
  const report = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Plan A · অ্যাডমিন ক্যাশফ্লো রিপোর্ট</h1>
            <p className="text-xs text-gray-400">প্ল্যাটফর্মের সম্পূর্ণ ক্যাশ পজিশন — আয়, দায়, এবং পাওনা</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                days === d ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {d} দিন
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl border border-gray-200 h-28 animate-pulse" />
          ))}
        </div>
      ) : isError || !report ? (
        <div className="text-center text-red-500 py-12">ডেটা লোড করতে সমস্যা হয়েছে।</div>
      ) : (
        <>
          {/* Platform earnings */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<ShieldCheck className="w-5 h-5" />} color="bg-green-500" label="আজকের আয়" value={money(report.platform_earnings.today)} />
            <StatCard icon={<ShieldCheck className="w-5 h-5" />} color="bg-teal-500" label="৭ দিনের আয়" value={money(report.platform_earnings.last_7_days)} />
            <StatCard icon={<ShieldCheck className="w-5 h-5" />} color="bg-blue-500" label="এই মাসের আয়" value={money(report.platform_earnings.this_month)} />
            <StatCard
              icon={<ShieldCheck className="w-5 h-5" />}
              color="bg-indigo-500"
              label="মোট আয় (সর্বমোট)"
              value={money(report.platform_earnings.total)}
              sub={`কমিশন ${money(report.platform_earnings.product_commission_total)} + শিপিং ${money(report.platform_earnings.shipping_margin_total)}`}
            />
          </div>

          {/* Liabilities, receivables, cash in hand */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">দায় (Liabilities)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Dropshipper দের পাওনা</span>
                  <span className="font-bold text-amber-600">{money(report.liabilities.owed_to_dropshippers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendor দের পাওনা</span>
                  <span className="font-bold text-amber-600">{money(report.liabilities.owed_to_vendors)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-700 font-semibold">মোট দায়</span>
                  <span className="font-black text-amber-700">{money(report.liabilities.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">পাওনা (Receivables)</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vendor দের থেকে পাওনা</span>
                <span className="font-bold text-sky-600">{money(report.receivables.owed_by_vendors)}</span>
              </div>
              <div className="flex items-start gap-1.5 mt-3 text-[11px] text-gray-400">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>{report.receivables.note}</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="w-5 h-5 text-gray-300" />
                <h3 className="text-sm font-bold">ক্যাশ-ইন-হ্যান্ড (এস্টিমেট)</h3>
              </div>
              <p className="text-2xl font-black">{money(report.cash_in_hand.estimate)}</p>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{report.cash_in_hand.note}</p>
            </div>
          </div>

          {/* Dropshipper / Vendor flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FlowStages
              title="Dropshipper ফ্লো"
              icon={Truck}
              color="bg-teal-50 text-teal-500"
              projected={report.dropshipper_flow.projected}
              settledLabel="সেটেলড (উইথড্র হয়নি)"
              settled={report.dropshipper_flow.settled_unwithdrawn}
              paid={report.dropshipper_flow.paid_out_total}
            />
            <FlowStages
              title="Vendor ফ্লো"
              icon={Store}
              color="bg-orange-50 text-orange-500"
              projected={report.vendor_flow.projected}
              settledLabel="সেটেলড (পরিশোধ হয়নি)"
              settled={report.vendor_flow.settled_unpaid}
              paid={report.vendor_flow.paid_out_total}
              extra={
                report.vendor_flow.receivable_from_vendors > 0 && (
                  <p className="text-[11px] text-sky-600 mt-3 text-center">
                    + {money(report.vendor_flow.receivable_from_vendors)} ভেন্ডরদের থেকে পাওনা (receivable)
                  </p>
                )
              }
            />
          </div>

          {/* Daily chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {report.daily_breakdown.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">গ্রোথ ডেটা পাওয়া যায়নি।</p>
            ) : (
              <>
                <DailyEarningsChart daily={report.daily_breakdown} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <GrowthSummaryCard title="এই সপ্তাহ বনাম আগের সপ্তাহ (আয়)" growth={report.growth.week} />
                  <GrowthSummaryCard title="এই মাস বনাম আগের মাস (আয়)" growth={report.growth.month} />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCashflowReport;
