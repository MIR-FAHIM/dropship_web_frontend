import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CalendarDays, Check, ChevronDown, Loader2, Search, User, X } from "lucide-react";
import { useGetDropshippersQuery } from "../../../redux/features/user";

/* ---------- dates (Bangladesh time) ---------- */

const dhakaToday = () => {
  // en-CA gives YYYY-MM-DD.
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
};

const shiftDays = (ymd, days) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const DATE_PRESETS = [
  { key: "today", label: "Today", range: () => { const t = dhakaToday(); return [t, t]; } },
  { key: "yesterday", label: "Yesterday", range: () => { const y = shiftDays(dhakaToday(), -1); return [y, y]; } },
  { key: "7d", label: "Last 7 days", range: () => { const t = dhakaToday(); return [shiftDays(t, -6), t]; } },
  { key: "30d", label: "Last 30 days", range: () => { const t = dhakaToday(); return [shiftDays(t, -29), t]; } },
  { key: "month", label: "This month", range: () => { const t = dhakaToday(); return [`${t.slice(0, 8)}01`, t]; } },
];

const fmtDay = (ymd) =>
  ymd ? new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "";

export const describeDateRange = (from, to) => {
  if (from && to) return from === to ? fmtDay(from) : `${fmtDay(from)} – ${fmtDay(to)}`;
  if (from) return `From ${fmtDay(from)}`;
  if (to) return `Until ${fmtDay(to)}`;
  return "";
};

/* ---------- date filter ---------- */

export const OrderDateFilter = ({ dateFrom, dateTo, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const label = describeDateRange(dateFrom, dateTo) || "Any date";
  const active = Boolean(dateFrom || dateTo);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold shadow-2xs transition ${
          active ? "border-red-300 bg-red-50 text-red-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <CalendarDays className="h-4 w-4" />
        <span className="max-w-[170px] truncate">{label}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl sm:left-0 sm:right-auto">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Order date (Bangladesh time)</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => { const [f, t] = p.range(); onChange(f, t); setOpen(false); }}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] font-medium text-gray-600" htmlFor="order-date-from">
              From
              <input
                id="order-date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => onChange(e.target.value, dateTo)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
              />
            </label>
            <label className="text-[11px] font-medium text-gray-600" htmlFor="order-date-to">
              To
              <input
                id="order-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => onChange(dateFrom, e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
              />
            </label>
          </div>
          {active && (
            <button
              type="button"
              onClick={() => { onChange("", ""); setOpen(false); }}
              className="mt-3 text-[11px] font-semibold text-red-600 hover:underline"
            >
              Clear date filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

OrderDateFilter.propTypes = {
  dateFrom: PropTypes.string.isRequired,
  dateTo: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

/* ---------- dropshipper filter ---------- */

export const DropshipperFilter = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  // Server-side search: there can be thousands of dropshippers.
  const { data, isFetching } = useGetDropshippersQuery({ search: debounced, per_page: 20 }, { skip: !open });
  const list = data?.data?.data || (Array.isArray(data?.data) ? data.data : []);

  const pick = (user) => {
    onSelect(user ? { id: user.id, name: user.name, phone: user.phone } : null);
    setOpen(false);
    setTerm("");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold shadow-2xs transition ${
          selected ? "border-red-300 bg-red-50 text-red-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <User className="h-4 w-4" />
        <span className="max-w-[150px] truncate">{selected ? selected.name || `#${selected.id}` : "All dropshippers"}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-72 rounded-xl border border-gray-200 bg-white shadow-xl sm:left-0 sm:right-auto">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                id="dropshipper-filter-search"
                autoFocus
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Name, phone, email or ID"
                className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => pick(null)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs ${!selected ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
              All dropshippers
              {!selected && <Check className="h-3.5 w-3.5" />}
            </button>
            {isFetching && list.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…</div>
            ) : list.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400">No dropshipper found.</p>
            ) : (
              list.map((u) => {
                const isSelected = selected && String(selected.id) === String(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => pick(u)}
                    className={`flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-xs ${isSelected ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{u.name || "Unnamed"} <span className="font-mono text-[10px] font-normal text-gray-400">#{u.id}</span></span>
                      <span className="block truncate text-[11px] text-gray-400">
                        {[u.phone, u.total_order_count != null ? `${u.total_order_count} orders` : null].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {isSelected && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

DropshipperFilter.propTypes = {
  selected: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string, phone: PropTypes.string }),
  onSelect: PropTypes.func.isRequired,
};

/* ---------- active filter chips ---------- */

export const ClearFilterChip = ({ label, onClear }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
    {label}
    <button type="button" onClick={onClear} aria-label={`Remove ${label}`} className="rounded-full hover:text-red-900">
      <X className="h-3 w-3" />
    </button>
  </span>
);

ClearFilterChip.propTypes = { label: PropTypes.string.isRequired, onClear: PropTypes.func.isRequired };
