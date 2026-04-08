import React, { useState } from "react";
import { FolderTree, Plus, Search, Trash2, Pencil, Loader2, XCircle, X, ImagePlus } from "lucide-react";
import {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../redux/features/category";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import MediaPickerModal from "../../../components/shared/MediaPickerModal";

const AdminCategories = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", icon: null, iconPreview: null });

  const { data, isLoading, isFetching } = useListCategoriesQuery(currentPage);
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 1;

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("ক্যাটাগরির নাম দিন");
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
     
      if (formData.icon) payload.append("icon", formData.icon);
      await createCategory(payload).unwrap();
      toast.success("ক্যাটাগরি তৈরি হয়েছে!");
      setFormData({ name: "", icon: null, iconPreview: null });
      setShowCreateModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "ক্যাটাগরি তৈরি ব্যর্থ!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("এই ক্যাটাগরি মুছে ফেলতে চান?")) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "মুছে ফেলা ব্যর্থ!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">ক্যাটাগরি</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ক্যাটাগরি খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            ক্যাটাগরি যোগ
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {searchTerm ? "কোনো ক্যাটাগরি পাওয়া যায়নি।" : "এখনো কোনো ক্যাটাগরি যোগ করা হয়নি।"}
            </p>
            <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে নতুন ক্যাটাগরি যোগ করুন।</p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-50" : ""}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">আইকন</th>
                    <th className="pb-3 font-medium">নাম</th>
                    <th className="pb-3 font-medium">লেভেল</th>
                    <th className="pb-3 font-medium">ফিচার্ড</th>
                    <th className="pb-3 font-medium">তারিখ</th>
                    <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cat, i) => (
                    <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{(currentPage - 1) * 20 + i + 1}</td>
                      <td className="py-3">
                        {cat.icon?.file_name ? (
                          <img
                            src={`${imgBaseUrl}/${cat.icon.file_name}`}
                            alt={cat.name}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FolderTree className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-medium text-gray-800">{cat.name}</td>
                      <td className="py-3 text-gray-600">{cat.level}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cat.featured
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {cat.featured ? "হ্যাঁ" : "না"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(cat.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  পূর্ববর্তী
                </button>
                <span className="text-sm text-gray-600">
                  পৃষ্ঠা {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  পরবর্তী
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">নতুন ক্যাটাগরি</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ক্যাটাগরি নাম</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: Electronics"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Icon via Media Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">আইকন</label>
                {formData.icon ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={`${imgBaseUrl}/${formData.iconPreview}`}
                      alt="icon"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaOpen(true)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        পরিবর্তন
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: null, iconPreview: null })}
                        className="text-xs text-red-500 hover:underline"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition w-full justify-center text-sm"
                  >
                    <ImagePlus className="w-4 h-4" />
                    মিডিয়া থেকে নির্বাচন করুন
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(file) => setFormData({ ...formData, icon: file.id, iconPreview: file.file_name })}
      />
    </div>
  );
};

export default AdminCategories;
