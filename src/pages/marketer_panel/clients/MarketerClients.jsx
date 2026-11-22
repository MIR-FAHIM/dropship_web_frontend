/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, Mail, MousePointerClick, Package, PackageCheck, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useGetMarketerClientsQuery, useCreateMarketerClientMutation } from "../../../redux/features/marketer";
import { Badge, Metric, PageHeading, Pagination, SectionHeading, StateMessage } from "../partnerWorkspace";
import { activityLabels, activityLabelsBn, clientName, field, formatDate, mintAction, panel, periods, periodsBn, secondary, workspacePath } from "../partnerWorkspaceData";
import { useNumber, usePartnerPrefs } from "../partnerPrefs";
import CreateClientModal from "./CreateClientModal";

const sorting = {
  joined: { en: "Recently linked", bn: "নতুন যুক্ত" },
  clicks: { en: "Most product clicks", bn: "সর্বাধিক প্রোডাক্ট ক্লিক" },
  orders: { en: "Most orders placed", bn: "সর্বাধিক প্লেসড অর্ডার" },
  delivered: { en: "Most delivered orders", bn: "সর্বাধিক ডেলিভার্ড অর্ডার" },
  last_login: { en: "Most recently active", bn: "সম্প্রতি সক্রিয়" },
};
const invitationsPath = `${workspacePath}/invitations#invite-client`;

function ClientDetails({ client, period, close }) {
  const { t, lang } = usePartnerPrefs();
  const metrics = client.metrics;
  const activity = metrics?.activity_status;
  const periodLabel = lang === "bn" ? periodsBn[period] || periods[period] : periods[period];
  const actLabel = lang === "bn" ? activityLabelsBn[activity] || activityLabels[activity] : activityLabels[activity];

  return <div className="space-y-5">
    <Link to={close} className={secondary}><ArrowLeft size={16} aria-hidden="true" /> {t("Back to My Clients", "ক্লায়েন্ট তালিকায় ফিরে যান")}</Link>
    <PageHeading
      icon={Users}
      eyebrow={t("My Clients", "আমার ক্লায়েন্ট")}
      title={clientName(client)}
      description={`${t("Performance", "পারফরম্যান্স")} · ${periodLabel}`}
      action={<Badge status={activity}>{actLabel || t("Unknown", "অজানা")}</Badge>}
    />
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-labelledby="partner-client-performance">
      <h2 id="partner-client-performance" className="sr-only">{t("Client performance", "ক্লায়েন্ট পারফরম্যান্স")}</h2>
      <Metric icon={MousePointerClick} label={t("Product clicks", "প্রোডাক্ট ক্লিক")} value={metrics?.product_clicks} hint={periodLabel} tone="sky" />
      <Metric icon={Package} label={t("Orders placed", "প্লেসড অর্ডার")} value={metrics?.placed_orders} hint={periodLabel} tone="peach" />
      <Metric icon={PackageCheck} label={t("Delivered orders", "ডেলিভার্ড অর্ডার")} value={metrics?.delivered_orders} hint={periodLabel} tone="mint" />
    </section>
    <section className={`${panel} p-5`} aria-labelledby="partner-client-access">
      <SectionHeading id="partner-client-access" title={t("Relationship & access", "সম্পর্ক ও অ্যাক্সেস")} icon={ShieldCheck} tone="mint" />
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t("Partnership accepted", "পার্টনারশিপ শুরু")}</dt>
          <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{formatDate(client.accepted_at, lang)}</dd>
        </div>
        <div>
          <dt className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t("Last recorded account activity", "সর্বশেষ রেকর্ডকৃত অ্যাকাউন্ট অ্যাক্টিভিটি")}</dt>
          <dd className="mt-0.5 font-bold text-slate-900 dark:text-white">{formatDate(metrics?.last_login_at, lang)}</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 p-3.5 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
        {t("Partners can see aggregate activity. Customer information and client wallet balances stay private.", "পার্টনাররা সামগ্রিক কার্যকলাপ দেখতে পারেন। কাস্টমার তথ্য এবং ক্লায়েন্টের ওয়ালেট ব্যালেন্স সম্পূর্ণ গোপন থাকে।")}
      </p>
    </section>
  </div>;
}

