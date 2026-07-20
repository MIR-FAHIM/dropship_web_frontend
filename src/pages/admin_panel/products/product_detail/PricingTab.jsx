import React, { useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InfoRow, Badge } from "./shared";
import { useUpdateProductMutation } from "../../../../redux/features/product";
import { getAdminBasePrice } from "../../../../utils/pricing.utils";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const PricingTab = ({ product, productId }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  const startEdit = () => {
    setForm({
      unit_price: product.unit_price || "",
      admin_price: product.admin_price ?? getAdminBasePrice(product) ?? "",
      max_resell_price: product.max_resell_price || "",
      purchase_price: product.purchase_price || "",
      current_stock: product.current_stock ?? "",
      unit: product.unit || "",
      weight: product.weight || "",
      discount: product.discount || "",
      discount_type: product.discount_type || "flat",
      discount_start_date: product.discount_start_date?.slice(0, 10) || "",
      discount_end_date: product.discount_end_date?.slice(0, 10) || "",
      tax: product.tax || "",
      tax_type: product.tax_type || "flat",
      stock_visibility_state: product.stock_visibility_state ?? 1,
    });
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProduct({ id: productId, ...form }).unwrap();
      toast.success("মূল্য ও স্টক আপডেট হয়েছে!");
      setEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "আপডেট ব্যর্থ হয়েছে!");
    }
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-700">মূল্য ও স্টক Edit</p>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              <X className="w-3.5 h-3.5" /> বাতিল
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              সংরক্ষণ
            </button>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">মূল্য</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Vendor Price *</label>
              <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Admin/Base Price *</label>
              <input type="number" name="admin_price" value={form.admin_price} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Resell Price</label>
              <input type="number" name="max_resell_price" value={form.max_resell_price} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ক্রয় মূল্য</label>
              <input type="number" name="purchase_price" value={form.purchase_price} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">স্টক</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>বর্তমান স্টক</label>
              <input type="number" name="current_stock" value={form.current_stock} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ইউনিট</label>
              <input name="unit" value={form.unit} onChange={handleChange} className={inputCls} placeholder="pcs, kg..." />
            </div>
            <div>
              <label className={labelCls}>ওজন (kg)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelCls}>স্টক দৃশ্যমানতা</label>
            <select name="stock_visibility_state" value={form.stock_visibility_state} onChange={handleChange} className={inputCls}>
              <option value={1}>দৃশ্যমান</option>
              <option value={0}>অদৃশ্য</option>
            </select>
          </div>
        </div>

        {/* Discount */}
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">ডিসকাউন্ট</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ডিসকাউন্ট পরিমাণ</label>
              <input type="number" name="discount" value={form.discount} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ডিসকাউন্ট ধরন</label>
              <select name="discount_type" value={form.discount_type} onChange={handleChange} className={inputCls}>
                <option value="flat">ফ্ল্যাট</option>
                <option value="percent">শতাংশ</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>শুরুর তারিখ</label>
              <input type="date" name="discount_start_date" value={form.discount_start_date} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>শেষের তারিখ</label>
              <input type="date" name="discount_end_date" value={form.discount_end_date} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Tax */}
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">ট্যাক্স</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ট্যাক্স পরিমাণ</label>
              <input type="number" name="tax" value={form.tax} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>ট্যাক্স ধরন</label>
              <select name="tax_type" value={form.tax_type} onChange={handleChange} className={inputCls}>
                <option value="flat">ফ্ল্যাট</option>
                <option value="percent">শতাংশ</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={startEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">মূল্য</p>
      <InfoRow label="Vendor Price" value={`৳${product.unit_price || 0}`} />
      <InfoRow label="Admin/Base Price" value={`৳${getAdminBasePrice(product)}`} />
      <InfoRow label="Max Resell Price" value={`৳${product.max_resell_price || 0}`} />

      <div className="mt-6">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">স্টক</p>
        <InfoRow label="বর্তমান স্টক" value={product.current_stock ?? 0} />
        <InfoRow label="ইউনিট" value={product.unit} />
        <InfoRow label="ওজন" value={product.weight ? `${product.weight} kg` : null} />
        <InfoRow label="স্টক দৃশ্যমান">
          <Badge active={Number(product.stock_visibility_state)} />
        </InfoRow>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">ডিসকাউন্ট</p>
        <InfoRow label="ডিসকাউন্ট" value={product.discount ? `${product.discount} (${product.discount_type || ""})` : null} />
        <InfoRow label="শুরুর তারিখ" value={product.discount_start_date ? new Date(product.discount_start_date).toLocaleDateString("bn-BD") : null} />
        <InfoRow label="শেষের তারিখ" value={product.discount_end_date ? new Date(product.discount_end_date).toLocaleDateString("bn-BD") : null} />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">ট্যাক্স</p>
        <InfoRow label="ট্যাক্স" value={product.tax ? `${product.tax} (${product.tax_type || ""})` : null} />
      </div>
    </div>
  );
};

export default PricingTab;
