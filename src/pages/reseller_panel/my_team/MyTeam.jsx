/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BadgeCheck, CheckCircle2, Copy, Loader2, Lock, Share2, UserPlus, Users } from "lucide-react";
import { useGetMySellerTeamMembersQuery, useGetMySellerTeamQuery } from "../../../redux/features/sellerTeam";

/**
 * Dropshipper panel → আমার টিম (Passive Income phase 1).
 * Not verified yet: progress to 10 delivered orders. Verified: seller code + share link, team per level (1–4).
 * Commission on the team's sales comes in the next phase.
 */
const bn = (n) => String(n ?? 0).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const LEVEL_NAMES = { 1: "১ম লেভেল", 2: "২য় লেভেল", 3: "৩য় লেভেল", 4: "৪র্থ লেভেল" };

const copy = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} কপি হয়েছে`);
  } catch {
    toast.error("কপি করা যায়নি");
  }
};

function Progress({ done, need }) {
  const pct = Math.min(100, Math.round((done / need) * 100));
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 ring-1 ring-blue-200"><Lock className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900">সেলার কোড পেতে আর {bn(Math.max(0, need - done))}টি ডেলিভারি</h2>
          <p className="mt-0.5 text-sm text-slate-600">আপনার অ্যাকাউন্ট থেকে {bn(need)}টি অর্ডার সম্পূর্ণ ডেলিভারি হলে আপনি ভেরিফাইড সেলার হবেন এবং নিজের সেলার কোড পাবেন।</p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white ring-1 ring-blue-100">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-right text-xs font-semibold text-blue-800">{bn(done)} / {bn(need)} ডেলিভারি</p>
    </section>
  );
}

function CodeCard({ code }) {
  const link = `${window.location.origin}/register?ref=${code}`;
  const share = async () => {
    const text = `ResellerBrain-এ ফ্রি রেজিস্ট্রেশন করে রিসেলিং শুরু করুন। আমার সেলার কোড: ${code}\n${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "ResellerBrain", text });
        return;
      } catch {
        /* user closed the share sheet */
      }
    }
    copy(text, "মেসেজ");
  };

  return (
    <section className="rounded-2xl border-2 border-emerald-300 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-800"><BadgeCheck className="h-4 w-4" /> আপনি ভেরিফাইড সেলার</p>
      <p className="mt-3 text-xs text-slate-500">আপনার সেলার কোড</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="rounded-xl bg-slate-900 px-4 py-2 font-mono text-2xl font-black tracking-widest text-white">{code}</span>
        <button type="button" onClick={() => copy(code, "কোড")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Copy className="h-3.5 w-3.5" /> কোড কপি
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
          <Share2 className="h-4 w-4" /> রেজিস্ট্রেশন লিংক শেয়ার করুন
        </button>
        <button type="button" onClick={() => copy(link, "লিংক")} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Copy className="h-4 w-4" /> লিংক কপি
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">এই লিংক বা কোড দিয়ে কেউ রেজিস্ট্রেশন করলে তিনি আপনার টিমের ১ম লেভেলে যুক্ত হবেন। কোড শুধু রেজিস্ট্রেশনের সময়ই দেওয়া যায়।</p>
    </section>
  );
}

function Members({ level }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetMySellerTeamMembersQuery({ level, page });
  const d = data?.data;
  const members = d?.members || [];

  if (isLoading) return <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>;
  if (!members.length) {
    return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">এই লেভেলে এখনো কেউ নেই।</div>;
  }

  return (
    <div className={isFetching ? "opacity-70" : ""}>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{(m.name || "?").charAt(0)}</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
                {m.name}
                {m.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" title="ভেরিফাইড সেলার" />}
                {!m.active && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">অ্যাক্টিভেশন বাকি</span>}
              </p>
              <p className="truncate text-xs text-slate-500">
                {m.phone && <>{m.phone} · </>}
                {m.via && <>{m.via}-এর মাধ্যমে · </>}
                যোগ দিয়েছেন {m.joined_at ? new Date(m.joined_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-slate-900">{bn(m.delivered_orders)}</p>
              <p className="text-[10px] text-slate-500">ডেলিভারি</p>
            </div>
          </li>
        ))}
      </ul>
      {(d?.last_page || 1) > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40">আগের</button>
          <span className="text-slate-600">{bn(d.current_page)} / {bn(d.last_page)}</span>
          <button type="button" disabled={page >= d.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40">পরের</button>
        </div>
      )}
    </div>
  );
}

export default function MyTeam() {
  const { data, isLoading, isError } = useGetMySellerTeamQuery();
  const [level, setLevel] = useState(1);
  const t = data?.data;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Users className="h-6 w-6 text-blue-700" /> আমার টিম</h1>
          <p className="mt-1 text-sm text-slate-600">সেলার টিম গড়ুন — আপনার কোড দিয়ে যোগ দেওয়া সেলাররা ৪ লেভেল পর্যন্ত আপনার টিমে থাকবে।</p>
        </div>
        <Link to="/app/passive-income" className="text-sm font-semibold text-blue-700 hover:underline">প্যাসিভ ইনকাম কীভাবে কাজ করে →</Link>
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>
      ) : isError || !t ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">টিমের তথ্য আনা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।</div>
      ) : (
        <>
          {t.verified ? <CodeCard code={t.seller_code} /> : <Progress done={t.delivered_orders} need={t.orders_to_verify} />}

          {t.upline && (
            <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200">
              <UserPlus className="h-4 w-4 text-slate-500" /> আপনি <b>{t.upline.name}</b>-এর টিমের সদস্য
            </p>
          )}

          <section>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {t.levels.map((l) => (
                <button key={l.level} type="button" onClick={() => setLevel(l.level)}
                  className={`rounded-xl border p-3 text-left transition ${level === l.level ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-900 hover:border-blue-300"}`}>
                  <p className={`text-xs font-semibold ${level === l.level ? "text-blue-100" : "text-slate-500"}`}>{LEVEL_NAMES[l.level]}</p>
                  <p className="mt-1 text-2xl font-black">{bn(l.members)}</p>
                  <p className={`text-[11px] ${level === l.level ? "text-blue-100" : "text-slate-500"}`}>জন সেলার</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">মোট টিম: <b>{bn(t.team_size)}</b> জন</p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-slate-900">{LEVEL_NAMES[level]}-এর সেলার</h2>
            <Members key={level} level={level} />
          </section>

          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900 ring-1 ring-amber-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> টিমের বিক্রয় থেকে কমিশনের হিসাব শিগগিরই এখানে দেখা যাবে।
          </p>
        </>
      )}
    </div>
  );
}
