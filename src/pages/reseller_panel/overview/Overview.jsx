import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useButtonClickMutation } from "../../../redux/features/user";
import { Outlet } from "react-router-dom";
import { useGetResellerNoticesQuery } from "../../../redux/features/notice";
import { formatNoticeDate, formatNoticeLabel, getNoticeList, noticePriorityClass } from "../../../utils/notice.utils";
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

const leaderboardData = [
  { rank: 1, product: "Smart Watch", sales: "1500+" },
  { rank: 2, product: "Wireless Earbuds", sales: "1200+" },
  { rank: 3, product: "Gaming Mouse", sales: "1100+" },
  { rank: 4, product: "Fitness Band", sales: "900+" },
  { rank: 5, product: "Portable Speaker", sales: "850+" },
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
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#BDEAD8] bg-[#E1F5EE] shadow-sm">
      <div className="bg-gradient-to-r from-[#085041] via-[#158E72] to-[#5DCAA5] p-4 text-white sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Reseller Tier Journey</p>
            <h3 className="mt-1 text-xl font-black">Current tier: {currentTier.name}</h3>
            <p className="mt-1 text-sm text-white/80">Complete the next milestones to unlock better benefits.</p>
          </div>
          <div className="w-full rounded-2xl bg-white/15 p-3 sm:w-[170px]">
            <p className="text-xs font-semibold text-white/70">Progress</p>
            <p className="mt-1 text-2xl font-black">{progress}%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-white/75">
            <span>Started</span>
            <span>Next: Platinum</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {tierSteps.map((tier, index) => {
          const isDone = tier.state === "done";
          const isCurrent = tier.state === "current";
          const isLocked = tier.state === "locked";

          return (
            <div
              key={tier.name}
              className={`rounded-xl border p-4 ${
                isCurrent
                  ? "border-[#158E72] bg-[#CDEFE1] shadow-sm"
                  : isDone
                    ? "border-[#BDEAD8] bg-[#DDF4EA]"
                    : "border-gray-200 bg-white/70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    isDone
                      ? "bg-[#158E72] text-white"
                      : isCurrent
                        ? "bg-white text-[#085041]"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isDone ? "OK" : isLocked ? "L" : index + 1}
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                    isDone
                      ? "bg-green-100 text-green-700"
                      : isCurrent
                        ? "bg-white text-[#085041]"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tier.status}
                </span>
              </div>
              <h4 className="mt-4 text-base font-black text-gray-900">{tier.name}</h4>
              <p className="mt-1 text-sm leading-5 text-gray-600">{tier.helper}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

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
        <div className="bg-blue-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">🏆 {t("Product Leaderboard")}</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-gray-800">
                <th className="p-2">Rank</th>
                <th className="p-2">Product</th>
                <th className="p-2">Sales</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((item) => (
                <tr key={item.rank} className="border-b text-gray-700">
                  <td className="p-2">#{item.rank}</td>
                  <td className="p-2">{item.product}</td>
                  <td className="p-2">{item.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
