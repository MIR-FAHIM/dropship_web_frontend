/* eslint-disable react/prop-types */
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, MousePointerClick, Package, PackageCheck, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useGetMarketerClientsQuery } from "../../../redux/features/marketer";
import { Badge, Metric, PageHeading, Pagination, SectionHeading, StateMessage } from "../partnerWorkspace";
import { activityLabels, clientName, field, formatCount, formatDate, mintAction, panel, periods, secondary, workspacePath } from "../partnerWorkspaceData";

const sorting = { joined: "Recently linked", clicks: "Most product clicks", orders: "Most orders placed", delivered: "Most delivered orders", last_login: "Most recently active" };
const invitationsPath = `${workspacePath}/invitations#invite-client`;

function ClientDetails({ client, period, close }) {
  const metrics = client.metrics;
  const activity = metrics?.activity_status;
  return <div className="space-y-5">
    <Link to={close} className={secondary}><ArrowLeft size={16} aria-hidden="true" /> Back to My Clients</Link>
    <PageHeading icon={Users} eyebrow="My Clients" title={clientName(client)} description={`Performance · ${periods[period]}`} action={<Badge status={activity}>{activityLabels[activity] || "Unknown"}</Badge>} />
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-labelledby="partner-client-performance">
      <h2 id="partner-client-performance" className="sr-only">Client performance</h2>
      <Metric icon={MousePointerClick} label="Product clicks" value={metrics?.product_clicks} hint={periods[period]} tone="sky" />
      <Metric icon={Package} label="Orders placed" value={metrics?.placed_orders} hint={periods[period]} tone="peach" />
      <Metric icon={PackageCheck} label="Delivered orders" value={metrics?.delivered_orders} hint={periods[period]} tone="mint" />
    </section>
    <section className={`${panel} p-5`} aria-labelledby="partner-client-access">
      <SectionHeading id="partner-client-access" title="Relationship & access" icon={ShieldCheck} tone="mint" />
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><dt className="text-sm text-slate-600">Partnership accepted</dt><dd className="font-semibold text-slate-900">{formatDate(client.accepted_at)}</dd></div>
        <div><dt className="text-sm text-slate-600">Last recorded account activity</dt><dd className="font-semibold text-slate-900">{formatDate(metrics?.last_login_at)}</dd></div>
      </dl>
      <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-950">Partners can see aggregate activity. Customer information and client wallet balances stay private.</p>
    </section>
  </div>;
}

