/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, ImagePlus, Loader2 } from "lucide-react";
import { useApplyAsPartnerMutation } from "../../redux/features/partnerProfile";
import { PartnerPrefsProvider, usePartnerPrefs } from "./partnerPrefs";
import { CAMPAIGN_TYPES, LEVEL_LABEL, NICHES, levelFor } from "./partnerOptions";

/**
 * Partner Portal F8 — public Partner Registration (the demo's sign-up form).
 * Creates a marketer account in "pending approval"; an admin approves it in Admin → Marketers.
 */
const RB_LOGO = "https://apidropship.resellerbrain.com/storage/app/public/all/1776237215_YeclKITg.png";
const input = "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";
const label = "mb-1 block text-xs font-bold text-slate-700";
const EMPTY = { name: "", business_name: "", email: "", password: "", whatsapp: "", facebook_page: "", portfolio_url: "", ad_spend_usd: "", campaigns_run: "", niche: "gadgets_electronics", campaign_type: "purchase_website" };

/** Photo / logo / screenshot picker with preview. */
function ImagePick({ id, title, file, onFile, error, round }) {
  const { t } = usePartnerPrefs();
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div>
      <span className={label}>{title}</span>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-2.5 hover:border-teal-400 hover:bg-teal-50/40">
        {preview ? <img src={preview} alt="" className={`h-12 w-12 object-cover ${round ? "rounded-full" : "rounded-lg"}`} />
          : <span className={`grid h-12 w-12 place-items-center bg-slate-100 text-slate-400 ${round ? "rounded-full" : "rounded-lg"}`}><ImagePlus size={20} aria-hidden="true" /></span>}
        <span className="min-w-0 truncate text-[11px] text-slate-600">{file ? file.name : t("JPG, PNG, WEBP · 5 MB", "JPG, PNG, WEBP · ৫ MB")}</span>
        <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            if (f && f.size > 5 * 1024 * 1024) { e.target.value = ""; onFile(null, t("Image must be 5 MB or smaller.", "ছবি ৫ MB এর মধ্যে হতে হবে।")); return; }
            onFile(f, "");
          }} />
      </label>
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

