import React, { useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  ThumbsUp,
  MessageCircleQuestion,
  Rocket,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from "lucide-react";
import {
  useListEcommerceLeadsQuery,
  useUpdateEcommerceLeadStatusMutation,
} from "../../../redux/features/ecommerceLead";

const STATUS_TABS = [
  { value: "", label: "সব" },
  { value: "new", label: "নতুন" },
  { value: "contacted", label: "যোগাযোগ হয়েছে" },
  { value: "closed", label: "বন্ধ" },
];

const LEAD_TYPE_META = {
  interested_later: { label: "আগ্রহী — পরে কথা বলবেন", icon: ThumbsUp, color: "bg-teal-50 text-teal-600" },
  question: { label: "প্রশ্ন করেছেন", icon: MessageCircleQuestion, color: "bg-indigo-50 text-indigo-600" },
  show_packages: { label: "প্যাকেজ দেখতে চান", icon: Rocket, color: "bg-amber-50 text-amber-600" },
};

const STATUS_META = {
  new: { label: "নতুন", pill: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  contacted: { label: "যোগাযোগ হয়েছে", pill: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  closed: { label: "বন্ধ", pill: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

const fmt = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
};

const StatusUpdateModal = ({ lead, onClose }) => {
  const [status, setStatus] = useState(lead.status === "new" ? "contacted" : lead.status);
  const [note, setNote] = useState(lead.admin_note || "");
  const [updateStatus, { isLoading }] = useUpdateEcommerceLeadStatusMutation();

  const handleSave = async () => {
    try {
      await updateStatus({ id: lead.id, status, admin_note: note }).unwrap();
      toast.success("লিড আপডেট করা হয়েছে");
      onClose();
    } catch {
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5 relative">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-bold text-gray-800 mb-4">লিড আপডেট করুন</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">স্ট্যাটাস</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="new">নতুন</option>
              <option value="contacted">যোগাযোগ হয়েছে</option>
              <option value="closed">বন্ধ</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">নোট</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="যোগাযোগের বিস্তারিত লিখুন..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="w-full mt-4 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
        >
          সংরক্ষণ করুন
        </button>
      </div>
    </div>
  );
};

const AdminEcommerceLeads = () => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [activeLead, setActiveLead] = useState(null);

  const { data, isLoading, isError } = useListEcommerceLeadsQuery({
    status: status || undefined,
    page,
  });

  const leads = data?.data?.data || [];
  const meta = data?.data;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">ইকমার্স ওয়েবসাইট লিড</h1>
          <p className="text-xs text-gray-400">/app/ecommerce-website পেজ থেকে সংগৃহীত লিডসমূহ</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setStatus(t.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              status === t.value ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">লোড হচ্ছে…</div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500 text-sm">ডেটা লোড করতে সমস্যা হয়েছে।</div>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">কোনো লিড পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ড্রপশিপার", "ধরন", "প্রশ্ন / নোট", "স্ট্যাটাস", "তারিখ", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const typeMeta = LEAD_TYPE_META[lead.lead_type] || { label: lead.lead_type, icon: Globe, color: "bg-gray-50 text-gray-500" };
                  const TypeIcon = typeMeta.icon;
                  const statusMeta = STATUS_META[lead.status] || STATUS_META.new;
                  return (
                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition align-top">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{lead.user?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{lead.user?.phone || lead.user?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${typeMeta.color}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-gray-600 text-xs">{lead.message || "—"}</p>
                        {lead.admin_note && <p className="text-[11px] text-gray-400 mt-1">নোট: {lead.admin_note}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.pill}`}>{statusMeta.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmt(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setActiveLead(lead)}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          আপডেট করুন
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta?.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                p === page ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {activeLead && <StatusUpdateModal lead={activeLead} onClose={() => setActiveLead(null)} />}
    </div>
  );
};

export default AdminEcommerceLeads;
