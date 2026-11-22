import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Loader2, PackageSearch, Search } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../config";
import { useGetSourcingRequestsQuery, useUpdateSourcingRequestMutation } from "../../../redux/features/partnerSourcing";

/**
 * Admin → Marketers → Sourcing Requests (Partner Portal F4).
 * Marketers ask for a product + wholesale price for their client's campaign. Open requests are
 * sorted by deadline; "within 2 hours" / overdue rows are red, 6-hour ones amber.
 * Confirm with a price (incl. packaging) and the partner sees it in their panel at once.
 */
const PLATFORM = { facebook_instagram: "Facebook & Instagram", tiktok: "TikTok", google_youtube: "Google / YouTube", other: "Other" };
const CAMPAIGN = { active: "🟢 Active", upcoming: "🟡 Upcoming", testing: "🔵 Testing" };
const STATUS = {
  pending: ["Pending", "bg-amber-100 text-amber-800"],
  checking: ["Checking", "bg-sky-100 text-sky-800"],
  confirmed: ["Confirmed", "bg-emerald-100 text-emerald-800"],
  rejected: ["Not available", "bg-rose-100 text-rose-800"],
  withdrawn: ["Withdrawn", "bg-gray-200 text-gray-700"],
};
const FILTERS = [["open", "Open"], ["pending", "Pending"], ["checking", "Checking"], ["confirmed", "Confirmed"], ["rejected", "Not available"], ["withdrawn", "Withdrawn"], ["all", "All"]];
const imageUrl = (p) => (!p ? "" : /^https?:\/\//i.test(p) ? p : `${imgBaseUrl}/${p}`);
const fmt = (iso) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");

/** "in 1h 20m" / "overdue 35m" */
const timeLeft = (iso, now) => {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - now;
  const mins = Math.round(Math.abs(ms) / 60000);
  const text = mins >= 1440 ? `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h` : mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  return ms < 0 ? `overdue ${text}` : `in ${text}`;
};

/* ---------- inline answer form ---------- */
const AnswerForm = ({ req, onDone }) => {
  const [status, setStatus] = useState(req.status === "pending" ? "checking" : req.status);
  const [price, setPrice] = useState(req.quoted_price_bdt ?? "");
  const [note, setNote] = useState(req.admin_note ?? "");
  const [productId, setProductId] = useState(req.linked_product_id ?? "");
  const [update, { isLoading }] = useUpdateSourcingRequestMutation();

  const save = async () => {
    try {
      await update({
        id: req.id, status,
        quoted_price_bdt: status === "confirmed" ? Number(price) : undefined,
        admin_note: note.trim() || null,
        linked_product_id: productId === "" ? null : Number(productId),
      }).unwrap();
      toast.success(status === "confirmed" ? "Confirmed — the partner can see the price now." : "Saved.");
      onDone();
    } catch (err) {
      toast.error(err?.data?.message || "Could not save.");
    }
  };

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <label className="font-semibold text-gray-700">Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 font-normal">
          <option value="pending">Pending</option>
          <option value="checking">Checking…</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Not available</option>
        </select>
      </label>
      <label className="font-semibold text-gray-700">Confirmed price ৳ {status === "confirmed" && "*"}
        <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} disabled={status !== "confirmed"}
          placeholder="e.g. 575" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 font-normal disabled:bg-gray-100" />
        <span className="text-[11px] font-normal text-gray-500">Including packaging</span>
      </label>
      <label className="font-semibold text-gray-700">Product ID (optional)
        <input type="number" min="1" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product they can order"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 font-normal" />
        {req.linked_product && <span className="text-[11px] font-normal text-gray-600">Linked: {req.linked_product.name}</span>}
      </label>
      <label className="font-semibold text-gray-700">Note to partner {status === "rejected" && "*"}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={status === "rejected" ? "Why it can't be sourced" : "Stock, MOQ, delivery time…"}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 font-normal" />
      </label>
      <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4">
        <button type="button" onClick={onDone} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Close</button>
        <button type="button" onClick={save} disabled={isLoading || (status === "confirmed" && !(Number(price) > 0)) || (status === "rejected" && !note.trim())}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-200 disabled:text-teal-900">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>
    </div>
  );
};
AnswerForm.propTypes = { req: PropTypes.object.isRequired, onDone: PropTypes.func.isRequired };

