/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2, Lock, RefreshCw, ShieldCheck, Trash2, Unplug } from "lucide-react";
import {
  useCheckFacebookPageMutation,
  useChooseFacebookPagesMutation,
  useDisconnectFacebookPageMutation,
  useGetMyFacebookPagesQuery,
  useGetPendingFacebookPagesQuery,
  useStartFacebookConnectMutation,
} from "../../../redux/features/facebookConnect";
import FacebookPostHistory from "./FacebookPostHistory";

/**
 * Dropshipper panel → Facebook পেজ: connect a page with one click (Facebook login), choose pages,
 * see status, check, reconnect or disconnect. Tokens stay on the server; this page never sees them.
 */
const FB_BLUE = "#1877F2";

const FbIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);

const ERRORS = {
  cancelled: "আপনি Facebook-এ অনুমতি দেননি। আবার চেষ্টা করতে নিচের বাটনে চাপুন।",
  expired: "কানেকশনের সময় শেষ হয়ে গেছে। আবার \"Facebook দিয়ে কানেক্ট করুন\" চাপুন।",
  no_pages: "আপনার Facebook অ্যাকাউন্টে কোনো পেজ পাওয়া যায়নি। আগে Facebook-এ একটি পেজ খুলুন, অথবা লগইনের সময় পেজটি বাছাই করুন।",
  failed: "Facebook-এর সাথে কানেক্ট করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
};