export default function MarketerClients() {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const search = params.get("search") || "";
  const period = Object.hasOwn(periods, params.get("period")) ? params.get("period") : "30d";
  const activity = Object.hasOwn(activityLabels, params.get("activity")) ? params.get("activity") : "all";
  const sort = Object.hasOwn(sorting, params.get("sort")) ? params.get("sort") : "joined";
  const direction = params.get("direction") === "asc" ? "asc" : "desc";
  const minOrders = /^\d+$/.test(params.get("min_orders") || "") ? params.get("min_orders") : "";
  const selected = params.get("client");
  const query = useGetMarketerClientsQuery({ page, per_page: 20, search, activity, period, min_orders: minOrders, sort_by: sort, sort_direction: direction }, { refetchOnMountOrArgChange: true });
  const result = query.currentData?.data;
  const clients = result?.data ?? [];
  const lastPage = Number(result?.last_page ?? 1);
  const selectedClient = clients.find(client => String(client.id) === selected);

  const linkFor = (id) => {
    const next = new URLSearchParams(params);
    if (id == null) next.delete("client");
    else next.set("client", String(id));
    const search = next.toString();
    return `${workspacePath}/clients${search ? `?${search}` : ""}`;
  };
  const update = (updates, resetPage = true) => {
    const next = new URLSearchParams(params);
    if (resetPage) next.delete("page");
    next.delete("client");
    Object.entries(updates).forEach(([key, value]) => value == null || value === "" ? next.delete(key) : next.set(key, String(value)));
    setParams(next);
  };

  if (selected) {
    if (query.isFetching) return <StateMessage loading title="Checking client access…" />;
    if (query.isError) return <StateMessage title="Client details could not be loaded" retry={query.refetch} action={<Link to={linkFor()} className={secondary}>Back to My Clients</Link>} />;
    if (selectedClient) return <ClientDetails client={selectedClient} period={period} close={linkFor()} />;
    return <div className={panel}><StateMessage title="Client unavailable in this view" detail="The relationship may have ended, or the client may be outside this page or filter. Find the client in My Clients to open their details." action={<Link to={linkFor()} className={secondary}>Back to My Clients</Link>} /></div>;
  }

  return <div className="space-y-5">
    <PageHeading icon={Users} title="My Clients" description="Find linked businesses and review their activity. Pending invitations are tracked separately."
      action={<Link to={invitationsPath} className={mintAction}><UserPlus size={17} aria-hidden="true" /> Invite a client</Link>} />
    <section className={panel} aria-labelledby="partner-client-list">
      <div className="space-y-4 rounded-t-2xl border-b border-violet-100 bg-violet-50/70 p-4 sm:p-5">
        <SectionHeading id="partner-client-list" title="Client directory" icon={Users}
          action={result && <Badge status="planned">{formatCount(result.total)} matching clients</Badge>} />
        <form key={search} className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); update({ search: String(new FormData(event.currentTarget).get("search") || "").trim() }); }}>
          <label className="min-w-0 flex-1"><span className="sr-only">Search by business or client name</span><input name="search" type="search" className={field} placeholder="Search by business or client name" defaultValue={search} /></label>
          <button type="submit" className={secondary}><Search size={16} aria-hidden="true" /> Search</button>
        </form>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <label className="text-xs font-semibold text-slate-700">Activity<select className={`${field} mt-1`} value={activity} onChange={event => update({ activity: event.target.value === "all" ? null : event.target.value })}>
            <option value="all">All activity</option>{Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label className="text-xs font-semibold text-slate-700">Period<select className={`${field} mt-1`} value={period} onChange={event => update({ period: event.target.value })}>
            {Object.entries(periods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label className="col-span-2 text-xs font-semibold text-slate-700 lg:col-span-1">Sort by<select className={`${field} mt-1`} value={sort} onChange={event => update({ sort: event.target.value, direction: null })}>
            {Object.entries(sorting).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
        </div>
        <details className="rounded-xl border border-violet-200 bg-white px-3 py-2">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">More filters{(minOrders || direction === "asc") && " · applied"}</summary>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <form key={minOrders} className="flex items-end gap-2" onSubmit={event => { event.preventDefault(); update({ min_orders: new FormData(event.currentTarget).get("min") }); }}>
              <label className="text-xs font-semibold text-slate-700">Minimum delivered orders<input name="min" type="number" min="0" max="999999999" step="1" defaultValue={minOrders} className={`${field} mt-1`} /></label><button type="submit" className={secondary}>Apply</button>
            </form>
            <button type="button" className={secondary} onClick={() => update({ direction: direction === "asc" ? null : "asc" })}>{direction === "asc" ? "Use default sort order" : "Reverse sort order"}</button>
            <button type="button" className={secondary} onClick={() => setParams({})}>Reset filters</button>
          </div>
        </details>
        <p className="text-xs text-slate-600">Activity is based on the last recorded account activity: active within 7 days, moderate within 30 days, otherwise inactive.</p>
      </div>
      {query.isFetching ? <StateMessage loading title="Loading clients…" />
        : query.isError ? <StateMessage title="Clients could not be loaded" retry={query.refetch} />
        : !clients.length ? <StateMessage title={search || activity !== "all" || minOrders ? "No matching clients" : "No clients on this page"} detail="Clear the filters or send an invitation to link a new business." action={<Link to={invitationsPath} className={secondary}>Open invitations</Link>} />
        : <>
          <div className="hidden overflow-x-auto lg:block"><table className="w-full text-left text-sm">
            <thead className="bg-violet-100/70 text-xs text-violet-950"><tr>{["Client", "Partnership date", "Clicks", "Placed", "Delivered", "Last activity", "Status"].map(title => <th scope="col" key={title} className="whitespace-nowrap px-3 py-3 first:pl-5">{title}</th>)}</tr></thead>
            <tbody className="divide-y divide-violet-100">{clients.map(client => {
              const m = client.metrics;
              return <tr key={client.id} className="hover:bg-violet-50">
                <th scope="row" className="max-w-52 break-words px-3 py-3 pl-5"><Link to={linkFor(client.id)} className="font-semibold text-violet-800 hover:underline">{clientName(client)}</Link></th>
                <td className="whitespace-nowrap px-3 py-3">{formatDate(client.accepted_at)}</td><td className="px-3 py-3 tabular-nums">{formatCount(m?.product_clicks)}</td><td className="px-3 py-3 tabular-nums">{formatCount(m?.placed_orders)}</td><td className="px-3 py-3 tabular-nums">{formatCount(m?.delivered_orders)}</td><td className="whitespace-nowrap px-3 py-3">{formatDate(m?.last_login_at)}</td><td className="px-3 py-3"><Badge status={m?.activity_status}>{activityLabels[m?.activity_status] || "Unknown"}</Badge></td>
              </tr>;
            })}</tbody>
          </table></div>
          <ul className="divide-y divide-violet-100 lg:hidden">{clients.map(client => {
            const m = client.metrics;
            return <li key={client.id} className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3"><Link to={linkFor(client.id)} className="inline-flex min-w-0 items-center gap-1 font-semibold text-violet-800"><span className="min-w-0 break-words">{clientName(client)}</span><ArrowUpRight size={15} className="shrink-0" aria-hidden="true" /></Link><Badge status={m?.activity_status}>{activityLabels[m?.activity_status] || "Unknown"}</Badge></div>
              <p className="text-xs text-slate-600"><CalendarDays size={13} className="mr-1 inline" aria-hidden="true" /> Linked {formatDate(client.accepted_at)} · Last activity {formatDate(m?.last_login_at)}</p>
              <p className="text-sm text-slate-700">{formatCount(m?.product_clicks)} clicks · {formatCount(m?.placed_orders)} placed · {formatCount(m?.delivered_orders)} delivered</p>
            </li>;
          })}</ul>
        </>}
      {result && !query.isError && <Pagination page={page} lastPage={lastPage} onPage={next => update({ page: Math.max(1, Math.min(lastPage, next)) }, false)} />}
    </section>
  </div>;
}
