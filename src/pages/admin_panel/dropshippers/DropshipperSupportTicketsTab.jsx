import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Headset, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useChangeTicketStatusMutation,
  useGetAdminUserSupportTicketsQuery,
} from "../../../redux/features/support";
import { imgBaseUrl } from "../../../../config";

// Same statuses as the admin Support Tickets page.
const STATUSES = [
  { value: "open", label: "Open", className: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "in progress", label: "In progress", className: "border-amber-200 bg-amber-50 text-amber-800" },
  { value: "resolved", label: "Resolved", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "closed", label: "Closed", className: "border-gray-200 bg-gray-100 text-gray-600" },
];
const statusMeta = (status) =>
  STATUSES.find((s) => s.value === String(status || "").toLowerCase()) || {
    label: status || "—",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  };

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const imageUrl = (image) => {
  if (!image) return null;
  if (image.external_link) return image.external_link;
  if (!image.file_name) return null;
  return /^https?:\/\//i.test(image.file_name) ? image.file_name : `${imgBaseUrl}/${image.file_name}`;
};

const StatusBadge = ({ status }) => {
  const meta = statusMeta(status);
  return (
    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${meta.className}`}>
      {meta.label}
    </span>
  );
};

const TicketCard = ({ ticket }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(String(ticket.status || "open").toLowerCase());
  const [note, setNote] = useState(ticket.admin_note || "");
  const [changeStatus, { isLoading }] = useChangeTicketStatusMutation();
  const img = imageUrl(ticket.image);
  const dirty = status !== String(ticket.status || "").toLowerCase() || note !== (ticket.admin_note || "");

  const save = async () => {
    try {
      await changeStatus({ id: ticket.id, status, admin_note: note }).unwrap();
      toast.success("টিকিট আপডেট হয়েছে");
    } catch (err) {
      toast.error(err?.data?.message || "টিকিট আপডেট করা যায়নি");
    }
  };

  return (
    <li className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50/70"
      >
        <span className="mt-0.5 font-mono text-xs font-semibold text-gray-400">#{ticket.id}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-gray-900">{ticket.title || "—"}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
            <span className="capitalize">{ticket.support_type || "—"}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDateTime(ticket.created_at)}</span>
            {ticket.order_id && (
              <>
                <span aria-hidden="true">·</span>
                <span>অর্ডার {ticket.order?.order_number || `#${ticket.order_id}`}</span>
              </>
            )}
            {img && <ImageIcon className="h-3 w-3 text-gray-400" aria-label="ছবি সংযুক্ত" />}
          </span>
        </span>
        <StatusBadge status={ticket.status} />
        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-gray-100 px-4 py-4">
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500">বিবরণ</p>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{ticket.description || "—"}</p>
          </div>

          {ticket.order_id && (
            <Link to={`/admin-panel/orders/${ticket.order_id}`} className="inline-block text-xs font-semibold text-blue-700 hover:underline">
              অর্ডার {ticket.order?.order_number || `#${ticket.order_id}`} দেখুন →
            </Link>
          )}

          {img && (
            <a href={img} target="_blank" rel="noopener noreferrer" className="inline-block">
              <img src={img} alt="টিকিটের ছবি" loading="lazy" className="max-h-48 rounded-lg border border-gray-200 object-contain" />
            </a>
          )}

          <div className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
            <div>
              <label htmlFor={`ticket-status-${ticket.id}`} className="mb-1 block text-xs font-medium text-gray-600">স্ট্যাটাস</label>
              <select
                id={`ticket-status-${ticket.id}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`ticket-note-${ticket.id}`} className="mb-1 block text-xs font-medium text-gray-600">অ্যাডমিন নোট</label>
              <input
                id={`ticket-note-${ticket.id}`}
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ড্রপশিপারের জন্য নোট"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || isLoading}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              সেভ করুন
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

/** Support Tickets tab on the admin dropshipper details page. */
const DropshipperSupportTicketsTab = ({ dropshipperId }) => {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminUserSupportTicketsQuery(
    { userId: dropshipperId, status, page },
    { skip: !dropshipperId }
  );

  const pagination = data?.data || {};
  const tickets = Array.isArray(pagination.data) ? pagination.data : [];
  const summary = data?.summary || {};
  const currentPage = Number(pagination.current_page || page);
  const lastPage = Number(pagination.last_page || 1);

  const chips = [{ value: "all", label: "সব", count: summary.total }, ...STATUSES.map((s) => ({ ...s, count: summary[s.value] }))];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-gray-900">সাপোর্ট টিকিট</h2>
          <p className="mt-1 text-xs text-gray-500">এই ড্রপশিপারের সব সাপোর্ট টিকিট</p>
        </div>
        <Link to="/admin-panel/support-tickets" className="text-xs font-semibold text-blue-700 hover:underline">
          সব টিকিট →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50/60 px-5 py-3" role="group" aria-label="স্ট্যাটাস ফিল্টার">
        {chips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            aria-pressed={status === chip.value}
            onClick={() => {
              setStatus(chip.value);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              status === chip.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {chip.label} <span className="tabular-nums opacity-70">({chip.count ?? 0})</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-sm text-gray-500">টিকিট লোড হচ্ছে…</div>
      ) : isError ? (
        <div className="p-10 text-center text-sm text-rose-600">
          টিকিট লোড করা যায়নি।{" "}
          <button type="button" onClick={refetch} className="font-semibold underline">আবার চেষ্টা করুন</button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-10 text-center">
          <Headset className="mx-auto mb-2 h-9 w-9 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            {status === "all" ? "এই ড্রপশিপারের কোনো সাপোর্ট টিকিট নেই" : "এই স্ট্যাটাসে কোনো টিকিট নেই"}
          </p>
        </div>
      ) : (
        <>
          <ul className={`space-y-2 p-4 ${isFetching ? "opacity-60" : ""}`} aria-busy={isFetching}>
            {tickets.map((ticket) => (
              <TicketCard key={`${ticket.id}-${ticket.updated_at}`} ticket={ticket} />
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-xs text-gray-500">মোট {pagination.total ?? tickets.length}টি টিকিট</span>
            {lastPage > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">পৃষ্ঠা {currentPage} / {lastPage}</span>
                <button
                  type="button"
                  disabled={currentPage <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> আগের
                </button>
                <button
                  type="button"
                  disabled={currentPage >= lastPage || isFetching}
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-40"
                >
                  পরের <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default DropshipperSupportTicketsTab;
