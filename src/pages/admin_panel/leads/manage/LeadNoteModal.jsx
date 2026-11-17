import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { useGetLeadQuery, useLogLeadContactMutation, useUpdateLeadMutation } from "../../../../redux/features/leads";
import {
  ACTIVITY_LABELS,
  FOLLOWUP_TAGS,
  LEAD_STATUSES,
  callPresets,
  findOption,
  formatDateTime,
  fromLocalInput,
  telUrl,
  toLocalInput,
  whatsappUrl,
} from "./leadConstants";

const timelineText = (a) => {
  const label = ACTIVITY_LABELS[a.type] || a.type;
  if (a.type === "status_changed") {
    return `${label}: ${findOption(LEAD_STATUSES, a.from_value)?.label || a.from_value || "—"} → ${findOption(LEAD_STATUSES, a.to_value)?.label || a.to_value}`;
  }
  if (a.type === "followup_changed") return `${label}: ${findOption(FOLLOWUP_TAGS, a.to_value)?.label || "cleared"}`;
  if (a.type === "scheduled") return a.to_value ? `${label}: ${formatDateTime(a.to_value.replace(" ", "T") + "Z")}` : "Next call cleared";
  return label;
};

/** "Notes & follow-up" window: one-click tag, next call presets, conversation notes, timeline. */
const LeadNoteModal = ({ lead, onClose }) => {
  const [tag, setTag] = useState(lead.followup_tag || "");
  const [nextCall, setNextCall] = useState(toLocalInput(lead.next_call_at));
  const [note, setNote] = useState(lead.note || "");
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const [logContact] = useLogLeadContactMutation();
  const { data: detail } = useGetLeadQuery(lead.id);
  const activities = detail?.data?.activities || [];

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addTimestamp = () => {
    const stamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });
    setNote((prev) => `${prev ? `${prev.trimEnd()}\n` : ""}[${stamp}] `);
  };

  const save = async () => {
    try {
      await updateLead({
        id: lead.id,
        followup_tag: tag || null,
        next_call_at: fromLocalInput(nextCall),
        note: note || null,
      }).unwrap();
      toast.success("Follow-up saved");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not save");
    }
  };

  const contact = (channel, url) => {
    if (url) window.open(url, channel === "call" ? "_self" : "_blank", "noopener");
    logContact({ id: lead.id, channel });
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notes and follow-up"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Notes & follow-up</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              {lead.name ? `${lead.name} · ` : ""}
              <span className="font-mono">{lead.phone}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => contact("call", telUrl(lead))} className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
              <Phone className="h-3.5 w-3.5" /> Call
            </button>
            <button type="button" onClick={() => contact("whatsapp", whatsappUrl(lead))} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-600">Follow-up tag (one click)</p>
            <div className="flex flex-wrap gap-2">
              {FOLLOWUP_TAGS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={tag === t.value}
                  onClick={() => setTag(tag === t.value ? "" : t.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    tag === t.value ? `${t.className} ring-2 ring-offset-1 ring-gray-400` : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="lead-next-call" className="mb-2 block text-xs font-semibold text-gray-600">Next call / free time</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="lead-next-call"
                type="datetime-local"
                value={nextCall}
                onChange={(e) => setNextCall(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {callPresets().map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setNextCall(toLocalInput(p.value))}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  {p.label}
                </button>
              ))}
              <button type="button" onClick={() => setNextCall("")} className="px-1 text-xs font-semibold text-red-600 hover:underline">
                Clear
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="lead-note" className="text-xs font-semibold text-gray-600">Conversation & notes</label>
              <button type="button" onClick={addTimestamp} className="text-xs font-semibold text-indigo-700 hover:underline">
                + Add current time
              </button>
            </div>
            <textarea
              id="lead-note"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did they say?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {activities.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-600">History</p>
              <ol className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-xs">
                {activities.map((a) => (
                  <li key={a.id} className="flex flex-wrap gap-x-2 text-gray-700">
                    <span className="whitespace-nowrap text-gray-400">{formatDateTime(a.created_at)}</span>
                    <span>{timelineText(a)}</span>
                    {a.admin?.name && <span className="text-gray-400">· {a.admin.name}</span>}
                    {a.type === "note" && a.note && <span className="w-full whitespace-pre-wrap pl-2 text-gray-500">“{a.note}”</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500 bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-800 hover:bg-indigo-200 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadNoteModal;