export default function MarketerClients() {
  const { t, lang } = usePartnerPrefs();
  const num = useNumber();
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createClient, { isLoading: isCreating, error: createError, reset: resetCreateError }] = useCreateMarketerClientMutation();

  const query = useGetMarketerClientsQuery({ page, per_page: 20, search, activity, period, min_orders: minOrders, sort_by: sort, sort_direction: direction }, { refetchOnMountOrArgChange: true });
  const result = query.currentData?.data;
  const clients = result?.data ?? [];
  const lastPage = Number(result?.last_page ?? 1);
  const selectedClient = clients.find(client => String(client.id) === selected);

  const handleCreateClient = async (payload) => {
    const res = await createClient(payload).unwrap();
    query.refetch();
    return res;
  };

  const linkFor = (id) => {
    const next = new URLSearchParams(params);
    if (id == null) next.delete("client");
    else next.set("client", String(id));
    const s = next.toString();
    return `${workspacePath}/clients${s ? `?${s}` : ""}`;
  };
  const update = (updates, resetPage = true) => {
    const next = new URLSearchParams(params);
    if (resetPage) next.delete("page");
    next.delete("client");
    Object.entries(updates).forEach(([key, value]) => value == null || value === "" ? next.delete(key) : next.set(key, String(value)));
    setParams(next);
  };

  if (selected) {
    if (query.isFetching) return <StateMessage loading title={t("Checking client access…", "ক্লায়েন্ট অ্যাক্সেস যাচাই করা হচ্ছে…")} />;
    if (query.isError) return <StateMessage title={t("Client details could not be loaded", "ক্লায়েন্ট বিবরণ লোড করা যায়নি")} retry={query.refetch} action={<Link to={linkFor()} className={secondary}>{t("Back to My Clients", "ক্লায়েন্ট তালিকায় ফিরে যান")}</Link>} />;
    if (selectedClient) return <ClientDetails client={selectedClient} period={period} close={linkFor()} />;
    return <div className={panel}><StateMessage title={t("Client unavailable in this view", "ক্লায়েন্ট এই ভিউতে নেই")} detail={t("The relationship may have ended, or the client may be outside this page or filter. Find the client in My Clients to open their details.", "সম্পর্ক শেষ হয়ে থাকতে পারে, অথবা ফিল্টারের বাইরে হতে পারে। বিবরণ দেখতে ক্লায়েন্ট তালিকায় খুঁজুন।")} action={<Link to={linkFor()} className={secondary}>{t("Back to My Clients", "ক্লায়েন্ট তালিকায় ফিরে যান")}</Link>} /></div>;
  }

  return <div className="space-y-5">
    <PageHeading
      icon={Users}
      title={t("My Clients", "আমার ক্লায়েন্ট")}
      description={t("Find linked businesses and review their activity. Pending invitations are tracked separately.", "সংযুক্ত ড্রপশিপারদের তালিকা ও অ্যাক্টিভিটি দেখুন। পেন্ডিং ইনভাইটেশন আলাদাভাবে ট্র্যাক করা হয়।")}
      action={
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className={mintAction}
          >
            <UserPlus size={16} aria-hidden="true" /> {t("Add Dropshipper", "নতুন ড্রপশিপার যুক্ত করুন")}
          </button>
          <Link
            to={invitationsPath}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 px-3.5 py-2 text-white ring-1 ring-white/30 hover:bg-white/25 transition-all"
          >
            <Mail size={16} aria-hidden="true" /> {t("Invite via Email", "ইমেইলে ইনভাইট করুন")}
          </Link>
        </div>
      }
    />

    <section className={panel} aria-labelledby="partner-client-list">
      <div className="space-y-4 rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-white p-4 dark:border-slate-800 dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-900 sm:p-5">
        <SectionHeading
          id="partner-client-list"
          tone="sky"
          title={t("Client Directory", "ক্লায়েন্ট ডিরেক্টরি")}
          icon={Users}
          action={result && <Badge status="planned">{num(result.total)} {t("matching clients", "জন ক্লায়েন্ট")}</Badge>}
        />
        <form key={search} className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); update({ search: String(new FormData(event.currentTarget).get("search") || "").trim() }); }}>
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t("Search by business or client name", "বিজনেস বা ক্লায়েন্টের নাম দিয়ে খুঁজুন")}</span>
            <input name="search" type="search" className={field} placeholder={t("Search by business or client name", "বিজনেস বা ক্লায়েন্টের নাম দিয়ে খুঁজুন")} defaultValue={search} />
          </label>
          <button type="submit" className={secondary}><Search size={16} aria-hidden="true" /> {t("Search", "খুঁজুন")}</button>
        </form>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t("Activity", "অ্যাক্টিভিটি")}
            <select className={`${field} mt-1`} value={activity} onChange={event => update({ activity: event.target.value === "all" ? null : event.target.value })}>
              <option value="all">{t("All activity", "সব অ্যাক্টিভিটি")}</option>
              {Object.entries(activityLabels).map(([value, label]) => (
                <option key={value} value={value}>{lang === "bn" ? activityLabelsBn[value] || label : label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t("Period", "সময়কাল")}
            <select className={`${field} mt-1`} value={period} onChange={event => update({ period: event.target.value })}>
              {Object.entries(periods).map(([value, label]) => (
                <option key={value} value={value}>{lang === "bn" ? periodsBn[value] || label : label}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 text-xs font-bold text-slate-700 dark:text-slate-300 lg:col-span-1">
            {t("Sort by", "সাজান")}
            <select className={`${field} mt-1`} value={sort} onChange={event => update({ sort: event.target.value, direction: null })}>
              {Object.entries(sorting).map(([value, opt]) => (
                <option key={value} value={value}>{t(opt.en, opt.bn)}</option>
              ))}
            </select>
          </label>
        </div>
        <details className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
          <summary className="cursor-pointer text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            {t("More filters", "অতিরিক্ত ফিল্টার")}{(minOrders || direction === "asc") && ` · ${t("applied", "প্রযুক্ত")}`}
          </summary>
          <div className="mt-2.5 flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <form key={minOrders} className="flex items-end gap-2" onSubmit={event => { event.preventDefault(); update({ min_orders: new FormData(event.currentTarget).get("min") }); }}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("Minimum delivered orders", "নূন্যতম ডেলিভার্ড অর্ডার")}
                <input name="min" type="number" min="0" max="999999999" step="1" defaultValue={minOrders} className={`${field} mt-1`} />
              </label>
              <button type="submit" className={secondary}>{t("Apply", "প্রয়োগ করুন")}</button>
            </form>
            <button type="button" className={secondary} onClick={() => update({ direction: direction === "asc" ? null : "asc" })}>
              {direction === "asc" ? t("Use default sort order", "ডিফল্ট অর্ডারে সাজান") : t("Reverse sort order", "বিপরীত অর্ডারে সাজান")}
            </button>
            <button type="button" className={secondary} onClick={() => setParams({})}>
              {t("Reset filters", "ফিল্টার রিসেট")}
            </button>
          </div>
        </details>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("Activity is based on the last recorded account activity: active within 7 days, moderate within 30 days, otherwise inactive.", "অ্যাক্টিভিটি হিসেব হয় সর্বশেষ অ্যাকাউন্টে প্রবেশের সময় অনুযায়ী: ৭ দিনের মধ্যে সক্রিয়, ৩০ দিনের মধ্যে মাঝারি, অন্যথায় নিষ্ক্রিয়।")}
        </p>
      </div>

      {query.isFetching ? <StateMessage loading title={t("Loading clients…", "ক্লায়েন্ট তালিকা লোড হচ্ছে…")} />
        : query.isError ? <StateMessage title={t("Clients could not be loaded", "ক্লায়েন্ট লোড করা যায়নি")} retry={query.refetch} />
        : !clients.length ? <StateMessage title={search || activity !== "all" || minOrders ? t("No matching clients", "কোনো ক্লায়েন্ট পাওয়া যায়নি") : t("No clients on this page", "এই পৃষ্ঠায় কোনো ক্লায়েন্ট নেই")} detail={t("Clear the filters or send an invitation to link a new business.", "ফিল্টার রিসেট করুন বা নতুন ক্লায়েন্টকে ইনভাইট করুন।")} action={<Link to={invitationsPath} className={secondary}>{t("Open invitations", "ইনভাইটেশনে যান")}</Link>} />
        : <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-slate-200/80 bg-slate-50 dark:bg-slate-800/70 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  {[
                    t("Client & Store", "ড্রপশিপার ও স্টোর"),
                    t("Partnership Date", "যুক্ত হওয়ার তারিখ"),
                    t("Product Clicks", "প্রোডাক্ট ক্লিক"),
                    t("Placed", "প্লেসড"),
                    t("Delivered", "ডেলিভার্ড"),
                    t("Last Activity", "সর্বশেষ অ্যাক্টিভিটি"),
                    t("Status", "স্ট্যাটাস"),
                  ].map(title => (
                    <th scope="col" key={title} className="whitespace-nowrap px-4 py-3 first:pl-5">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {clients.map((client, idx) => {
                  const m = client.metrics;
                  const act = m?.activity_status;
                  const actLabel = lang === "bn" ? activityLabelsBn[act] || activityLabels[act] : activityLabels[act];
                  return <tr key={client.id} className="transition-colors hover:bg-teal-50/40 dark:hover:bg-slate-800/40">
                    <th scope="row" className="max-w-56 break-words px-4 py-3.5 pl-5 font-normal">
                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold text-white ${["bg-teal-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"][idx % 5]}`}>
                          {(clientName(client) || "C").trim().slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <Link to={linkFor(client.id)} className="block truncate font-bold text-teal-800 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200 hover:underline">
                            {clientName(client)}
                          </Link>
                          {client.dropshipper?.business_name && client.dropshipper?.name && (
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {client.dropshipper.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </th>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">{formatDate(client.accepted_at, lang)}</td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-slate-800 dark:text-slate-200">{num(m?.product_clicks)}</td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-slate-800 dark:text-slate-200">{num(m?.placed_orders)}</td>
                    <td className="px-4 py-3.5 tabular-nums font-extrabold text-emerald-700 dark:text-emerald-400">{num(m?.delivered_orders)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">{formatDate(m?.last_login_at, lang)}</td>
                    <td className="px-4 py-3.5"><Badge status={act}>{actLabel || t("Unknown", "অজানা")}</Badge></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive card view */}
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
            {clients.map(client => {
              const m = client.metrics;
              const act = m?.activity_status;
              const actLabel = lang === "bn" ? activityLabelsBn[act] || activityLabels[act] : activityLabels[act];
              return <li key={client.id} className="space-y-2.5 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <Link to={linkFor(client.id)} className="inline-flex min-w-0 items-center gap-1 font-bold text-teal-800 dark:text-teal-300 hover:underline">
                    <span className="min-w-0 break-words">{clientName(client)}</span>
                    <ArrowUpRight size={15} className="shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  </Link>
                  <Badge status={act}>{actLabel || t("Unknown", "অজানা")}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CalendarDays size={13} className="shrink-0" aria-hidden="true" />
                  <span>{t("Linked", "যুক্ত")} {formatDate(client.accepted_at, lang)} · {t("Last activity", "সর্বশেষ অ্যাক্টিভিটি")} {formatDate(m?.last_login_at, lang)}</span>
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                  <span className="rounded-md bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-sky-800 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                    {num(m?.product_clicks)} {t("clicks", "ক্লিক")}
                  </span>
                  <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {num(m?.placed_orders)} {t("placed", "প্লেসড")}
                  </span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    {num(m?.delivered_orders)} {t("delivered", "ডেলিভার্ড")}
                  </span>
                </div>
              </li>;
            })}
          </ul>
        </>}
      {result && !query.isError && <Pagination page={page} lastPage={lastPage} onPage={next => update({ page: Math.max(1, Math.min(lastPage, next)) }, false)} />}
    </section>

    {/* Create Dropshipper Modal */}
    <CreateClientModal
      isOpen={isCreateModalOpen}
      onClose={() => { setIsCreateModalOpen(false); resetCreateError(); }}
      onCreate={handleCreateClient}
      isCreating={isCreating}
      error={createError?.data?.message || (createError?.data?.errors ? Object.values(createError.data.errors).flat().join(" ") : "")}
      clearError={resetCreateError}
    />
  </div>;
}
