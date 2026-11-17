// Labels, colours and helpers for the Lead Manager (values match LeadController / Lead model).

export const LEAD_STATUSES = [
  { value: "new", label: "⚡ New", className: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "contacted", label: "💬 Contacted", className: "border-amber-200 bg-amber-50 text-amber-800" },
  { value: "converted", label: "✅ Converted", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "cancelled", label: "❌ Cancelled", className: "border-red-200 bg-red-50 text-red-700" },
];

export const FOLLOWUP_TAGS = [
  { value: "phone_off", label: "📵 Phone off", className: "border-gray-300 bg-gray-100 text-gray-700" },
  { value: "no_answer", label: "🔕 No answer", className: "border-slate-300 bg-slate-100 text-slate-700" },
  { value: "call_later", label: "⏳ Call later / busy", className: "border-amber-200 bg-amber-50 text-amber-800" },
  { value: "messaged", label: "💬 Message sent", className: "border-sky-200 bg-sky-50 text-sky-700" },
  { value: "interested", label: "🤝 Interested", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "not_interested", label: "❌ Not interested", className: "border-red-200 bg-red-50 text-red-700" },
];

export const ROLES = [
  { value: "dropshipper", label: "Dropshipper (D)", short: "D", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  { value: "supplier", label: "Supplier (S)", short: "S", className: "border-purple-200 bg-purple-50 text-purple-700" },
];

export const findOption = (list, value) => list.find((o) => o.value === value);

/** 01XXXXXXXXX -> 8801XXXXXXXXX for wa.me links. */
export const whatsappUrl = (lead) => {
  const n = String(lead?.phone_normalized || lead?.phone || "").replace(/\D/g, "");
  if (!n) return null;
  const intl = n.startsWith("880") ? n : n.startsWith("0") ? `88${n}` : n;
  return `https://wa.me/${intl}`;
};

export const telUrl = (lead) => {
  const n = String(lead?.phone || lead?.phone_normalized || "").replace(/[^\d+]/g, "");
  return n ? `tel:${n}` : null;
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/** Value for <input type="datetime-local"> from an ISO date (Dhaka time). */
export const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dhaka = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const pad = (n) => String(n).padStart(2, "0");
  return `${dhaka.getFullYear()}-${pad(dhaka.getMonth() + 1)}-${pad(dhaka.getDate())}T${pad(dhaka.getHours())}:${pad(dhaka.getMinutes())}`;
};

/** datetime-local value (Dhaka wall time) -> UTC ISO for the API. */
export const fromLocalInput = (value) => {
  if (!value) return null;
  // Bangladesh is UTC+6 with no daylight saving.
  const d = new Date(`${value}:00+06:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** Next-call presets from the demo, as UTC ISO strings. */
export const callPresets = () => {
  const now = new Date();
  const dhakaDate = (dayOffset, hour) => {
    const today = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    today.setDate(today.getDate() + dayOffset);
    const pad = (n) => String(n).padStart(2, "0");
    return fromLocalInput(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T${pad(hour)}:00`);
  };
  return [
    { label: "+1 hour", value: new Date(now.getTime() + 3600e3).toISOString() },
    { label: "+3 hours", value: new Date(now.getTime() + 3 * 3600e3).toISOString() },
    { label: "Today 5:00 PM", value: dhakaDate(0, 17) },
    { label: "Tomorrow 11:00 AM", value: dhakaDate(1, 11) },
    { label: "Tomorrow 4:00 PM", value: dhakaDate(1, 16) },
  ];
};

export const isOverdue = (lead) =>
  Boolean(lead?.next_call_at) &&
  !["converted", "cancelled"].includes(lead?.status) &&
  new Date(lead.next_call_at).getTime() <= Date.now();

export const ACTIVITY_LABELS = {
  created: "Lead created",
  updated: "Details edited",
  status_changed: "Status changed",
  followup_changed: "Follow-up tag",
  note: "Note added",
  call: "Called",
  whatsapp: "WhatsApp opened",
  scheduled: "Next call set",
  converted: "Converted",
};
