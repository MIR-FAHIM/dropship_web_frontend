import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Activity, ArrowUpRight, CalendarClock, ChevronRight, ListTodo, Mail, MailCheck, MousePointerClick, PackageCheck, Rocket, UserPlus, Users } from "lucide-react";
import { useGetMarketerClientsQuery, useGetMarketerInvitationsQuery } from "../../../redux/features/marketer";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { Badge, Metric, PageHeading, SectionHeading, SectionLink, StateMessage } from "../partnerWorkspace";
import { activityLabels, clientName, field, formatCount, invitationPageSize, invitationStatus, isInvitationExpiring, mintAction, panel, periods, workspacePath } from "../partnerWorkspaceData";

const referrals = `${workspacePath}/invitations`;
const clientsUrl = `${workspacePath}/clients`;
const taskLink = "flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700";
const clientColors = ["bg-violet-100 text-violet-900", "bg-sky-100 text-sky-900", "bg-orange-100 text-orange-900"];

function Overview() {
  const [period, setPeriod] = useState("30d");
  const user = getFromLocalstorage("user");
  const clientsQuery = useGetMarketerClientsQuery({ period, page: 1, per_page: 4, sort_by: "joined", sort_direction: "desc" });
  const invitesQuery = useGetMarketerInvitationsQuery({ page: 1, per_page: invitationPageSize });
  const snapshot = clientsQuery.currentData?.data;
  const invitesPage = invitesQuery.currentData?.data;
  const clients = snapshot?.data ?? [];
  const summary = snapshot?.summary;
  const invites = invitesPage?.data ?? [];
  const now = Date.now();
  const invitationStatuses = invites.map(invite => invitationStatus(invite, now));
  const pending = invitationStatuses.filter(status => status === "pending").length;
  const accepted = invitationStatuses.filter(status => status === "accepted").length;
  const expiring = invites.filter(invite => isInvitationExpiring(invite, now)).length;
  const completeInvites = invitesPage && Number(invitesPage.last_page) === 1;
  const inactive = summary?.distribution?.inactive;
  const clientsHref = `${clientsUrl}?period=${period}`;
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="grid gap-4 [reading-flow:grid-rows] sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="order-1 lg:col-span-2">
        <PageHeading featured icon={Rocket} eyebrow="Partner Overview" title={firstName ? `Welcome back, ${firstName}.` : "Your partner overview"}
          description="Grow your client network and see who needs a follow-up today."
          action={<Link to={`${referrals}#invite-client`} className={mintAction}><UserPlus size={17} aria-hidden="true" /> Invite a client</Link>} />
      </div>

      <section className={`${panel} order-2 self-start p-4 sm:p-5 lg:order-3`} aria-labelledby="partner-attention">
        <SectionHeading id="partner-attention" title="Needs your attention" description="Start with invitations close to expiry." icon={ListTodo} tone="peach" />
        <div className="mt-4 space-y-2">
          <Link to={`${referrals}?status=expiring#invitation-history`} className={`${taskLink} bg-orange-50 text-orange-950 hover:bg-orange-100`}>
            <CalendarClock size={19} className="shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Invitations expiring soon</strong>
              <span className="block text-xs">{!invitesPage ? "Invitation data unavailable" : `${formatCount(expiring)} due within 7 days${completeInvites ? "" : " · latest batch"}`}</span>
            </span>
            <ArrowUpRight size={17} className="shrink-0" aria-hidden="true" />
          </Link>
          <Link to={`${clientsHref}&activity=inactive`} className={`${taskLink} bg-violet-50 text-violet-950 hover:bg-violet-100`}>
            <Users size={19} className="shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <strong className="block text-sm">Clients to check in on</strong>
              <span className="block text-xs">{inactive == null ? "Client activity unavailable" : `${formatCount(inactive)} with no activity in 30 days`}</span>
            </span>
            <ArrowUpRight size={17} className="shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="order-3 lg:order-2 lg:col-span-2" aria-labelledby="partner-business-overview" aria-busy={clientsQuery.isFetching || invitesQuery.isFetching}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div><h2 id="partner-business-overview" className="text-lg font-bold tracking-tight text-violet-950">Performance at a glance</h2><p className="text-sm text-slate-600">Track engagement across your linked businesses.</p></div>
          <label className="flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-950">Orders &amp; clicks
            <select className={`${field} !w-auto`} value={period} onChange={event => setPeriod(event.target.value)}>
              {Object.entries(periods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        {(clientsQuery.isError || invitesQuery.isError) && <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
          Some metrics could not be loaded. <button type="button" className="font-semibold underline" onClick={() => { if (clientsQuery.isError) clientsQuery.refetch(); if (invitesQuery.isError) invitesQuery.refetch(); }}>Try again</button>
        </div>}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric icon={Users} label="Active clients" value={summary?.recently_active_clients} hint={summary ? `Past 7 days · ${formatCount(summary.total_clients)} linked` : "Past 7 days"} />
          <Metric icon={PackageCheck} label="Delivered orders" value={summary?.total_delivered_orders} hint={periods[period]} tone="mint" />
          <Metric icon={MousePointerClick} label="Product clicks" value={summary?.total_product_clicks} hint={periods[period]} tone="sky" />
          <Metric icon={Mail} label="Open invitations" value={invitesPage ? pending : undefined} hint={invitesPage && !completeInvites ? `Latest ${invites.length} invitations only` : "Awaiting acceptance"} tone="peach" />
        </div>
      </section>

      <section className={`${panel} order-4 p-4 sm:p-5`} aria-labelledby="partner-recent-clients">
        <SectionHeading id="partner-recent-clients" title="Client pulse" description="Recently linked businesses" icon={Activity}
          action={<SectionLink to={clientsHref}>View clients</SectionLink>} />
        {clientsQuery.isFetching && !snapshot ? <StateMessage loading title="Loading clients…" />
          : clientsQuery.isError && !snapshot ? <StateMessage title="Client list unavailable" retry={clientsQuery.refetch} />
          : !clients.length ? <StateMessage title="No linked clients yet" detail="Clients appear here after they accept your invitation." />
          : <ul className="mt-3 divide-y divide-violet-100">{clients.map((client, index) => {
            const name = clientName(client);
            const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();
            const activity = client.metrics?.activity_status;
            return (
              <li key={client.id}>
                <Link to={`${clientsHref}&sort=joined&client=${encodeURIComponent(client.id)}`} className="group flex min-h-14 min-w-0 items-center gap-2 rounded-lg py-2 text-sm text-slate-900 hover:bg-violet-50 focus-visible:outline-violet-700 sm:gap-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${clientColors[index % clientColors.length]}`} aria-hidden="true">{initials}</span>
                  <span className="min-w-0 flex-1 break-words"><strong className="group-hover:text-violet-800">{name}</strong><small className="block text-xs text-slate-600">{formatCount(client.metrics?.delivered_orders)} delivered</small></span>
                  <Badge status={activity}>{activityLabels[activity] || "Unknown"}</Badge>
                  <ChevronRight size={16} className="shrink-0 text-violet-700" aria-hidden="true" />
                </Link>
              </li>
            );
          })}</ul>}
      </section>

      <section className={`${panel} order-5 flex flex-wrap items-center gap-x-5 gap-y-1 p-4 sm:p-5 lg:col-span-2`} aria-labelledby="partner-referral-progress">
        <SectionHeading id="partner-referral-progress" title="Referral progress" icon={MailCheck} tone="mint"
          description={invitesPage && !completeInvites ? "Latest invitation batch" : "Invitation status"} />
        {invitesPage && <div className="flex flex-wrap items-center gap-2">
          <Link to={`${referrals}?status=pending#invitation-history`} className="inline-flex min-h-11 items-center rounded-lg hover:underline focus-visible:outline-violet-700"><Badge status="pending">{formatCount(pending)} awaiting acceptance</Badge></Link>
          <Link to={`${referrals}?status=accepted#invitation-history`} className="inline-flex min-h-11 items-center rounded-lg hover:underline focus-visible:outline-violet-700"><Badge status="accepted">{formatCount(accepted)} accepted</Badge></Link>
        </div>}
        <div className="sm:ml-auto"><SectionLink to={`${referrals}#invitation-history`}>Review invitations</SectionLink></div>
      </section>
    </div>
  );
}

export default function MarketerDashboard() {
  const [params] = useSearchParams();
  const legacyClient = params.get("client_id");
  if (legacyClient) return <Navigate replace to={`${clientsUrl}?client=${encodeURIComponent(legacyClient)}`} />;
  return <Overview />;
}
