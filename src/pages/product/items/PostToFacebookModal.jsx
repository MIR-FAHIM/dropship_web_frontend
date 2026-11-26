/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, Check, CheckCircle2, ExternalLink, Loader2, Send, X } from "lucide-react";
import { useGetFacebookPostDraftQuery, usePublishProductToFacebookMutation } from "../../../redux/features/facebookConnect";

/**
 * Product page → "Facebook-এ পোস্ট করুন": choose page(s), your price, caption, photos (one post with up to 10),
 * post now or schedule, with a Facebook-style preview. Facebook connect phase 2.
 */
const FB_BLUE = "#1877F2";
const bn = (n) => Number(n || 0).toLocaleString("bn-BD");

const buildCaption = (p, price) => [
  `🔥 ${p?.name || ""}`,
  p?.description ? `\n✅ ${p.description.length > 220 ? `${p.description.slice(0, 220)}…` : p.description}` : "",
  price ? `\n💰 দাম: ৳${bn(price)}` : "",
  "🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি",
  "\n📩 অর্ডার করতে পেজে ইনবক্স করুন অথবা কমেন্টে \"অর্ডার\" লিখুন",
].filter(Boolean).join("\n");

// datetime-local value for now + minutes (local time)
const localInput = (minutes) => {
  const d = new Date(Date.now() + minutes * 60000);
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function Preview({ page, caption, photos }) {
  const shown = photos.slice(0, 4);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {page?.picture_url
          ? <img src={page.picture_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          : <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: FB_BLUE }}>{(page?.name || "P").charAt(0)}</span>}
        <div>
          <p className="text-sm font-semibold text-gray-900">{page?.name || "আপনার পেজ"}</p>
          <p className="text-[11px] text-gray-500">এখন · 🌎</p>
        </div>
      </div>
      <p className="max-h-40 overflow-hidden whitespace-pre-wrap px-3 pb-2 text-[13px] leading-snug text-gray-900">{caption || "…"}</p>
      {shown.length > 0 && (
        <div className={`grid gap-0.5 ${shown.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {shown.map((src, i) => (
            <div key={src} className={`relative bg-gray-100 ${shown.length === 3 && i === 0 ? "col-span-2" : ""}`}>
              <img src={src} alt="" className={`w-full object-cover ${shown.length === 1 ? "max-h-72" : "h-32"}`} />
              {i === 3 && photos.length > 4 && <span className="absolute inset-0 grid place-items-center bg-black/50 text-xl font-bold text-white">+{photos.length - 4}</span>}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-around border-t border-gray-100 py-1.5 text-xs font-semibold text-gray-500"><span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span></div>
    </div>
  );
}

export default function PostToFacebookModal({ productId, onClose }) {
  const { data, isLoading, isError } = useGetFacebookPostDraftQuery(productId);
  const [publish, { isLoading: posting }] = usePublishProductToFacebookMutation();
  const draft = data?.data;
  const pages = useMemo(() => draft?.pages || [], [draft]);
  const images = useMemo(() => draft?.images || [], [draft]);
  const maxPhotos = draft?.limits?.max_photos || 10;
  const minMinutes = draft?.limits?.min_schedule_minutes || 15;

  const [pageIds, setPageIds] = useState([]);
  const [price, setPrice] = useState("");
  const [caption, setCaption] = useState("");
  const [edited, setEdited] = useState(false);
  const [picked, setPicked] = useState([]);
  const [when, setWhen] = useState("now");
  const [scheduleAt, setScheduleAt] = useState(() => localInput(60));
  const [results, setResults] = useState(null);

  // First load: tick connected pages, suggested price, first 4 photos, a ready caption.
  useEffect(() => {
    if (!draft) return;
    setPageIds(pages.filter((p) => p.status === "connected").map((p) => p.id));
    const suggested = draft.product?.suggested_price || "";
    setPrice(suggested);
    setPicked(images.slice(0, 4).map((_, i) => i));
    setCaption(buildCaption(draft.product, suggested));
    setEdited(false);
  }, [draft, pages, images]);

  // Price change updates the caption until the dropshipper edits the text by hand.
  const onPrice = (v) => {
    setPrice(v);
    if (!edited) setCaption(buildCaption(draft?.product, v));
  };

  const togglePage = (id) => setPageIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const togglePhoto = (i) => setPicked((s) => {
    if (s.includes(i)) return s.filter((x) => x !== i);
    if (s.length >= maxPhotos) {
      toast.warning(`সর্বোচ্চ ${bn(maxPhotos)}টি ছবি`);
      return s;
    }
    return [...s, i];
  });

  const submit = async () => {
    if (pageIds.length === 0) return toast.error("অন্তত একটি পেজ বাছাই করুন");
    if (!caption.trim()) return toast.error("ক্যাপশন লিখুন");
    const body = { page_ids: pageIds, caption: caption.trim(), image_indexes: picked };
    if (when === "schedule") body.scheduled_at = new Date(scheduleAt).toISOString();
    try {
      const res = await publish({ productId, body }).unwrap();
      setResults(res?.data?.results || []);
      toast.success(res?.message || "পোস্ট হয়েছে");
    } catch (e) {
      if (e?.data?.data?.results) setResults(e.data.data.results);
      toast.error(e?.data?.message || "পোস্ট করা যায়নি");
    }
    return undefined;
  };

  const previewPage = pages.find((p) => pageIds.includes(p.id)) || pages[0];
  const pickedUrls = picked.map((i) => images[i]).filter(Boolean);

  const body = (() => {
    if (isLoading) return <div className="flex items-center gap-2 p-8 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>;
    if (isError || !draft) return <div className="p-6 text-sm text-rose-700">তথ্য আনা যায়নি। পরে আবার চেষ্টা করুন।</div>;
    if (pages.length === 0) {
      return (
        <div className="space-y-3 p-6 text-center">
          <p className="text-sm text-gray-700">আপনার কোনো Facebook পেজ কানেক্ট করা নেই। আগে পেজ কানেক্ট করুন — মাত্র ১ মিনিট লাগবে।</p>
          <Link to="/app/facebook-pages" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: FB_BLUE }}>
            Facebook পেজ কানেক্ট করুন
          </Link>
        </div>
      );
    }
    if (results) {
      return (
        <div className="space-y-3 p-5">
          {results.map((r) => (
            <div key={r.page_id} className={`flex items-start gap-3 rounded-xl border p-3 ${r.ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              {r.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-gray-900">{r.page_name}</p>
                {r.ok ? (
                  <p className="text-emerald-800">{r.status === "scheduled" ? "নির্ধারিত সময়ে পোস্ট হবে ✓" : "পোস্ট হয়েছে ✓"}
                    {r.post_url && r.status !== "scheduled" && <a href={r.post_url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 font-semibold underline">Facebook-এ দেখুন <ExternalLink className="h-3 w-3" /></a>}
                  </p>
                ) : r.reason === "needs_reconnect" ? (
                  <p className="text-rose-800">পেজটি আবার কানেক্ট করতে হবে। <Link to="/app/facebook-pages" onClick={onClose} className="font-semibold underline">এখানে কানেক্ট করুন</Link></p>
                ) : (
                  <p className="text-rose-800">Facebook পোস্টটি নেয়নি: {r.message}</p>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setResults(null)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">আরেকটি পোস্ট</button>
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: FB_BLUE }}>শেষ</button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
        <div className="space-y-4">
          {/* 1. Pages */}
          <section>
            <p className="mb-1.5 text-xs font-bold text-gray-700">১. কোন পেজে পোস্ট করবেন</p>
            <div className="flex flex-wrap gap-2">
              {pages.map((p) => {
                const ok = p.status === "connected";
                const on = pageIds.includes(p.id);
                return (
                  <button key={p.id} type="button" disabled={!ok} onClick={() => togglePage(p.id)} aria-pressed={on}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${!ok ? "border-amber-200 bg-amber-50 text-amber-800" : on ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-300 bg-white text-gray-700"}`}>
                    {on && <Check className="h-3.5 w-3.5" />}{p.name}{!ok && " · আবার কানেক্ট দরকার"}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Price + caption */}
          <section>
            <label className="text-xs font-bold text-gray-700" htmlFor="fb-price">২. আপনার বিক্রয় মূল্য (৳)</label>
            <input id="fb-price" type="number" min="0" inputMode="numeric" value={price} onChange={(e) => onPrice(e.target.value)}
              className="mt-1 w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <div className="mt-3 flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700" htmlFor="fb-caption">ক্যাপশন</label>
              {edited && <button type="button" onClick={() => { setCaption(buildCaption(draft.product, price)); setEdited(false); }} className="text-[11px] font-semibold text-blue-700 hover:underline">নতুন করে লিখুন</button>}
            </div>
            <textarea id="fb-caption" rows={8} value={caption} maxLength={5000} onChange={(e) => { setCaption(e.target.value); setEdited(true); }}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-snug" />
          </section>

          {/* 3. Photos */}
          <section>
            <p className="mb-1.5 text-xs font-bold text-gray-700">৩. ছবি ({bn(picked.length)}/{bn(Math.min(maxPhotos, images.length))}) — একটি পোস্টে সব ছবি যাবে</p>
            {images.length === 0 ? <p className="text-xs text-gray-500">এই প্রোডাক্টের কোনো ছবি নেই — শুধু লেখা পোস্ট হবে।</p> : (
              <div className="grid grid-cols-5 gap-1.5">
                {images.map((src, i) => {
                  const on = picked.includes(i);
                  return (
                    <button key={src} type="button" onClick={() => togglePhoto(i)} aria-pressed={on}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 ${on ? "border-blue-500" : "border-transparent opacity-60"}`}>
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {on && <span className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{bn(picked.indexOf(i) + 1)}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4. When */}
          <section>
            <p className="mb-1.5 text-xs font-bold text-gray-700">৪. কখন পোস্ট হবে</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-sm"><input type="radio" name="fb-when" checked={when === "now"} onChange={() => setWhen("now")} className="accent-blue-600" /> এখনই</label>
              <label className="inline-flex items-center gap-1.5 text-sm"><input type="radio" name="fb-when" checked={when === "schedule"} onChange={() => setWhen("schedule")} className="accent-blue-600" /> সময় ঠিক করুন</label>
              {when === "schedule" && (
                <input type="datetime-local" value={scheduleAt} min={localInput(minMinutes)} onChange={(e) => setScheduleAt(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
              )}
            </div>
          </section>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-700">প্রিভিউ — পেজে এমন দেখাবে</p>
          <Preview page={previewPage} caption={caption} photos={pickedUrls} />
          <button type="button" onClick={submit} disabled={posting || pageIds.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: FB_BLUE }}>
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : when === "schedule" ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {when === "schedule" ? "পোস্ট শিডিউল করুন" : pageIds.length > 1 ? `${bn(pageIds.length)}টি পেজে পোস্ট করুন` : "এখনই পোস্ট করুন"}
          </button>
        </div>
      </div>
    );
  })();

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Facebook-এ পোস্ট করুন" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-gray-50 shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill={FB_BLUE} aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" /></svg>
            Facebook-এ পোস্ট করুন
          </h2>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {body}
      </div>
    </div>,
    document.body
  );
}
