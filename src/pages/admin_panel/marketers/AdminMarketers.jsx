import { useState } from "react";
import {
  useGetAdminMarketersQuery,
  useCreateAdminMarketerMutation,
  useUpdateMarketerSuspensionMutation,
  useGetAdminMarketerClientsQuery,
  useEndAdminMarketerClientLinkMutation,
} from "../../../redux/features/marketer";
import { Users, PlusCircle, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const AdminMarketerClientsPanel = ({ marketerId }) => {
  const [page, setPage] = useState(1);
  const [confirmEnd, setConfirmEnd] = useState(null);

  const { data, isLoading } = useGetAdminMarketerClientsQuery({
    id: marketerId,
    page,
    per_page: 10,
  });
  const [endLink, { isLoading: isEnding }] = useEndAdminMarketerClientLinkMutation();

  const clients = data?.data?.data || [];
  const lastPage = data?.data?.last_page || 1;

  const handleEnd = async () => {
    if (!confirmEnd) return;
    try {
      await endLink({ id: confirmEnd }).unwrap();
      toast.success("ক্লায়েন্ট লিঙ্ক শেষ করা হয়েছে");
      setConfirmEnd(null);
    } catch (err) {
      toast.error(err?.data?.message || "লিঙ্ক শেষ করতে সমস্যা হয়েছে");
      setConfirmEnd(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return <div className="p-4 text-sm text-gray-400">লোড হচ্ছে...</div>;

  if (clients.length === 0)
    return <div className="p-4 text-sm text-gray-500">এই মার্কেটারের কোনো ক্লায়েন্ট নেই।</div>;

  return (
    <div className="border-t border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-500">ক্লায়েন্ট নাম</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500">সংযুক্তির তারিখ</th>
              <th className="text-right px-4 py-2 font-medium text-gray-500">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.map((rel) => (
              <tr key={rel.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-800">{rel.dropshipper?.name || "—"}</td>
                <td className="px-4 py-2 text-gray-600">{formatDate(rel.accepted_at)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => setConfirmEnd(rel.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition"
                  >
                    লিঙ্ক শেষ করুন
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lastPage > 1 && (
        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
          <span className="text-xs text-gray-400">পৃষ্ঠা {page}/{lastPage}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="p-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm end modal */}
      {confirmEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ক্লায়েন্ট লিঙ্ক শেষ করবেন?</h3>
            <p className="text-sm text-gray-600 mb-5">
              এই মার্কেটার ও ক্লায়েন্টের সংযোগ স্থায়ীভাবে শেষ হবে।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEnd(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleEnd}
                disabled={isEnding}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isEnding ? "শেষ হচ্ছে..." : "হ্যাঁ, শেষ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminMarketers = () => {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", business_name: "" });
  const [formError, setFormError] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminMarketersQuery({ page, per_page: 20 });
  const [createMarketer, { isLoading: isCreating }] = useCreateAdminMarketerMutation();
  const [updateSuspension] = useUpdateMarketerSuspensionMutation();

  const marketers = data?.data?.data || [];
  const lastPage = data?.data?.last_page || 1;

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("নাম এবং ইমেইল আবশ্যক");
      return;
    }
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (form.business_name.trim()) payload.business_name = form.business_name.trim();
      await createMarketer(payload).unwrap();
      toast.success("মার্কেটার তৈরি হয়েছে");
      setShowCreateModal(false);
      setForm({ name: "", email: "", business_name: "" });
      refetch();
    } catch (err) {
      setFormError(err?.data?.message || "মার্কেটার তৈরি করতে সমস্যা হয়েছে");
    }
  };

  const handleToggleBan = async (marketer) => {
    const newBanned = marketer.banned ? 0 : 1;
    try {
      await updateSuspension({ id: marketer.id, banned: newBanned }).unwrap();
      toast.success(newBanned ? "মার্কেটার স্থগিত করা হয়েছে" : "মার্কেটার সক্রিয় করা হয়েছে");
    } catch (err) {
      toast.error(err?.data?.message || "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">মার্কেটার তালিকা</h1>
          <p className="text-sm text-gray-500 mt-1">সমস্ত মার্কেটার পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          <PlusCircle className="w-4 h-4" />
          নতুন মার্কেটার
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">লোড হচ্ছে...</div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-red-600 text-sm mb-2">তথ্য লোড করতে সমস্যা হয়েছে।</p>
            <button onClick={refetch} className="text-emerald-600 text-sm underline">
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : marketers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">এখনো কোনো মার্কেটার নেই।</p>
          </div>
        ) : (
          <div>
            {marketers.map((marketer) => (
              <div key={marketer.id} className="border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{marketer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{marketer.email}</p>
                    {marketer.business_name && (
                      <p className="text-xs text-gray-400 truncate">{marketer.business_name}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      marketer.banned
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {marketer.banned ? "স্থগিত" : "সক্রিয়"}
                  </span>
                  <button
                    onClick={() => handleToggleBan(marketer)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                      marketer.banned
                        ? "border-green-300 text-green-700 hover:bg-green-50"
                        : "border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {marketer.banned ? "সক্রিয় করুন" : "স্থগিত করুন"}
                  </button>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === marketer.id ? null : marketer.id)
                    }
                    className="text-gray-400 hover:text-gray-700 p-1"
                    title="ক্লায়েন্ট দেখুন"
                  >
                    {expandedId === marketer.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {expandedId === marketer.id && (
                  <AdminMarketerClientsPanel marketerId={marketer.id} />
                )}
              </div>
            ))}
          </div>
        )}

        {lastPage > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              পৃষ্ঠা {page} / {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">নতুন মার্কেটার তৈরি করুন</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নাম *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="পূর্ণ নাম"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="example@email.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ব্যবসার নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  placeholder="ব্যবসার নাম"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormError("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isCreating ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketers;
