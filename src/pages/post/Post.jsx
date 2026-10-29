import React, { useState } from "react";
import { useGetPostByTypeQuery } from "../../redux/features/post";
import { imgBaseUrl } from "../../../config";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";

const Post = () => {
  const navigate = useNavigate();
  const { data, error, isLoading, refetch, isFetching } = useGetPostByTypeQuery("New");
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("কনটেন্ট কপি করা হয়েছে! (Copied to clipboard)");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("কপি করতে সমস্যা হয়েছে");
    }
  };

  const posts = Array.isArray(data?.posts)
    ? data.posts
    : Array.isArray(data?.data?.posts)
    ? data.data.posts
    : Array.isArray(data?.data)
    ? data.data
    : [];

  return (
    <div className="min-h-screen bg-gray-50/70 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <FaFacebook className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Facebook Marketing Content</h1>
              <p className="text-xs text-gray-500">ফেসবুক মার্কেটিং কনটেন্ট ও প্রোডাক্ট পোস্ট</p>
            </div>
          </div>
          {posts.length > 0 && (
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-xs transition shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              রিফ্রেশ
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-gray-700">কনটেন্ট লোড হচ্ছে...</p>
            <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন</p>
          </div>
        ) : error || posts.length === 0 ? (
          /* Error or Empty State with the requested Bangla message */
          <div className="bg-white rounded-2xl border border-blue-100 p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
              <FaFacebook className="text-3xl" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coming Soon / শীঘ্রই আসছে</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              আমরা শীঘ্রই আপনাদের জন্য ফেসবুক মার্কেটিং কনটেন্ট যুক্ত করব।
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mt-3 font-medium leading-relaxed">
              যাতে আপনারা সরাসরি কনটেন্ট কপি করে আপনাদের ফেসবুক পেজে পোস্ট করতে পারেন।
            </p>

            <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
              (We will add Facebook marketing content for you soon, so you can directly copy the content and post it to your Facebook page.)
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/app/dashboard")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>পণ্য ব্রাউজ করুন (Browse Products)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>আবার চেষ্টা করুন (Retry)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Posts List */
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Post Author / Product Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => post.product_id && navigate(`/app/productdetails/${post.product_id}`)}
                  >
                    {post.product?.main_image_url ? (
                      <img
                        src={post.product.main_image_url}
                        alt={post.product.product_name || "Product"}
                        className="h-10 w-10 rounded-xl object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        FB
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-gray-800 hover:text-blue-600 transition">
                        {post.product?.product_name || post.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                  {post.product_id && (
                    <button
                      onClick={() => navigate(`/app/productdetails/${post.product_id}`)}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      <span>View Product</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Post Title */}
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-base font-bold text-gray-800">{post.title}</h3>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition shrink-0 cursor-pointer"
                      onClick={() => copyToClipboard(post.title, `title-${post.id}`)}
                    >
                      {copiedKey === `title-${post.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>Copy Title</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed flex-1">
                      {post.post_content}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition shrink-0 cursor-pointer"
                      onClick={() => copyToClipboard(post.post_content, `content-${post.id}`)}
                    >
                      {copiedKey === `content-${post.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                  {post.product?.product_code && (
                    <p className="text-xs text-gray-400 mt-3 font-mono">Product Code: {post.product.product_code}</p>
                  )}
                </div>

                {/* Images */}
                {Array.isArray(post.images) && post.images.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                      {post.images.map((image, index) => {
                        const imgUrl = image.image_url?.startsWith("http")
                          ? image.image_url
                          : `${imgBaseUrl}${image.image_url}`;
                        return (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Post image ${index + 1}`}
                            className="h-32 w-32 object-cover rounded-xl border border-gray-200 shrink-0"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center p-4 bg-gray-50/70 border-t border-gray-100 text-xs">
                  <div className="font-bold text-gray-800">
                    {post.product?.price ? `Price: ৳${post.product.price}` : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.product?.is_verified && (
                      <span className="px-2 py-0.5 text-white bg-blue-600 rounded-full font-bold">
                        Verified
                      </span>
                    )}
                    {post.product?.winning_rate && (
                      <span className="text-gray-500 font-semibold">
                        Winning Rate: {post.product.winning_rate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
