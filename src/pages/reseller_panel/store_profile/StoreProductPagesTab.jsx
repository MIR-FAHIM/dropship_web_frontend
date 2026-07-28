import { useState } from "react";
import { Copy, Edit3, ExternalLink, Loader2, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { imgBaseUrl } from "../../../../config";
import {
  useListResellerProductPagesQuery,
  useRemoveResellerProductPageMutation,
  useUpdateResellerProductPageMutation,
} from "../../../redux/features/resellerProductPage";
import ResellerProductPageModal from "../../../components/shared/ResellerProductPageModal";

const getProductPages = (response) => {
  const data = response?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
};

const getImageUrl = (page) => {
  const fileName =
    page?.product?.primary_image?.file_name ||
    page?.product?.image?.file_name ||
    page?.primary_image?.file_name;
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return `${String(imgBaseUrl).replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
};

const StoreProductPagesTab = ({ resellerId }) => {
  const [editingPage, setEditingPage] = useState(null);
  const { data, isLoading, isFetching } = useListResellerProductPagesQuery(
    { reseller_id: resellerId },
    { skip: !resellerId }
  );
  const [updatePage, { isLoading: updating }] = useUpdateResellerProductPageMutation();
  const [removePage, { isLoading: deleting }] = useRemoveResellerProductPageMutation();
  const pages = getProductPages(data);

  const publicLink = (slug) => `${window.location.origin}/store/product/${slug}`;

  const handleCopy = async (slug) => {
    if (!slug) return;
    await navigator.clipboard.writeText(publicLink(slug));
    toast.success("Public link copied");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product page?")) return;
    try {
      await removePage(id).unwrap();
      toast.success("Product page deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Product page delete failed");
    }
  };

  const handleUpdate = async (form) => {
    if (!editingPage?.id) return;
    try {
      await updatePage({
        id: editingPage.id,
        reseller_id: Number(resellerId),
        product_id: editingPage.product_id || editingPage.product?.id,
        ...form,
        selling_price: Number(form.selling_price),
        discount_price: form.discount_price === "" ? null : Number(form.discount_price),
        delivery_charge: Number(form.delivery_charge || 0),
        template_id: Number(form.template_id || 1),
      }).unwrap();
      toast.success("Product page updated");
      setEditingPage(null);
    } catch (err) {
      toast.error(err?.data?.message || "Product page update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={isFetching ? "opacity-60" : ""}>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total discounted Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No product pages created yet.
                </td>
              </tr>
            ) : (
              pages.map((page) => {
                const imageUrl = getImageUrl(page);
                return (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {imageUrl ? (
                        <img src={imageUrl} alt={page.custom_title} className="h-11 w-11 rounded-lg border border-gray-200 object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                          <Store className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-medium text-gray-800">{page.custom_title}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-600">{page.product?.name || page.product_name || "-"}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-blue-600">{page.slug || "-"}</td>
                    <td className="px-4 py-3">৳{page.selling_price || 0}</td>
                    <td className="px-4 py-3">৳{page.discount_price || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => window.open(`/store/product/${page.slug}`, "_blank")} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditingPage(page)} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleCopy(page.slug)} className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50" title="Copy link">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(page.id)} disabled={deleting} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50" title="Delete">
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

      <ResellerProductPageModal
        open={Boolean(editingPage)}
        page={editingPage}
        product={editingPage?.product}
        loading={updating}
        title="Edit Product Page"
        onClose={() => setEditingPage(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default StoreProductPagesTab;
