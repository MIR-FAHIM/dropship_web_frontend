import React, { useState } from "react";
import { Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InfoRow, Badge } from "./shared";
import { useUpdateProductMutation } from "../../../../redux/features/product";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const TOGGLES = [
  { name: "cash_on_delivery", label: "ক্যাশ অন ডেলিভারি" },
  { name: "refundable", label: "রিফান্ডযোগ্য" },
  { name: "published", label: "পাবলিশড" },
  { name: "featured", label: "ফিচার্ড" },
  { name: "show_home", label: "হোম পেজে দেখান" },
  { name: "seller_featured", label: "সেলার ফিচার্ড" },
  { name: "todays_deal", label: "আজকের ডিল" },
  { name: "variant_product", label: "ভ্যারিয়েন্ট পণ্য" },
  { name: "stock_visibility_state", label: "স্টক দৃশ্যমান" },
];

const ShippingTab = ({ product, productId }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  const startEdit = () => {
    setForm({
      shipping_type: product.shipping_type || "free",
      shipping_cost: product.shipping_cost || "",
      est_shipping_days: product.est_shipping_days || "",
      cash_on_delivery: Number(product.cash_on_delivery ?? 0),
      refundable: Number(product.refundable ?? 0),
      published: Number(product.published ?? 0),
      featured: Number(product.featured ?? 0),
      show_home: Number(product.show_home ?? 0),
      seller_featured: Number(product.seller_featured ?? 0),
      todays_deal: Number(product.todays_deal ?? 0),
      variant_product: Number(product.variant_product ?? 0),
      stock_visibility_state: Number(product.stock_visibility_state ?? 1),
    });
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name) => {
    setForm((prev) => ({ ...prev, [name]: prev[name] ? 0 : 1 }));
  };

  const handleSave = async () => {
    try {
      await updateProduct({ id: productId, ...form }).unwrap();
      toast.success("শিপিং ও সেটিংস আপডেট হয়েছে!");
      setEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "আপডেট ব্যর্থ হয়েছে!");
    }
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-700">শিপিং ও সেটিংস সম্পাদনা</p>
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

        {/* Shipping */}
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">শিপিং</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>শিপিং ধরন</label>
              <select name="shipping_type" value={form.shipping_type} onChange={handleChange} className={inputCls}>
                <option value="free">ফ্রি</option>
                <option value="flat_rate">ফ্ল্যাট রেট</option>
                <option value="calculated">ক্যালকুলেটেড</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>শিপিং চার্জ (৳)</label>
              <input
                type="number"
                name="shipping_cost"
                value={form.shipping_cost}
                onChange={handleChange}
                className={inputCls}
                disabled={form.shipping_type === "free"}
              />
            </div>
            <div>
              <label className={labelCls}>আনুমানিক ডেলিভারি (দিন)</label>
              <input type="number" name="est_shipping_days" value={form.est_shipping_days} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">সেটিংস</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOGGLES.map(({ name, label }) => (
              <button
                key={name}
                type="button"
                onClick={() => handleToggle(name)}
                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition ${
                  form[name]
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <span>{label}</span>
                <span className={`w-8 h-4 rounded-full relative transition-colors ${form[name] ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${form[name] ? "left-4" : "left-0.5"}`} />
                </span>
              </button>
            ))}
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
      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">শিপিং</p>
      <InfoRow
        label="শিপিং ধরন"
        value={
          product.shipping_type === "free"
            ? "ফ্রি"
            : product.shipping_type === "flat_rate"
            ? "ফ্ল্যাট রেট"
            : product.shipping_type
        }
      />
      <InfoRow label="শিপিং চার্জ" value={product.shipping_cost ? `৳${product.shipping_cost}` : null} />
      <InfoRow label="আনুমানিক ডেলিভারি" value={product.est_shipping_days ? `${product.est_shipping_days} দিন` : null} />

      <div className="mt-6">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-4">সেটিংস</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "ক্যাশ অন ডেলিভারি", value: product.cash_on_delivery },
            { label: "রিফান্ডযোগ্য", value: product.refundable },
            { label: "পাবলিশড", value: product.published },
            { label: "অনুমোদিত", value: product.approved },
            { label: "ফিচার্ড", value: product.featured },
            { label: "হোম পেজে দেখান", value: product.show_home },
            { label: "সেলার ফিচার্ড", value: product.seller_featured },
            { label: "আজকের ডিল", value: product.todays_deal },
            { label: "ভ্যারিয়েন্ট পণ্য", value: product.variant_product },
            { label: "স্টক দৃশ্যমান", value: Number(product.stock_visibility_state) },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
              <span className="text-sm text-gray-700">{item.label}</span>
              <Badge active={item.value} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">সময়কাল</p>
        <InfoRow label="তৈরির তারিখ" value={new Date(product.created_at).toLocaleString("bn-BD")} />
        <InfoRow label="সর্বশেষ আপডেট" value={new Date(product.updated_at).toLocaleString("bn-BD")} />
      </div>
    </div>
  );
};

export default ShippingTab;
