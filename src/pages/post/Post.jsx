import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Search,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Filter,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { useGetFeedPostsQuery } from "../../redux/features/feedPost";
import FeedPostCard from "./components/FeedPostCard";

const Post = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: apiResponse, isLoading, isFetching, refetch } = useGetFeedPostsQuery({
    page,
    per_page: 20,
    search: activeSearch || undefined,
  });

  const rawPosts = apiResponse?.data || apiResponse;
  const posts = Array.isArray(rawPosts?.data)
    ? rawPosts.data
    : Array.isArray(rawPosts)
    ? rawPosts
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchTerm.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-3 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Facebook Style Header Banner */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <FaFacebook className="text-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Facebook Marketing Feed</h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Live Feed
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  রেডিমেড ফেসবুক মার্কেটিং কনটেন্ট ও ছবি — সরাসরি কপি করে আপনার পেজে পোস্ট করুন!
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {/* Quick Guide Points */}
          <div className="mt-4 pt-3.5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600">✓</span>
              <span>১-ক্লিকে টেক্সট কপি করুন</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600">✓</span>
              <span>হাই-রেজ্যুলেশন ছবি ডাউনলোড</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600">✓</span>
              <span>কমেন্ট ও রিঅ্যাকশন দিন</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-2.5 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="প্রোডাক্ট নাম বা কিওয়ার্ড দিয়ে সার্চ করুন..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 focus:bg-white text-xs sm:text-sm text-gray-800 rounded-lg border border-transparent focus:border-blue-400 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0 shadow-xs"
            >
              Search
            </button>

            {activeSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 rounded-md w-1/3" />
                    <div className="h-2.5 bg-gray-100 rounded-md w-1/5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded-md w-full" />
                  <div className="h-3 bg-gray-200 rounded-md w-4/5" />
                </div>
                <div className="h-64 bg-gray-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-blue-100 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-[#1877F2] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <FaFacebook className="text-3xl" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Facebook Marketing Ready</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {activeSearch
                ? `"${activeSearch}" এর জন্য কোনো কনটেন্ট পাওয়া যায়নি`
                : "শিগগিরই নতুন ফেসবুক মার্কেটিং পোস্ট আসছে!"}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 mt-2.5 max-w-md mx-auto leading-relaxed">
              {activeSearch
                ? "ভিন্ন কোনো প্রোডাক্টের নাম বা কিওয়ার্ড দিয়ে আবার চেষ্টা করুন।"
                : "অ্যাডমিন প্যানেল থেকে প্রোডাক্টের জন্য নতুন ফেসবুক পোস্ট পাবলিশ করা হলে তা সরাসরি এই ফিডে প্রদর্শিত হবে।"}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/app/dashboard")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>পণ্য ব্রাউজ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {activeSearch && (
                <button
                  onClick={handleClearSearch}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                >
                  সব পোস্ট দেখুন
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Feed Post Stream */
          <div className="space-y-5">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
