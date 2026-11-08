import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Share2,
  Copy,
  Check,
  Download,
  ShoppingBag,
  Globe,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import FeedImageGrid, { getFullImageUrl } from "./FeedImageGrid";
import FeedReactionPicker, { REACTIONS } from "./FeedReactionPicker";
import FeedImageLightbox from "./FeedImageLightbox";
import FeedComments from "./FeedComments";
import ShareToPageModal from "./ShareToPageModal";
import { useReactToFeedPostMutation } from "../../../redux/features/feedPost";
import { useSelector } from "react-redux";
import { useCurrentUserId } from "../../../redux/slices/authSlice";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const past = new Date(dateStr);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return past.toLocaleDateString();
};

const FeedPostCard = ({ post }) => {
  const navigate = useNavigate();
  const currentUserId = useSelector(useCurrentUserId);
  const [reactToPost] = useReactToFeedPostMutation();

  const [expandedContent, setExpandedContent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Optimistic reaction handling
  const [userReaction, setUserReaction] = useState(post.user_reaction || null);
  const [reactionsCount, setReactionsCount] = useState(post.likes_count || 0);

  React.useEffect(() => {
    setUserReaction(post.user_reaction || null);
    setReactionsCount(post.likes_count || 0);
  }, [post.user_reaction, post.likes_count]);

  const handleReaction = async (reactionType) => {
    const prevReaction = userReaction;
    const prevCount = reactionsCount;

    // Optimistic state
    if (prevReaction === reactionType) {
      setUserReaction(null);
      setReactionsCount(Math.max(0, prevCount - 1));
    } else {
      setUserReaction(reactionType);
      if (!prevReaction) setReactionsCount(prevCount + 1);
    }

    try {
      const res = await reactToPost({
        id: post.id,
        type: reactionType,
        user_id: currentUserId,
      }).unwrap();

      if (res?.data) {
        setUserReaction(res.data.user_reaction);
        setReactionsCount(res.data.reactions_count);
      }
    } catch {
      // Revert on failure
      setUserReaction(prevReaction);
      setReactionsCount(prevCount);
      toast.error("Reaction failed");
    }
  };

  const copyPostText = () => {
    navigator.clipboard.writeText(post.content || "");
    setCopiedText(true);
    toast.success("পোস্টের টেক্সট কপি করা হয়েছে!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  const downloadAllImagesAsZip = async () => {
    const images = Array.isArray(post.images) ? post.images : [];
    if (images.length === 0) {
      toast.info("এই পোস্টে কোনো ছবি নেই");
      return;
    }

    setDownloadingZip(true);
    toast.info("ছবিগুলো ডাউনলোড করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...");

    try {
      const zip = new JSZip();
      const folder = zip.folder(`post-${post.id}-assets`);

      const promises = images.map(async (img, idx) => {
        const fullUrl = getFullImageUrl(img);
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        folder.file(`photo-${idx + 1}.jpg`, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `dropship-post-${post.id}-photos.zip`);
      toast.success("সব ছবি জিপ আকারে ডাউনলোড সম্পন্ন হয়েছে!");
    } catch (err) {
      toast.error("জিপ ডাউনলোড ব্যর্থ হয়েছে, একটি একটি করে ডাউনলোড করুন");
      // Fallback: open first image in lightbox
      setLightboxIndex(0);
      setLightboxOpen(true);
    } finally {
      setDownloadingZip(false);
    }
  };

  const authorName = post.admin?.name || "DropShip BD Official";
  const product = post.product;
  const images = Array.isArray(post.images) ? post.images : [];

  // Content formatting: highlight hashtags
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[\w\u0980-\u09FF]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <span key={i} className="text-blue-600 font-semibold hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const isLongContent = (post.content || "").length > 220;
  const displayContent = !expandedContent && isLongContent
    ? post.content.slice(0, 220) + "..."
    : post.content;

  // Reaction breakdown top icons
  const topReactionIcons = ["👍", "❤️", "🤗"];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* 1. Post Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            <FaFacebook className="text-xl" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 hover:text-blue-600 transition truncate">
                {authorName}
              </h3>
              <span className="inline-flex items-center text-blue-600" title="Verified Marketing Source">
                <ShieldCheck className="w-4 h-4 fill-blue-600 text-white" />
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span>{timeAgo(post.created_at)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5" title="Public Community Post">
                <Globe className="w-3 h-3 text-gray-400" /> Public
              </span>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copyPostText}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            title="Copy post content"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Linked Product Pill Banner */}
      {product && (
        <div className="mx-4 sm:mx-5 mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            onClick={() => navigate(`/app/productdetails/${product.id}`)}
          >
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600 shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate hover:text-red-600 transition">
                {product.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                {product.sku && <span>SKU: {product.sku}</span>}
                {(product.admin_price || product.unit_price) && (
                  <span className="font-bold text-red-600">
                    ৳{product.admin_price || product.unit_price}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/app/productdetails/${product.id}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition shrink-0 cursor-pointer"
          >
            <span>View Product</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Post Title & Caption */}
      <div className="px-4 sm:px-5 pb-3">
        {post.title && (
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
            {post.title}
          </h2>
        )}

        <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {renderFormattedContent(displayContent)}
          {isLongContent && (
            <button
              type="button"
              onClick={() => setExpandedContent(!expandedContent)}
              className="text-blue-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              {expandedContent ? "See less" : "See more"}
            </button>
          )}
        </div>
      </div>

      {/* 4. Multi-Image Media Grid */}
      {images.length > 0 && (
        <div className="px-4 sm:px-5 pb-3">
          <FeedImageGrid
            images={images}
            onImageClick={(idx) => {
              setLightboxIndex(idx);
              setLightboxOpen(true);
            }}
          />
        </div>
      )}

      {/* 5. Post Statistics Summary Bar */}
      <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          {reactionsCount > 0 ? (
            <>
              <div className="flex items-center -space-x-1">
                {topReactionIcons.map((emo, i) => (
                  <span key={i} className="text-sm">{emo}</span>
                ))}
              </div>
              <span className="font-semibold text-gray-700">{reactionsCount}</span>
            </>
          ) : (
            <span className="text-gray-400">Be the first to react</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(post.comments_count || 0) > 0 && (
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="hover:underline cursor-pointer"
            >
              {post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}
            </button>
          )}
          {(post.shares_count || 0) > 0 && (
            <span>{post.shares_count} shares</span>
          )}
        </div>
      </div>

      {/* 6. Action Bar */}
      <div className="px-2 sm:px-4 py-1.5 border-t border-b border-gray-100 flex items-center justify-between gap-1">
        {/* Like / Reaction Picker Button */}
        <FeedReactionPicker
          currentReaction={userReaction}
          onSelectReaction={handleReaction}
        />

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer select-none"
        >
          <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Comment</span>
        </button>

        {/* Copy Text Button */}
        <button
          type="button"
          onClick={copyPostText}
          className="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer select-none"
          title="Copy marketing caption"
        >
          {copiedText ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Download Images Button */}
        {images.length > 0 && (
          <button
            type="button"
            onClick={downloadAllImagesAsZip}
            disabled={downloadingZip}
            className="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer select-none disabled:opacity-50"
            title="Download all high-res photos"
          >
            {downloadingZip ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            )}
            <span className="hidden sm:inline">Images</span>
          </button>
        )}

        {/* Share to Page Button */}
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer select-none"
          title="Directly post to your Facebook Page"
        >
          <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* 7. Comments Section (Collapsible) */}
      {showComments && (
        <div className="p-4 sm:p-5 bg-gray-50/50">
          <FeedComments postId={post.id} />
        </div>
      )}

      {/* Lightbox Modal */}
      <FeedImageLightbox
        isOpen={lightboxOpen}
        images={images}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
        onPrev={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />

      {/* Share to Page Modal */}
      <ShareToPageModal
        post={post}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
};

export default FeedPostCard;
