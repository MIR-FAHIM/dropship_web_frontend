import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarClock,
  ExternalLink,
  LayoutGrid,
  Loader2,
  MessageCircle,
  NotebookPen,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Table2,
  Target,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateLeadMutation,
  useCreateLeadRoleMutation,
  useCreateLeadTagMutation,
  useDeleteLeadMutation,
  useGetLeadRolesQuery,
  useGetLeadStatsQuery,
  useGetLeadTagsQuery,
  useGetLeadsQuery,
  useLogLeadContactMutation,
  useUpdateLeadMutation,
} from "../../../../redux/features/leads";
import { useUserUnbanMutation } from "../../../../redux/features/user";
import { OrderDateFilter } from "../../orders/OrderListFilters";
import LeadNoteModal from "./LeadNoteModal";
import LeadEditModal from "./LeadEditModal";
import {
  FOLLOWUP_TAGS,
  LEAD_STATUSES,
  buildRoleOptions,
  findOption,
  formatDateTime,
  isOverdue,
  telUrl,
  whatsappUrl,
} from "./leadConstants";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];
const input = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

const Badge = ({ option, fallback = "—" }) =>
  option ? (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${option.className}`}>{option.label}</span>
  ) : (
    <span className="text-xs text-gray-400">{fallback}</span>
  );

const StatCard = ({ label, value, className, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-xl border p-3 text-center transition hover:shadow-sm ${className} ${active ? "ring-2 ring-indigo-400 ring-offset-1" : ""}`}
  >
    <p className="text-xs font-semibold opacity-80">{label}</p>
    <p className="mt-1 text-2xl font-extrabold tabular-nums">{value ?? 0}</p>
  </button>
);

