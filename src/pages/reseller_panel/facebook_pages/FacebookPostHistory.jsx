/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CalendarClock, ExternalLink, Heart, Image as ImageIcon, Loader2, MessageCircle, RefreshCw, Share2, XCircle } from "lucide-react";
import {
  useCancelFacebookPostMutation,
  useGetMyFacebookPostsQuery,
  useRefreshFacebookPostStatsMutation,
} from "../../../redux/features/facebookConnect";

/**
 * Facebook পেজ → পোস্ট হিস্টোরি: every post made from Reseller Brain, its likes / comments / shares
 * (fresh from Facebook), a link to the post, and "বাতিল" for a scheduled post that hasn't gone live yet.
 */
const FILTERS = [
  { key: "", label: "সব", count: "all" },
  { key: "published", label: "পোস্ট হয়েছে", count: "published" },
  { key: "scheduled", label: "শিডিউল করা", count: "scheduled" },
  { key: "failed", label: "ব্যর্থ", count: "failed" },
];

const STATUS = {
  published: { label: "পোস্ট হয়েছে", cls: "bg-emerald-100 text-emerald-800" },
  scheduled: { label: "শিডিউল করা", cls: "bg-blue-100 text-blue-800" },
  failed: { label: "ব্যর্থ", cls: "bg-rose-100 text-rose-800" },
  cancelled: { label: "বাতিল", cls: "bg-gray-100 text-gray-700" },
  removed: { label: "Facebook থেকে মুছে ফেলা", cls: "bg-gray-100 text-gray-700" },
};

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

const Stat = ({ icon: Icon, value, label }) => (
  <span className="inline-flex items-center gap-1 text-xs text-gray-700" title={label}>
    <Icon className="h-3.5 w-3.5 text-gray-500" /> <b>{value}</b> <span className="hidden sm:inline">{label}</span>
  </span>
);

function PostRow({ post }) {
  const [cancel, { isLoading }] = useCancelFacebookPostMutation();
  const s = STATUS[post.status] || STATUS.published;

  const onCancel = async () => {
    if (!window.confirm("এই শিডিউল করা পোস্টটি বাতিল করবেন? Facebook-এ এটি আর পোস্ট হবে না।")) return;
    try {
      await cancel(post.id).unwrap();
      toast.success("শিডিউল করা পোস্ট বাতিল হয়েছে");
    } catch (e) {
      toast.error(e?.status === 409 ? "আগে পেজটি আবার কানেক্ট করুন, তারপর বাতিল করুন।" : e?.data?.message || "বাতিল করা যায়নি");
    }
  };

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex gap-3">
        {post.product?.image ? (
          <img src={post.product.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-gray-200" />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gray-100 text-gray-400"><ImageIcon className="h-6 w-6" /></span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
            {post.page && <span className="truncate text-xs font-semibold text-gray-700">{post.page.name}</span>}
          </div>
          {post.product ? (
            <Link to={`/app/productdetails/${post.product.id}`} className="mt-0.5 block truncate text-sm font-semibold text-gray-900 hover:underline">{post.product.name}</Link>
          ) : (
            <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">পোস্ট</p>
          )}
          <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs text-gray-600">{post.caption}</p>
          <p className="mt-1 text-[11px] text-gray-500">
            {post.status === "scheduled" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700"><CalendarClock className="h-3.5 w-3.5" /> পোস্ট হবে: {fmt(post.scheduled_at)}</span>
            ) : (
              <>তৈরি: {fmt(post.published_at || post.created_at)}</>
            )}
            {post.image_count > 0 && <> · {post.image_count}টি ছবি</>}
          </p>
          {post.status === "failed" && post.error && <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 text-[11px] text-rose-800">{post.error}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <div className="flex items-center gap-3">
          {post.status === "published" && (
            <>
              <Stat icon={Heart} value={post.likes} label="লাইক" />
              <Stat icon={MessageCircle} value={post.comments} label="কমেন্ট" />
              <Stat icon={Share2} value={post.shares} label="শেয়ার" />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {post.status === "scheduled" && (
            <button type="button" onClick={onCancel} disabled={isLoading} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} বাতিল করুন
            </button>
          )}
          {post.post_url && post.status === "published" && (
            <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
              Facebook-এ দেখুন <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export default function FacebookPostHistory() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetMyFacebookPostsQuery({ status, page });
  const [refresh, { isLoading: refreshing }] = useRefreshFacebookPostStatsMutation();
  const d = data?.data;
  const posts = d?.posts || [];
  const counts = d?.counts || {};
  const totals = d?.totals || {};

  const doRefresh = async (quiet = false) => {
    try {
      const res = await refresh([]).unwrap();
      if (!quiet) toast.success(`${res?.data?.updated ?? 0}টি পোস্টের হিসাব আপডেট হয়েছে`);
    } catch {
      if (!quiet) toast.error("এখন Facebook থেকে হিসাব আনা যাচ্ছে না");
    }
  };

  // Fresh numbers once when the tab opens (only if there is something to refresh).
  const didAuto = useRef(false);
  useEffect(() => {
    if (!didAuto.current && (counts.published || counts.scheduled)) {
      didAuto.current = true;
      doRefresh(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts.published, counts.scheduled]);

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[[Heart, totals.likes, "মোট লাইক"], [MessageCircle, totals.comments, "মোট কমেন্ট"], [Share2, totals.shares, "মোট শেয়ার"]].map(([Icon, v, l]) => (
          <div key={l} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <Icon className="mx-auto h-4 w-4 text-gray-500" />
            <p className="mt-1 text-lg font-bold text-gray-900">{v ?? 0}</p>
            <p className="text-[11px] text-gray-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => { setStatus(f.key); setPage(1); }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${status === f.key ? "bg-gray-900 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {f.label} {counts[f.count] ? `(${counts[f.count]})` : ""}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => doRefresh(false)} disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> লাইক/কমেন্ট আপডেট
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
          এখনো কোনো পোস্ট নেই। যেকোনো প্রোডাক্টের পেজে গিয়ে নীল &quot;Facebook-এ পোস্ট করুন&quot; বাটনে চাপুন।
        </div>
      ) : (
        <ul className={`space-y-3 ${isFetching ? "opacity-70" : ""}`}>
          {posts.map((p) => <PostRow key={p.id} post={p} />)}
        </ul>
      )}

      {(d?.last_page || 1) > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold disabled:opacity-40">আগের</button>
          <span className="text-gray-600">{d.current_page} / {d.last_page}</span>
          <button type="button" disabled={page >= d.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 font-semibold disabled:opacity-40">পরের</button>
        </div>
      )}
    </section>
  );
}
