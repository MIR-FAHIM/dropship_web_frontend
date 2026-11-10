import { BadgeCheck, Code2, LockKeyhole, Map, MousePointerClick, ShieldCheck, Store } from "lucide-react";
import { getFromLocalstorage } from "../../utils/localstorage.utils";
import { Badge, PageHeading, SectionHeading } from "./partnerWorkspace";
import { panel } from "./partnerWorkspaceData";

const roadmap = [
  { icon: MousePointerClick, title: "Engagement", detail: "Activity trends and client follow-up suggestions.", phase: "Phase 2", color: "bg-sky-100 text-sky-900" },
  { icon: Store, title: "Partner Marketplace", detail: "Service listings, listing approvals and service orders.", phase: "Phase 2", color: "bg-orange-100 text-orange-900" },
  { icon: LockKeyhole, title: "Privacy & Security", detail: "Consent history, access logs and session settings.", phase: "Phase 2", color: "bg-emerald-100 text-emerald-900" },
  { icon: Code2, title: "Developer Portal", detail: "Scoped credentials, store integrations and webhooks.", phase: "Phase 3", color: "bg-violet-100 text-violet-900" },
];

export default function MarketerProfile() {
  const user = getFromLocalstorage("user");
  const suspended = user?.banned === true || Number(user?.banned) === 1;
  const profile = [
    ["Name", user?.name],
    ["Business name", user?.business_name],
    ["Account email", user?.email],
    ["Workspace role", "Marketer"],
  ];
  return <div className="space-y-5">
    <PageHeading icon={BadgeCheck} title="Profile & Access" description="Review your business identity and what information your partner account can see." />
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <section className={`${panel} p-5`} aria-labelledby="partner-business-profile">
        <SectionHeading id="partner-business-profile" title="Business profile" icon={BadgeCheck} />
        <dl className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">{profile.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{value || "Not provided"}</dd></div>)}</dl>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-violet-100 pt-4"><span className="text-sm font-semibold">Account status</span><Badge status={suspended ? "inactive" : "active"}>{suspended ? "Suspended" : "Active"}</Badge></div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">Business verification</span><Badge status="planned">Not available yet</Badge></div>
        <p className="mt-3 text-xs text-slate-600">Business verification and profile editing will be added separately from account access.</p>
      </section>
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="partner-client-privacy">
        <SectionHeading id="partner-client-privacy" title="Client access" icon={ShieldCheck} tone="mint" />
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
          <p><strong className="block text-slate-900">What you can see</strong>Linked business names, partnership dates and aggregate product and order activity.</p>
          <p><strong className="block text-slate-900">What stays private</strong>Client phone numbers, shopper records, delivery addresses and wallet balances.</p>
          <p><strong className="block text-slate-900">How access starts</strong>Send an invitation. The client reviews what they’ll share and chooses whether to accept from their own account.</p>
        </div>
      </section>
    </div>
    <section className={`${panel} p-5`} aria-labelledby="partner-roadmap">
      <SectionHeading id="partner-roadmap" title="Workspace roadmap" description="Planned features for upcoming releases." icon={Map} tone="sky" />
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{roadmap.map(({ icon: Icon, title, detail, phase, color }) => <li key={title} className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
        <div className="mb-2 flex items-center justify-between gap-2"><span className={`grid size-9 place-items-center rounded-lg ${color}`}><Icon size={17} aria-hidden="true" /></span><Badge status="planned">{phase}</Badge></div>
        <p className="text-sm font-bold">{title}</p><p className="text-sm text-slate-600">{detail}</p>
      </li>)}</ul>
    </section>
  </div>;
}