const Avatar = ({ src, name, size = "h-12 w-12" }) => {
  const [broken, setBroken] = useState(false);
  return src && !broken ? (
    <img src={src} alt="" onError={() => setBroken(true)} className={`${size} shrink-0 rounded-full object-cover ring-1 ring-gray-200`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-full text-lg font-bold text-white`} style={{ backgroundColor: FB_BLUE }}>
      {(name || "F").charAt(0).toUpperCase()}
    </span>
  );
};

/** Step 2 after Facebook login: choose which pages to connect. */
function PagePicker({ connectKey, onDone }) {
  const { data, isLoading, isError, error } = useGetPendingFacebookPagesQuery(connectKey);
  const [choose, { isLoading: saving }] = useChooseFacebookPagesMutation();
  const pages = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    // Pages you can post on are ticked by default.
    setPicked(pages.filter((p) => p.can_post).map((p) => p.page_id));
  }, [pages]);

  const toggle = (id) => setPicked((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = async () => {
    try {
      const res = await choose({ key: connectKey, pageIds: picked }).unwrap();
      toast.success(res?.message || "পেজ কানেক্ট হয়েছে");
      onDone();
    } catch (e) {
      toast.error(e?.data?.message || "পেজ কানেক্ট করা যায়নি");
    }
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> আপনার পেজগুলো আনা হচ্ছে…</div>;
  }
  if (isError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        {/* 410 = link expired / not yours (our own message); anything else gets a plain friendly text. */}
        {error?.status === 410 ? ERRORS.expired : ERRORS.failed}
        <button type="button" onClick={onDone} className="ml-2 font-semibold underline">ঠিক আছে</button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border-2 bg-white p-5 shadow-sm" style={{ borderColor: FB_BLUE }}>
      <h2 className="text-base font-bold text-gray-900">ধাপ ২: কোন পেজ কানেক্ট করবেন?</h2>
      <p className="mt-0.5 text-xs text-gray-600">যে পেজে প্রোডাক্ট পোস্ট করতে চান সেগুলোতে টিক দিন।</p>
      <ul className="mt-4 space-y-2">
        {pages.map((p) => (
          <li key={p.page_id}>
            <label className={`flex items-center gap-3 rounded-xl border p-3 ${p.can_post ? "cursor-pointer border-gray-200 hover:border-blue-300" : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-70"}`}>
              <input type="checkbox" className="h-5 w-5 accent-blue-600" disabled={!p.can_post} checked={picked.includes(p.page_id)} onChange={() => toggle(p.page_id)} />
              <Avatar src={p.picture_url} name={p.name} size="h-10 w-10" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-900">{p.name}</span>
                <span className="block text-xs text-gray-500">
                  {p.category}
                  {p.already_connected && <span className="ml-1 font-semibold text-emerald-700">· আগে থেকেই কানেক্টেড</span>}
                  {!p.can_post && <span className="ml-1 text-amber-700">· এই পেজে পোস্ট করার অনুমতি নেই</span>}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={saving || picked.length === 0}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: FB_BLUE }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {picked.length > 0 ? `${picked.length}টি পেজ কানেক্ট করুন` : "পেজ বাছাই করুন"}
        </button>
        <button type="button" onClick={onDone} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">বাতিল</button>
      </div>
    </section>
  );
}

function PageCard({ page, onReconnect, reconnecting }) {
  const [check, { isLoading: checking }] = useCheckFacebookPageMutation();
  const [disconnect, { isLoading: removing }] = useDisconnectFacebookPageMutation();
  const needsReconnect = page.status === "needs_reconnect";

  const onCheck = async () => {
    try {
      const res = await check(page.id).unwrap();
      res?.data?.status === "connected" ? toast.success("কানেকশন ঠিক আছে ✓") : toast.warning("পেজটি আবার কানেক্ট করতে হবে");
    } catch {
      toast.error("চেক করা যায়নি");
    }
  };
  const onDisconnect = async () => {
    if (!window.confirm(`"${page.name}" পেজটি ডিসকানেক্ট করবেন? এরপর এই পেজে Reseller Brain থেকে পোস্ট করা যাবে না।`)) return;
    try {
      await disconnect(page.id).unwrap();
      toast.success("পেজ ডিসকানেক্ট হয়েছে");
    } catch {
      toast.error("ডিসকানেক্ট করা যায়নি");
    }
  };

  return (
    <li className={`rounded-2xl border bg-white p-4 shadow-sm ${needsReconnect ? "border-amber-300" : "border-gray-200"}`}>
      <div className="flex items-center gap-3">
        <Avatar src={page.picture_url} name={page.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{page.name}</p>
          <p className="text-xs text-gray-500">{page.category}</p>
        </div>
        {needsReconnect ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> আবার কানেক্ট দরকার</span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> কানেক্টেড</span>
        )}
      </div>
      {needsReconnect && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Facebook এই পেজের অনুমতি বাতিল করেছে (যেমন পাসওয়ার্ড বদলালে)। পোস্ট করতে আবার কানেক্ট করুন।
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {needsReconnect ? (
          <button type="button" onClick={onReconnect} disabled={reconnecting} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: FB_BLUE }}>
            <FbIcon className="h-3.5 w-3.5" /> আবার কানেক্ট করুন
          </button>
        ) : (
          <button type="button" onClick={onCheck} disabled={checking} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} /> কানেকশন চেক করুন
          </button>
        )}
        <button type="button" onClick={onDisconnect} disabled={removing} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
          <Trash2 className="h-3.5 w-3.5" /> ডিসকানেক্ট
        </button>
      </div>
    </li>
  );
}

