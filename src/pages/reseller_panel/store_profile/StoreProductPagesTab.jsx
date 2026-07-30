import { useEffect, useState } from "react";
import { Copy, Edit3, ExternalLink, Loader2, Palette, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { imgBaseUrl } from "../../../../config";
import {
  useListResellerProductPagesQuery,
  useRemoveResellerProductPageMutation,
  useUpdateResellerProductPageDesignMutation,
  useUpdateResellerProductPageMutation,
} from "../../../redux/features/resellerProductPage";
import ResellerProductPageModal from "../../../components/shared/ResellerProductPageModal";
import { normalizeTemplateId, templateOptions } from "../../../utils/resellerProductPageDesign.utils";
import ProductPageDesignSettingsModal from "./ProductPageDesignSettingsModal";

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
  const [designPage, setDesignPage] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isFetching } = useListResellerProductPagesQuery(
    { reseller_id: resellerId },
    { skip: !resellerId }
  );
  const [updatePage, { isLoading: updating }] = useUpdateResellerProductPageMutation();
  const [updateDesign, { isLoading: updatingDesign }] = useUpdateResellerProductPageDesignMutation();
  const [removePage, { isLoading: deleting }] = useRemoveResellerProductPageMutation();
  const pages = getProductPages(data);

  const publicLink = (slug) => `${window.location.origin}/store/product/${slug}`;
  const clearPageActionParams = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("edit_page_id");
    nextParams.delete("design_page_id");
    nextParams.set("tab", "product-pages");
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (pages.length === 0) return;

    const editPageId = searchParams.get("edit_page_id");
    const designPageId = searchParams.get("design_page_id");

    if (editPageId && String(editingPage?.id || "") !== editPageId) {
      const page = pages.find((item) => String(item.id) === editPageId);
      if (page) setEditingPage(page);
    }

    if (designPageId && String(designPage?.id || "") !== designPageId) {
      const page = pages.find((item) => String(item.id) === designPageId);
      if (page) setDesignPage(page);
    }
  }, [designPage?.id, editingPage?.id, pages, searchParams]);

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
        slug: form.slug,
        selling_price: Number(form.selling_price),
        discount_price: form.discount_price === "" ? null : Number(form.discount_price),
        custom_title: form.custom_title,
        custom_description: form.custom_description,
        delivery_charge: Number(form.delivery_charge || 0),
        published_status: form.published_status || editingPage.published_status || "draft",
      }).unwrap();
      toast.success("Product page updated");
      setEditingPage(null);
    } catch (err) {
      toast.error(err?.data?.message || "Product page update failed");
    }
  };

  const handleDesignUpdate = async (payload) => {
    if (!designPage?.id) return;
    try {
      await updateDesign({ id: designPage.id, ...payload }).unwrap();
      toast.success("Product page design saved");
      setDesignPage(null);
    } catch (err) {
      toast.error(err?.data?.message || "Design save failed");
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
              <th className="px-4 py-3">Theme</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  No product pages created yet.
                </td>
              </tr>
            ) : (
              pages.map((page) => {
                const imageUrl = getImageUrl(page);
                const theme = templateOptions.find((option) => option.value === normalizeTemplateId(page.template_id));
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
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {theme?.label || "Default"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => window.open(`/store/product/${page.slug}`, "_blank")} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditingPage(page)} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDesignPage(page)} className="rounded-lg p-1.5 text-fuchsia-600 hover:bg-fuchsia-50" title="Customize design">
                          <Palette className="h-4 w-4" />
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
        onClose={() => {
          setEditingPage(null);
          clearPageActionParams();
        }}
        onSubmit={handleUpdate}
      />

      <ProductPageDesignSettingsModal
        open={Boolean(designPage)}
        page={designPage}
        loading={updatingDesign}
        onClose={() => {
          setDesignPage(null);
          clearPageActionParams();
        }}
        onSubmit={handleDesignUpdate}
      />
    </div>
  );
};

export default StoreProductPagesTab;




