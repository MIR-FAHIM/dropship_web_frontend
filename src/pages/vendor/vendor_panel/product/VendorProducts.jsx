import React, { useRef, useState } from "react";
import { Check, Copy, Package, Pencil, Plus, Search, Trash2, Eye, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetVendorProductsQuery, useGetVendorIdQuery } from "../../../../redux/features/vendor_api";
import vendorApi from "../../../../redux/features/vendor_api";
import { useDeleteProductMutation, useUpdateProductMutation, useApproveProductMutation, useDuplicateProductMutation } from "../../../../redux/features/product";
import { getFromLocalstorage } from "../../../../utils/localstorage.utils";
import { imgBaseUrl } from "../../../../../config";
import { toast } from "sonner";
import ConfirmModal from "../../../../components/shared/ConfirmModal";

const VendorProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState(null); // { productId, field }
  const [editValue, setEditValue] = useState("");
  const [approveProduct] = useApproveProductMutation();
  const [duplicateProduct] = useDuplicateProductMutation();
  const [duplicatingProductId, setDuplicatingProductId] = useState(null);
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const userId = getFromLocalstorage("userId");
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });
  const vendorId = vendorIdData?.data?.vendor_id;

  const { data, isLoading, isFetching } = useGetVendorProductsQuery(
    { vendorId, page: currentPage },
    { skip: !vendorId }
  );
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isSavingEdit }] = useUpdateProductMutation();
  const savingEdit = useRef(false);

  const startEdit = (productId, field, currentValue) => {
    if (savingEdit.current) return;
    setEditingCell({ productId, field });
    setEditValue(String(currentValue ?? ""));
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const commitEdit = async (product) => {
    if (savingEdit.current || editingCell?.productId !== product.id) return;
    const field = editingCell?.field;
    const isStock = field === "current_stock";
    const numericFields = ["unit_price", "max_resell_price"];
    const isNumeric = numericFields.includes(field);

    let finalValue = editValue;
    if (isStock) {
      const stock = editValue.trim();
      if (!/^\d+$/.test(stock) || Number(stock) > 2147483647) {
        toast.error("স্টকের জন্য শূন্য বা ধনাত্মক পূর্ণসংখ্যা দিন");
        return;
      }
      finalValue = Number(stock);
    } else if (isNumeric) {
      const parsed = parseFloat(editValue);
      if (isNaN(parsed) || parsed < 0) {
        toast.error("সঠিক মূল্য দিন");
        cancelEdit();
        return;
      }
      finalValue = parsed;
    }

    const currentValue = isStock ? Number(product.current_stock ?? 0) : isNumeric ? parseFloat(product[field]) : product[field];
    if (finalValue === currentValue) {
      cancelEdit();
      return;
    }

    savingEdit.current = true;
    const patchResult = dispatch(
      vendorApi.util.updateQueryData("getVendorProducts", { vendorId, page: currentPage }, (draft) => {
        const item = draft?.data?.data?.find((p) => p.id === product.id);
        if (item) item[field] = finalValue;
      })
    );
    try {
      await updateProduct({ id: product.id, [field]: finalValue, updated_by: userId }).unwrap();
      toast.success("আপডেট হয়েছে!");
      cancelEdit();
    } catch (err) {
      patchResult.undo();
      toast.error(err?.data?.message || "আপডেট ব্যর্থ!");
      if (!isStock) cancelEdit();
    } finally {
      savingEdit.current = false;
    }
  };

  const products = data?.data?.data || [];
  const totalPages = data?.data?.last_page || 1;

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => navigate("/vendor-panel/products/create")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            নতুন পণ্য যোগ
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
            <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে আপনার প্রথম পণ্য যোগ করুন।</p>
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
                    <th className="pb-3 font-medium">SKU</th>
                    <th className="pb-3 font-medium">Vendor Price</th>
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
                      <td
                        className="py-3 text-gray-600 cursor-pointer"
                        onClick={() => startEdit(product.id, "sku", product.sku)}
                      >
                        {editingCell?.productId === product.id && editingCell?.field === "sku" ? (
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(product)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit(product);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-28 border border-blue-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="hover:underline hover:text-blue-600" title="ক্লিক করে সম্পাদনা করুন">{product.sku || "—"}</span>
                        )}
                      </td>
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
                          <span className="hover:underline hover:text-blue-600" title="ক্লিক করে সম্পাদনা করুন">৳{product.max_resell_price || 0}</span>
                        )}
                      </td>
                      <td className="py-3 min-w-[9rem]">
                        {editingCell?.productId === product.id && editingCell.field === "current_stock" ? (
                          <form
                            className="flex items-center gap-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              commitEdit(product);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Escape" && !savingEdit.current) cancelEdit();
                            }}
                          >
                            <input
                              autoFocus
                              type="text"
                              inputMode="numeric"
                              aria-label="স্টকের পরিমাণ"
                              value={editValue}
                              disabled={isSavingEdit}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 rounded border border-blue-400 px-1.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              type="submit"
                              title="স্টক সংরক্ষণ করুন"
                              aria-label="স্টক সংরক্ষণ করুন"
                              disabled={isSavingEdit}
                              className="rounded p-1 text-green-700 hover:bg-green-50 disabled:opacity-50"
                            >
                              {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              title="বাতিল করুন"
                              aria-label="বাতিল করুন"
                              disabled={isSavingEdit}
                              onClick={cancelEdit}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            title="স্টক সম্পাদনা করুন"
                            aria-label={`${product.name}: স্টক সম্পাদনা করুন`}
                            disabled={isSavingEdit}
                            onClick={() => startEdit(product.id, "current_stock", product.current_stock ?? 0)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium disabled:opacity-50 ${product.current_stock > 0
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                          >
                            {product.current_stock ?? 0}
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleApprove(product)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.approved ? "bg-green-500" : "bg-gray-300"
                            }`}
                          title={product.approved ? "পাবলিশড — ক্লিক করে ড্রাফটে নিন" : "ড্রাফট — ক্লিক করে পাবলিশ করুন"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${product.approved ? "translate-x-4" : "translate-x-1"
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
                            onClick={() => navigate(`/vendor-panel/products/${product.id}`)}
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

export default VendorProducts;