/** Quick "New lead" form (top of the page, like the demo). */
const QuickAddLead = ({ tags, roles }) => {
  const empty = { role: "dropshipper", name: "", phone: "", page_link: "", product_tag_id: "", note: "" };
  const [form, setForm] = useState(empty);
  const [newTag, setNewTag] = useState(null);
  const [newRole, setNewRole] = useState(null); // null = dropdown, string = typing a new role
  const [error, setError] = useState("");
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const [createTag, { isLoading: savingTag }] = useCreateLeadTagMutation();
  const [createRole, { isLoading: savingRole }] = useCreateLeadRoleMutation();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    try {
      const res = await createLead({
        ...form,
        name: form.name || null,
        page_link: form.page_link || null,
        note: form.note || null,
        product_tag_id: form.product_tag_id ? Number(form.product_tag_id) : null,
      }).unwrap();
      if (res?.data?.matched_dropshipper) {
        toast.warning(`Saved. ${res.data.matched_dropshipper.name || "This number"} is already a registered dropshipper (linked).`);
      } else {
        toast.success("Lead saved");
      }
      setForm({ ...empty, role: form.role, product_tag_id: form.product_tag_id });
    } catch (err) {
      const msg = err?.data?.errors?.phone?.[0] || err?.data?.message || "Could not save the lead";
      setError(err?.data?.errors?.existing_lead_id ? `${msg} (Lead #${err.data.errors.existing_lead_id})` : msg);
    }
  };

  const addRole = async () => {
    if (!newRole?.trim()) return;
    try {
      const res = await createRole(newRole.trim()).unwrap();
      setForm((f) => ({ ...f, role: res?.data?.value || f.role }));
      setNewRole(null);
      toast.success(`Role "${res?.data?.label || newRole.trim()}" added`);
    } catch (err) {
      toast.error(err?.data?.errors?.label?.[0] || "Could not add the role");
    }
  };

  const addTag = async () => {
    if (!newTag?.trim()) return;
    try {
      const res = await createTag(newTag.trim()).unwrap();
      setForm((f) => ({ ...f, product_tag_id: String(res?.data?.id || "") }));
      setNewTag(null);
      toast.success("Tag added");
    } catch (err) {
      toast.error(err?.data?.errors?.name?.[0] || "Could not add the tag");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
        <UserPlus className="h-4 w-4 text-indigo-600" /> New lead
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-end 2xl:grid-cols-[160px_1fr_1fr_1.2fr_1fr_1.3fr_auto]">
        <div className="text-xs font-semibold text-gray-600">
          Role
          {newRole === null ? (
            <div className="mt-1 flex gap-1">
              <select className={`${input} w-full min-w-0`} value={form.role} onChange={set("role")} aria-label="Role">
                {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <button type="button" onClick={() => setNewRole("")} title="Add a new role" aria-label="Add a new role"
                className="inline-flex w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-50 text-indigo-800 hover:bg-indigo-100">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex gap-1">
              <input
                className={`${input} w-full min-w-0`}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addRole(); }
                  if (e.key === "Escape") setNewRole(null);
                }}
                placeholder="New role, e.g. Marketer"
                aria-label="New role name"
                maxLength={60}
                autoFocus
              />
              <button type="button" onClick={addRole} disabled={savingRole} className="rounded-lg border border-indigo-400 bg-indigo-50 px-2 text-xs font-bold text-indigo-800 disabled:opacity-60">
                Add
              </button>
              <button type="button" onClick={() => setNewRole(null)} aria-label="Cancel" className="rounded-lg border border-gray-300 px-2 text-gray-500 hover:bg-gray-50">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <label className="text-xs font-semibold text-gray-600">
          Name
          <input className={`${input} mt-1 w-full`} value={form.name} onChange={set("name")} placeholder="Optional" />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          Phone *
          <input className={`${input} mt-1 w-full ${error ? "border-red-400" : ""}`} value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" inputMode="tel" />
        </label>
        <label className="text-xs font-semibold text-gray-600">
          Page or website link
          <input className={`${input} mt-1 w-full`} value={form.page_link} onChange={set("page_link")} placeholder="facebook.com/page-name" />
        </label>
        <div className="text-xs font-semibold text-gray-600">
          <span className="flex items-center justify-between">
            Product tag
            <button type="button" onClick={() => setNewTag(newTag === null ? "" : null)} className="font-semibold text-indigo-700 hover:underline">
              {newTag === null ? "+ New" : "Cancel"}
            </button>
          </span>
          {newTag === null ? (
            <select className={`${input} mt-1 w-full`} value={form.product_tag_id} onChange={set("product_tag_id")}>
              <option value="">No tag</option>
              {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <div className="mt-1 flex gap-1">
              <input
                className={`${input} w-full`}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Tag name"
                aria-label="New tag name"
              />
              <button type="button" onClick={addTag} disabled={savingTag} className="rounded-lg border border-indigo-400 bg-indigo-50 px-2 text-xs font-bold text-indigo-800">
                Add
              </button>
            </div>
          )}
        </div>
        <label className="text-xs font-semibold text-gray-600">
          Note
          <input className={`${input} mt-1 w-full`} value={form.note} onChange={set("note")} placeholder="e.g. send catalog" />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-lg border border-indigo-500 bg-indigo-100 px-4 text-sm font-bold text-indigo-800 hover:bg-indigo-200 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Save lead
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600" role="alert">{error}</p>}
    </form>
  );
};

/** Lead Manager: /admin-panel/leads/manage */
const AdminLeadManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const get = (k) => searchParams.get(k) || "";
  const updateUrl = (patch, { resetPage = true } = {}) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => (v === undefined || v === null || v === "" || v === "all" ? next.delete(k) : next.set(k, String(v))));
      if (resetPage && !("page" in patch)) next.delete("page");
      return next;
    }, { replace: true });

  const page = Math.max(1, Number(get("page")) || 1);
  const perPage = PER_PAGE_OPTIONS.includes(Number(get("per_page"))) ? Number(get("per_page")) : 20;
  const view = get("view") === "cards" ? "cards" : "table";
  const filters = {
    status: get("status"),
    role: get("role"),
    followup: get("followup"), // a follow-up tag, or "scheduled" / "today"
    product_tag_id: get("tag"),
    source: get("source"),
    date_from: get("date_from"),
    date_to: get("date_to"),
    search: get("q"),
  };

  const [searchInput, setSearchInput] = useState(filters.search);
  useEffect(() => {
    const term = searchInput.trim();
    if (term === filters.search) return undefined;
    const t = setTimeout(() => updateUrl({ q: term }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, filters.search]);

  const queryArgs = useMemo(() => {
    const followupIsSchedule = ["scheduled", "today"].includes(filters.followup);
    return {
      page,
      per_page: perPage,
      status: filters.status,
      role: filters.role,
      followup_tag: followupIsSchedule ? "" : filters.followup,
      schedule: followupIsSchedule ? filters.followup : "",
      product_tag_id: filters.product_tag_id,
      source: filters.source,
      date_from: filters.date_from,
      date_to: filters.date_to,
      search: filters.search,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data, isLoading, isFetching, isError, refetch } = useGetLeadsQuery(queryArgs);
  const { data: statsData } = useGetLeadStatsQuery();
  const { data: tagsData } = useGetLeadTagsQuery();
  const [updateLead] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();
  const [logContact] = useLogLeadContactMutation();
  const [activateUser] = useUserUnbanMutation();

  const pagination = data?.data || {};
  const leads = Array.isArray(pagination.data) ? pagination.data : [];
  const lastPage = Number(pagination.last_page || 1);
  const stats = statsData?.data || {};
  const tags = Array.isArray(tagsData?.data) ? tagsData.data : [];
  const { data: rolesData } = useGetLeadRolesQuery();
  const ROLES = useMemo(() => buildRoleOptions(rolesData?.data), [rolesData]);
  const tagName = (id) => tags.find((t) => Number(t.id) === Number(id))?.name;

  const [noteLead, setNoteLead] = useState(null);
  const [editLead, setEditLead] = useState(null);

  const contact = (lead, channel) => {
    const url = channel === "call" ? telUrl(lead) : whatsappUrl(lead);
    if (url) window.open(url, channel === "call" ? "_self" : "_blank", "noopener");
    logContact({ id: lead.id, channel });
  };

  const changeStatus = async (lead, status) => {
    try {
      await updateLead({ id: lead.id, status }).unwrap();
      toast.success(`Status: ${findOption(LEAD_STATUSES, status)?.label}`);
    } catch (err) {
      toast.error(err?.data?.message || "Could not change the status");
    }
  };

  const remove = async (lead) => {
    if (!window.confirm(`Delete lead ${lead.name || lead.phone}?`)) return;
    try {
      await deleteLead(lead.id).unwrap();
      toast.success("Lead deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Could not delete the lead");
    }
  };

  const activate = async (lead) => {
    if (!window.confirm(`Activate the dropshipper account of ${lead.user?.name || lead.phone}? They will be able to sign in.`)) return;
    try {
      await activateUser(lead.user_id).unwrap();
      toast.success("Account activated");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Could not activate the account");
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const LeadActions = ({ lead }) => (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {lead.user && Number(lead.user.banned) === 1 && (
        <button type="button" onClick={() => activate(lead)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100" title="Linked dropshipper account isn't active">
          <ShieldCheck className="h-3.5 w-3.5" /> Activate account
        </button>
      )}
      <button type="button" onClick={() => setNoteLead(lead)} className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50" title="Notes & follow-up" aria-label="Notes and follow-up">
        <NotebookPen className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => setEditLead(lead)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100" title="Edit" aria-label="Edit lead">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => remove(lead)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Delete" aria-label="Delete lead">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const ContactButtons = ({ lead }) => (
    <div className="flex gap-1">
      <button type="button" onClick={() => contact(lead, "call")} className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100" aria-label={`Call ${lead.phone}`}>
        <Phone className="h-3.5 w-3.5" /> Call
      </button>
      <button type="button" onClick={() => contact(lead, "whatsapp")} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100" aria-label={`WhatsApp ${lead.phone}`}>
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </button>
    </div>
  );

  const NoteCell = ({ lead }) => (
    <button type="button" onClick={() => setNoteLead(lead)} className="block w-full max-w-[240px] text-left" title="Open notes & follow-up">
      {lead.note ? <span className="line-clamp-2 text-xs text-gray-700">{lead.note}</span> : <span className="text-xs text-gray-400">Add note…</span>}
      {lead.next_call_at && (
        <span className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${isOverdue(lead) ? "text-red-600" : "text-gray-500"}`}>
          <CalendarClock className="h-3 w-3" /> {formatDateTime(lead.next_call_at)}{isOverdue(lead) ? " · due" : ""}
        </span>
      )}
    </button>
  );

  const LeadIdentity = ({ lead }) => (
    <div className="min-w-0">
      {lead.name && <p className="truncate text-sm font-semibold text-gray-900">{lead.name}</p>}
      <p className="font-mono text-xs text-gray-700">{lead.phone}</p>
      {lead.user && (
        <Link to={`/admin-panel/dropshippers/${lead.user_id}`} className="text-[11px] font-semibold text-indigo-700 hover:underline">
          Dropshipper #{lead.user_id}{Number(lead.user.banned) === 1 ? " · inactive" : ""}
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Users className="h-5 w-5 text-indigo-600" /> Lead Manager
        </h1>
        <Link to="/admin-panel/dropshippers?inactive=1" className="text-xs font-semibold text-indigo-700 hover:underline">
          Find inactive dropshippers →
        </Link>
      </div>

      {/* Stat cards (click to filter) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total leads" value={stats.total} className="border-gray-200 bg-gray-50 text-gray-800" active={!filters.status} onClick={() => updateUrl({ status: null })} />
        <StatCard label="New" value={stats.new} className="border-blue-200 bg-blue-50 text-blue-800" active={filters.status === "new"} onClick={() => updateUrl({ status: "new" })} />
        <StatCard label="Contacted" value={stats.contacted} className="border-amber-200 bg-amber-50 text-amber-800" active={filters.status === "contacted"} onClick={() => updateUrl({ status: "contacted" })} />
        <StatCard label="Converted" value={stats.converted} className="border-emerald-200 bg-emerald-50 text-emerald-800" active={filters.status === "converted"} onClick={() => updateUrl({ status: "converted" })} />
        <StatCard label="Cancelled" value={stats.cancelled} className="border-red-200 bg-red-50 text-red-800" active={filters.status === "cancelled"} onClick={() => updateUrl({ status: "cancelled" })} />
      </div>

      {/* Today */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <span className="flex items-center gap-2 text-sm font-bold text-gray-900"><Target className="h-4 w-4 text-indigo-600" /> Today</span>
        <span className="text-sm text-gray-700">Leads collected: <b className="tabular-nums">{stats.today_created ?? 0}</b></span>
        <span className="text-sm text-gray-700">Leads contacted: <b className="tabular-nums">{stats.today_contacted ?? 0}</b></span>
        <button
          type="button"
          onClick={() => updateUrl({ followup: "today" })}
          className={`inline-flex items-center gap-1 text-sm font-semibold ${stats.scheduled_today ? "text-red-600" : "text-gray-500"} hover:underline`}
        >
          <CalendarClock className="h-4 w-4" /> Calls due today: {stats.scheduled_today ?? 0}
        </button>
      </div>

      <QuickAddLead tags={tags} roles={ROLES} />

      {/* Leads & follow-up */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4">
          <h2 className="mr-auto text-sm font-bold text-gray-900">Leads & follow-up</h2>
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className={`${input} w-full pl-8 pr-7`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Name, phone, link, note…" aria-label="Search leads" />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <select className={input} value={filters.product_tag_id} onChange={(e) => updateUrl({ tag: e.target.value })} aria-label="Product tag">
            <option value="">All tags</option>
            {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className={input} value={filters.role} onChange={(e) => updateUrl({ role: e.target.value })} aria-label="Role">
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select className={input} value={filters.followup} onChange={(e) => updateUrl({ followup: e.target.value })} aria-label="Follow-up">
            <option value="">All follow-ups</option>
            {FOLLOWUP_TAGS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            <option value="scheduled">⏰ Call scheduled</option>
            <option value="today">⚠️ Today's schedule</option>
          </select>
          <select className={input} value={filters.source} onChange={(e) => updateUrl({ source: e.target.value })} aria-label="Source">
            <option value="">All sources</option>
            <option value="manual">Added manually</option>
            <option value="dropshipper">From dropshippers</option>
          </select>
          <OrderDateFilter dateFrom={filters.date_from} dateTo={filters.date_to} onChange={(f, t) => updateUrl({ date_from: f, date_to: t })} />
          <div className="flex overflow-hidden rounded-lg border border-gray-300" role="group" aria-label="View">
            <button type="button" onClick={() => updateUrl({ view: null }, { resetPage: false })} aria-pressed={view === "table"} className={`px-2.5 py-2 ${view === "table" ? "bg-indigo-50 text-indigo-700" : "text-gray-500"}`} title="Table view">
              <Table2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => updateUrl({ view: "cards" }, { resetPage: false })} aria-pressed={view === "cards"} className={`px-2.5 py-2 ${view === "cards" ? "bg-indigo-50 text-indigo-700" : "text-gray-500"}`} title="Card view">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchParams(view === "cards" ? { view: "cards" } : {}, { replace: true });
              }}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 text-sm text-gray-600">
          <p aria-live="polite">
            {isLoading ? "Loading…" : pagination.total ? <>Showing <b>{pagination.from}–{pagination.to}</b> of <b>{pagination.total}</b> {pagination.total === 1 ? "lead" : "leads"}</> : "0 leads"}
          </p>
          <label className="flex items-center gap-2 text-xs font-medium">
            Per page
            <select className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs" value={perPage} onChange={(e) => updateUrl({ per_page: Number(e.target.value) === 20 ? null : e.target.value })}>
              {PER_PAGE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>

        <div className={`p-4 ${isFetching ? "opacity-60" : ""}`} aria-busy={isFetching}>
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-red-600">Could not load leads. <button type="button" onClick={refetch} className="font-semibold underline">Try again</button></p>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">{hasFilters ? "No leads match these filters." : "No leads yet. Add one above, or convert an inactive dropshipper."}</p>
            </div>
          ) : view === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2 font-semibold">Role</th>
                    <th className="pb-2 font-semibold">Lead</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Call & WhatsApp</th>
                    <th className="pb-2 font-semibold">Follow-up</th>
                    <th className="pb-2 font-semibold">Social link</th>
                    <th className="pb-2 font-semibold">Product tag</th>
                    <th className="pb-2 font-semibold">Note & next call</th>
                    <th className="pb-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const role = findOption(ROLES, lead.role);
                    return (
                      <tr key={lead.id} className={`border-b align-top last:border-0 ${lead.role === "supplier" ? "bg-purple-50/40" : ""} ${isOverdue(lead) ? "bg-red-50/40" : ""}`}>
                        <td className="py-3 pr-2">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${role?.className}`} title={role?.label}>{role?.short}</span>
                        </td>
                        <td className="py-3 pr-3"><LeadIdentity lead={lead} /></td>
                        <td className="py-3 pr-3">
                          <select
                            value={lead.status}
                            onChange={(e) => changeStatus(lead, e.target.value)}
                            aria-label="Status"
                            className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${findOption(LEAD_STATUSES, lead.status)?.className}`}
                          >
                            {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="py-3 pr-3"><ContactButtons lead={lead} /></td>
                        <td className="py-3 pr-3">
                          <button type="button" onClick={() => setNoteLead(lead)} title="Change follow-up">
                            <Badge option={findOption(FOLLOWUP_TAGS, lead.followup_tag)} fallback="+ Tag" />
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          {lead.page_link ? (
                            <a href={/^https?:\/\//i.test(lead.page_link) ? lead.page_link : `https://${lead.page_link}`} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[160px] items-center gap-1 truncate text-xs font-medium text-blue-700 hover:underline">
                              <ExternalLink className="h-3 w-3 shrink-0" /> <span className="truncate">{lead.page_link.replace(/^https?:\/\//i, "")}</span>
                            </a>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="py-3 pr-3 text-xs text-gray-700">{lead.product_tag?.name || tagName(lead.product_tag_id) || <span className="text-gray-400">—</span>}</td>
                        <td className="py-3 pr-3"><NoteCell lead={lead} /></td>
                        <td className="py-3"><LeadActions lead={lead} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {leads.map((lead) => {
                const role = findOption(ROLES, lead.role);
                return (
                  <div key={lead.id} className={`space-y-3 rounded-xl border p-4 ${isOverdue(lead) ? "border-red-200" : "border-gray-200"} ${lead.role === "supplier" ? "bg-purple-50/40" : "bg-white"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${role?.className}`} title={role?.label}>{role?.short}</span>
                      <LeadIdentity lead={lead} />
                      <span className="ml-auto"><Badge option={findOption(LEAD_STATUSES, lead.status)} /></span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ContactButtons lead={lead} />
                      <button type="button" onClick={() => setNoteLead(lead)}><Badge option={findOption(FOLLOWUP_TAGS, lead.followup_tag)} fallback="+ Tag" /></button>
                      {(lead.product_tag?.name || tagName(lead.product_tag_id)) && (
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">{lead.product_tag?.name || tagName(lead.product_tag_id)}</span>
                      )}
                    </div>
                    <NoteCell lead={lead} />
                    <LeadActions lead={lead} />
                  </div>
                );
              })}
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 border-t pt-4">
              <button type="button" disabled={page <= 1} onClick={() => updateUrl({ page: page - 1 > 1 ? page - 1 : null }, { resetPage: false })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40">
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} / {lastPage}</span>
              <button type="button" disabled={page >= lastPage} onClick={() => updateUrl({ page: page + 1 }, { resetPage: false })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {noteLead && <LeadNoteModal lead={noteLead} onClose={() => setNoteLead(null)} />}
      {editLead && <LeadEditModal lead={editLead} tags={tags} roles={ROLES} onClose={() => setEditLead(null)} />}
    </div>
  );
};

export default AdminLeadManager;
