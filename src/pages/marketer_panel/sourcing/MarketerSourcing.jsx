/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../config";
import { useGetMarketerOverviewQuery } from "../../../redux/features/marketerCommission";
import { useGetMyRequirementsQuery, useSubmitRequirementMutation, useWithdrawRequirementMutation } from "../../../redux/features/partnerSourcing";
import { PageHeading, Pagination, StateMessage } from "../partnerWorkspace";
import { field, panel, primary } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";

/**
 * Partner Portal F4 — Product Sourcing Request (the demo's "Submit Product Sourcing Request"
 * form + "Submitted Requests" list). The sourcing team answers in the admin panel; this list
 * refreshes every 30 seconds so a confirmed price shows up without reloading.
 */

const PLATFORMS = [
  ["facebook_instagram", "Facebook & Instagram", "ফেসবুক ও ইনস্টাগ্রাম"],
  ["tiktok", "TikTok Ads", "টিকটক অ্যাডস"],
  ["google_youtube", "Google / YouTube", "গুগল / ইউটিউব"],
  ["other", "Other", "অন্যান্য"],
];
const CAMPAIGN = [
  ["active", "🟢 Active / Running", "🟢 চলমান"],
  ["upcoming", "🟡 Upcoming Launch", "🟡 শিগগিরই চালু"],
  ["testing", "🔵 Testing Phase", "🔵 টেস্টিং চলছে"],
];
const DEADLINES = [
  ["2h", "Within 2 hours", "২ ঘণ্টার মধ্যে"],
  ["6h", "Within 6 hours", "৬ ঘণ্টার মধ্যে"],
  ["24h", "Within 24 hours", "২৪ ঘণ্টার মধ্যে"],
  ["days", "In days", "কয়েক দিনে"],
  ["date", "By a date", "নির্দিষ্ট তারিখে"],
];
const STATUS = {
  pending: ["Pending", "অপেক্ষমান", "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"],
  checking: ["Checking…", "যাচাই চলছে…", "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"],
  confirmed: ["Confirmed", "কনফার্মড", "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"],
  rejected: ["Not available", "পাওয়া যায়নি", "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"],
  withdrawn: ["Withdrawn", "প্রত্যাহার", "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"],
};
const label = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1";
const imageUrl = (path) => (!path ? "" : /^https?:\/\//i.test(path) ? path : `${imgBaseUrl}/${path}`);
const tomorrow = () => new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const EMPTY = { product_name: "", campaign_platform: "facebook_instagram", daily_budget: "", campaign_status: "active", confirmation_deadline: "24h", deadline_days: "2", deadline_date: "", special_note: "", client_id: "" };

/* ---------- form ---------- */
function RequestForm({ clients }) {
  const { t, lang } = usePartnerPrefs();
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const [submit, { isLoading }] = useSubmitRequirementMutation();
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    setErrors((x) => ({ ...x, product_image: undefined }));
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
      setErrors((x) => ({ ...x, product_image: t("Use a JPG, PNG or WEBP photo.", "JPG, PNG বা WEBP ছবি দিন।") }));
      e.target.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors((x) => ({ ...x, product_image: t("Photo must be 5 MB or smaller.", "ছবির সাইজ ৫ MB এর মধ্যে হতে হবে।") }));
      e.target.value = "";
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrors((x) => ({ ...x, product_image: t("Add a product photo.", "পণ্যের ছবি দিন।") }));
      return;
    }
    const fd = new FormData();
    fd.append("product_image", file);
    Object.entries(form).forEach(([k, v]) => {
      if (k === "deadline_days" && form.confirmation_deadline !== "days") return;
      if (k === "deadline_date" && form.confirmation_deadline !== "date") return;
      if (v !== "" && v != null) fd.append(k, v);
    });
    try {
      await submit(fd).unwrap();
      toast.success(t("Product requirement submitted! The sourcing team has been alerted.", "প্রোডাক্ট রিকোয়ারমেন্ট জমা হয়েছে! সোর্সিং টিমকে জানানো হয়েছে।"));
      setForm(EMPTY);
      setFile(null);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      const errs = err?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k === "daily_budget" ? "daily_budget" : k, Array.isArray(v) ? v[0] : v])));
      toast.error(err?.data?.message && err.data.message !== "Validation failed" ? err.data.message : t("Please check the form.", "ফর্মটি আবার দেখুন।"));
    }
  };

  const Err = ({ k }) => (errors[k] ? <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} className={`${panel} space-y-3.5 p-5 sm:p-6`} aria-labelledby="req-title" noValidate>
      <div>
        <h2 id="req-title" className="text-base font-extrabold text-slate-900 dark:text-white">{t("Submit Product Sourcing Request", "প্রোডাক্ট সোর্সিং রিকোয়েস্ট পাঠান")}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t("Request sourcing & price confirmation for your client", "আপনার ক্লায়েন্টের জন্য সোর্সিং ও প্রাইস কনফার্মেশন চান")}</p>
      </div>

      <div>
        <label htmlFor="req-name" className={label}>{t("Product Name *", "পণ্যের নাম *")}</label>
        <input id="req-name" value={form.product_name} onChange={set("product_name")} required maxLength={255} placeholder="Portable Rechargeable Mini Fan" className={field} />
        <Err k="product_name" />
      </div>

      <div>
        <span className={label}>{t("Product Image *", "পণ্যের ছবি *")}</span>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-3 transition-colors hover:border-teal-400 hover:bg-teal-50/40 dark:border-slate-700 dark:hover:border-teal-600 dark:hover:bg-teal-950/30">
          {preview ? <img src={preview} alt="" className="h-16 w-16 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
            : <span className="grid h-16 w-16 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800"><ImagePlus size={24} aria-hidden="true" /></span>}
          <span className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-teal-700 dark:text-teal-400">{file ? t("Change photo", "ছবি বদলান") : t("Choose a photo", "ছবি বাছাই করুন")}</span><br />
            {file ? file.name : t("JPG, PNG or WEBP · up to 5 MB", "JPG, PNG বা WEBP · ৫ MB পর্যন্ত")}
          </span>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="sr-only" />
        </label>
        <Err k="product_image" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="req-platform" className={label}>{t("Ad Platform *", "অ্যাড প্ল্যাটফর্ম *")}</label>
          <select id="req-platform" value={form.campaign_platform} onChange={set("campaign_platform")} className={field}>
            {PLATFORMS.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="req-budget" className={label}>{t("Daily Budget ($) *", "দৈনিক বাজেট ($) *")}</label>
          <input id="req-budget" type="number" min="1" step="1" inputMode="decimal" value={form.daily_budget} onChange={set("daily_budget")} required placeholder="50" className={field} />
          <Err k="daily_budget" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="req-camp" className={label}>{t("Campaign Status *", "ক্যাম্পেইনের অবস্থা *")}</label>
          <select id="req-camp" value={form.campaign_status} onChange={set("campaign_status")} className={field}>
            {CAMPAIGN.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="req-deadline" className={label}>{t("Confirmation Deadline *", "কনফার্মেশনের সময়সীমা *")}</label>
          <select id="req-deadline" value={form.confirmation_deadline}
            onChange={(e) => setForm((f) => ({ ...f, confirmation_deadline: e.target.value, deadline_date: e.target.value === "date" && !f.deadline_date ? tomorrow() : f.deadline_date }))}
            className={field}>
            {DEADLINES.map(([v, en, bn]) => <option key={v} value={v}>{t(en, bn)}</option>)}
          </select>
        </div>
      </div>
      {form.confirmation_deadline === "days" && (
        <div>
          <label htmlFor="req-days" className={label}>{t("Number of days", "কত দিনের মধ্যে")}</label>
          <input id="req-days" type="number" min="1" max="60" value={form.deadline_days} onChange={set("deadline_days")} className={field} />
          <Err k="deadline_days" />
        </div>
      )}
      {form.confirmation_deadline === "date" && (
        <div>
          <label htmlFor="req-date" className={label}>{t("Answer needed by", "যে তারিখের মধ্যে উত্তর চাই")}</label>
          <input id="req-date" type="date" min={new Date().toISOString().slice(0, 10)} value={form.deadline_date} onChange={set("deadline_date")} className={field} />
          <Err k="deadline_date" />
        </div>
      )}
      {["2h", "6h"].includes(form.confirmation_deadline) && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          🔴 {t("Marked urgent: the sourcing team is alerted right away.", "জরুরি হিসেবে চিহ্নিত: সোর্সিং টিমকে সাথে সাথে জানানো হবে।")}
        </p>
      )}

      {clients.length > 0 && (
        <div>
          <label htmlFor="req-client" className={label}>{t("For client (optional)", "কোন ক্লায়েন্টের জন্য (ঐচ্ছিক)")}</label>
          <select id="req-client" value={form.client_id} onChange={set("client_id")} className={field}>
            <option value="">{t("Not specific", "নির্দিষ্ট নয়")}</option>
            {clients.map((c) => <option key={c.client_id} value={c.client_id}>{c.store || c.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="req-note" className={label}>{t("Requirement Note", "রিকোয়ারমেন্ট নোট")}</label>
        <textarea id="req-note" rows={2} maxLength={2000} value={form.special_note} onChange={set("special_note")}
          placeholder={t("Target price, daily volume, packaging specs...", "টার্গেট প্রাইস, দৈনিক অর্ডার, প্যাকেজিং...")} className={field} />
      </div>

      <button type="submit" disabled={isLoading} className={`${primary} w-full`}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}{t("Submit Request", "রিকোয়েস্ট জমা দিন")}
      </button>
      <p className="text-[11px] text-slate-500 dark:text-slate-400" lang={lang}>{t("You'll get a notification when the price is confirmed.", "প্রাইস কনফার্ম হলে আপনাকে নোটিফিকেশন পাঠানো হবে।")}</p>
    </form>
  );
}

/* ---------- one request card ---------- */
function RequestCard({ r }) {
  const { t, lang } = usePartnerPrefs();
  const num = useNumber();
  const [withdraw, { isLoading }] = useWithdrawRequirementMutation();
  const [en, bn, cls] = STATUS[r.status] || STATUS.pending;
  const platform = PLATFORMS.find((p) => p[0] === r.campaign_platform);
  const camp = CAMPAIGN.find((c) => c[0] === r.campaign_status);
  const due = r.deadline_at ? new Date(r.deadline_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const client = r.client?.dropshipper?.business_name || r.client?.dropshipper?.name;

  const onWithdraw = async () => {
    if (!window.confirm(t("Withdraw this request?", "এই রিকোয়েস্টটি প্রত্যাহার করবেন?"))) return;
    try {
      await withdraw(r.id).unwrap();
      toast.success(t("Request withdrawn.", "রিকোয়েস্ট প্রত্যাহার করা হয়েছে।"));
    } catch (err) {
      toast.error(err?.data?.message || t("Could not withdraw.", "প্রত্যাহার করা যায়নি।"));
    }
  };

  return (
    <article className={`${panel} flex gap-4 p-4`}>
      <img src={imageUrl(r.product_image)} alt={r.product_name} loading="lazy" className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{r.product_name}</h3>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${cls}`}>{t(en, bn)}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span>📢 {platform ? t(platform[1], platform[2]) : r.campaign_platform}</span><span aria-hidden="true">•</span>
          <span>💵 ${num(r.daily_budget_usd)}/{t("day", "দিন")}</span><span aria-hidden="true">•</span>
          <span className={r.is_overdue ? "font-bold text-rose-600 dark:text-rose-400" : ""}>⏱️ {r.is_overdue ? t("Overdue", "সময় পেরিয়েছে") : due}</span>
          {client && (<><span aria-hidden="true">•</span><span>👤 {client}</span></>)}
        </div>
        {r.special_note && <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">{r.special_note}</p>}
        {r.admin_note && (
          <p className={`mt-1.5 rounded-lg px-2.5 py-1.5 text-xs ${r.status === "rejected" ? "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200" : "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200"}`}>
            💬 {r.admin_note}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">{camp ? t(camp[1], camp[2]) : r.campaign_status}</span>
          <span className="flex items-center gap-2">
            {r.status === "pending" && (
              <button type="button" onClick={onWithdraw} disabled={isLoading} className="font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400">{t("Withdraw", "প্রত্যাহার")}</button>
            )}
            {r.status === "confirmed" ? (
              <span className="font-extrabold text-teal-600 dark:text-teal-400">{num(r.quoted_price_bdt, { money: true })} {t("(Incl. Packaging)", "(প্যাকেজিং সহ)")}</span>
            ) : r.status === "pending" || r.status === "checking" ? (
              <span className="font-bold text-amber-600 dark:text-amber-400">{t("Checking...", "যাচাই চলছে...")}</span>
            ) : null}
          </span>
        </div>
        {r.status === "confirmed" && r.linked_product?.id && (
          // Marketers can't open dropshipper pages; they send this link to the client, who orders from it.
          <button type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${window.location.origin}/app/productdetails/${r.linked_product.id}`);
                toast.success(t("Product link copied. Send it to your client.", "পণ্যের লিংক কপি হয়েছে। ক্লায়েন্টকে পাঠান।"));
              } catch {
                toast.error(t("Could not copy the link.", "লিংক কপি করা যায়নি।"));
              }
            }}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60">
            🛒 {t("Ready to order", "অর্ডারের জন্য প্রস্তুত")}: {r.linked_product.name} · 🔗 {t("Copy product link", "পণ্যের লিংক কপি")}
          </button>
        )}
      </div>
    </article>
  );
}

