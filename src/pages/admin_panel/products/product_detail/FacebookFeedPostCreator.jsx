import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Loader2,
  CheckCircle2,
  Eye,
  Trash2,
  Check,
  RotateCcw,
  ExternalLink,
  ImageIcon,
  Send,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../../config";
import {
  useCreateFeedPostMutation,
  useGetFeedPostsQuery,
  useDeleteFeedPostMutation,
} from "../../../../redux/features/feedPost";
import FeedImageGrid, { getFullImageUrl } from "../../../post/components/FeedImageGrid";

const FacebookFeedPostCreator = ({ product, productId }) => {
  const { data: postsData, isLoading: fetchingPosts, refetch } = useGetFeedPostsQuery({
    product_id: productId,
  });
  const [createPost, { isLoading: creating }] = useCreateFeedPostMutation();
  const [deletePost, { isLoading: deleting }] = useDeleteFeedPostMutation();

  // Extract all available photos from product
  const extractProductImages = () => {
    const list = [];
    if (product?.primary_image?.file_name) {
      list.push(`${imgBaseUrl}/${product.primary_image.file_name.replace(/^\//, "")}`);
    } else if (product?.thumbnail_img) {
      list.push(`${imgBaseUrl}/${String(product.thumbnail_img).replace(/^\//, "")}`);
    }

    if (Array.isArray(product?.images)) {
      product.images.forEach((imgObj) => {
        const fn = imgObj?.image?.file_name || imgObj?.file_name || imgObj?.image;
        if (fn && typeof fn === "string") {
          const full = `${imgBaseUrl}/${fn.replace(/^\//, "")}`;
          if (!list.includes(full)) list.push(full);
        }
      });
    }

    if (typeof product?.photos === "string" && product.photos.trim()) {
      product.photos.split(",").forEach((p) => {
        const trimmed = p.trim();
        if (trimmed && !trimmed.startsWith("http")) {
          const full = `${imgBaseUrl}/${trimmed.replace(/^\//, "")}`;
          if (!list.includes(full)) list.push(full);
        } else if (trimmed && !list.includes(trimmed)) {
          list.push(trimmed);
        }
      });
    }

    return list;
  };

  const productPhotos = extractProductImages();

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [status, setStatus] = useState("published");
  const [previewMode, setPreviewMode] = useState("compose"); // 'compose' or 'preview'

  // Auto-attach all product photos by default
  useEffect(() => {
    if (productPhotos.length > 0 && selectedPhotos.length === 0) {
      setSelectedPhotos(productPhotos);
    }
  }, [product]);

  // Smart Caption Generator
  const generateSmartCaption = () => {
    if (!product) return;
    const price = product.admin_price || product.unit_price || "বিশেষ মূল্য";
    const name = product.name || "আমাদের হট সেলিং প্রিমিয়াম প্রোডাক্ট";
    const sku = product.sku ? `📦 প্রোডাক্ট কোড: ${product.sku}\n` : "";

    const smartCopy = `🔥 ধামাকা অফার! প্রিমিয়াম কোয়ালিটি ${name} এখন বিশেষ মূল্যে!\n\n` +
      `✅ ১০০% অরিজিনাল ও প্রিমিয়াম ফিনিশিং\n` +
      `⚡ ক্যাশ অন ডেলিভারি সুবিধা (সারা বাংলাদেশে)\n` +
      `🛡️ দ্রুত ডেলিভারি ও সহজ রিটার্ন পলিসি\n\n` +
      `💰 পাইকারি / ড্রপশিপ মূল্য: ৳${price}\n` +
      sku +
      `\n👉 অর্ডার কনফার্ম করতে এখনই ইনবক্সে মেসেজ করুন বা বিস্তারিত জানতে কমেন্ট করুন!\n\n` +
      `#DropShipBD #OnlineShopping #BestDeals #Trending #${(product.name || "").replace(/\s+/g, "_")}`;

    setContent(smartCopy);
    if (!title) {
      setTitle(`🔥 হট সেলিং: ${name}`);
    }
    toast.success("স্মার্ট ফেসবুক ক্যাপশন জেনারেট করা হয়েছে!");
  };

  const togglePhoto = (url) => {
    if (selectedPhotos.includes(url)) {
      setSelectedPhotos(selectedPhotos.filter((u) => u !== url));
    } else {
      setSelectedPhotos([...selectedPhotos, url]);
    }
  };

  const selectAllPhotos = () => setSelectedPhotos(productPhotos);
  const deselectAllPhotos = () => setSelectedPhotos([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("অনুগ্রহ করে ফেসবুক পোস্টের টেক্সট বা ক্যাপশন লিখুন");
      return;
    }

    try {
      await createPost({
        product_id: Number(productId),
        title: title.trim() || undefined,
        content: content.trim(),
        images: selectedPhotos,
        status: status,
      }).unwrap();

      toast.success("পোস্ট সফলভাবে /app/post ফিডে পাবলিশ করা হয়েছে!");
      setTitle("");
      setContent("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "পোস্ট তৈরি করতে ব্যর্থ হয়েছে");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত এই পোস্টটি ডিলিট করতে চান?")) return;
    try {
      await deletePost(id).unwrap();
      toast.success("পোস্ট ডিলিট করা হয়েছে");
      refetch();
    } catch (err) {
      toast.error("ডিলিট করতে ব্যর্থ হয়েছে");
    }
  };

  const postsList = postsData?.data?.data || postsData?.data || postsData || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <FaFacebook className="text-2xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Facebook Feed Post Creator</h2>
            <p className="text-xs text-blue-100 mt-0.5">
              এই প্রোডাক্টের ছবি ও আকর্ষণীয় কনটেন্ট দিয়ে ড্রপশিপারদের জন্য ফেসবুক ফিড পোস্ট তৈরি করুন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generateSmartCaption}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Auto-Generate Caption</span>
        </button>
      </div>

      {/* Main Composer Box */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Composer Tabs */}
        <div className="px-6 py-3.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode("compose")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                previewMode === "compose"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Compose Post
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("preview")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                previewMode === "preview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Feed Preview</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            {selectedPhotos.length} / {productPhotos.length} Photos Attached
          </div>
        </div>

        {previewMode === "compose" ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title / Headline */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Post Headline / Title (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🔥 ধামাকা অফার! প্রিমিয়াম গ্যাজেট কালেকশন..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Textarea with Helper Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Facebook Marketing Text / Caption <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setContent((prev) => prev + `\n💰 ড্রপশিপ মূল্য: ৳${product?.admin_price || product?.unit_price || ""}`)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    + Insert Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => prev + "\n👉 অর্ডার করতে এখনই ইনবক্সে মেসেজ করুন!")}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    + Insert CTA
                  </button>
                </div>
              </div>
              <textarea
                required
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your Facebook marketing copy here with emojis, bullet points, price, and hashtags..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* Auto-Attached Product Images Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Attached Product Images
                  </label>
                  <p className="text-[11px] text-gray-500">
                    এই প্রোডাক্টের সব ছবি স্বয়ংক্রিয়ভাবে যুক্ত হয়েছে। আনচেক করে ছবি বাদ দিতে পারেন।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllPhotos}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={deselectAllPhotos}
                    className="text-xs font-semibold text-gray-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {productPhotos.length === 0 ? (
                <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                  এই প্রোডাক্টে কোনো ছবি পাওয়া যায়নি। প্রোডাক্ট এডিট অপশন থেকে ছবি আপলোড করুন।
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {productPhotos.map((url, idx) => {
                    const isSelected = selectedPhotos.includes(url);
                    return (
                      <div
                        key={idx}
                        onClick={() => togglePhoto(url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition group ${
                          isSelected
                            ? "border-blue-600 ring-2 ring-blue-100 shadow-sm"
                            : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />

                        {/* Selection Checkmark */}
                        <div
                          className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white transition ${
                            isSelected ? "bg-blue-600" : "bg-black/40"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-700">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating || !content.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Feed...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish to /app/post Feed</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Live Feed Simulator Preview */
          <div className="p-6 bg-slate-50 flex justify-center">
            <div className="max-w-xl w-full bg-white rounded-2xl border border-gray-200 shadow-md p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  FB
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">DropShip BD Official</h4>
                  <p className="text-[11px] text-gray-400">Just now • 🌐 Public</p>
                </div>
              </div>

              {title && <h3 className="text-base font-bold text-gray-900">{title}</h3>}
              <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                {content || "No caption entered yet..."}
              </p>

              {selectedPhotos.length > 0 && (
                <FeedImageGrid images={selectedPhotos} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Published Feed Posts for this Product */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">
            Published Feed Posts for this Product ({Array.isArray(postsList) ? postsList.length : 0})
          </h3>
        </div>

        {fetchingPosts ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : !Array.isArray(postsList) || postsList.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-400">
            এই প্রোডাক্টের জন্য এখনও কোনো ফেসবুক ফিড পোস্ট করা হয়নি। ওপরের ফর্মটি পূরণ করে প্রথম পোস্টটি করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postsList.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {p.title || `Feed Post #${p.id}`}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 mb-3 whitespace-pre-wrap">
                    {p.content}
                  </p>

                  {Array.isArray(p.images) && p.images.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
                      {p.images.slice(0, 4).map((img, i) => (
                        <img
                          key={i}
                          src={getFullImageUrl(img)}
                          alt="thumb"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>👍 {p.likes_count || 0} reactions</span>
                    <span>💬 {p.comments_count || 0} comments</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePost(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookFeedPostCreator;