/* ---------- page ---------- */
const AdminSourcingRequests = () => {
  const [status, setStatus] = useState("open");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const { data, isLoading, isFetching, isError } = useGetSourcingRequestsQuery(
    { status, search: query || undefined, page, per_page: 20 },
    { pollingInterval: 30000 }
  );
  const rows = data?.data?.requests?.data || [];
  const last = data?.data?.requests?.last_page || 1;
  const counts = data?.data?.counts || {};

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000); // keep the countdowns fresh
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 400);
    return () => window.clearTimeout(id);
  }, [search]);

  const rowTone = (r) => {
    if (!r.is_open) return "border-gray-200 bg-white";
    if (r.is_overdue || r.confirmation_deadline === "2h") return "border-red-300 bg-red-50/60";
    if (r.is_urgent) return "border-amber-300 bg-amber-50/60";
    return "border-gray-200 bg-white";
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><PackageSearch className="h-5 w-5 text-teal-600" /> Partner sourcing requests</h1>
        <p className="mt-1 text-xs text-gray-600">Marketers ask for a product and a wholesale price (incl. packaging) for their client&apos;s campaign. Answer urgent ones first.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[["Open", counts.open, "text-gray-900"], ["Urgent (≤ 6h)", counts.urgent, "text-amber-700"], ["Overdue", counts.overdue, "text-red-600"], ["Confirmed", counts.confirmed, "text-emerald-700"], ["Not available", counts.rejected, "text-rose-700"]].map(([label, value, cls]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-600">{label}</p>
            <p className={`mt-0.5 text-xl font-extrabold tabular-nums ${cls}`}>{value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" onClick={() => { setStatus(v); setPage(1); setOpenId(null); }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${status === v ? "border-teal-600 bg-teal-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
            {l}{v === "open" && counts.open ? ` (${counts.open})` : ""}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Product or partner"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm" />
        </div>
      </div>

      <div className={`space-y-3 ${isFetching ? "opacity-70" : ""}`}>
        {isLoading ? <p className="py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></p>
          : isError ? <p className="py-12 text-center text-sm text-red-600">Could not load sourcing requests.</p>
          : rows.length === 0 ? <p className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">No requests here.</p>
          : rows.map((r) => {
            const [sLabel, sCls] = STATUS[r.status] || STATUS.pending;
            const left = r.is_open ? timeLeft(r.deadline_at, now) : "";
            const client = r.client?.dropshipper?.business_name || r.client?.dropshipper?.name;
            return (
              <article key={r.id} className={`rounded-xl border p-4 ${rowTone(r)}`}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <a href={imageUrl(r.product_image)} target="_blank" rel="noreferrer" className="shrink-0">
                    <img src={imageUrl(r.product_image)} alt={r.product_name} loading="lazy" className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">{r.product_name}</h2>
                      <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${sCls}`}>{sLabel}</span>
                      {r.is_open && (r.is_overdue || r.confirmation_deadline === "2h") && <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">URGENT</span>}
                      {r.is_open && !r.is_overdue && r.confirmation_deadline !== "2h" && r.is_urgent && <span className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">SOON</span>}
                    </div>
                    <p className="mt-1 text-xs text-gray-700">
                      <b>{r.partner?.business_name || r.partner?.name}</b>{r.partner?.business_name && r.partner?.name ? ` (${r.partner.name})` : ""}
                      {r.partner?.phone && <span className="text-gray-500"> · {r.partner.phone}</span>}
                      {client && <span className="text-gray-500"> · for client {client}</span>}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                      <span>📢 {PLATFORM[r.campaign_platform] || r.campaign_platform}</span>
                      <span>💵 ${Number(r.daily_budget_usd)}/day</span>
                      <span>{CAMPAIGN[r.campaign_status] || r.campaign_status}</span>
                      <span>Sent {fmt(r.created_at)}</span>
                      <span className={r.is_overdue ? "font-bold text-red-700" : r.is_urgent ? "font-bold text-amber-700" : ""}>
                        ⏱️ Due {fmt(r.deadline_at)}{left && ` (${left})`}
                      </span>
                    </p>
                    {r.special_note && <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-800 ring-1 ring-gray-100">📝 {r.special_note}</p>}
                    {(r.quoted_price_bdt || r.admin_note || r.linked_product) && (
                      <p className="mt-2 text-xs text-gray-700">
                        {r.quoted_price_bdt && <b className="text-emerald-700">৳{Number(r.quoted_price_bdt).toLocaleString("en-BD")} incl. packaging</b>}
                        {r.linked_product && <span> · Product: {r.linked_product.name} (#{r.linked_product.id})</span>}
                        {r.admin_note && <span> · “{r.admin_note}”</span>}
                        {r.handler?.name && <span className="text-gray-500"> · by {r.handler.name}</span>}
                      </p>
                    )}
                  </div>
                  {r.status !== "withdrawn" && openId !== r.id && (
                    <div className="shrink-0 sm:text-right">
                      <button type="button" onClick={() => setOpenId(r.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold ${r.is_open ? "bg-teal-600 text-white hover:bg-teal-700" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
                        {r.is_open ? "Answer" : "Edit"}
                      </button>
                    </div>
                  )}
                </div>
                {openId === r.id && <AnswerForm req={r} onDone={() => setOpenId(null)} />}
              </article>
            );
          })}
      </div>

      {last > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {page} / {last}</span>
          <button type="button" disabled={page >= last} onClick={() => setPage(page + 1)} className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminSourcingRequests;
