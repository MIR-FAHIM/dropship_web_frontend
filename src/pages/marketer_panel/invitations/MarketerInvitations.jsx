import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { History, Mail, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCreateMarketerInvitationMutation, useGetMarketerInvitationsQuery, useRevokeMarketerInvitationMutation } from "../../../redux/features/marketer";
import { Badge, PageHeading, Pagination, SectionHeading, StateMessage } from "../partnerWorkspace";
import { field, formatDate, invitationPageSize, invitationStatus, isInvitationExpiring, panel, primary, secondary, workspacePath } from "../partnerWorkspaceData";
import { usePartnerPrefs } from "../partnerPrefs";

const statuses = {
  pending: { en: "Pending", bn: "অপেক্ষমাণ" },
  accepted: { en: "Accepted", bn: "গৃহীত" },
  expired: { en: "Expired", bn: "মেয়াদোত্তীর্ণ" },
  revoked: { en: "Revoked", bn: "বাতিলকৃত" },
};

const filterKeys = ["all", "expiring", "pending", "accepted", "expired", "revoked"];

export default function MarketerInvitations() {
  const { t, lang } = usePartnerPrefs();
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const selectedStatus = params.get("status");
  const statusFilter = filterKeys.includes(selectedStatus) ? selectedStatus : "all";
  const [email, setEmail] = useState("");
  const [sendError, setSendError] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const query = useGetMarketerInvitationsQuery({ page, per_page: invitationPageSize });
  const [createInvitation, { isLoading: isSending }] = useCreateMarketerInvitationMutation();
  const [revokeInvitation, { isLoading: isRevoking }] = useRevokeMarketerInvitationMutation();
  const result = query.currentData?.data;
  const lastPage = Number(result?.last_page || 1);
  const invitations = result?.data ?? [];
  const now = Date.now();
  const visible = invitations.map(invite => ({ invite, status: invitationStatus(invite, now) }))
    .filter(({ invite, status }) => statusFilter === "expiring" ? isInvitationExpiring(invite, now) : statusFilter === "all" || status === statusFilter);
  if (statusFilter === "expiring") {
    visible.sort((a, b) => Date.parse(a.invite.expires_at) - Date.parse(b.invite.expires_at));
  }

  const statusNote = (status) => {
    switch (status) {
      case "pending": return t("Awaiting the client’s consent", "ক্লায়েন্টের সম্মতির অপেক্ষায় রয়েছে");
      case "accepted": return t("Partnership accepted", "পার্টনারশিপ সফলভাবে শুরু হয়েছে");
      case "expired": return t("Invitation can no longer be used", "ইনভাইটেশনের মেয়াদ শেষ হয়ে গেছে");
      case "revoked": return t("Invitation cancelled", "ইনভাইটেশনটি বাতিল করা হয়েছে");
      default: return "";
    }
  };

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value == null) next.delete(key);
    else next.set(key, String(value));
    setConfirmRevoke(null);
    navigate({ search: next.toString(), hash });
  };

  const handleSend = async event => {
    event.preventDefault();
    if (isSending || !email.trim()) return;
    setSendError("");
    try {
      await createInvitation({ email: email.trim() }).unwrap();
      setEmail("");
      setConfirmRevoke(null);
      navigate({ search: "", hash }, { replace: true });
      toast.success(t("Invitation emailed. The client can review it and accept from their account.", "ইনভাইটেশন ইমেইল পাঠানো হয়েছে। ক্লায়েন্ট তার অ্যাকাউন্ট থেকে দেখে গ্রহণ করতে পারবেন।"));
    } catch (error) {
      setSendError(error?.data?.errors?.email?.[0] || error?.data?.message || t("Could not send the invitation. Please try again.", "ইনভাইটেশন পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"));
    }
  };

  const handleRevoke = async id => {
    if (isRevoking) return;
    try {
      await revokeInvitation({ id }).unwrap();
      setConfirmRevoke(null);
      toast.success(t("Invitation revoked.", "ইনভাইটেশন বাতিল করা হয়েছে।"));
    } catch (error) {
      toast.error(error?.data?.message || t("Could not revoke the invitation.", "ইনভাইটেশন বাতিল করা যায়নি।"));
    }
  };

  return <div className="space-y-5">
    <PageHeading
      icon={Mail}
      title={t("Referrals & Invitations", "রেফারেল ও ইনভাইটেশন")}
      description={t("Invite a business and track its response. Once it accepts, you can find the relationship in My Clients.", "নতুন ড্রপশিপার ইনভাইট করুন এবং রেসপন্স ট্র্যাক করুন। গ্রহণ করলে 'আমার ক্লায়েন্ট' তালিকায় যুক্ত হবে।")}
    />
    <div className="grid items-start gap-4 xl:grid-cols-[1.4fr_1fr]">
      <section id="invite-client" className={`${panel} p-4 sm:p-5`} aria-labelledby="partner-invite-heading">
        <SectionHeading
          id="partner-invite-heading"
          title={t("Invite a client", "ক্লায়েন্ট ইনভাইট করুন")}
          icon={Mail}
          tone="purple"
          description={t("Send an invitation code to the email your client uses to sign in.", "ক্লায়েন্টের লগইন ইমেইলে ইনভাইটেশন কোড পাঠান।")}
        />
        <form className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5" onSubmit={handleSend}>
          <label className="min-w-0 flex-1 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            {t("Client email address", "ক্লায়েন্টের ইমেইল এড্রেস")}
            <input
              id="partner-invite-email"
              type="email"
              autoComplete="off"
              maxLength={191}
              value={email}
              onChange={event => { setEmail(event.target.value); setSendError(""); }}
              required
              placeholder="client@example.com"
              className={`${field} mt-1`}
              aria-invalid={Boolean(sendError)}
              aria-describedby={sendError ? "partner-invite-error" : undefined}
            />
          </label>
          <button type="submit" disabled={isSending} className={primary}>
            <Send size={16} aria-hidden="true" />
            {isSending ? t("Sending…", "পাঠানো হচ্ছে…") : t("Send invitation", "ইনভাইটেশন পাঠান")}
          </button>
        </form>
        {sendError && <p id="partner-invite-error" role="alert" className="mt-2 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">{sendError}</p>}
      </section>

      <aside className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 sm:p-5 transition-colors">
        <SectionHeading title={t("What happens next?", "এরপর কী ঘটবে?")} icon={ShieldCheck} tone="mint" />
        <ol className="mt-2.5 list-decimal space-y-1.5 pl-5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>{t("The client receives a code that expires in 7 days.", "ক্লায়েন্ট একটি কোড পাবেন যার মেয়াদ থাকবে ৭ দিন।")}</li>
          <li>{t("They sign in and review what information you can see.", "তারা সাইন ইন করে দেখতে পারবেন আপনি কী তথ্য দেখতে পাবেন।")}</li>
          <li>
            {t("Once they accept, the relationship appears in", "তারা গ্রহণ করলে সংযুক্তিটি দেখা যাবে")} <Link to={`${workspacePath}/clients`} className="font-bold text-emerald-800 dark:text-emerald-300 underline decoration-emerald-500 underline-offset-2">{t("My Clients", "আমার ক্লায়েন্ট")}</Link> {t("tab.", "ট্যাবে।")}
          </li>
        </ol>
        <p className="mt-3 border-t border-emerald-200/80 dark:border-emerald-900/60 pt-3 text-[11px] text-slate-600 dark:text-slate-400">
          {t("Acceptance records the client’s consent to connect.", "ইনভাইটেশন গ্রহণের মাধ্যমে ক্লায়েন্ট সংযুক্তির সম্মতি প্রদান করে।")}
        </p>
      </aside>
    </div>

    <section id="invitation-history" tabIndex={-1} className={`${panel} scroll-mt-4 focus-visible:outline-teal-700`} aria-labelledby="partner-invitation-history">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-white p-4 dark:border-slate-800 dark:from-violet-950/40 dark:via-slate-900 dark:to-slate-900 sm:p-5">
        <SectionHeading
          id="partner-invitation-history"
          title={t("Invitation History", "ইনভাইটেশন ইতিহাস")}
          icon={History}
          tone="peach"
          description={t("Review invitations you’ve sent and revoke pending ones.", "আপনার প্রেরিত ইনভাইটেশনসমূহ দেখুন এবং পেন্ডিং ইনভাইটেশন বাতিল করুন।")}
        />
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>{t("Filter:", "ফিল্টার:")}</span>
          <select className={`${field} py-1.5 text-xs min-h-9 w-auto`} value={statusFilter} onChange={event => updateFilter("status", event.target.value === "all" ? null : event.target.value)}>
            <option value="all">{t("All statuses", "সব স্ট্যাটাস")}</option>
            <option value="expiring">{t("Expiring within 7 days", "৭ দিনের মধ্যে মেয়াদ শেষ")}</option>
            <option value="pending">{t("Pending", "অপেক্ষমাণ")}</option>
            <option value="accepted">{t("Accepted", "গৃহীত")}</option>
            <option value="expired">{t("Expired", "মেয়াদোত্তীর্ণ")}</option>
            <option value="revoked">{t("Revoked", "বাতিলকৃত")}</option>
          </select>
        </label>
      </div>

      {query.isFetching && !result ? <StateMessage loading title={t("Loading invitations…", "ইনভাইটেশন লোড হচ্ছে…")} />
        : query.isError ? <StateMessage title={t("Invitations could not be loaded", "ইনভাইটেশন লোড করা যায়নি")} retry={query.refetch} />
        : !visible.length ? <StateMessage title={statusFilter === "all" ? t("No invitations sent yet", "এখনো কোনো ইনভাইটেশন পাঠানো হয়নি") : t("No matching invitations on this page", "এই ফিল্টারে কোনো ইনভাইটেশন নেই")} detail={statusFilter === "all" ? t("Send your first invitation above to get started.", "শুরু করতে উপরে আপনার প্রথম ক্লায়েন্টকে ইনভাইট করুন।") : t("Change the status filter or view another page.", "ফিল্টার পরিবর্তন করুন বা অন্য পৃষ্ঠা দেখুন।")} />
        : <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">{visible.map(({ invite, status }) => (
          <li key={invite.id} className="p-4 sm:px-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="break-all font-bold text-slate-900 dark:text-white text-sm">{invite.email || t("Invitation", "ইনভাইটেশন")}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t("Sent", "প্রেরিত")} {formatDate(invite.created_at, lang)}
                  {(status === "pending" || status === "expired") && ` · ${status === "expired" ? t("Expired", "মেয়াদ শেষ") : t("Expires", "মেয়াদ শেষ হবে")} ${formatDate(invite.expires_at, lang)}`}
                  {status === "accepted" && invite.accepted_at && ` · ${t("Accepted", "গৃহীত")} ${formatDate(invite.accepted_at, lang)}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge status={status}>{t(statuses[status]?.en || status, statuses[status]?.bn || status)}</Badge>
                {status === "pending" && confirmRevoke !== invite.id && (
                  <button type="button" className={secondary} onClick={() => setConfirmRevoke(invite.id)} disabled={isRevoking}>
                    {t("Revoke", "বাতিল")}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{statusNote(status)}</p>

            {status === "pending" && confirmRevoke === invite.id && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 p-3">
                <p className="mr-auto text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200">
                  {t("Revoke this invitation? The code will stop working.", "এই ইনভাইটেশনটি বাতিল করবেন? কোডটি আর কাজ করবে না।")}
                </p>
                <button type="button" className={secondary} disabled={isRevoking} onClick={() => setConfirmRevoke(null)}>
                  {t("Keep invitation", "ইনভাইটেশন রাখুন")}
                </button>
                <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50" disabled={isRevoking} onClick={() => handleRevoke(invite.id)}>
                  {isRevoking ? t("Revoking…", "বাতিল হচ্ছে…") : t("Confirm revoke", "বাতিল নিশ্চিত করুন")}
                </button>
              </div>
            )}
          </li>
        ))}</ul>}
      {result && !query.isError && <Pagination page={page} lastPage={lastPage} onPage={next => updateFilter("page", next > 1 ? next : null)} />}
    </section>
  </div>;
}
