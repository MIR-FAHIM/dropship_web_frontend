/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Copy, Flame, Loader2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../config";
import { useGetWinningProductsQuery } from "../../../redux/features/winningProducts";
import { useStarPitchProductMutation } from "../../../redux/features/marketerPitch";
import { PageHeading, Pagination, StateMessage } from "../partnerWorkspace";
import { field, panel, workspacePath } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";

/**
 * Partner Portal F6 — Winning Products & Visual Narrative (the demo's tab, with real data).
 * Cards show the Reseller Brain price → suggested selling price → client profit per piece,
 * the ad hook and creative angle, and a local-copy vs verified-original photo comparison.
 */
const url = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${imgBaseUrl}/${p}`);
const CALC_KEY = "rb_partner_calc_v1"; // same key the Pitch Calculator reads

function WinningCard({ p }) {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const navigate = useNavigate();
  const [star, { isLoading: starring }] = useStarPitchProductMutation();
  const money = (v) => num(v, { money: true });

  const copyPitch = async () => {
    const text = `${p.name}\nReseller Brain price: ৳${p.rb_price} | Sell at: ৳${p.suggested_price} | Your profit: ৳${p.client_profit}/piece\n🎯 Hook: ${p.hook}\n🎬 Angle: ${p.ad_angle}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("Product pitch copied!", "প্রোডাক্ট পিচ কপি হয়েছে!"));
    } catch {
      toast.error(t("Could not copy.", "কপি করা যায়নি।"));
    }
  };
  const toggleStar = async () => {
    try {
      await star({ id: p.product_id, starred: !p.starred }).unwrap();
    } catch {
      toast.error(t("Could not update the star.", "স্টার আপডেট করা যায়নি।"));
    }
  };
  const useInCalculator = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CALC_KEY) || "{}");
      window.localStorage.setItem(CALC_KEY, JSON.stringify({ ...saved, productId: p.product_id, productName: p.name, rbDropshipPrice: p.rb_price, sellingPrice: p.suggested_price }));
    } catch { /* storage blocked: the calculator opens with its own values */ }
    navigate(`${workspacePath}/pitch`);
  };

  return (
    <article className={`${panel} flex flex-col justify-between p-5`}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {p.image ? <img src={url(p.image)} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-xl object-cover" /> : null}
            <div className="min-w-0">
              {p.category && <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">{p.category}</span>}
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">{p.name}</h3>
            </div>
          </div>
          <button type="button" onClick={toggleStar} disabled={starring} aria-pressed={p.starred}
            aria-label={p.starred ? t("Unstar", "স্টার সরান") : t("Star for the calculator", "ক্যালকুলেটরের জন্য স্টার করুন")}
            className="shrink-0 rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50">
            <Star size={18} className={p.starred ? "fill-current" : ""} />
          </button>
        </div>

        {p.has_comparison ? (
          <div className="my-3 grid grid-cols-2 gap-2.5">
            <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20">
              <img src={url(p.local_image)} alt={t("Local copy", "লোকাল কপি")} loading="lazy" className="h-28 w-full object-cover opacity-85" />
              <div className="p-2">
                <span className="block text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400">❌ {t("Low Quality", "নিম্নমানের")}</span>
                {p.local_caption && <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">{p.local_caption}</p>}
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-teal-200 bg-teal-50/40 dark:border-teal-800 dark:bg-teal-950/20">
              <img src={url(p.original_image)} alt={t("Verified original", "যাচাই করা অরিজিনাল")} loading="lazy" className="h-28 w-full object-cover" />
              <div className="p-2">
                <span className="block text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400">✅ {t("High Quality", "উচ্চমানের")}</span>
                {p.original_caption && <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">{p.original_caption}</p>}
              </div>
            </div>
          </div>
        ) : p.creative_tip ? (
          <div className="my-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-800/60 dark:bg-amber-950/30">
            <span className="mb-1 block text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-300">💡 {t("Custom Visual Narrative Guide", "কাস্টম ভিজ্যুয়াল গাইড")}</span>
            <p className="text-xs text-slate-700 dark:text-slate-200">{p.creative_tip}</p>
          </div>
        ) : <div className="my-3" />}

        <div className="space-y-1.5 rounded-xl border border-slate-200/60 bg-slate-50 p-3 text-xs dark:border-slate-700/60 dark:bg-slate-800/60">
          <p><strong className="text-slate-800 dark:text-slate-200">🎯 {t("Ad Hook:", "অ্যাড হুক:")}</strong> <span className="text-slate-600 dark:text-slate-300">{p.hook}</span></p>
          <p><strong className="text-slate-800 dark:text-slate-200">🎬 {t("Creative Angle:", "ক্রিয়েটিভ অ্যাঙ্গেল:")}</strong> <span className="text-slate-600 dark:text-slate-300">{p.ad_angle}</span></p>
        </div>

        {/* Prices: Reseller Brain → suggested sell → client profit (no supplier price) */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-sky-50 px-2 py-2 dark:bg-sky-950/50">
            <p className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300">{t("RB price", "RB প্রাইস")}</p>
            <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{money(p.rb_price)}</p>
          </div>
          <div className="rounded-xl bg-violet-50 px-2 py-2 dark:bg-violet-950/50">
            <p className="text-[10px] font-bold uppercase text-violet-700 dark:text-violet-300">{t("Sell at", "বিক্রি")}</p>
            <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{money(p.suggested_price)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-2 py-2 dark:bg-emerald-950/50">
            <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">{t("Client profit", "ক্লায়েন্টের লাভ")}</p>
            <p className="text-sm font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">{money(p.client_profit)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <button type="button" onClick={useInCalculator} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Calculator size={14} aria-hidden="true" /> {t("Use in calculator", "ক্যালকুলেটরে ব্যবহার")}
        </button>
        <button type="button" onClick={copyPitch} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500">
          <Copy size={14} aria-hidden="true" /> {t("Copy Pitch", "পিচ কপি")}
        </button>
      </div>
    </article>
  );
}

export default function MarketerWinningProducts() {
  const { t } = usePartnerPrefs();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isFetching, isError, refetch } = useGetWinningProductsQuery({ search: query || undefined, starred: onlyStarred ? 1 : undefined, page, per_page: 12 });
  const list = data?.data;
  const rows = list?.data || [];

  useEffect(() => {
    const id = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(id);
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeading icon={Flame} eyebrow={t("Partner Portal", "পার্টনার পোর্টাল")} title={t("Winning Products & Visual Narrative", "উইনিং প্রোডাক্ট ও ভিজ্যুয়াল ন্যারেটিভ")}
        description={t("Use low vs high quality visual comparisons to pitch clients and guide ad creatives.",
          "ক্লায়েন্টকে পিচ করতে আর অ্যাড ক্রিয়েটিভ বানাতে নিম্ন বনাম উচ্চমানের তুলনা ব্যবহার করুন।")} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("Search products or hooks...", "প্রোডাক্ট বা হুক সার্চ করুন...")} className={`${field} pl-9`} />
        </div>
        <button type="button" onClick={() => { setOnlyStarred((v) => !v); setPage(1); }} aria-pressed={onlyStarred}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold ${onlyStarred ? "bg-amber-400 text-amber-950" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
          <Star size={14} className={onlyStarred ? "fill-current" : ""} aria-hidden="true" /> {t("Starred", "স্টার করা")}
        </button>
      </div>

      {isFetching && !rows.length ? <div className={panel}><StateMessage loading title={t("Loading products…", "লোড হচ্ছে…")} /></div>
        : isError ? <div className={panel}><StateMessage title={t("Could not load winning products", "উইনিং প্রোডাক্ট লোড করা যায়নি")} retry={refetch} /></div>
        : rows.length === 0 ? <div className={panel}><StateMessage title={onlyStarred ? t("No starred winning products", "স্টার করা উইনিং প্রোডাক্ট নেই") : t("No winning products yet", "এখনো কোনো উইনিং প্রোডাক্ট নেই")} detail={t("The Reseller Brain team adds new winners regularly.", "Reseller Brain টিম নিয়মিত নতুন উইনিং প্রোডাক্ট যোগ করে।")} /></div>
        : (
          <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-80" : ""}`}>
            {rows.map((p) => <WinningCard key={p.product_id} p={p} />)}
          </div>
        )}
      {isFetching && rows.length > 0 && <p className="text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin text-teal-600" /></p>}
      {list && <Pagination page={page} lastPage={Number(list.last_page || 1)} onPage={setPage} />}
    </div>
  );
}
