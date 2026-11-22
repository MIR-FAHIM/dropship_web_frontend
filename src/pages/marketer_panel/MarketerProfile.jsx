import { BadgeCheck, Code2, LockKeyhole, Map, MousePointerClick, ShieldCheck, Store } from "lucide-react";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import { Badge, PageHeading, SectionHeading } from "./partnerWorkspace";
import { panel } from "./partnerWorkspaceData";
import { usePartnerPrefs } from "./partnerPrefs";
import PartnerProfileSettings from "./PartnerProfileSettings";

const roadmapData = [
  { icon: MousePointerClick, title: { en: "Engagement Analytics", bn: "অ্যাক্টিভিটি অ্যানালিটিক্স" }, detail: { en: "Activity trends and client follow-up suggestions.", bn: "অ্যাক্টিভিটি ট্রেন্ড ও ক্লায়েন্ট ফলো-আপ পরামর্শ।" }, phase: "Phase 2", color: "bg-gradient-to-br from-sky-500 to-blue-500 text-white" },
  { icon: Store, title: { en: "Partner Marketplace", bn: "সার্ভিস মার্কেটপ্লেস" }, detail: { en: "Service listings, listing approvals and service orders.", bn: "মার্কেটার সার্ভিস লিস্টিং ও ক্লায়েন্ট সার্ভিস অর্ডার।" }, phase: "Phase 2", color: "bg-gradient-to-br from-amber-400 to-orange-500 text-white" },
  { icon: LockKeyhole, title: { en: "Privacy & Security", bn: "প্রাইভেসি ও সিকিউরিটি" }, detail: { en: "Consent history, access logs and session settings.", bn: "সম্মতি ইতিহাস, অ্যাক্সেস লগ এবং সিকিউরিটি সেটিংস।" }, phase: "Phase 2", color: "bg-gradient-to-br from-emerald-500 to-green-500 text-white" },
  { icon: Code2, title: { en: "Developer Portal", bn: "ডেভেলপার পোর্টাল" }, detail: { en: "Scoped credentials, store integrations and webhooks.", bn: "API ক্রেডেনশিয়াল, স্টোর ইন্টিগ্রেশন এবং ওয়েবহুক।" }, phase: "Phase 3", color: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white" },
];

export default function MarketerProfile() {
  const { t } = usePartnerPrefs();
  const user = getFromLocalstorage("user");
  const suspended = user?.banned === true || Number(user?.banned) === 1;

  const profile = [
    [t("Name", "নাম"), user?.name],
    [t("Business Name", "ব্যবসার নাম"), user?.business_name],
    [t("Account Email", "অ্যাকাউন্ট ইমেইল"), user?.email],
    [t("Workspace Role", "ওয়ার্কস্পেস রোল"), t("Marketer Partner", "মার্কেটার পার্টনার")],
  ];

  return <div className="space-y-5">
    <PageHeading
      icon={BadgeCheck}
      title={t("Profile & Access", "প্রোফাইল ও অ্যাক্সেস")}
      description={t("Review your business identity and what information your partner account can see.", "আপনার ব্যবসায়িক পরিচয় এবং পার্টনার অ্যাকাউন্টের অ্যাক্সেস তথ্য দেখুন।")}
    />
    {/* Partner Portal F8: edit photo, logo, links, ad experience → level */}
    <PartnerProfileSettings />
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <section className={`${panel} p-5`} aria-labelledby="partner-business-profile">
        <SectionHeading id="partner-business-profile" title={t("Business Profile", "ব্যবসায়িক প্রোফাইল")} icon={BadgeCheck} tone="peach" />
        <dl className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
          {profile.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-0.5 break-words text-sm font-bold text-slate-900 dark:text-white">
                {value || t("Not provided", "তথ্য নেই")}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{t("Account status", "অ্যাকাউন্ট স্ট্যাটাস")}</span>
          <Badge status={suspended ? "inactive" : "active"}>
            {suspended ? t("Suspended", "স্থগিত") : t("Active", "সক্রিয়")}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{t("Business verification", "বিজনেস ভেরিফিকেশন")}</span>
          <Badge status="planned">{t("Not available yet", "এখনো চালু হয়নি")}</Badge>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t("Business verification and profile editing will be added separately from account access.", "বিজনেস ভেরিফিকেশন ও প্রোফাইল এডিটিং ফিচার পরবর্তী আপডেটে যুক্ত করা হবে।")}
        </p>
      </section>

      <section className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-5 transition-colors" aria-labelledby="partner-client-privacy">
        <SectionHeading id="partner-client-privacy" title={t("Client Access & Privacy", "ক্লায়েন্ট অ্যাক্সেস ও গোপনীয়তা")} icon={ShieldCheck} tone="mint" />
        <div className="mt-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <strong className="block text-slate-900 dark:text-white font-bold">{t("What you can see", "যা আপনি দেখতে পাবেন")}</strong>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              {t("Linked business names, partnership dates and aggregate product and order activity.", "সংযুক্ত ড্রপশিপারদের নাম, পার্টনারশিপ শুরু হওয়ার তারিখ এবং সামগ্রিক প্রোডাক্ট ও অর্ডার রিপোর্ট।")}
            </p>
          </div>
          <div>
            <strong className="block text-slate-900 dark:text-white font-bold">{t("What stays private", "যা সম্পূর্ণ গোপন থাকে")}</strong>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              {t("Client phone numbers, shopper records, delivery addresses and wallet balances.", "ক্লায়েন্টদের মোবাইল নম্বর, গ্রাহকদের বিস্তারিত তথ্য, ডেলিভারি ঠিকানা এবং ওয়ালেট ব্যালেন্স।")}
            </p>
          </div>
          <div>
            <strong className="block text-slate-900 dark:text-white font-bold">{t("How access starts", "সংযুক্তি যেভাবে শুরু হয়")}</strong>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              {t("Send an invitation. The client reviews what they’ll share and chooses whether to accept from their own account.", "একটি ইনভাইটেশন পাঠান। ক্লায়েন্ট তার অ্যাকাউন্ট থেকে পর্যালোচনা করে সংযোগের সম্মতি প্রদান করতে পারবেন।")}
            </p>
          </div>
        </div>
      </section>
    </div>

    <section className={`${panel} p-5`} aria-labelledby="partner-roadmap">
      <SectionHeading id="partner-roadmap" title={t("Workspace Roadmap", "ওয়ার্কস্পেস রোডম্যাপ")} description={t("Planned features for upcoming releases.", "পরবর্তী আপডেটে আসার অপেক্ষায় থাকা ফিচারসমূহ।")} icon={Map} tone="sky" />
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {roadmapData.map(({ icon: Icon, title, detail, phase, color }) => (
          <li key={title.en} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 transition-colors">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}>
                <Icon size={17} aria-hidden="true" />
              </span>
              <Badge status="planned">{phase}</Badge>
            </div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{t(title.en, title.bn)}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t(detail.en, detail.bn)}</p>
          </li>
        ))}
      </ul>
    </section>
  </div>;
}
