import { useMemo, useState } from "react";
import { Edit3, Loader2, Megaphone, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAddNoticeMutation,
  useDeleteNoticeMutation,
  useGetAdminNoticesQuery,
  useUpdateNoticeMutation,
} from "../../../redux/features/notice";
import {
  formatNoticeDate,
  formatNoticeLabel,
  getApiErrorMessage,
  getNoticeList,
  noticePriorityClass,
} from "../../../utils/notice.utils";

const initialForm = {
  title: "",
  message: "",
  audience_type: "reseller",
  notice_type: "general",
  priority: "normal",
  status: "draft",
  published_at: "",
  expires_at: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100";
const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500";

const normalizeDateTime = (value) => {
  if (!value) return "";
  const normalized = String(value).replace("T", " ");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

const cleanPayload = (form) => {
  const payload = {
    ...form,
    published_at: normalizeDateTime(form.published_at),
    expires_at: normalizeDateTime(form.expires_at),
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
  );
};

const AdminNotices = () => {
  const [filters, setFilters] = useState({ status: "", priority: "", audience_type: "" });
  const [form, setForm] = useState(initialForm);
  const [editingNotice, setEditingNotice] = useState(null);
  const queryParams = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
    [filters]
  );
  const { data, isLoading, isFetching, isError, error } = useGetAdminNoticesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const [addNotice, { isLoading: creating }] = useAddNoticeMutation();
  const [updateNotice, { isLoading: updating }] = useUpdateNoticeMutation();
  const [deleteNotice, { isLoading: deleting }] = useDeleteNoticeMutation();
  const notices = getNoticeList(data);
  const saving = creating || updating;

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingNotice(null);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || "",
      message: notice.message || "",
      audience_type: notice.audience_type || "reseller",
      notice_type: notice.notice_type || "general",
      priority: notice.priority || "normal",
      status: notice.status || "draft",
      published_at: notice.published_at ? String(notice.published_at).slice(0, 16).replace(" ", "T") : "",
      expires_at: notice.expires_at ? String(notice.expires_at).slice(0, 16).replace(" ", "T") : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.message.trim()) return toast.error("Message is required");

    try {
      const payload = cleanPayload(form);
      if (editingNotice?.id) {
        await updateNotice({ id: editingNotice.id, ...payload }).unwrap();
        toast.success("Notice updated successfully");
      } else {
        await addNotice(payload).unwrap();
        toast.success("Notice created successfully");
      }
      resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Notice save failed"));
    }
  };

  const handleDelete = async (notice) => {
    if (!window.confirm(`Delete notice "${notice.title || notice.id}"?`)) return;
    try {
      await deleteNotice(notice.id).unwrap();
      toast.success("Notice deleted successfully");
      if (editingNotice?.id === notice.id) resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Notice delete failed"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-green-900 to-emerald-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Notice Management</h1>
            <p className="text-sm text-green-100">Create and manage notices for reseller panel users.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-gray-800">{editingNotice ? "Edit Notice" : "Add Notice"}</h2>
          {editingNotice ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Title</label>
            <input name="title" value={form.title} onChange={updateForm} className={inputClass} placeholder="Notice title" />
          </div>
          <div>
            <label className={labelClass}>Notice Type</label>
            <input name="notice_type" value={form.notice_type} onChange={updateForm} className={inputClass} placeholder="general" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={updateForm}
              rows={4}
              className={inputClass}
              placeholder="Plain text notice message"
            />
          </div>
          <div>
            <label className={labelClass}>Audience Type</label>
            <select name="audience_type" value={form.audience_type} onChange={updateForm} className={inputClass}>
              <option value="reseller">Reseller</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select name="priority" value={form.priority} onChange={updateForm} className={inputClass}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={updateForm} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Published At</label>
            <input type="datetime-local" name="published_at" value={form.published_at} onChange={updateForm} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Expires At</label>
            <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={updateForm} className={inputClass} />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingNotice ? "Update Notice" : "Add Notice"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">
          <select name="status" value={filters.status} onChange={updateFilter} className={inputClass}>
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="inactive">Inactive</option>
          </select>
          <select name="priority" value={filters.priority} onChange={updateFilter} className={inputClass}>
            <option value="">All priority</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select name="audience_type" value={filters.audience_type} onChange={updateFilter} className={inputClass}>
            <option value="">All audience</option>
            <option value="reseller">Reseller</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-green-600" />
                    Loading notices...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-red-600">
                    {error?.data?.message || "Failed to load notices"}
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    No notices available
                  </td>
                </tr>
              ) : (
                notices.map((notice) => {
                  const priority = String(notice.priority || "normal").toLowerCase();
                  return (
                    <tr key={notice.id} className="align-top hover:bg-gray-50">
                      <td className="max-w-[260px] px-4 py-3">
                        <p className="font-bold text-gray-900">{notice.title || "-"}</p>
                        <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs leading-5 text-gray-500">{notice.message || "-"}</p>
                      </td>
                      <td className="px-4 py-3">{formatNoticeLabel(notice.audience_type)}</td>
                      <td className="px-4 py-3">{formatNoticeLabel(notice.notice_type)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${noticePriorityClass[priority] || noticePriorityClass.normal}`}>
                          {formatNoticeLabel(priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatNoticeLabel(notice.status)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatNoticeDate(notice.published_at) || "-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatNoticeDate(notice.expires_at) || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(notice)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(notice)}
                            disabled={deleting}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;
