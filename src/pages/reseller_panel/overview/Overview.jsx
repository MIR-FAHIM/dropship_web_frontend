import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useButtonClickMutation } from "../../../redux/features/user";
import { Outlet } from "react-router-dom";
import { useGetResellerNoticesQuery } from "../../../redux/features/notice";
import { formatNoticeDate, formatNoticeLabel, getNoticeList, noticePriorityClass } from "../../../utils/notice.utils";
import { useGetProductClicksLeaderboardQuery } from "../../../redux/features/report";
import { getLeaderboardDateRange } from "../../../utils/productLeaderboard.utils";
import {
  FaBoxOpen, FaTrophy, FaRocket, FaBook, FaVideo,
  FaStore, FaChartBar, FaWallet, FaMoneyBillWave, FaHeadset,
} from "react-icons/fa";

const menuItems = [
  { name: "All Products", icon: <FaBoxOpen className="text-blue-600" />, route: "/app/all-product-category" },
  { name: "All Store", icon: <FaStore className="text-indigo-600" />, route: "/app/all-store" },
  { name: "Winning Products", icon: <FaTrophy className="text-green-500" />, route: "/app/product-assistant" },
  { name: "Boosting Products", icon: <FaRocket className="text-red-500" />, route: "/app/favproducts" },
  { name: "Sales Guideline", icon: <FaBook className="text-green-600" />, route: "/app/sale-guide-line" },
  { name: "Learning Video", icon: <FaVideo className="text-purple-600" />, route: "/app/learning-video" },
  { name: "Ecommerce Website", icon: <FaStore className="text-indigo-600" />, route: "/app/ecommerce-website" },
  { name: "Sales Dashboard", icon: <FaChartBar className="text-pink-600" />, route: "/app/saleandprofit" },
  { name: "Balance Statement", icon: <FaWallet className="text-teal-600" />, route: "/app/billing" },
  { name: "Passive Income", icon: <FaMoneyBillWave className="text-orange-500" />, route: "/app/passive-income" },
  { name: "Support Center", icon: <FaHeadset className="text-gray-600" />, route: "/app/users" },
  { name: "General Questions", icon: <FaHeadset className="text-gray-600" />, route: "/app/faq" },
];

const tierSteps = [
  {
    name: "Bronze",
    status: "Completed",
    helper: "First sales milestone",
    state: "done",
  },
  {
    name: "Silver",
    status: "Completed",
    helper: "Consistent order flow",
    state: "done",
  },
  {
    name: "Gold",
    status: "In Progress",
    helper: "Grow monthly profit",
    state: "current",
  },
  {
    name: "Platinum",
    status: "Locked",
    helper: "Premium seller rewards",
    state: "locked",
  },
];

