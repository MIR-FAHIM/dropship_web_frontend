import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { History, Mail, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCreateMarketerInvitationMutation, useGetMarketerInvitationsQuery, useRevokeMarketerInvitationMutation } from "../../../redux/features/marketer";
import { Badge, PageHeading, Pagination, SectionHeading, StateMessage } from "../partnerWorkspace";
import { field, formatDate, invitationPageSize, invitationStatus, isInvitationExpiring, panel, primary, secondary, workspacePath } from "../partnerWorkspaceData";

const statuses = { pending: "Pending", accepted: "Accepted", expired: "Expired", revoked: "Revoked" };
const filters = { all: "All statuses", expiring: "Expiring within 7 days", ...statuses };
const statusNotes = { pending: "Awaiting the client’s consent", accepted: "Partnership accepted", expired: "Invitation can no longer be used", revoked: "Invitation cancelled" };

export default function MarketerInvitations() {
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const selectedStatus = params.get("status");
  const statusFilter = Object.hasOwn(filters, selectedStatus) ? selectedStatus : "all";
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
      toast.success("Invitation emailed. The client can review it and accept from their account.");
    } catch (error) {
      setSendError(error?.data?.errors?.email?.[0] || error?.data?.message || "Could not send the invitation. Please try again.");
    }
  };

  const handleRevoke = async id => {
    if (isRevoking) return;
    try {
      await revokeInvitation({ id }).unwrap();
      setConfirmRevoke(null);
      toast.success("Invitation revoked.");
    } catch (error) {
      toast.error(error?.data?.message || "Could not revoke the invitation.");
    }
  };

  return <div className="space-y-5">
    <PageHeading icon={Mail} title="Referrals & Invitations" description="Invite a business and track its response. Once it accepts, you can find the relationship in My Clients." />
    <div className="grid items-start gap-4 xl:grid-cols-[1.4fr_1fr]">
      <section id="invite-client" className={`${panel} p-4 sm:p-5`} aria-labelledby="partner-invite-heading">
        <SectionHeading id="partner-invite-heading" title="Invite a client" icon={Mail}
          description="Send an invitation code to the email your client uses to sign in." />
        <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={handleSend}>
          <label className="min-w-[min(100%,12rem)] flex-1 text-sm font-semibold text-slate-700">Client email address
            <input id="partner-invite-email" type="email" autoComplete="off" maxLength={191} value={email} onChange={event => { setEmail(event.target.value); setSendError(""); }} required placeholder="client@example.com" className={`${field} mt-1`} aria-invalid={Boolean(sendError)} aria-describedby={sendError ? "partner-invite-error" : undefined} />
          </label>
          <button type="submit" disabled={isSending} className={primary}><Send size={16} aria-hidden="true" />{isSending ? "Sending…" : "Send invitation"}</button>
        </form>
        {sendError && <p id="partner-invite-error" role="alert" className="mt-2 text-sm text-red-700">{sendError}</p>}
      </section>
      <aside className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
        <SectionHeading title="What happens next?" icon={ShieldCheck} tone="mint" />
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
          <li>The client receives a code that expires in 7 days.</li><li>They sign in and review what information you can see.</li><li>Once they accept, the relationship appears in <Link to={`${workspacePath}/clients`} className="font-semibold text-emerald-900 underline decoration-emerald-500 underline-offset-2">My Clients</Link>.</li>
        </ol>
        <p className="mt-3 border-t border-emerald-200 pt-3 text-xs text-slate-700">Acceptance records the client’s consent to connect.</p>
      </aside>
    </div>
    <section id="invitation-history" tabIndex={-1} className={`${panel} scroll-mt-4 focus-visible:outline-violet-700`} aria-labelledby="partner-invitation-history">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-t-2xl border-b border-violet-100 bg-violet-50/70 p-4 sm:p-5">
        <SectionHeading id="partner-invitation-history" title="Invitation history" icon={History} tone="peach"
          description="Review invitations you’ve sent and revoke pending ones." />
        <label className="text-xs font-semibold text-violet-950">Status on this page<select className={`${field} mt-1`} value={statusFilter} onChange={event => updateFilter("status", event.target.value === "all" ? null : event.target.value)}>
          {Object.entries(filters).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
      </div>
      {query.isFetching && !result ? <StateMessage loading title="Loading invitations…" />
        : query.isError ? <StateMessage title="Invitations could not be loaded" retry={query.refetch} />
        : !visible.length ? <StateMessage title={statusFilter === "all" ? "No invitations on this page" : "No matching invitations on this page"} detail={statusFilter === "all" ? "Send your first invitation above to get started." : "Change the status filter or view another page."} />
        : <ul className="divide-y divide-violet-100">{visible.map(({ invite, status }) => <li key={invite.id} className="px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0"><p className="break-all text-sm font-semibold text-slate-900">{invite.email || "Invitation"}</p><p className="mt-1 text-xs text-slate-600">Sent {formatDate(invite.created_at)}{(status === "pending" || status === "expired") && ` · ${status === "expired" ? "Expired" : "Expires"} ${formatDate(invite.expires_at)}`}{status === "accepted" && invite.accepted_at && ` · Accepted ${formatDate(invite.accepted_at)}`}</p></div>
            <div className="flex flex-wrap items-center gap-2"><Badge status={status}>{statuses[status]}</Badge>
              {status === "pending" && confirmRevoke !== invite.id && <button type="button" className={secondary} onClick={() => setConfirmRevoke(invite.id)} disabled={isRevoking}>Revoke</button>}
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-600">{statusNotes[status]}</p>
          {status === "pending" && confirmRevoke === invite.id && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 p-3">
            <p className="mr-auto text-sm text-amber-950">Revoke this invitation? The code will stop working.</p>
            <button type="button" className={secondary} disabled={isRevoking} onClick={() => setConfirmRevoke(null)}>Keep invitation</button>
            <button type="button" className={primary} disabled={isRevoking} onClick={() => handleRevoke(invite.id)}>{isRevoking ? "Revoking…" : "Confirm revoke"}</button>
          </div>}
        </li>)}</ul>}
      {result && !query.isError && <Pagination page={page} lastPage={lastPage} onPage={next => updateFilter("page", next > 1 ? next : null)} />}
    </section>
  </div>;
}