export default function FacebookPages() {
  const [params, setParams] = useSearchParams();
  const connectKey = params.get("connect");
  const fbError = params.get("fb_error");
  const { data, isLoading } = useGetMyFacebookPagesQuery();
  const [start, { isLoading: starting }] = useStartFacebookConnectMutation();
  const pages = data?.data?.pages || [];
  const configured = data?.data?.configured !== false;
  const brokenPages = pages.filter((p) => p.status === "needs_reconnect");
  const tab = params.get("tab") === "history" ? "history" : "pages";

  const clearParams = () => setParams({}, { replace: true });
  const setTab = (t) => setParams(t === "history" ? { tab: "history" } : {}, { replace: true });

  const connect = async () => {
    try {
      const res = await start().unwrap();
      if (res?.data?.url) window.location.assign(res.data.url); // Facebook's own login page
    } catch (e) {
      toast.error(e?.data?.message || "এখন কানেক্ট করা যাচ্ছে না");
    }
  };

  const ConnectButton = ({ label = "Facebook দিয়ে কানেক্ট করুন" }) => (
    <button type="button" onClick={connect} disabled={starting || !configured}
      className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60" style={{ backgroundColor: FB_BLUE }}>
      {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FbIcon />} {label}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><span style={{ color: FB_BLUE }}><FbIcon className="h-6 w-6" /></span> Facebook পেজ</h1>
        <p className="mt-1 text-sm text-gray-600">আপনার Facebook পেজ Reseller Brain-এর সাথে কানেক্ট করুন — তারপর প্রোডাক্ট সরাসরি আপনার পেজে পোস্ট করতে পারবেন।</p>
      </header>

      {fbError && ERRORS[fbError] && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {ERRORS[fbError]}</span>
          <button type="button" onClick={clearParams} className="shrink-0 text-xs font-semibold underline">বন্ধ</button>
        </div>
      )}

      {!configured && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">Facebook কানেক্ট এখনো চালু হয়নি। শিগগিরই চালু হবে।</div>
      )}

      {/* Reconnect alert: Facebook stopped accepting one of the pages (daily check or a failed post found it). */}
      {!connectKey && brokenPages.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              <b>{brokenPages.map((p) => p.name).join(", ")}</b> পেজে এখন পোস্ট করা যাচ্ছে না। এক ক্লিকে আবার কানেক্ট করুন — আগের পোস্ট ও সেটিং সব থাকবে।
            </span>
          </p>
          <button type="button" onClick={connect} disabled={starting || !configured}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: FB_BLUE }}>
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FbIcon className="h-4 w-4" />} আবার কানেক্ট করুন
          </button>
        </div>
      )}

      {!connectKey && pages.length > 0 && (
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {[["pages", `আমার পেজ (${pages.length})`], ["history", "পোস্ট হিস্টোরি"]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${tab === k ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {connectKey ? (
        <PagePicker connectKey={connectKey} onDone={clearParams} />
      ) : !isLoading && pages.length > 0 && tab === "history" ? (
        <FacebookPostHistory />
      ) : isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>
      ) : pages.length === 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">মাত্র ৩ ধাপে কানেক্ট করুন</h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-700">
            <li className="flex gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">১</span> নিচের নীল বাটনে চাপুন — Facebook-এর নিজের লগইন পেজ খুলবে।</li>
            <li className="flex gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">২</span> লগইন করে আপনার পেজটি বাছাই করুন এবং অনুমতি দিন।</li>
            <li className="flex gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">৩</span> এখানে ফিরে এসে পেজে টিক দিয়ে &quot;কানেক্ট করুন&quot; চাপুন — শেষ!</li>
          </ol>
          <div className="mt-5"><ConnectButton /></div>
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900">কানেক্টেড পেজ ({pages.length})</h2>
            <ConnectButton label="আরেকটি পেজ যোগ করুন" />
          </div>
          <ul className="space-y-3">
            {pages.map((p) => <PageCard key={p.id} page={p} onReconnect={connect} reconnecting={starting} />)}
          </ul>
        </section>
      )}

      {/* Security, in plain words */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-900"><ShieldCheck className="h-4 w-4" /> আপনার নিরাপত্তা</h2>
        <ul className="mt-2 space-y-1.5 text-xs text-emerald-900">
          <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> লগইন হয় Facebook-এর নিজের পেজে — আমরা আপনার Facebook পাসওয়ার্ড কখনো দেখি না।</li>
          <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> আমরা শুধু আপনার বাছাই করা পেজে পোস্ট করার অনুমতি নিই — আপনার প্রোফাইল, মেসেজ বা বন্ধুদের তথ্য নয়।</li>
          <li className="flex gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> অনুমতির কী (token) এনক্রিপ্ট করে আমাদের সার্ভারে রাখা হয়, কারো সাথে শেয়ার হয় না।</li>
          <li className="flex gap-2"><Unplug className="mt-0.5 h-3.5 w-3.5 shrink-0" /> যেকোনো সময় এখান থেকে, অথবা Facebook-এর Settings থেকে ডিসকানেক্ট করতে পারবেন।</li>
        </ul>
      </section>
    </div>
  );
}
