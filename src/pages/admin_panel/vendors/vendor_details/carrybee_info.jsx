import React, { useState } from "react";
import {
  Loader2, Truck, Plus, Pencil, Trash2, Eye, EyeOff,
  CheckCircle, XCircle, X, Save,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useListVendorCarryBeeCredentialsQuery,
  useAddVendorCarryBeeCredentialMutation,
  useUpdateVendorCarryBeeCredentialMutation,
  useDeleteVendorCarryBeeCredentialMutation,
} from "../../../../redux/features/vendor_carrybee";

/* ── helpers ── */
const EMPTY_FORM = {
  base_url: "",
  client_id: "",
  client_secret: "",
  client_context: "",
  is_active: true,
  note: "",
};

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    {children}
  </div>
);

const inp =
  "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

/* ── Modal form ── */
const CredentialModal = ({ vendorId, initial, onClose, onSaved }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    isEdit
      ? {
          base_url:       initial.base_url       || "",
          client_id:      initial.client_id      || "",
          client_secret:  initial.client_secret  || "",
          client_context: initial.client_context || "",
          is_active:      !!initial.is_active,
          note:           initial.note           || "",
        }
      : { ...EMPTY_FORM }
  );
  const [showSecret, setShowSecret] = useState(false);

  const [addCredential,    { isLoading: adding   }] = useAddVendorCarryBeeCredentialMutation();
  const [updateCredential, { isLoading: updating }] = useUpdateVendorCarryBeeCredentialMutation();
  const saving = adding || updating;

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateCredential({ id: initial.id, ...form }).unwrap();
        toast.success("Credential updated!");
      } else {
        await addCredential({ vendor_id: Number(vendorId), ...form }).unwrap();
        toast.success("Credential added!");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save credential.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "Edit Credential" : "Add New Credential"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Base URL">
            <input
              className={inp}
              placeholder="https://api.carrybee.com"
              value={form.base_url}
              onChange={set("base_url")}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client ID">
              <input
                className={inp}
                placeholder="client_id"
                value={form.client_id}
                onChange={set("client_id")}
              />
            </Field>
            <Field label="Client Secret">
              <div className="relative">
                <input
                  className={`${inp} pr-9`}
                  type={showSecret ? "text" : "password"}
                  placeholder="client_secret"
                  value={form.client_secret}
                  onChange={set("client_secret")}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>

          <Field label="Client Context">
            <input
              className={inp}
              placeholder="client_context"
              value={form.client_context}
              onChange={set("client_context")}
            />
          </Field>

          <Field label="Note">
            <textarea
              className={`${inp} resize-none`}
              rows={2}
              placeholder="Additional notes..."
              value={form.note}
              onChange={set("note")}
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 accent-red-500"
              checked={form.is_active}
              onChange={set("is_active")}
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main ── */
const CarryBeeInfo = ({ vendorId }) => {
  const { data, isLoading, isError, refetch } = useListVendorCarryBeeCredentialsQuery(
    { vendor_id: vendorId },
    { skip: !vendorId }
  );
  const credentials = Array.isArray(data?.data) ? data.data : [];

  const [deleteCredential, { isLoading: deleting }] = useDeleteVendorCarryBeeCredentialMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [modal, setModal] = useState(null); // null | "add" | { ...credential }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this credential?")) return;
    setDeletingId(id);
    try {
      await deleteCredential(id).unwrap();
      toast.success("Credential deleted.");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">CarryBee Credentials</h3>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 space-y-2">
          <Truck className="w-12 h-12 text-red-300 mx-auto" />
          <p className="text-red-500 text-sm">Failed to load data.</p>
          <button onClick={refetch} className="text-sm text-red-600 underline">
            Retry
          </button>
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No CarryBee credentials found.</p>
          <button
            onClick={() => setModal("add")}
            className="mt-3 text-sm text-red-500 underline"
          >
            Add first credential
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    Credential #{cred.id}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    cred.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {cred.is_active ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {cred.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 space-y-2 text-sm">
                {cred.base_url && (
                  <div>
                    <p className="text-xs text-gray-400">Base URL</p>
                    <p className="text-gray-800 break-all">{cred.base_url}</p>
                  </div>
                )}
                {cred.client_id && (
                  <div>
                    <p className="text-xs text-gray-400">Client ID</p>
                    <p className="font-mono text-gray-800">{cred.client_id}</p>
                  </div>
                )}
                {cred.client_secret && (
                  <div>
                    <p className="text-xs text-gray-400">Client Secret</p>
                    <p className="font-mono text-gray-500 tracking-widest">••••••••</p>
                  </div>
                )}
                {cred.client_context && (
                  <div>
                    <p className="text-xs text-gray-400">Client Context</p>
                    <p className="text-gray-800">{cred.client_context}</p>
                  </div>
                )}
                {cred.note && (
                  <div>
                    <p className="text-xs text-gray-400">Note</p>
                    <p className="text-gray-600">{cred.note}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setModal(cred)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cred.id)}
                  disabled={deleting && deletingId === cred.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition disabled:opacity-60"
                >
                  {deleting && deletingId === cred.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <CredentialModal
          vendorId={vendorId}
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); refetch(); }}
        />
      )}
    </div>
  );
};

export default CarryBeeInfo;
