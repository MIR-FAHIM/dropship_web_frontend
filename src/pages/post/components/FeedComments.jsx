import React, { useState } from "react";
import { Send, Trash2, CornerDownRight, Loader2, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import {
  useGetFeedPostCommentsQuery,
  useAddFeedPostCommentMutation,
  useDeleteFeedPostCommentMutation,
} from "../../../redux/features/feedPost";
import { useSelector } from "react-redux";
import { useCurrentUser, useCurrentUserId } from "../../../redux/slices/authSlice";

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

const FeedComments = ({ postId }) => {
  const currentUser = useSelector(useCurrentUser);
  const currentUserId = useSelector(useCurrentUserId);

  const { data: apiResponse, isLoading, refetch } = useGetFeedPostCommentsQuery(postId);
  const [addComment, { isLoading: submitting }] = useAddFeedPostCommentMutation();
  const [deleteComment, { isLoading: deleting }] = useDeleteFeedPostCommentMutation();

  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const rawComments = apiResponse?.data || apiResponse;
  const comments = Array.isArray(rawComments) ? rawComments : [];

  const isAdmin = ["admin", "superadmin", "product manager"].includes(
    String(currentUser?.user_type || currentUser?.role || "").toLowerCase()
  );

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        id: postId,
        comment: commentText.trim(),
        user_id: currentUserId,
      }).unwrap();

      setCommentText("");
      toast.success("মন্তব্য যুক্ত হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "মন্তব্য প্রকাশে ব্যর্থ হয়েছে");
    }
  };

  const handlePostReply = async (parentId) => {
    if (!replyText.trim()) return;

    try {
      await addComment({
        id: postId,
        parent_id: parentId,
        comment: replyText.trim(),
        user_id: currentUserId,
      }).unwrap();

      setReplyText("");
      setReplyingToId(null);
      toast.success("উত্তর যুক্ত হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "রিপ্লাই পাঠাতে ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment({ commentId, postId }).unwrap();
      toast.success("মন্তব্য মুছে ফেলা হয়েছে");
    } catch (err) {
      toast.error(err?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="space-y-4 pt-3 border-t border-gray-100">
      {/* Top Comment Input Box */}
      <form onSubmit={handlePostComment} className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </div>

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Write a comment as ${currentUser?.name || "you"}...`}
            className="w-full bg-gray-100 hover:bg-gray-200/80 focus:bg-white text-xs sm:text-sm text-gray-800 rounded-full px-4 py-2 pr-10 border border-transparent focus:border-blue-400 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            className="absolute right-1.5 p-1.5 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            title="Post Comment"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-3 text-xs text-gray-400">
          এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const authorName = comment.user?.name || "Dropshipper";
            const isCommentAdmin = ["admin", "superadmin", "product manager"].includes(
              String(comment.user?.user_type || comment.user?.role || "").toLowerCase()
            );
            const canDelete = isAdmin || Number(comment.user_id) === Number(currentUserId);
            const replies = Array.isArray(comment.replies) ? comment.replies : [];

            return (
              <div key={comment.id} className="space-y-2">
                {/* Parent Comment */}
                <div className="flex items-start gap-2.5 group">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {authorName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="inline-block bg-gray-100/90 rounded-2xl px-3.5 py-2 max-w-[90%]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-900">{authorName}</span>
                        {isCommentAdmin && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                            <ShieldCheck className="w-3 h-3 text-blue-600" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap mt-0.5 leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>

                    {/* Actions under bubble */}
                    <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-gray-500 font-semibold">
                      <span className="text-gray-400 font-normal">{timeAgo(comment.created_at)}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(replyingToId === comment.id ? null : comment.id);
                          setReplyText("");
                        }}
                        className="hover:underline hover:text-blue-600 cursor-pointer"
                      >
                        Reply
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleting}
                          className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="mt-2.5 ml-4 pl-3 border-l-2 border-gray-200 space-y-2">
                        {replies.map((reply) => {
                          const replyAuthor = reply.user?.name || "Dropshipper";
                          const isReplyAdmin = ["admin", "superadmin", "product manager"].includes(
                            String(reply.user?.user_type || reply.user?.role || "").toLowerCase()
                          );
                          const canDeleteReply = isAdmin || Number(reply.user_id) === Number(currentUserId);

                          return (
                            <div key={reply.id} className="flex items-start gap-2 group/reply">
                              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {replyAuthor.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="inline-block bg-gray-100 rounded-2xl px-3 py-1.5 max-w-[90%]">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-gray-900">{replyAuthor}</span>
                                    {isReplyAdmin && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-700">
                                        <ShieldCheck className="w-2.5 h-2.5 text-blue-600" /> Admin
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-800 whitespace-pre-wrap mt-0.5">
                                    {reply.comment}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 px-2 pt-0.5 text-[10px] text-gray-500 font-semibold">
                                  <span className="text-gray-400 font-normal">{timeAgo(reply.created_at)}</span>
                                  {canDeleteReply && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(reply.id)}
                                      className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                                      title="Delete reply"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Reply Box */}
                    {replyingToId === comment.id && (
                      <div className="mt-2.5 ml-4 pl-3 flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handlePostReply(comment.id);
                              }
                            }}
                            placeholder={`Reply to ${authorName}...`}
                            className="w-full bg-gray-100 text-xs text-gray-800 rounded-full px-3.5 py-1.5 pr-8 border border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => handlePostReply(comment.id)}
                            disabled={!replyText.trim() || submitting}
                            className="absolute right-1.5 p-1 rounded-full text-blue-600 hover:bg-blue-50 disabled:opacity-40 cursor-pointer"
                          >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedComments;
