/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Save, UserCog, X } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../config";
import { useGetMyPartnerProfileQuery, useUpdateMyPartnerProfileMutation } from "../../redux/features/partnerProfile";
import { saveToLocalstorage, getFromLocalstorage } from "../../utils/localstorage.utils";
import { field, panel, primary } from "./partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "./partnerPrefs";
import { CAMPAIGN_TYPES, LEVEL_LABEL, NICHES, levelFor } from "./partnerOptions";

/**
 * Partner Portal F8 — Profile & settings: photo, agency logo, name, links, ad experience,
 * niche, campaign type and screenshot. The level follows ad spend / campaigns unless an admin set it.
 */
const url = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${imgBaseUrl}/${p}`);
const label = "mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300";

function PhotoField({ id, title, saved, file, onFile, removed, onRemove, round }) {
  const { t } = usePartnerPrefs();
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const shown = preview || (!removed && url(saved));
  const shape = round ? "rounded-full" : "rounded-xl";
  return (
    <div>
      <span className={label}>{title}</span>
      <div className="flex items-center gap-3">
        <div className="relative">
          {shown ? <img src={shown} alt="" className={`h-16 w-16 border border-slate-200 object-cover dark:border-slate-700 ${shape}`} />
            : <span className={`grid h-16 w-16 place-items-center bg-slate-100 text-slate-400 dark:bg-slate-800 ${shape}`}><ImagePlus size={20} aria-hidden="true" /></span>}
          {shown && onRemove && (
            <button type="button" onClick={onRemove} aria-label={t("Remove", "মুছুন")} className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-slate-500 shadow hover:text-rose-600 dark:bg-slate-800"><X size={13} /></button>
          )}
        </div>
        <label htmlFor={id} className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          {shown ? t("Change", "বদলান") : t("Upload", "আপলোড")}
          <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f && f.size > 5 * 1024 * 1024) { toast.error(t("Image must be 5 MB or smaller.", "ছবি ৫ MB এর মধ্যে হতে হবে।")); e.target.value = ""; return; }
              onFile(f);
            }} />
        </label>
      </div>
    </div>
  );
}

export default function PartnerProfileSettings() {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const { data, isLoading } = useGetMyPartnerProfileQuery();
  const [save, { isLoading: saving }] = useUpdateMyPartnerProfileMutation();
  const me = data?.data;
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState({ avatar: null, agency_logo: null, campaign_screenshot: null });
  const [removed, setRemoved] = useState({ avatar: false, agency_logo: false });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!me) return;
    const p = me.profile || {};
    setForm({
      name: me.name || "", business_name: me.business_name || "", whatsapp: p.whatsapp || "", facebook_page: p.facebook_page || "",
      portfolio_url: p.portfolio_url || "", ad_spend_usd: p.ad_spend_usd ?? "", campaigns_run: p.campaigns_run ?? "",
      niche: p.niche || "gadgets_electronics", campaign_type: p.campaign_type || "purchase_website",
    });
    setFiles({ avatar: null, agency_logo: null, campaign_screenshot: null });
    setRemoved({ avatar: false, agency_logo: false });
  }, [me]);

  if (isLoading || !form) return <div className={`${panel} p-8 text-center`}><Loader2 className="mx-auto h-5 w-5 animate-spin text-teal-600" /></div>;

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const autoLevel = levelFor(form.ad_spend_usd, form.campaigns_run);
  const shownLevel = me.level_source === "admin" ? me.level : autoLevel;

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
    Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));
    Object.entries(removed).forEach(([k, v]) => v && !files[k] && fd.append(`remove_${k}`, "1"));
    try {
      const res = await save(fd).unwrap();
      // Keep the header name in sync.
      const stored = getFromLocalstorage("user");
      if (stored) saveToLocalstorage("user", { ...stored, name: res.data.name, business_name: res.data.business_name });
      toast.success(t("Profile saved.", "প্রোফাইল সংরক্ষণ হয়েছে।"));
    } catch (err) {
      const errs = err?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      toast.error(err?.data?.message || t("Could not save.", "সংরক্ষণ করা যায়নি।"));
    }
  };
  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">{errors[k]}</p> : null);

  return (
    <form onSubmit={submit} noValidate className={`${panel} space-y-5 p-5`} aria-labelledby="partner-settings">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="partner-settings" className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white"><UserCog size={17} aria-hidden="true" /></span>
          {t("Profile & settings", "প্রোফাইল ও সেটিংস")}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {shownLevel && (
            <span className={`rounded-full px-3 py-1 ${shownLevel === "pro" ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white" : "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
              {shownLevel === "pro" ? "🏆 " : "⭐ "}{t(LEVEL_LABEL[shownLevel][0], LEVEL_LABEL[shownLevel][1])}
              {me.level_source === "admin" && <span className="ml-1 font-semibold opacity-80">· {t("set by admin", "অ্যাডমিন নির্ধারিত")}</span>}
            </span>
          )}
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800 dark:bg-sky-950 dark:text-sky-300">{num(me.commission_rate)}% {t("commission", "কমিশন")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PhotoField id="ps-avatar" title={t("Your photo", "আপনার ছবি")} round saved={me.profile?.avatar} file={files.avatar} removed={removed.avatar}
          onFile={(f) => { setFiles((x) => ({ ...x, avatar: f })); setRemoved((x) => ({ ...x, avatar: false })); }}
          onRemove={() => { setFiles((x) => ({ ...x, avatar: null })); setRemoved((x) => ({ ...x, avatar: true })); }} />
        <PhotoField id="ps-logo" title={t("Agency logo", "এজেন্সির লোগো")} saved={me.profile?.agency_logo} file={files.agency_logo} removed={removed.agency_logo}
          onFile={(f) => { setFiles((x) => ({ ...x, agency_logo: f })); setRemoved((x) => ({ ...x, agency_logo: false })); }}
          onRemove={() => { setFiles((x) => ({ ...x, agency_logo: null })); setRemoved((x) => ({ ...x, agency_logo: true })); }} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><label htmlFor="ps-name" className={label}>{t("Full name *", "পূর্ণ নাম *")}</label><input id="ps-name" value={form.name} onChange={set("name")} className={field} /><Err k="name" /></div>
        <div><label htmlFor="ps-agency" className={label}>{t("Agency / business name", "এজেন্সি / ব্যবসার নাম")}</label><input id="ps-agency" value={form.business_name} onChange={set("business_name")} className={field} /></div>
        <div><label htmlFor="ps-wa" className={label}>{t("WhatsApp number *", "হোয়াটসঅ্যাপ নম্বর *")}</label><input id="ps-wa" type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="017XXXXXXXX" className={field} /><Err k="whatsapp" /></div>
        <div><label htmlFor="ps-fb" className={label}>{t("Facebook page link *", "ফেসবুক পেজ লিংক *")}</label><input id="ps-fb" type="url" value={form.facebook_page} onChange={set("facebook_page")} placeholder="https://facebook.com/page" className={field} /><Err k="facebook_page" /></div>
        <div className="sm:col-span-2"><label htmlFor="ps-port" className={label}>{t("Portfolio website", "পোর্টফোলিও ওয়েবসাইট")}</label><input id="ps-port" type="url" value={form.portfolio_url} onChange={set("portfolio_url")} placeholder="https://" className={field} /><Err k="portfolio_url" /></div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 dark:border-teal-900/60 dark:bg-teal-950/30 sm:grid-cols-2">
        <div><label htmlFor="ps-spend" className={label}>{t("Total ad spend ($) *", "মোট অ্যাড খরচ ($) *")}</label><input id="ps-spend" type="number" min="0" value={form.ad_spend_usd} onChange={set("ad_spend_usd")} className={field} /><Err k="ad_spend_usd" /></div>
        <div><label htmlFor="ps-camps" className={label}>{t("Total campaigns run *", "মোট ক্যাম্পেইন *")}</label><input id="ps-camps" type="number" min="0" value={form.campaigns_run} onChange={set("campaigns_run")} className={field} /><Err k="campaigns_run" /></div>
        <div><label htmlFor="ps-niche" className={label}>{t("Primary niche *", "প্রধান নিশ *")}</label><select id="ps-niche" value={form.niche} onChange={set("niche")} className={field}>{NICHES.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}</select></div>
        <div><label htmlFor="ps-type" className={label}>{t("Campaign type *", "ক্যাম্পেইনের ধরন *")}</label><select id="ps-type" value={form.campaign_type} onChange={set("campaign_type")} className={field}>{CAMPAIGN_TYPES.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}</select></div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 sm:col-span-2">
          {me.level_source === "admin"
            ? t("Your level was set by the Reseller Brain team.", "আপনার লেভেল Reseller Brain টিম নির্ধারণ করেছে।")
            : t("Pro needs $10,000+ ad spend or 100+ campaigns (20%). Mid Level earns 15%.", "প্রো লেভেলের জন্য $১০,০০০+ অ্যাড খরচ বা ১০০+ ক্যাম্পেইন লাগবে (২০%)। মিড লেভেলে ১৫%।")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PhotoField id="ps-shot" title={t("Running campaign screenshot", "চলমান ক্যাম্পেইনের স্ক্রিনশট")} saved={me.profile?.campaign_screenshot} file={files.campaign_screenshot}
          onFile={(f) => setFiles((x) => ({ ...x, campaign_screenshot: f }))} />
        <div className="flex items-end justify-end">
          <button type="submit" disabled={saving} className={primary}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}{t("Save profile", "প্রোফাইল সংরক্ষণ")}</button>
        </div>
      </div>
    </form>
  );
}
