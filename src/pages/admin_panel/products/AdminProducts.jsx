import React, { useState } from "react";
import { Package, Plus, Search, Trash2, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListProductsQuery, useDeleteProductMutation } from "../../../redux/features/product";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching } = useListProductsQuery(currentPage);
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 1;

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("এই পণ্যটি মুছে ফেলতে চান?")) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success("পণ্য মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "মুছে ফেলা ব্যর্থ!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">পণ্য সমূহ</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => navigate("/admin-panel/products/create")}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            পণ্য যোগ
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
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {searchTerm ? "কোনো পণ্য পাওয়া যায়নি।" : "এখনো কোনো পণ্য যোগ করা হয়নি।"}
            </p>
            <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে নতুন পণ্য যোগ করুন।</p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-50" : ""}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">ছবি</th>
                    <th className="pb-3 font-medium">নাম</th>
                    <th className="pb-3 font-medium">ক্যাটাগরি</th>
                    <th className="pb-3 font-medium">ব্র্যান্ড</th>
                    <th className="pb-3 font-medium">মূল্য</th>
                    <th className="pb-3 font-medium">স্টক</th>
                    <th className="pb-3 font-medium">স্ট্যাটাস</th>
                    <th className="pb-3 font-medium">তারিখ</th>
                    <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, i) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{(currentPage - 1) * 20 + i + 1}</td>
                      <td className="py-3">
                        {product.primary_image?.file_name ? (
                          <img
                            src={`${imgBaseUrl}/${product.primary_image.file_name}`}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-medium text-gray-800 max-w-[200px] truncate">
                        {product.name}
                      </td>
                      <td className="py-3 text-gray-600">{product.category?.name || "—"}</td>
                      <td className="py-3 text-gray-600">{product.brand?.name || "—"}</td>
                      <td className="py-3 text-gray-800 font-medium">৳{product.unit_price}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.current_stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {product.current_stock ?? 0}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {product.published ? "পাবলিশড" : "ড্রাফট"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(product.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin-panel/products/${product.id}`)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                            title="বিস্তারিত"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
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
    </div>
  );
};

export default AdminProducts;