function RegisterForm() {
  const { t, lang, toggleLang } = usePartnerPrefs();
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState({ avatar: null, agency_logo: null, campaign_screenshot: null });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(null);
  const [apply, { isLoading }] = useApplyAsPartnerMutation();
  const level = levelFor(form.ad_spend_usd, form.campaigns_run);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const setFile = (k) => (f, err) => { setFiles((x) => ({ ...x, [k]: f })); setErrors((x) => ({ ...x, [k]: err || undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== "" && fd.append(k, v));
    Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));
    try {
      const res = await apply(fd).unwrap();
      setDone(res?.data);
    } catch (err) {
      const errs = err?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      if (err?.status === 429) setErrors({ form: t("Too many attempts. Please wait a minute and try again.", "অনেকবার চেষ্টা হয়েছে। এক মিনিট পর আবার চেষ্টা করুন।") });
      else if (!Object.keys(errs).length) setErrors({ form: err?.data?.message || t("Could not send your application.", "আবেদন পাঠানো যায়নি।") });
    }
  };
  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors[k]}</p> : null);

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
        <CheckCircle2 className="mx-auto h-14 w-14 text-teal-500" />
        <h1 className="mt-3 text-xl font-extrabold text-slate-900">{t("Application received!", "আবেদন জমা হয়েছে!")}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("Our team will review it and email you at", "আমাদের টিম যাচাই করে আপনাকে ইমেইল করবে")} <b>{done.email}</b>.
          {" "}{t("After approval, sign in with your email and password.", "অনুমোদনের পর ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।")}
        </p>
        {done.level && (
          <p className="mt-3 inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {t("Expected level:", "সম্ভাব্য লেভেল:")} {t(LEVEL_LABEL[done.level][0], LEVEL_LABEL[done.level][1])}
          </p>
        )}
        <div className="mt-6"><Link to="/login" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">{t("Go to sign in", "লগইন পেজে যান")}</Link></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">{t("Partner Registration", "পার্টনার রেজিস্ট্রেশন")}</h1>
          <p className="text-xs text-slate-500">{t("Complete your profile & campaign experience", "আপনার প্রোফাইল ও ক্যাম্পেইন অভিজ্ঞতা দিন")}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${level === "pro" ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white" : "border border-amber-200 bg-amber-50 text-amber-800"}`} aria-live="polite">
          {level === "pro" ? "🏆 " : "⭐ "}{t(LEVEL_LABEL[level][0], LEVEL_LABEL[level][1])}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ImagePick id="pr-avatar" title={t("Marketer Photo", "মার্কেটারের ছবি")} file={files.avatar} onFile={setFile("avatar")} error={errors.avatar} round />
        <ImagePick id="pr-logo" title={t("Agency Company Logo", "এজেন্সির লোগো")} file={files.agency_logo} onFile={setFile("agency_logo")} error={errors.agency_logo} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="pr-name" className={label}>{t("Full Name *", "পূর্ণ নাম *")}</label>
          <input id="pr-name" value={form.name} onChange={set("name")} required maxLength={191} placeholder="Tanvir Ahmed" autoComplete="name" className={input} /><Err k="name" />
        </div>
        <div>
          <label htmlFor="pr-agency" className={label}>{t("Agency / Business name", "এজেন্সি / ব্যবসার নাম")}</label>
          <input id="pr-agency" value={form.business_name} onChange={set("business_name")} maxLength={191} placeholder="ScaleUp Growth Lab" autoComplete="organization" className={input} /><Err k="business_name" />
        </div>
        <div>
          <label htmlFor="pr-email" className={label}>{t("Email Address *", "ইমেইল *")}</label>
          <input id="pr-email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" placeholder="marketer@example.com" className={input} /><Err k="email" />
        </div>
        <div>
          <label htmlFor="pr-pw" className={label}>{t("Password *", "পাসওয়ার্ড *")}</label>
          <div className="relative">
            <input id="pr-pw" type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} required minLength={6} autoComplete="new-password" placeholder={t("At least 6 characters", "কমপক্ষে ৬ অক্ষর")} className={`${input} pr-10`} />
            <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div><Err k="password" />
        </div>
        <div>
          <label htmlFor="pr-wa" className={label}>{t("WhatsApp Number *", "হোয়াটসঅ্যাপ নম্বর *")}</label>
          <input id="pr-wa" type="tel" inputMode="tel" value={form.whatsapp} onChange={set("whatsapp")} required placeholder="017XXXXXXXX" autoComplete="tel" className={input} /><Err k="whatsapp" />
        </div>
        <div>
          <label htmlFor="pr-fb" className={label}>{t("Facebook Page Link *", "ফেসবুক পেজ লিংক *")}</label>
          <input id="pr-fb" type="url" value={form.facebook_page} onChange={set("facebook_page")} required placeholder="https://facebook.com/page" className={input} /><Err k="facebook_page" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pr-port" className={label}>{t("Portfolio Website", "পোর্টফোলিও ওয়েবসাইট")}</label>
          <input id="pr-port" type="url" value={form.portfolio_url} onChange={set("portfolio_url")} placeholder="https://portfolio.com" className={input} /><Err k="portfolio_url" />
        </div>
      </div>

      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5">
        <p className="mb-2 text-xs font-extrabold text-teal-800">📈 {t("Campaign experience", "ক্যাম্পেইন অভিজ্ঞতা")}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="pr-spend" className={label}>{t("Total Ad Spend ($) *", "মোট অ্যাড খরচ ($) *")}</label>
            <input id="pr-spend" type="number" min="0" step="100" inputMode="decimal" value={form.ad_spend_usd} onChange={set("ad_spend_usd")} required placeholder="15000" className={input} /><Err k="ad_spend_usd" />
          </div>
          <div>
            <label htmlFor="pr-camps" className={label}>{t("Total Campaigns Run *", "মোট ক্যাম্পেইন *")}</label>
            <input id="pr-camps" type="number" min="0" step="1" inputMode="numeric" value={form.campaigns_run} onChange={set("campaigns_run")} required placeholder="120" className={input} /><Err k="campaigns_run" />
          </div>
          <div>
            <label htmlFor="pr-niche" className={label}>{t("Primary Niche *", "প্রধান নিশ *")}</label>
            <select id="pr-niche" value={form.niche} onChange={set("niche")} className={input}>{NICHES.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}</select>
          </div>
          <div>
            <label htmlFor="pr-type" className={label}>{t("Campaign Type *", "ক্যাম্পেইনের ধরন *")}</label>
            <select id="pr-type" value={form.campaign_type} onChange={set("campaign_type")} className={input}>{CAMPAIGN_TYPES.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}</select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-600">
          {t("Upper Level (Pro): $10,000+ ad spend or 100+ campaigns — 20% of admin profit. Mid Level: 15%.",
            "আপার লেভেল (প্রো): $১০,০০০+ অ্যাড খরচ বা ১০০+ ক্যাম্পেইন — অ্যাডমিন প্রফিটের ২০%। মিড লেভেল: ১৫%।")}
        </p>
      </div>

      <ImagePick id="pr-shot" title={t("Running Campaign Screenshot", "চলমান ক্যাম্পেইনের স্ক্রিনশট")} file={files.campaign_screenshot} onFile={setFile("campaign_screenshot")} error={errors.campaign_screenshot} />

      {errors.form && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{errors.form}</p>}
      <button type="submit" disabled={isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-60">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}{t("Create Partner Account →", "পার্টনার অ্যাকাউন্ট খুলুন →")}
      </button>
      <p className="text-center text-xs text-slate-600">
        {t("Already a partner?", "আগে থেকেই পার্টনার?")} <Link to="/login" className="font-bold text-teal-700 hover:underline">{t("Sign in", "লগইন করুন")}</Link>
        <button type="button" onClick={toggleLang} className="ml-3 rounded-lg border border-slate-200 px-2 py-0.5 font-bold text-slate-600 hover:bg-slate-50">🌐 {lang === "bn" ? "English" : "বাংলা"}</button>
      </p>
    </form>
  );
}

export default function PartnerRegister() {
  return (
    <PartnerPrefsProvider>
      <div className="font-partner min-h-dvh bg-slate-50 px-4 py-8 text-slate-900">
        <Link to="/" className="mx-auto mb-6 flex w-fit items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1"><img src={RB_LOGO} alt="Reseller Brain" className="h-full w-full object-contain" /></span>
          <span className="text-lg font-extrabold tracking-tight">Reseller <span className="text-teal-600">Brain</span> <span className="text-xs font-semibold text-slate-500">· Partner Portal</span></span>
        </Link>
        <RegisterForm />
      </div>
    </PartnerPrefsProvider>
  );
}
