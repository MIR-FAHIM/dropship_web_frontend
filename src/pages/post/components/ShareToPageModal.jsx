import React, { useState } from "react";
import { X, Send, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { toast } from "sonner";
import {
  useGetFacebookPagesQuery,
  useShareFeedPostToPageMutation,
} from "../../../redux/features/feedPost";
import { useSelector } from "react-redux";
import { useCurrentUserId } from "../../../redux/slices/authSlice";

const ShareToPageModal = ({ post, isOpen, onClose }) => {
  const currentUserId = useSelector(useCurrentUserId);
  const { data: pagesData, isLoading: loadingPages } = useGetFacebookPagesQuery(
    { user_id: currentUserId },
    { skip: !isOpen }
  );
  const [shareToPage, { isLoading: publishing }] = useShareFeedPostToPageMutation();

  const [selectedPageId, setSelectedPageId] = useState("");
  const [customCaption, setCustomCaption] = useState(post?.content || "");

  if (!isOpen || !post) return null;

  const rawPages = pagesData?.data || pagesData;
  const pagesList = Array.isArray(rawPages?.data)
    ? rawPages.data
    : Array.isArray(rawPages)
    ? rawPages
    : [];

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!selectedPageId) {
      toast.error("অনুগ্রহ করে আপনার ফেসবুক পেজ সিলেক্ট করুন");
      return;
    }

    try {
      await shareToPage({
        id: post.id,
        facebook_page_id: Number(selectedPageId),
        custom_caption: customCaption,
      }).unwrap();

      toast.success("আপনার ফেসবুক পেজে সফলভাবে পোস্ট করা হয়েছে!");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "ফেসবুক পেজে পোস্ট করতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FaFacebook className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Share to Your Facebook Page</h3>
              <p className="text-[11px] text-gray-500">স্বয়ংক্রিয়ভাবে আপনার পেজে পোস্ট করুন</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {loadingPages ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin mb-2" />
              <p className="text-xs text-gray-500">আপনার পেজগুলো লোড হচ্ছে...</p>
            </div>
          ) : pagesList.length === 0 ? (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">কোনো ফেসবুক পেজ কানেক্ট করা নেই</h4>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  সরাসরি আপনার পেজে পোস্ট করার জন্য প্রথমে আপনার ফেসবুক পেজটি ড্রপশিপ অ্যাকাউন্টের সাথে যুক্ত করুন।
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    toast.info("ফেসবুক পেজ কানেক্ট ফিচারটি শিগগিরই সক্রিয় হচ্ছে!");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <span>Connect Facebook Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Facebook Page <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a Page --</option>
                  {pagesList.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.page_name} {page.category ? `(${page.category})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Post Caption
                </label>
                <textarea
                  rows={4}
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Caption for your Facebook page post..."
                />
              </div>

              {/* Photos Attachment Note */}
              {Array.isArray(post.images) && post.images.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    এই পোস্টের প্রথম ছবি স্বয়ংক্রিয়ভাবে ফেসবুক পোস্টে যুক্ত হবে।
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing || !selectedPageId}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareToPageModal;
