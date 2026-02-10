import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useButtonClickMutation } from "../../redux/features/user";
import {
  FaBoxOpen, FaTrophy, FaRocket, FaBook, FaVideo,
  FaStore, FaChartBar, FaWallet, FaMoneyBillWave, FaHeadset,
} from "react-icons/fa";

const menuItems = [
  { name: "All Products", icon: <FaBoxOpen className="text-blue-600" />, route: "/items/category" },
  { name: "Winning Products", icon: <FaTrophy className="text-green-500" />, route: "/product-assistant" },
  { name: "Boosting Products", icon: <FaRocket className="text-red-500" />, route: "/favproducts" },
  { name: "Sales Guideline", icon: <FaBook className="text-green-600" />, route: "/sale-guide-line" },
  { name: "Learning Video", icon: <FaVideo className="text-purple-600" />, route: "/learning-video" },
  { name: "Ecommerce Website", icon: <FaStore className="text-indigo-600" />, route: "/ecommerce-website" },
  { name: "Sales Dashboard", icon: <FaChartBar className="text-pink-600" />, route: "/saleandprofit" },
  { name: "Balance Statement", icon: <FaWallet className="text-teal-600" />, route: "/payments" },
  { name: "Passive Income", icon: <FaMoneyBillWave className="text-orange-500" />, route: "/passive-income" },
  { name: "Support Center", icon: <FaHeadset className="text-gray-600" />, route: "/users" },
  { name: "General Questions", icon: <FaHeadset className="text-gray-600" />, route: "/faq" },
];

const leaderboardData = [
  { rank: 1, product: "Smart Watch", sales: "1500+" },
  { rank: 2, product: "Wireless Earbuds", sales: "1200+" },
  { rank: 3, product: "Gaming Mouse", sales: "1100+" },
  { rank: 4, product: "Fitness Band", sales: "900+" },
  { rank: 5, product: "Portable Speaker", sales: "850+" },
];

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

        {/* Reseller Tier Journey */}
        <div className="mt-6 p-4 rounded-lg shadow-md bg-gradient-to-r from-green-400 to-gray-300">
          <h3 className="text-xl font-semibold mb-2 text-white">⭐ Reseller Tier Journey</h3>
          <ul className="flex space-x-4 text-sm">
            <li className="text-green-800 bg-green-100 px-3 py-1 rounded-full">✔ Bronze - Completed</li>
            <li className="text-green-800 bg-green-100 px-3 py-1 rounded-full">✔ Silver - Completed</li>
            <li className="text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">🔜 Gold - In Progress</li>
            <li className="text-gray-800 bg-gray-100 px-3 py-1 rounded-full">🔒 Platinum - Locked</li>
          </ul>
        </div>
      </div>

      {/* Right Section - Notice Board, Tips Board, and Leaderboard */}
      <div className="w-full lg:w-1/3 flex flex-col gap-5">
        {/* Notice Board */}
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">📢 {t("Notice Board")}</h3>
          <ul className="text-gray-700 text-sm space-y-2">
            <li>🚀 New product trends released, check the dashboard.</li>
            <li>📌 Sales target deadline extended to next month.</li>
            <li>📢 Exclusive offer for top sellers this week!</li>
          </ul>
        </div>

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