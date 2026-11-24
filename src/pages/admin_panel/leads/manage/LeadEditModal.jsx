import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useUpdateLeadMutation } from "../../../../redux/features/leads";
import { FOLLOWUP_TAGS, LEAD_STATUSES, ROLES as DEFAULT_ROLES, fromLocalInput, toLocalInput } from "./leadConstants";

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

/** Edit every field of a lead. */
const LeadEditModal = ({ lead, tags, roles, onClose }) => {
  const ROLES = roles?.length ? roles : DEFAULT_ROLES;
  const [form, setForm] = useState({
    name: lead.name || "",
    phone: lead.phone || "",
    page_link: lead.page_link || "",
    product_tag_id: lead.product_tag_id ? String(lead.product_tag_id) : "",
    role: lead.role || "dropshipper",
    status: lead.status || "new",
    followup_tag: lead.followup_tag || "",
    next_call_at: toLocalInput(lead.next_call_at),
    note: lead.note || "",
  });
  const [errors, setErrors] = useState({});
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      setErrors({ phone: "Phone number is required." });
      return;
    }
    try {
      await updateLead({
        id: lead.id,
        name: form.name || null,
        phone: form.phone,
        page_link: form.page_link || null,
        product_tag_id: form.product_tag_id ? Number(form.product_tag_id) : null,
        role: form.role,
        status: form.status,
        followup_tag: form.followup_tag || null,
        next_call_at: fromLocalInput(form.next_call_at),
        note: form.note || null,
      }).unwrap();
      toast.success("Lead updated");
      onClose();
    } catch (err) {
      const errs = err?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(errs).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v[0]])));
      toast.error(err?.data?.message || "Could not update the lead");
    }
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Edit lead"
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Edit lead</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-gray-600">
            Name
            <input className={`${field} mt-1`} value={form.name} onChange={set("name")} />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Phone *
            <input className={`${field} mt-1 ${errors.phone ? "border-red-400" : ""}`} value={form.phone} onChange={set("phone")} required />
            {errors.phone && <span className="mt-1 block text-xs font-normal text-red-600">{errors.phone}</span>}
          </label>
          <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
            Page or website link
            <input className={`${field} mt-1`} value={form.page_link} onChange={set("page_link")} placeholder="facebook.com/page-name" />
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Product tag
            <select className={`${field} mt-1 bg-white`} value={form.product_tag_id} onChange={set("product_tag_id")}>
              <option value="">No tag</option>
              {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Role
            <select className={`${field} mt-1 bg-white`} value={form.role} onChange={set("role")}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Status
            <select className={`${field} mt-1 bg-white`} value={form.status} onChange={set("status")}>
              {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600">
            Follow-up tag
            <select className={`${field} mt-1 bg-white`} value={form.followup_tag} onChange={set("followup_tag")}>
              <option value="">No tag</option>
              {FOLLOWUP_TAGS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
            Next call / free time
            <input type="datetime-local" className={`${field} mt-1`} value={form.next_call_at} onChange={set("next_call_at")} />
          </label>
          <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
            Notes
            <textarea rows={4} className={`${field} mt-1`} value={form.note} onChange={set("note")} />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500 bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-800 hover:bg-indigo-200 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadEditModal;
