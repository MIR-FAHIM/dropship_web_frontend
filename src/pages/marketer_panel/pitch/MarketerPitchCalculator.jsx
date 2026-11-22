/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import { Calculator, Download, Loader2, Maximize2, RotateCcw, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../config";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import {
  useGetPitchProductsQuery,
  useGetPitchSettingsQuery,
  useSavePitchSettingsMutation,
  useStarPitchProductMutation,
} from "../../../redux/features/marketerPitch";
import { PageHeading } from "../partnerWorkspace";
import { field, panel, primary, secondary } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";
import { DEFAULTS, calculatePitch, drawProposalCard } from "./pitchMath";

/**
 * Partner Portal F5 — Client Pitch Calculator ("Self-Stocking vs Reseller Brain").
 * All maths runs in the browser (pitchMath.js). Real products with their Reseller Brain
 * price, starred products and the dollar rate are saved on the server per marketer.
 */
const STORE_KEY = "rb_partner_calc_v1";
const loadCalc = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null");
    return saved ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
};
const imageUrl = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${imgBaseUrl}/${p}`);
const lbl = "block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1";

/* ---------- one number input ---------- */
const NumField = ({ id, label, value, onChange, step = "1", min = "0", suffix }) => (
  <div>
    <label htmlFor={id} className={lbl}>{label}</label>
    <div className="relative">
      <input id={id} type="number" inputMode="decimal" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} className={`${field} ${suffix ? "pr-12" : ""}`} />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">{suffix}</span>}
    </div>
  </div>
);

/* ---------- results (page + full screen) ---------- */
function Results({ m, big = false }) {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const money = (v) => num(Math.round(v), { money: true });
  const maxProfit = Math.max(1, Math.abs(m.selfWeeklyProfit), Math.abs(m.rbWeeklyProfit));
  const size = big ? "text-3xl sm:text-4xl" : "text-2xl";

  const Row = ({ l, v, strong }) => (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{l}</span>
      <span className={`tabular-nums ${strong ? "font-extrabold" : "font-semibold"} text-slate-900 dark:text-white`}>{v}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Model A */}
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-rose-700 dark:text-rose-300">🏚️ {t("Model A: Self-Stocking", "মডেল-ক: নিজে স্টক করলে")}</h3>
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-200">{t("Capital Locked", "স্টকে পুঁজি আটকে থাকে")}</span>
          </div>
          <p className={`mt-2 font-extrabold tabular-nums text-slate-900 dark:text-white ${size}`}>{num(Math.round(m.selfOrders))} <span className="text-sm font-bold text-slate-500">{t("orders / week", "অর্ডার / সপ্তাহ")}</span></p>
          <div className="mt-3 space-y-1.5">
            <Row l={t("Daily orders", "প্রতিদিন অর্ডার")} v={num(m.selfDailyOrders.toFixed(1))} />
            <Row l={t("Total weekly capital", "মোট সাপ্তাহিক পুঁজি")} v={money(m.totalWeeklyCapital)} />
            <Row l={t("Locked in inventory", "স্টকে আটকে থাকে")} v={money(m.lockedStockCapital)} />
            <Row l={t("Available ad budget", "অ্যাড বাজেট থাকে")} v={money(m.budget)} />
            <Row l={t("Landed cost / unit", "আসল খরচ / পিস")} v={money(m.selfLandedCost)} />
          </div>
          <div className="mt-3 border-t border-rose-200 pt-3 dark:border-rose-900/60">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Weekly net profit", "সাপ্তাহিক নিট প্রফিট")}</p>
            <p className={`font-extrabold tabular-nums text-rose-600 dark:text-rose-400 ${size}`}>{money(m.selfWeeklyProfit)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("30-day est.", "৩০ দিনে সম্ভাব্য")} {money(m.selfMonthlyProfit)}</p>
          </div>
        </div>

        {/* Model B */}
        <div className="relative rounded-2xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-5 dark:border-teal-700 dark:from-teal-950/50 dark:via-slate-900 dark:to-emerald-950/40">
          <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1 text-xs font-extrabold text-white shadow">
            {num(m.orderMultiplier.toFixed(1))}× {t("Orders", "বেশি অর্ডার")}
          </span>
          <h3 className="text-sm font-extrabold text-teal-700 dark:text-teal-300">🚀 {t("Model B: Reseller Brain", "মডেল-খ: Reseller Brain")}</h3>
          <p className={`mt-2 font-extrabold tabular-nums text-slate-900 dark:text-white ${size}`}>{num(Math.round(m.rbWeeklyOrders))} <span className="text-sm font-bold text-slate-500">{t("orders / week", "অর্ডার / সপ্তাহ")}</span></p>
          <div className="mt-3 space-y-1.5">
            <Row l={t("Daily orders", "প্রতিদিন অর্ডার")} v={num(m.rbDailyOrders.toFixed(1))} />
            <Row l={t("Total weekly capital", "মোট সাপ্তাহিক পুঁজি")} v={money(m.totalWeeklyCapital)} />
            <Row l={t("Locked in inventory", "স্টকে আটকে থাকে")} v={money(0)} />
            <Row l={t("Full ad budget", "সম্পূর্ণ অ্যাড বাজেট")} v={money(m.totalWeeklyCapital)} />
            <Row l={t("Net profit / order", "নিট লাভ / অর্ডার")} v={money(m.rbProfitPerOrder)} />
          </div>
          <div className="mt-3 border-t border-teal-200 pt-3 dark:border-teal-800">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">✨ {t("Weekly net profit", "সাপ্তাহিক নিট প্রফিট")}</p>
            <p className={`font-extrabold tabular-nums text-teal-600 dark:text-teal-400 ${size}`}>{money(m.rbWeeklyProfit)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("30-day est.", "৩০ দিনে সম্ভাব্য")} {money(m.rbMonthlyProfit)}</p>
          </div>
        </div>
      </div>

      {/* Spotlight */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-600/20">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-50">{t("Extra net profit with the same capital", "একই পুঁজিতে অতিরিক্ত নিট লাভ")}</p>
        <p className={`mt-1 font-extrabold tabular-nums ${big ? "text-4xl sm:text-6xl" : "text-3xl sm:text-4xl"}`}>
          {m.extraProfit >= 0 ? "+" : "−"}{money(Math.abs(m.extraProfit))}<span className="text-base font-bold text-emerald-100"> / {t("week", "সপ্তাহ")}</span>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/15 px-3 py-2"><p className="text-[11px] text-emerald-50">{t("Extra / day", "প্রতিদিন বাড়তি লাভ")}</p><p className="font-extrabold tabular-nums">{money(m.extraDailyProfit)}</p></div>
          <div className="rounded-xl bg-white/15 px-3 py-2"><p className="text-[11px] text-emerald-50">{t("Extra / 30 days", "মাসিক বাড়তি লাভ")}</p><p className="font-extrabold tabular-nums">{money(m.extraMonthlyProfit)}</p></div>
        </div>
        {/* Profit bars */}
        <div className="mt-4 space-y-2 text-xs">
          {[[t("Self-stocking profit", "নিজে স্টক (সাপ্তাহিক প্রফিট)"), m.selfWeeklyProfit, "bg-rose-300"], [t("Reseller Brain profit", "Reseller Brain (সাপ্তাহিক প্রফিট)"), m.rbWeeklyProfit, "bg-white"]].map(([l, v, c]) => (
            <div key={l}>
              <div className="flex justify-between font-semibold"><span>{l}</span><span className="tabular-nums">{money(v)}</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/20"><div className={`h-full rounded-full ${c}`} style={{ width: `${Math.max(2, (Math.max(0, v) / maxProfit) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- product picker ---------- */
function ProductPicker({ selectedId, onPick, onCustom }) {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [onlyStarred, setOnlyStarred] = useState(false);
  const { data, isFetching } = useGetPitchProductsQuery({ search: query || undefined, starred: onlyStarred ? 1 : undefined, per_page: 20 });
  const [star] = useStarPitchProductMutation();
  const rows = data?.data?.data || [];

  useEffect(() => {
    const id = window.setTimeout(() => setQuery(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  const toggleStar = async (e, p) => {
    e.stopPropagation();
    try {
      await star({ id: p.id, starred: !p.starred }).unwrap();
    } catch {
      toast.error(t("Could not update the star.", "স্টার আপডেট করা যায়নি।"));
    }
  };

  return (
    <div className={`${panel} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">🛍️ {t("Pick a product", "প্রোডাক্ট বাছাই করুন")}</h2>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setOnlyStarred((v) => !v)} aria-pressed={onlyStarred}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${onlyStarred ? "bg-amber-400 text-amber-950" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
            <Star size={12} className={onlyStarred ? "fill-current" : ""} aria-hidden="true" /> {t("Starred", "স্টার করা")}
          </button>
          <button type="button" onClick={onCustom}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${!selectedId ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
            ✏️ {t("Custom product", "কাস্টম প্রোডাক্ট")}
          </button>
        </div>
      </div>
      <div className="relative mt-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("Search platform products...", "প্রোডাক্ট সার্চ করুন...")} className={`${field} pl-9`} />
      </div>
      <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {isFetching && !rows.length ? <li className="py-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-teal-600" /></li>
          : rows.length === 0 ? <li className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">{onlyStarred ? t("No starred products yet. Tap ☆ to star one.", "এখনো কোনো স্টার করা প্রোডাক্ট নেই। ☆ চেপে স্টার করুন।") : t("No products found.", "কোনো প্রোডাক্ট পাওয়া যায়নি।")}</li>
          : rows.map((p) => (
            <li key={p.id}>
              <div role="button" tabIndex={0} onClick={() => onPick(p)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(p)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-colors ${selectedId === p.id ? "border-teal-500 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/50" : "border-slate-200 bg-white hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-teal-700"}`}>
                {p.image ? <img src={imageUrl(p.image)} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700">📦</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                  <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{p.category || p.sku}</span>
                </span>
                <span className="text-right">
                  <span className="block text-xs font-extrabold text-teal-700 dark:text-teal-300">{num(p.rb_price, { money: true })}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{t("RB price", "RB প্রাইস")}</span>
                </span>
                <button type="button" onClick={(e) => toggleStar(e, p)} aria-pressed={p.starred} aria-label={p.starred ? t("Unstar", "স্টার সরান") : t("Star", "স্টার করুন")}
                  className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50">
                  <Star size={16} className={p.starred ? "fill-current" : ""} />
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

/* ---------- page ---------- */
export default function MarketerPitchCalculator() {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const user = getFromLocalstorage("user");
  const [calc, setCalc] = useState(loadCalc);
  const [fullScreen, setFullScreen] = useState(false);
  const { data: settings } = useGetPitchSettingsQuery();
  const [saveSettings, { isLoading: savingRate }] = useSavePitchSettingsMutation();
  const savedRate = settings?.data?.dollar_rate;
  const metrics = useMemo(() => calculatePitch(calc), [calc]);

  // First load: use the dollar rate saved on the profile.
  useEffect(() => {
    if (savedRate && settings?.data?.dollar_rate_saved && calc.rateFromProfile !== savedRate) {
      setCalc((c) => ({ ...c, dollarRate: savedRate, rateFromProfile: savedRate }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedRate]);
  useEffect(() => {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(calc)); } catch { /* storage blocked */ }
  }, [calc]);
  useEffect(() => {
    if (!fullScreen) return undefined;
    const onKey = (e) => e.key === "Escape" && setFullScreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullScreen]);

  const set = (k) => (v) => setCalc((c) => ({ ...c, [k]: v }));
  const pick = (p) => setCalc((c) => ({
    ...c, productId: p.id, productName: p.name, rbDropshipPrice: p.rb_price,
    // Suggested selling price: the product's max resell price, else +40% on the RB price.
    sellingPrice: p.suggested_price && p.suggested_price > p.rb_price ? p.suggested_price : Math.round(p.rb_price * 1.4),
  }));
  const custom = () => setCalc((c) => ({ ...c, productId: null, productName: "" }));
  const reset = () => {
    setCalc({ ...DEFAULTS, dollarRate: savedRate || DEFAULTS.dollarRate, rateFromProfile: savedRate });
    toast.success(t("Calculator reset (your saved dollar rate is kept).", "ক্যালকুলেটর রিসেট হয়েছে (সংরক্ষিত ডলার রেট রাখা হয়েছে)।"));
  };
  const rateChanged = Number(calc.dollarRate) > 0 && Number(calc.dollarRate) !== Number(savedRate);
  const saveRate = async () => {
    try {
      await saveSettings({ dollar_rate: Number(calc.dollarRate) }).unwrap();
      setCalc((c) => ({ ...c, rateFromProfile: Number(c.dollarRate) }));
      toast.success(t("Dollar rate saved on your profile.", "ডলার রেট প্রোফাইলে সংরক্ষণ হয়েছে।"));
    } catch (err) {
      toast.error(err?.data?.errors?.dollar_rate?.[0] || err?.data?.message || t("Could not save the rate.", "রেট সংরক্ষণ করা যায়নি।"));
    }
  };
  const download = () => {
    const canvas = document.createElement("canvas");
    drawProposalCard(canvas, { calc, metrics, partnerName: user?.business_name || user?.name, productName: calc.productName });
    canvas.toBlob((blob) => {
      if (!blob) return toast.error(t("Could not create the image.", "ছবি তৈরি করা যায়নি।"));
      saveAs(blob, `reseller-brain-proposal-${new Date().toISOString().slice(0, 10)}.png`);
      return undefined;
    }, "image/png");
  };

  const inputs = (
    <div className={`${panel} space-y-4 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">🧮 {t("Pitch numbers", "পিচের হিসাব")}{calc.productName && <span className="ml-1 font-semibold text-teal-700 dark:text-teal-300">· {calc.productName}</span>}</h2>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"><RotateCcw size={13} aria-hidden="true" /> {t("Reset", "রিসেট")}</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField id="pc-budget" label={t("Weekly Ad Budget (৳)", "সাপ্তাহিক অ্যাড বাজেট (৳)")} value={calc.initialAdBudget} onChange={set("initialAdBudget")} step="500" suffix="৳" />
        <NumField id="pc-cpa" label={t("Cost Per Order (CPA $)", "প্রতি অর্ডার অ্যাড খরচ (CPA $)")} value={calc.cpaUsd} onChange={set("cpaUsd")} step="0.01" suffix="$" />
      </div>
      <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-900/60 dark:bg-sky-950/30">
        <NumField id="pc-rate" label={t("Dollar rate (৳ per $, incl. charges)", "ডলার রেট (প্রতি $ এ ৳, চার্জসহ)")} value={calc.dollarRate} onChange={set("dollarRate")} step="0.5" suffix="৳/$" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <span>CPA = {num(metrics.cpaBdt.toFixed(2), { money: true, decimals: 2 })} / {t("order", "অর্ডার")}</span>
          {rateChanged ? (
            <button type="button" onClick={saveRate} disabled={savingRate} className="rounded-lg bg-sky-600 px-2.5 py-1 font-bold text-white hover:bg-sky-700 disabled:opacity-60">
              {savingRate ? "…" : t("Save as my rate", "আমার রেট হিসেবে সংরক্ষণ")}
            </button>
          ) : savedRate ? <span className="font-semibold text-sky-700 dark:text-sky-300">✓ {t("Saved on your profile", "প্রোফাইলে সংরক্ষিত")}</span> : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField id="pc-whole" label={t("Wholesale Price (৳)", "পাইকারি প্রাইস (৳)")} value={calc.wholesalePrice} onChange={set("wholesalePrice")} />
        <NumField id="pc-sell" label={t("Selling Price (৳)", "কাস্টমার সেলিং প্রাইস (৳)")} value={calc.sellingPrice} onChange={set("sellingPrice")} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <NumField id="pc-wh" label={t("Warehouse (৳)", "ওয়্যারহাউস (৳)")} value={calc.warehouseCost} onChange={set("warehouseCost")} />
        <NumField id="pc-pack" label={t("Packaging (৳)", "প্যাকেজিং (৳)")} value={calc.packagingCost} onChange={set("packagingCost")} />
        <NumField id="pc-dmg" label={t("Damage Risk (৳)", "ড্যামেজ রিস্ক (৳)")} value={calc.damageRiskCost} onChange={set("damageRiskCost")} />
      </div>
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 dark:border-teal-900/60 dark:bg-teal-950/30">
        <NumField id="pc-rb" label={t("Reseller Brain Price (৳)", "Reseller Brain প্রাইস (৳)")} value={calc.rbDropshipPrice} onChange={set("rbDropshipPrice")} suffix="৳" />
        <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300">{calc.productId ? t("Filled from the product. Change it if you give your client a deal.", "প্রোডাক্ট থেকে নেওয়া। ক্লায়েন্টকে ছাড় দিলে বদলান।") : t("What your client pays Reseller Brain per piece.", "ক্লায়েন্ট প্রতি পিসে Reseller Brain কে যা দেবেন।")}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeading icon={Calculator} eyebrow={t("Partner Portal", "পার্টনার পোর্টাল")}
        title={t("Self-Stocking vs Reseller Brain Calculator", "নিজে স্টক বনাম Reseller Brain ক্যালকুলেটর")}
        description={t("Show your client, live on a call, how zero-stock dropshipping turns the same money into more orders and more profit.",
          "কলে লাইভ দেখান, স্টক ছাড়া ড্রপশিপিংয়ে একই টাকায় কীভাবে বেশি অর্ডার আর বেশি লাভ হয়।")}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFullScreen(true)} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-teal-700 hover:bg-teal-50 sm:text-sm">
              <Maximize2 size={15} aria-hidden="true" /> {t("Full-Screen Pitch", "ফুল-স্ক্রিন পিচ")}
            </button>
            <button type="button" onClick={download} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/40 hover:bg-white/25 sm:text-sm">
              <Download size={15} aria-hidden="true" /> {t("Download Proposal", "ক্লায়েন্টের জন্য ডাউনলোড")}
            </button>
          </div>
        } />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <ProductPicker selectedId={calc.productId} onPick={pick} onCustom={custom} />
          {inputs}
        </div>
        <div className="space-y-4 lg:col-span-7">
          <Results m={metrics} />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={download} className={secondary}><Download size={15} aria-hidden="true" /> {t("Download as image", "ছবি হিসেবে ডাউনলোড")}</button>
            <button type="button" onClick={() => setFullScreen(true)} className={primary}><Maximize2 size={15} aria-hidden="true" /> {t("Full-Screen Pitch", "ফুল-স্ক্রিন পিচ")}</button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t("An estimate for discussion — real results depend on ad performance.", "আলোচনার জন্য আনুমানিক হিসাব — আসল ফল অ্যাডের পারফরম্যান্সের উপর নির্ভর করে।")}</p>
        </div>
      </div>

      {fullScreen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 sm:p-8" role="dialog" aria-modal="true" aria-label={t("Full-Screen Pitch", "ফুল-স্ক্রিন পিচ")}>
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Reseller Brain · {t("Client proposal", "ক্লায়েন্ট প্রস্তাব")}</p>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{t("Same money. More orders. Zero stock.", "একই টাকা। বেশি অর্ডার। শূন্য স্টক।")}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {calc.productName && <b>{calc.productName} · </b>}
                  {t("Budget", "বাজেট")} {num(metrics.budget, { money: true })} · CPA ${Number(metrics.cpaUsd).toFixed(2)} · {t("Selling", "বিক্রি")} {num(calc.sellingPrice, { money: true })}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={download} className={secondary}><Download size={15} aria-hidden="true" /> {t("Download", "ডাউনলোড")}</button>
                <button type="button" onClick={() => setFullScreen(false)} className={primary}><X size={15} aria-hidden="true" /> {t("Close", "বন্ধ করুন")}</button>
              </div>
            </div>
            <Results m={metrics} big />
          </div>
        </div>
      )}
    </div>
  );
}