/* ---------- page ---------- */
export default function MarketerSourcing() {
  const { t } = usePartnerPrefs();
  const num = useNumber();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data: overview } = useGetMarketerOverviewQuery({});
  // Refresh every 30s so admin price quotes show up without a reload.
  const { data, isFetching, isError, refetch } = useGetMyRequirementsQuery({ status, page, per_page: 10 }, { pollingInterval: 30000, refetchOnFocus: true });
  const clients = (overview?.data?.clients || []).filter((c) => c.active);
  const list = data?.data?.requests;
  const rows = list?.data || [];
  const counts = data?.data?.counts || {};
  const tabs = [["all", t("All", "সব")], ["open", t("Open", "চলমান")], ["confirmed", t("Confirmed", "কনফার্মড")], ["rejected", t("Not available", "পাওয়া যায়নি")]];

  return (
    <div className="space-y-6">
      <PageHeading icon={PackageSearch} eyebrow={t("Partner Portal", "পার্টনার পোর্টাল")} title={t("Product Sourcing Request", "প্রোডাক্ট সোর্সিং রিকোয়েস্ট")}
        description={t("Ask Reseller Brain to source a hot-selling product for your client's campaign and confirm a wholesale price, packaging included.",
          "ক্লায়েন্টের ক্যাম্পেইনের জন্য রিসেলার ব্রেইনকে পণ্য সোর্স করতে বলুন এবং প্যাকেজিংসহ পাইকারি দাম কনফার্ম নিন।")} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5"><RequestForm clients={clients} /></div>

        <div className="space-y-4 lg:col-span-7">
          <div className={`${panel} flex flex-wrap items-center justify-between gap-3 p-4`}>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t("Submitted Requests", "জমা দেওয়া রিকোয়েস্ট")}
              <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{num(counts.all || 0)}</span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {tabs.map(([v, l]) => (
                <button key={v} type="button" onClick={() => { setStatus(v); setPage(1); }} aria-pressed={status === v}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${status === v ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                  {l}{v === "open" && counts.open ? ` · ${num(counts.open)}` : ""}
                </button>
              ))}
            </div>
          </div>

          {isFetching && !rows.length ? <div className={panel}><StateMessage loading title={t("Loading requests…", "লোড হচ্ছে…")} /></div>
            : isError ? <div className={panel}><StateMessage title={t("Could not load your requests", "রিকোয়েস্ট লোড করা যায়নি")} retry={refetch} /></div>
            : rows.length === 0 ? <div className={panel}><StateMessage title={t("No requests yet", "এখনো কোনো রিকোয়েস্ট নেই")} detail={t("Send your first product request with the form.", "ফর্ম দিয়ে প্রথম প্রোডাক্ট রিকোয়েস্ট পাঠান।")} /></div>
            : <div className="space-y-3.5">{rows.map((r) => <RequestCard key={r.id} r={r} />)}</div>}

          {list && <Pagination page={page} lastPage={Number(list.last_page || 1)} onPage={setPage} />}
        </div>
      </div>
    </div>
  );
}
