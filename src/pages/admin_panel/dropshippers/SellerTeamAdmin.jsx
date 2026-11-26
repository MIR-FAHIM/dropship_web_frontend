import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { BadgeCheck, Loader2, Search, ShieldOff, UserCog, Users, X } from "lucide-react";
import {
  useGetAdminSellerTeamQuery,
  useGetAdminSellerTeamUserQuery,
  useSetSellerUplineMutation,
  useUnverifySellerMutation,
  useVerifySellerMutation,
} from "../../../redux/features/sellerTeam";

/**
 * Admin → Dropshippers → Seller Team (Passive Income phase 1).
 * Who is a verified seller (code), who is in whose team, 4 levels below anyone, and the change log.
 * Admin can verify / unverify and set or clear a dropshipper's upline (reason required, logged).
 */
const FILTERS = [
  ["", "সবাই"],
  ["verified", "ভেরিফাইড সেলার"],
  ["has_team", "যাদের টিম আছে"],
  ["in_team", "কোনো টিমে আছে"],
];

const ACTIONS = { joined: "কোড দিয়ে যোগ দিয়েছে", upline_changed: "আপলাইন বদল", verified: "ভেরিফাইড", unverified: "ভেরিফিকেশন বাতিল" };

function UserDrawer({ id, onClose }) {
  const { data, isLoading } = useGetAdminSellerTeamUserQuery(id);
  const [setUpline, { isLoading: saving }] = useSetSellerUplineMutation();
  const [verify, { isLoading: verifying }] = useVerifySellerMutation();
  const [unverify, { isLoading: unverifying }] = useUnverifySellerMutation();
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  const d = data?.data;
  const u = d?.user;

  const run = async (fn, okMsg) => {
    try {
      await fn().unwrap();
      toast.success(okMsg);
      setCode("");
      setReason("");
    } catch (e) {
      toast.error(e?.data?.message || "করা যায়নি");
    }
  };
  const needReason = () => {
    if (reason.trim().length < 3) {
      toast.error("কারণ লিখুন (কমপক্ষে ৩ অক্ষর)");
      return false;
    }
    return true;
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-end bg-black/40" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{u ? `#${u.id} ${u.name}` : "লোড হচ্ছে…"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {isLoading || !u ? (
          <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে…</div>
        ) : (
          <div className="mt-4 space-y-5 text-sm">
            <section className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">ডেলিভারি</p>
                <p className="text-xl font-black">{u.delivered_orders} <span className="text-xs font-normal text-slate-500">/ {u.orders_to_verify}</span></p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">সেলার কোড</p>
                <p className={`font-mono text-lg font-black ${u.verified ? "text-emerald-700" : "text-slate-400"}`}>{u.seller_code || "—"}</p>
                <p className="text-[11px] text-slate-500">{u.verified ? "ভেরিফাইড" : u.seller_code ? "ভেরিফিকেশন বাতিল (কোড কাজ করে না)" : "এখনো ভেরিফাইড নয়"}</p>
              </div>
            </section>

            <section>
              <h3 className="mb-1.5 font-bold text-slate-900">আপলাইন (উপরের ৪ লেভেল)</h3>
              {d.uplines.length ? (
                <ol className="space-y-1">
                  {d.uplines.map((x) => (
                    <li key={x.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                      <span className="w-14 shrink-0 text-xs font-semibold text-slate-500">লেভেল {x.level}</span>
                      <span className="truncate">#{x.id} {x.name}</span>
                      <span className="ml-auto font-mono text-xs text-slate-500">{x.seller_code || ""}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="text-slate-500">কোনো টিমে নেই।</p>}
            </section>

            <section>
              <h3 className="mb-1.5 font-bold text-slate-900">টিম (নিচের ৪ লেভেল)</h3>
              <div className="space-y-2">
                {d.levels.map((l) => (
                  <details key={l.level} className="rounded-lg border border-slate-200 px-3 py-2">
                    <summary className="cursor-pointer font-semibold">লেভেল {l.level}: {l.members.length} জন</summary>
                    <ul className="mt-2 space-y-1">
                      {l.members.map((m) => (
                        <li key={m.id} className="flex items-center gap-2 text-xs">
                          <span className="truncate">#{m.id} {m.name}</span>
                          {m.verified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />}
                          {!m.active && <span className="text-slate-400">(inactive)</span>}
                          <span className="ml-auto text-slate-500">{m.delivered_orders} ডেলিভারি</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>

            <section className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <h3 className="flex items-center gap-1.5 font-bold text-amber-900"><UserCog className="h-4 w-4" /> অ্যাডমিন অ্যাকশন</h3>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="কারণ (প্রতিটি পরিবর্তনে আবশ্যক, লগে থাকবে)"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm" />
              <div className="flex flex-wrap gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="নতুন আপলাইনের সেলার কোড"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm" />
                <button type="button" disabled={saving || !code.trim()} onClick={() => needReason() && run(() => setUpline({ id, seller_code: code.trim(), reason }), "আপলাইন সেট হয়েছে")}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">আপলাইন সেট</button>
                {d.uplines.length > 0 && (
                  <button type="button" disabled={saving} onClick={() => needReason() && window.confirm("এই ড্রপশিপারকে টিম থেকে সরাবেন?") && run(() => setUpline({ id, upline_id: null, reason }), "টিম থেকে সরানো হয়েছে")}
                    className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">টিম থেকে সরান</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {u.verified ? (
                  <button type="button" disabled={unverifying} onClick={() => needReason() && run(() => unverify({ id, reason }), "ভেরিফিকেশন বাতিল হয়েছে")}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"><ShieldOff className="h-3.5 w-3.5" /> ভেরিফিকেশন বাতিল</button>
                ) : (
                  <button type="button" disabled={verifying} onClick={() => run(() => verify({ id, reason: reason || "Verified by admin" }), "ভেরিফাইড সেলার করা হয়েছে")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><BadgeCheck className="h-3.5 w-3.5" /> ভেরিফাইড সেলার করুন</button>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-1.5 font-bold text-slate-900">পরিবর্তনের লগ</h3>
              {d.logs.length ? (
                <ul className="space-y-1 text-xs">
                  {d.logs.map((l, i) => (
                    <li key={i} className="rounded-lg bg-slate-50 px-3 py-1.5">
                      <b>{ACTIONS[l.action] || l.action}</b>
                      {l.action === "upline_changed" && <> · {l.old_upline || "কেউ না"} → {l.new_upline || "কেউ না"}</>}
                      {l.action === "joined" && l.new_upline && <> · {l.new_upline}</>}
                      {l.reason && <> · “{l.reason}”</>}
                      <span className="block text-slate-500">{l.by} · {l.at}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-500">কোনো পরিবর্তন নেই।</p>}
            </section>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

export default function SellerTeamAdmin() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const { data, isLoading, isFetching } = useGetAdminSellerTeamQuery({ search: q, filter, page });
  const d = data?.data;
  const rows = d?.rows || [];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Users className="h-6 w-6 text-blue-700" /> Seller Team (Referral)</h1>
        <p className="mt-1 text-sm text-slate-600">
          ১০টি ডেলিভারির পর ড্রপশিপার সেলার কোড পায়; সেই কোডে রেজিস্ট্রেশন করলে তার টিমে যুক্ত হয়। ভেরিফাইড: <b>{d?.counts?.verified ?? 0}</b> · কোনো টিমে আছে: <b>{d?.counts?.in_a_team ?? 0}</b>
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); setQ(search.trim()); setPage(1); }} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, ফোন, ইমেইল, ID বা সেলার কোড"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm" />
          </div>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">খুঁজুন</button>
        </form>
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => { setFilter(k); setPage(1); }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${filter === k ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${isFetching ? "opacity-70" : ""}`}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ড্রপশিপার</th>
              <th className="px-4 py-3">ডেলিভারি</th>
              <th className="px-4 py-3">সেলার কোড</th>
              <th className="px-4 py-3">সরাসরি টিম</th>
              <th className="px-4 py-3">আপলাইন</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">কিছু পাওয়া যায়নি</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">#{r.id} {r.name} {!r.active && <span className="text-xs font-normal text-slate-400">(inactive)</span>}</p>
                  <p className="text-xs text-slate-500">{r.phone}</p>
                </td>
                <td className="px-4 py-3 font-semibold">{r.delivered_orders}</td>
                <td className="px-4 py-3">
                  {r.seller_code ? (
                    <span className={`inline-flex items-center gap-1 font-mono font-bold ${r.verified ? "text-emerald-700" : "text-slate-400 line-through"}`}>
                      {r.verified && <BadgeCheck className="h-4 w-4" />}{r.seller_code}
                    </span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 font-semibold">{r.direct_members}</td>
                <td className="px-4 py-3 text-xs">{r.upline ? <>#{r.upline.id} {r.upline.name}</> : <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setOpenId(r.id)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">টিম দেখুন</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(d?.last_page || 1) > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40">আগের</button>
          <span>{d.current_page} / {d.last_page}</span>
          <button type="button" disabled={page >= d.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-40">পরের</button>
        </div>
      )}

      {openId && <UserDrawer id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
