/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

const stripHtml = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();

const getInitialForm = ({ product, page }) => ({
  slug: page?.slug || "",
  selling_price: page?.selling_price ?? product?.max_resell_price ?? product?.unit_price ?? "",
  discount_price: page?.discount_price ?? "",
  custom_title: page?.custom_title || product?.name || "",
  custom_description: page?.custom_description || stripHtml(product?.description),
  delivery_charge: page?.delivery_charge ?? 0,
  template_id: page?.template_id ?? 1,
  published_status: page?.published_status || "draft",
});

const ResellerProductPageModal = ({
  open,
  product,
  page,
  loading = false,
  title,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(getInitialForm({ product, page }));

  useEffect(() => {
    if (open) setForm(getInitialForm({ product, page }));
  }, [open, product, page]);

  if (!open) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(form);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={loading ? undefined : onClose} />
      <form onSubmit={handleSubmit} className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800">{title || "Product Page"}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Custom Title</label>
            <input name="custom_title" value={form.custom_title} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className={inputClass} placeholder="Auto generate if empty" />
          </div>
          <div>
            <label className={labelClass}>Published Status</label>
            <select name="published_status" value={form.published_status} onChange={handleChange} className={inputClass}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Selling Price</label>
            <input required type="number" name="selling_price" value={form.selling_price} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Discount Price</label>
            <input type="number" name="discount_price" value={form.discount_price} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Delivery Charge</label>
            <input type="number" name="delivery_charge" value={form.delivery_charge} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Template ID</label>
            <input type="number" name="template_id" value={form.template_id} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Custom Description</label>
            <textarea name="custom_description" value={form.custom_description} onChange={handleChange} rows={5} className={inputClass} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Product Page
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResellerProductPageModal;
