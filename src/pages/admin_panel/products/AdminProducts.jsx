import React, { useState } from "react";
import { Copy, Package, Plus, Search, Trash2, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useListProductsQuery, useDeleteProductMutation, useUpdateProductMutation, useApproveProductMutation, useDuplicateProductMutation } from "../../../redux/features/product";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";
import productApi from "../../../redux/features/product";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import { getAdminBasePrice } from "../../../utils/pricing.utils";

const AdminProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const productListParams = {
    page: currentPage,
    ...(selectedVendorId ? { vendor_id: selectedVendorId } : {}),
  };
  const { data, isLoading, isFetching } = useListProductsQuery(productListParams);
  const { data: vendorData, isLoading: isVendorLoading } = useGetVendorListQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [approveProduct] = useApproveProductMutation();
  const [duplicateProduct] = useDuplicateProductMutation();

  const [editingCell, setEditingCell] = useState(null); // { productId, field }
  const [editValue, setEditValue] = useState("");
  const [duplicatingProductId, setDuplicatingProductId] = useState(null);
  const [duplicateTarget, setDuplicateTarget] = useState(null);

  const startEdit = (productId, field, currentValue) => {
    setEditingCell({ productId, field });
    setEditValue(String(currentValue ?? ""));
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const commitEdit = async (product) => {
    const field = editingCell?.field;
    const parsed = parseFloat(editValue);
    if (isNaN(parsed) || parsed < 0) {
      toast.error("সঠিক মূল্য দিন");
      cancelEdit();
      return;
    }
    if (parsed === parseFloat(product[field])) {
      cancelEdit();
      return;
    }
    if (["unit_price", "admin_price"].includes(field)) {
      const nextVendorPrice = field === "unit_price" ? parsed : Number(product.unit_price || 0);
      const nextAdminPrice = field === "admin_price" ? parsed : Number(product.admin_price || 0);
      if (nextAdminPrice && nextVendorPrice && nextAdminPrice < nextVendorPrice) {
        toast.error("Admin/Base Price must be greater than or equal to Vendor Price");
        cancelEdit();
        return;
      }
    }
    // Optimistically patch the cache so the UI updates instantly
    const patchResult = dispatch(
      productApi.util.updateQueryData("listProducts", productListParams, (draft) => {
        const item = draft?.data?.data?.find((p) => p.id === product.id);
        if (item) item[field] = parsed;
      })
    );
    try {
      await updateProduct({ id: product.id, [field]: parsed }).unwrap();
      toast.success("মূল্য আপডেট হয়েছে!");
    } catch (err) {
      patchResult.undo();
      toast.error(err?.data?.message || "আপডেট ব্যর্থ!");
    }
    cancelEdit();
  };

  const products = data?.data?.data || [];
  const shops = vendorData?.data?.data || vendorData?.data || [];
  const totalPages = data?.data?.last_page || 1;

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (p.vendor?.shop_name ?? "").toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const handleApprove = async (product) => {
    try {
      await approveProduct({ id: product.id, approved: product.approved ? 0 : 1 }).unwrap();
      toast.success("স্ট্যাটাস আপডেট হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "স্ট্যাটাস আপডেট ব্যর্থ!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("এই পণ্যটি মুছে ফেলতে চান?")) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success("পণ্য মুছে ফেলা হয়েছে!");
    } catch (err) {
      toast.error(err?.data?.message || "মুছে ফেলা ব্যর্থ!");
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateTarget?.id) return;
    setDuplicatingProductId(duplicateTarget.id);
    try {
      await duplicateProduct(duplicateTarget.id).unwrap();
      toast.success("Product duplicated successfully");
      setDuplicateTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Product duplicate failed");
    } finally {
      setDuplicatingProductId(null);
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
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Vendor খুঁজুন..."
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-56"
            />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedVendorId}
              onChange={(e) => {
                setSelectedVendorId(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isVendorLoading}
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-56 bg-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">{isVendorLoading ? "Loading shops..." : "All shops"}</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.shop_name || shop.user?.email || `Shop #${shop.id}`}
                </option>
              ))}
            </select>
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
              {searchTerm || vendorSearch || selectedVendorId ? "কোনো পণ্য পাওয়া যায়নি।" : "এখনো কোনো পণ্য যোগ করা হয়নি।"}
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
                    <th className="pb-3 font-medium">SKU</th>
                    <th className="pb-3 font-medium">ক্যাটাগরি</th>
                    <th className="pb-3 font-medium">Vendor</th>
                    <th className="pb-3 font-medium">Vendor Price</th>
                    <th className="pb-3 font-medium">Admin/Base Price</th>
                    <th className="pb-3 font-medium">Max Resell Price</th>
                    <th className="pb-3 font-medium">স্টক</th>
                    <th className="pb-3 font-medium">স্ট্যাটাস</th>
                    <th className="pb-3 font-medium">তারিখ</th>
                    <th className="pb-3 font-medium text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, i) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{product.id}</td>
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
                      <td className="py-3 font-medium text-gray-800 max-w-[200px] truncate">
                        {product.sku}
                      </td>
                      <td className="py-3 text-gray-600">{product.category?.name || "—"}</td>
                      <td className="py-3 text-gray-600">{product.vendor?.shop_name || "—"}</td>
                      <td
                        className="py-3 text-gray-800 font-medium cursor-pointer"
                        onClick={() => startEdit(product.id, "unit_price", product.unit_price)}
                      >
                        {editingCell?.productId === product.id && editingCell?.field === "unit_price" ? (
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(product)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit(product);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-24 border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="hover:underline hover:text-blue-600" title="ক্লিক করে সম্পাদনা করুন">৳{product.unit_price}</span>
                        )}
                      </td>
                      <td
                        className="py-3 text-gray-800 font-medium cursor-pointer"
                        onClick={() => startEdit(product.id, "admin_price", product.admin_price ?? getAdminBasePrice(product))}
                      >
                        {editingCell?.productId === product.id && editingCell?.field === "admin_price" ? (
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(product)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit(product);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-24 border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="hover:underline hover:text-blue-600" title="Click to edit">৳{getAdminBasePrice(product)}</span>
                        )}
                      </td>
                      <td
                        className="py-3 text-gray-800 font-medium cursor-pointer"
                        onClick={() => startEdit(product.id, "max_resell_price", product.max_resell_price)}
                      >
                        {editingCell?.productId === product.id && editingCell?.field === "max_resell_price" ? (
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(product)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit(product);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-24 border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="hover:underline hover:text-blue-600" title="ক্লিক করে সম্পাদনা করুন">৳{product.max_resell_price}</span>
                        )}
                      </td>
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
                        <button
                          onClick={() => handleApprove(product)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            product.approved ? "bg-green-500" : "bg-gray-300"
                          }`}
                          title={product.approved ? "পাবলিশড — ক্লিক করে ড্রাফটে নিন" : "ড্রাফট — ক্লিক করে পাবলিশ করুন"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              product.approved ? "translate-x-4" : "translate-x-1"
                            }`}
                          />
                        </button>
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
                            onClick={() => setDuplicateTarget(product)}
                            disabled={duplicatingProductId === product.id}
                            className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Duplicate product"
                          >
                            {duplicatingProductId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
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
      <ConfirmModal
        open={Boolean(duplicateTarget)}
        title="Duplicate product"
        message="Do you want to duplicate this product?"
        confirmText="Duplicate"
        loading={duplicatingProductId === duplicateTarget?.id}
        onConfirm={handleDuplicate}
        onClose={() => setDuplicateTarget(null)}
      />
    </div>
  );
};

export default AdminProducts;
