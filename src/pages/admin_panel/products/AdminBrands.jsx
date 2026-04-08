import React, { useState } from "react";
import { Tag, Plus, Search, Trash2, Loader2, X, ImagePlus } from "lucide-react";
import {
  useListBrandsQuery,
  useCreateBrandMutation,
  useDeleteBrandMutation,
} from "../../../redux/features/brand";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import MediaPickerModal from "../../../components/shared/MediaPickerModal";

const AdminBrands = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", logo: null, logoPreview: null });

  const { data, isLoading, isFetching } = useListBrandsQuery(currentPage);
  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const brands = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 1;

  const filtered = brands.filter((b) =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("ব্র্যান্ডের নাম দিন");
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      if (formData.logo) payload.append("logo", formData.logo);
      await createBrand(payload).unwrap();
      toast.success("ব্র্যান্ড তৈরি হয়েছে!");
      setFormData({ name: "", logo: null, logoPreview: null });
      setShowCreateModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "ব্র্যান্ড তৈরি ব্যর্থ!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("এই ব্র্যান্ড মুছে ফেলতে চান?")) return;
    try {
      await deleteBrand(id).unwrap();
      toast.success("ব্র্যান্ড মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "মুছে ফেলা ব্যর্থ!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">ব্র্যান্ড</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ব্র্যান্ড খুঁজুন..."
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
            ব্র্যান্ড যোগ
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
            <Tag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {searchTerm ? "কোনো ব্র্যান্ড পাওয়া যায়নি।" : "এখনো কোনো ব্র্যান্ড যোগ করা হয়নি।"}
            </p>
            <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে নতুন ব্র্যান্ড যোগ করুন।</p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-50" : ""}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">লোগো</th>
                    <th className="pb-3 font-medium">নাম</th>
                    <th className="pb-3 font-medium">তারিখ</th>
                    <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((brand, i) => (
                    <tr key={brand.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{(currentPage - 1) * 20 + i + 1}</td>
                      <td className="py-3">
                        {brand.logo?.file_name ? (
                          <img
                            src={`${imgBaseUrl}/${brand.logo.file_name}`}
                            alt={brand.name}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-medium text-gray-800">{brand.name}</td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(brand.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                          title="মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <h2 className="text-lg font-bold text-gray-800">নতুন ব্র্যান্ড</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ব্র্যান্ড নাম</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: Samsung"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Logo via Media Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">লোগো</label>
                {formData.logo ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={`${imgBaseUrl}/${formData.logoPreview}`}
                      alt="logo"
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
                        onClick={() => setFormData({ ...formData, logo: null, logoPreview: null })}
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
        onSelect={(file) => setFormData({ ...formData, logo: file.id, logoPreview: file.file_name })}
      />
    </div>
  );
};

export default AdminBrands;