const ResellerTierJourney = () => {
  const completedCount = tierSteps.filter((tier) => tier.state === "done").length;
  const currentTier = tierSteps.find((tier) => tier.state === "current") || tierSteps[0];
  const progress = Math.round(((completedCount + 0.45) / tierSteps.length) * 100);

  return (
    <section className="mt-5 rounded-2xl border border-[#BDEAD8] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="reseller-tier-heading">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <p id="reseller-tier-heading" className="text-xs font-bold uppercase tracking-wide text-[#28755f]">Reseller Tier Journey</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-gray-900">Current tier: {currentTier.name}</h3>
            <span className="rounded-full bg-[#CDEFE1] px-2.5 py-1 text-xs font-bold text-[#085041]">{progress}%</span>
          </div>
          <p className="mt-1 text-xs text-gray-600">Complete milestones to unlock better benefits.</p>
        </div>
        <div className="w-full sm:w-52">
          <div className="h-2 overflow-hidden rounded-full bg-[#E1F5EE]" role="progressbar" aria-label="Reseller tier progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[#158E72]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-right text-[11px] font-semibold text-gray-500">Next: Platinum</p>
        </div>
      </div>
      <ol className="mt-3 flex flex-wrap gap-2" aria-label="Reseller tiers">
        {tierSteps.map((tier) => (
          <li key={tier.name} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            tier.state === "current" ? "bg-[#158E72] text-white" : tier.state === "done" ? "bg-[#DDF4EA] text-[#085041]" : "bg-gray-100 text-gray-500"
          }`}>
            {tier.name}
          </li>
        ))}
      </ol>
    </section>
  );
};

const EcommerceFeatureCard = () => (
  <Link
    to="/app/ecommerce-website"
    className="group mt-4 flex items-center gap-4 overflow-hidden rounded-2xl border border-[#BDEAD8] bg-gradient-to-r from-[#E1F5EE] to-[#F1FBF6] p-4 shadow-sm transition hover:border-[#78C7A7] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#158E72] sm:p-5"
  >
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#085041] text-white">
      <FaStore aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-black text-[#085041]">আপনার ব্যবসার জন্য স্বয়ংক্রিয় ই-কমার্স</span>
      <span className="mt-1 block text-sm leading-relaxed text-gray-700">
        আপনার ফেসবুক পেজ বা ব্যবসার জন্য কি একটি স্বয়ংক্রিয় ই-কমার্স ওয়েবসাইট প্রয়োজন? রিসেলারব্রেইনের সব পণ্য, স্টক ও অর্ডার স্বয়ংক্রিয়ভাবে পরিচালিত হবে—সম্পূর্ণ ব্যবসার জন্য প্রস্তুত একটি অনলাইন স্টোর।
      </span>
      <span className="mt-2 inline-flex min-h-10 items-center gap-1 text-sm font-bold text-[#08634F]">
        বিস্তারিত জানতে যোগাযোগ করুন <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </span>
  </Link>
);

const DashboardNoticeWidget = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetResellerNoticesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const notices = getNoticeList(data).slice(0, 3);

  return (
    <div className="rounded-lg border border-[#BDEAD8] bg-[#E1F5EE] p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-[#085041]">📢 {t("Notice Board")}</h3>
        <button
          type="button"
          onClick={() => navigate("/app/notices")}
          className="rounded-full bg-[#CDEFE1] px-3 py-1.5 text-xs font-bold text-[#085041] hover:bg-[#BDEAD8]"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-lg bg-[#CDEFE1]" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-red-700">Failed to load notices.</p>
      ) : notices.length === 0 ? (
        <p className="text-sm text-[#085041]/70">No notices available</p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => {
            const priority = String(notice.priority || "normal").toLowerCase();
            return (
              <div key={notice.id} className="rounded-lg border border-[#BDEAD8] bg-[#DDF4EA] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#085041]">{notice.title || "Untitled notice"}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${noticePriorityClass[priority] || noticePriorityClass.normal}`}>
                    {formatNoticeLabel(priority)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#085041]/70">{notice.message || "-"}</p>
                {notice.published_at && <p className="mt-2 text-[11px] font-semibold text-[#085041]/55">{formatNoticeDate(notice.published_at)}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DashboardLeaderboardWidget = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [period, setPeriod] = useState("week");
  const dateRange = useMemo(() => getLeaderboardDateRange(period), [period]);

  const { data, isLoading, isFetching, isError, refetch } = useGetProductClicksLeaderboardQuery(
    { limit: 5, ...dateRange },
    { refetchOnMountOrArgChange: true }
  );

  const loading = isLoading || isFetching;
  const items = useMemo(() => {
    if (Array.isArray(data?.data?.leaderboard)) {
      return data.data.leaderboard.slice(0, 5);
    }
    return [];
  }, [data]);

  return (
    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-1.5">
          <span>🏆</span> {t("Product Leaderboard")}
        </h3>
        <div className="flex items-center gap-1.5">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs bg-white/80 border border-blue-200 rounded px-2 py-1 text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button
            type="button"
            onClick={() => navigate("/app/product-leaderboard")}
            className="rounded-full bg-blue-200/80 hover:bg-blue-300 px-2.5 py-1 text-xs font-bold text-blue-900 transition cursor-pointer"
            title="View Full Leaderboard"
          >
            View All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-blue-200/60" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-4 text-center text-xs text-red-600">
          <p>Failed to load leaderboard data.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 inline-block px-2.5 py-1 rounded bg-white text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-600">
          <p>No product sales data for this period.</p>
          {period !== "all" && (
            <button
              type="button"
              onClick={() => setPeriod("all")}
              className="mt-2 text-xs font-semibold text-blue-800 underline hover:text-blue-950 cursor-pointer"
            >
              View All Time
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-blue-200 text-gray-800">
                <th className="p-2 w-14">Rank</th>
                <th className="p-2">Product</th>
                <th className="p-2 text-right w-20">Sales</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const rank = item.rank ?? index + 1;
                const productId = item.product_id ?? item.product?.id;
                const productName = item.product?.name || `Product #${productId || index + 1}`;
                const sales = Number(item.total_clicks ?? 0);

                return (
                  <tr
                    key={`${productId || index}-${rank}`}
                    className="border-b border-blue-200/60 text-gray-700 hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="p-2 font-bold text-gray-800 whitespace-nowrap">
                      #{rank}
                    </td>
                    <td className="p-2 max-w-[140px] sm:max-w-[180px]">
                      {productId ? (
                        <Link
                          to={`/app/productdetails/${productId}`}
                          className="font-medium text-gray-800 hover:text-blue-700 hover:underline line-clamp-1"
                          title={productName}
                        >
                          {productName}
                        </Link>
                      ) : (
                        <span className="line-clamp-1">{productName}</span>
                      )}
                    </td>
                    <td className="p-2 text-right font-semibold tabular-nums text-gray-800 whitespace-nowrap">
                      {sales.toLocaleString("en-BD")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Overview = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [trackButtonClick, { isButtonLoading: createLoading, error: createError }] = useButtonClickMutation();
  const handleButtonClick = (buttonName) => {

    trackButtonClick(buttonName)  // Call the mutation and pass the button name
      .unwrap() // Unwrap the response or error
      .then((response) => {
        console.log("Button click tracked:", response);
      })
      .catch((error) => {
        console.error("Error tracking button click:", error);
      });
  };

  const handleNavigate = (route, button) => {
    navigate(route);
    handleButtonClick(button);
  };
  // Mock data for reseller metrics
  const resellerMetrics = {
    totalProducts: 120,
    totalAssets: 350,
    totalVideos: 45,
    profitGeneratedToday: 1250,
  };

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-plex p-5 flex flex-col lg:flex-row gap-5">
      {/* Left Section - Dashboard Menu */}
      <div className="flex-1">
        {/* Confidence-Building Container */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, Reseller! 🚀
          </h2>
          <p className="text-gray-600 mb-6">
            {t("Product Collection")} <span className="text-blue-600 font-bold">{resellerMetrics.totalProducts}</span> , {t("We Have Product Images")}  <span className="text-green-600 font-bold">{resellerMetrics.totalAssets}</span>  {t("And")} {t("We have video")} <span className="text-purple-600 font-bold">{resellerMetrics.totalVideos}</span> </p>


          {/* Search Field */}
          <input
            type="text"
            placeholder="Search by product name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Reseller Metrics */}
          {/* Reseller Metrics Summary */}

        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMenu.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.route, item.name)}
              className="flex items-center justify-center gap-3 p-4 bg-white border border-gray-200 hover:bg-gray-100 transition-all rounded-lg shadow-md text-lg font-semibold"
            >
              {item.icon} {t(item.name)}
            </button>
          ))}
        </div>

        <ResellerTierJourney />
        <EcommerceFeatureCard />
      </div>

      {/* Right Section - Notice Board, Tips Board, and Leaderboard */}
      <div className="w-full lg:w-1/3 flex flex-col gap-5">
        <DashboardNoticeWidget />

        {/* Tips Board */}
        <div className="bg-green-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">💡 {t("Tips Board")}</h3>
          <ul className="text-gray-700 text-sm space-y-2">
            <li>🎯 Focus on seasonal trends for better conversions.</li>
            <li>📦 Optimize product descriptions with SEO keywords.</li>
            <li>📸 High-quality images boost sales by 30%!</li>
          </ul>
        </div>

        {/* Product Leaderboard */}
        <DashboardLeaderboardWidget />
      </div>
    </div>
  );
};

export default Overview;
