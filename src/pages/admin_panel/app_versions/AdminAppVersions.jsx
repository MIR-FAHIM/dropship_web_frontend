import { useState } from "react";
import { Edit3, Loader2, Plus, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAddAppVersionMutation,
  useGetAppVersionsQuery,
  useToggleAppVersionMutation,
  useUpdateAppVersionMutation,
} from "../../../redux/features/appVersion";
import { getApiErrorMessage } from "../../../utils/notice.utils";

const initialForm = {
  platform: "android",
  version_name: "",
  build_number: "",
  min_supported_build: "",
  store_url: "",
  title: "",
  release_notes: "",
  is_force_update: false,
  is_active: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100";
const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500";

const getList = (data) => {
  const list = data?.data;
  if (Array.isArray(list)) return list;
  if (Array.isArray(list?.data)) return list.data;
  return [];
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** Mobile app releases: the newest active build per platform is offered to users. */
const AdminAppVersions = () => {
  const [platform, setPlatform] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching, isError, error } = useGetAppVersionsQuery(
    platform ? { platform } : {},
    { refetchOnMountOrArgChange: true }
  );
  const [addVersion, { isLoading: isAdding }] = useAddAppVersionMutation();
  const [updateVersion, { isLoading: isUpdating }] = useUpdateAppVersionMutation();
  const [toggleVersion, { isLoading: isToggling, originalArgs: togglingId }] =
    useToggleAppVersionMutation();

  const versions = getList(data);
  const saving = isAdding || isUpdating;

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setFormOpen(true);
  };

  const openEdit = (version) => {
    setEditing(version);
    setForm({
      platform: version.platform || "android",
      version_name: version.version_name || "",
      build_number: String(version.build_number ?? ""),
      min_supported_build: String(version.min_supported_build ?? ""),
      store_url: version.store_url || "",
      title: version.title || "",
      release_notes: version.release_notes || "",
      is_force_update: Boolean(version.is_force_update),
      is_active: Boolean(version.is_active),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      build_number: Number(form.build_number),
      min_supported_build: form.min_supported_build === "" ? 0 : Number(form.min_supported_build),
      title: form.title.trim() || null,
      release_notes: form.release_notes.trim() || null,
      is_force_update: form.is_force_update ? 1 : 0,
      is_active: form.is_active ? 1 : 0,
    };
    try {
      if (editing) {
        await updateVersion({ id: editing.id, ...payload }).unwrap();
        toast.success("Release updated");
      } else {
        await addVersion(payload).unwrap();
        toast.success("Release added");
      }
      closeForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save the release"));
    }
  };

  const handleToggle = async (version) => {
    try {
      const result = await toggleVersion(version.id).unwrap();
      toast.success(result?.message || "Updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update the release"));
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Smartphone className="h-5 w-5 text-green-600" /> App Updates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            The newest active build per platform is offered to app users. Builds below
            “min supported” (or below a forced release) must update before using the app.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" /> New release
        </button>
      </div>

      <div className="flex gap-2">
        {[
          ["", "All"],
          ["android", "Android"],
          ["ios", "iOS"],
        ].map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setPlatform(value)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              platform === value
                ? "border-green-600 bg-green-50 font-semibold text-green-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
        {isFetching && !isLoading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Version (build)</th>
              <th className="px-4 py-3">Min supported</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Release notes</th>
              <th className="px-4 py-3">Released</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-red-600">
                  {getApiErrorMessage(error, "Could not load releases")}
                </td>
              </tr>
            ) : versions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  No releases yet. Add one after the build is live in the store.
                </td>
              </tr>
            ) : (
              versions.map((version) => (
                <tr key={version.id} className={version.is_active ? "" : "bg-gray-50 text-gray-400"}>
                  <td className="px-4 py-3 font-medium capitalize">
                    {version.platform === "ios" ? "iOS" : "Android"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {version.version_name} ({version.build_number})
                  </td>
                  <td className="px-4 py-3">{version.min_supported_build}</td>
                  <td className="px-4 py-3">
                    {version.is_force_update ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Forced
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3" title={version.release_notes || ""}>
                    {version.release_notes || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(version.released_at)}</td>
                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-green-600"
                        checked={Boolean(version.is_active)}
                        disabled={isToggling && togglingId === version.id}
                        onChange={() => handleToggle(version)}
                      />
                      <span className="text-xs">{version.is_active ? "On" : "Off"}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(version)}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? "Edit release" : "New release"}
              </h2>
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Platform</label>
                <select className={inputClass} value={form.platform} onChange={setField("platform")}>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Version name</label>
                <input
                  className={inputClass}
                  placeholder="1.2.0"
                  required
                  value={form.version_name}
                  onChange={setField("version_name")}
                />
              </div>
              <div>
                <label className={labelClass}>Build number</label>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  placeholder="12"
                  required
                  value={form.build_number}
                  onChange={setField("build_number")}
                />
              </div>
              <div>
                <label className={labelClass}>Min supported build</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.min_supported_build}
                  onChange={setField("min_supported_build")}
                />
              </div>
            </div>
            <p className="-mt-2 text-xs text-gray-500">
              Build number is the number after “+” in pubspec.yaml (e.g. 1.2.0+12 → 12). Users on
              builds below “min supported” are forced to update.
            </p>

            <div>
              <label className={labelClass}>Store URL</label>
              <input
                className={inputClass}
                type="url"
                required
                placeholder="https://play.google.com/store/apps/details?id=..."
                value={form.store_url}
                onChange={setField("store_url")}
              />
            </div>
            <div>
              <label className={labelClass}>Dialog title (optional)</label>
              <input className={inputClass} value={form.title} onChange={setField("title")} />
            </div>
            <div>
              <label className={labelClass}>Release notes (what&apos;s new)</label>
              <textarea
                className={inputClass}
                rows={4}
                value={form.release_notes}
                onChange={setField("release_notes")}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-red-600"
                  checked={form.is_force_update}
                  onChange={setField("is_force_update")}
                />
                Force update
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-green-600"
                  checked={form.is_active}
                  onChange={setField("is_active")}
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Add release"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAppVersions;
