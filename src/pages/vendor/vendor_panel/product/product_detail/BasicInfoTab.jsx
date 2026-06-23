import React, { useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InfoRow } from "./shared";
import { useUpdateProductMutation } from "../../../../../redux/features/product";
import { useListCategoriesQuery } from "../../../../../redux/features/category";
import { useListBrandsQuery } from "../../../../../redux/features/brand";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const BasicInfoTab = ({ product, productId }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  const { data: catData } = useListCategoriesQuery(1);
  const { data: brandData } = useListBrandsQuery(1);

  const categories = catData?.data?.data || [];
  const brands = brandData?.data?.data || [];

  const startEdit = () => {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      tags: product.tags || "",
      unit: product.unit || "",
      weight: product.weight || "",
      description: product.description || "",
      category_id: product.category_id || product.category?.id || "",
      brand_id: product.brand_id || product.brand?.id || "",
      vendor_id: product.vendor_id || "",
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
      toast.success("পণ্যের তথ্য আপডেট হয়েছে!");
      setEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "আপডেট ব্যর্থ হয়েছে!");
    }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-700">মৌলিক তথ্য Edit</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>পণ্যের নাম *</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ক্যাটাগরি</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className={inputCls}>
              <option value="">নির্বাচন করুন</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>ব্র্যান্ড</label>
            <select name="brand_id" value={form.brand_id} onChange={handleChange} className={inputCls}>
              <option value="">নির্বাচন করুন</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>SKU / বারকোড</label>
            <input name="sku" value={form.sku} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ট্যাগ (কমা দিয়ে আলাদা)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className={inputCls} placeholder="tag1, tag2" />
          </div>
          <div>
            <label className={labelCls}>ইউনিট</label>
            <input name="unit" value={form.unit} onChange={handleChange} className={inputCls} placeholder="pcs, kg..." />
          </div>
          <div>
            <label className={labelCls}>ওজন (kg)</label>
            <input type="number" name="weight" value={form.weight} onChange={handleChange} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>বিবরণ</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className={inputCls}
            />
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
      <InfoRow label="পণ্যের নাম" value={product.name} />
      <InfoRow label="স্লাগ" value={product.slug} />
      <InfoRow label="বারকোড" value={product.barcode} />
      <InfoRow label="ক্যাটাগরি" value={product.category?.name} />
      <InfoRow label="সাব-ক্যাটাগরি" value={product.sub_category?.name} />
      <InfoRow label="ব্র্যান্ড" value={product.brand?.name} />
      <InfoRow label="ট্যাগ">
        {product.tags ? (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.split(",").filter(Boolean).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                {tag.trim()}
              </span>
            ))}
          </div>
        ) : "—"}
      </InfoRow>
      <InfoRow label="বিবরণ">
        {product.description ? (
          <div
            className="text-sm text-gray-700 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : "—"}
      </InfoRow>
      <InfoRow label="ইউনিট" value={product.unit} />
      <InfoRow label="ওজন" value={product.weight ? `${product.weight} kg` : null} />
    </div>
  );
};

export default BasicInfoTab;
