import React, { useState } from "react";
import {
  Package, ArrowLeft, ArrowRight, Save, Loader2, ImagePlus, X, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../../redux/features/product";
import { useListCategoriesQuery } from "../../../redux/features/category";
import { useListBrandsQuery } from "../../../redux/features/brand";
import { useGetVendorListQuery } from "../../../redux/features/vendor_api";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { imgBaseUrl } from "../../../../config";
import { toast } from "sonner";
import MediaPickerModal from "../../../components/shared/MediaPickerModal";

import { useGetAttributesQuery } from "../../../redux/features/attribute";
import { useGetAttributeDetailsQuery } from "../../../redux/features/attribute";
import { useCreateProductAttributeMutation, useListProductAttributesQuery } from "../../../redux/features/productAttribute";
import FormikForm from "../../../components/formik/FormikForm";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import FormikInput from "../../../components/formik/FormikInput";
import * as Yup from "yup";

const tabs = [
  { id: "basic", label: "মৌলিক তথ্য" },
  { id: "media", label: "ছবি ও মিডিয়া" },
  { id: "pricing", label: "মূল্য ও স্টক" },
  { id: "shipping", label: "শিপিং ও সেটিংস" },
  { id: "productAttribute", label: "Product Attribute" },
];

const initialForm = {
  name: "",
  category_id: "",
  brand_id: "",
  vendor_id: "",
  tags: "",
  description: "",
  slug: "",
  barcode: "",
  // media
  thumbnail_img: null,
  thumbnailPreview: null,
  photos: null,
  photosPreview: null,
  video_link: "",
  // pricing
  unit_price: "",
  max_resell_price: "",
  purchase_price: "",
  current_stock: "",
  unit: "",
  weight: "",
  discount: "",
  discount_type: "",
  discount_start_date: "",
  discount_end_date: "",
  tax: "",
  tax_type: "",
  // shipping & settings
  shipping_type: "",
  shipping_cost: "",
  cash_on_delivery: 1,
  refundable: 0,
  published: 0,
  featured: 0,
  seller_featured: 0,
  todays_deal: 0,
  variant_product: 0,
  approved: 1,
  stock_visibility_state: 1,
};

const AdminProductCreate = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(initialForm);
  const [createdProductId, setCreatedProductId] = useState(null);
  const [mediaTarget, setMediaTarget] = useState(null); // "thumbnail" | "photos"
  const [mediaOpen, setMediaOpen] = useState(false);

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const { data: catData } = useListCategoriesQuery(1);
  const { data: brandData } = useListBrandsQuery(1);
  const { data: vendorData } = useGetVendorListQuery();

  const categories = catData?.data?.data || [];
  const brands = brandData?.data?.data || [];
  const vendors = vendorData?.data?.data || vendorData?.data || [];

  const currentTabIndex = tabs.findIndex((t) => t.id === activeTab);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const openMedia = (target) => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  const handleMediaSelect = (file) => {
    if (mediaTarget === "thumbnail") {
      setFormData((prev) => ({ ...prev, thumbnail_img: file.id, thumbnailPreview: file.file_name }));
    } else if (mediaTarget === "photos") {
      setFormData((prev) => ({ ...prev, photos: file.id, photosPreview: file.file_name }));
    }
  };

  const goNext = () => {
    if (currentTabIndex < tabs.length - 1) setActiveTab(tabs[currentTabIndex + 1].id);
  };
  const goPrev = () => {
    if (currentTabIndex > 0) setActiveTab(tabs[currentTabIndex - 1].id);
  };


  // State for attribute values dropdown (must be before hooks that use it)
  const [selectedAttrId, setSelectedAttrId] = useState(null); // number or null

  // Product Attribute Tab Logic (move to top-level)
  const { data: attrData } = useGetAttributesQuery();
  const [createProductAttribute, { isLoading: creatingProdAttr }] = useCreateProductAttributeMutation();
  const { data: prodAttrList, refetch: refetchProdAttr } = useListProductAttributesQuery(createdProductId, { skip: !createdProductId });

  // Prepare attribute options (value as number)
  const attributeOptions = (attrData?.data || []).map((a) => ({ value: a.id, label: a.name }));

  // Fetch attribute values when attribute is selected
  const { data: selectedAttrDetails, isLoading: loadingAttrDetails, refetch: refetchAttrDetails } = useGetAttributeDetailsQuery(selectedAttrId, { skip: selectedAttrId == null });

  // Debug log for API response
  React.useEffect(() => {
    if (selectedAttrId != null) {
      console.log("Selected attribute id (number):", selectedAttrId);
      console.log("Attribute details API response:", selectedAttrDetails);
    }
  }, [selectedAttrId, selectedAttrDetails]);

  // Support both possible API response keys
  const valuesArr = selectedAttrDetails?.data?.values || selectedAttrDetails?.data?.attribute_values || [];
  const attributeValueOptions = Array.isArray(valuesArr)
    ? valuesArr.map((v) => ({ value: v.id, label: v.value }))
    : [];

  // Formik logic for product attribute
  const prodAttrInitial = { attribute_id: "", attribute_value_id: "", stock: "" };
  const prodAttrSchema = Yup.object({
    attribute_id: Yup.string().required("Required"),
    attribute_value_id: Yup.string().required("Required"),
    stock: Yup.number().required("Required"),
  });


  const handleProdAttrSubmit = async (values, { resetForm }) => {
    if (!createdProductId) return toast.error("Product must be created first");
    const payload = {
      product_id: createdProductId,
      attribute_id: values.attribute_id,
      attribute_value_id: values.attribute_value_id,
      stock: values.stock,
    };
    await createProductAttribute(payload).unwrap();
    toast.success("Product attribute added");
    resetForm();
    refetchProdAttr();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("পণ্যের নাম দিন");
    if (!formData.category_id) return toast.error("ক্যাটাগরি নির্বাচন করুন");
    if (!formData.unit_price) return toast.error("বিক্রয় মূল্য দিন");

    const userId = getFromLocalstorage("userId");
    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("added_by", userId || 1);
    payload.append("user_id", userId || 1);
    payload.append("category_id", formData.category_id);
    if (formData.brand_id) payload.append("brand_id", formData.brand_id);
    if (formData.vendor_id) payload.append("vendor_id", formData.vendor_id);
    if (formData.photos) payload.append("photos", formData.photos);
    if (formData.thumbnail_img) payload.append("thumbnail_img", formData.thumbnail_img);
    payload.append("video_link", formData.video_link);
    payload.append("tags", formData.tags);
    payload.append("description", formData.description);
    payload.append("unit_price", formData.unit_price);
    payload.append("max_resell_price", formData.max_resell_price);
    payload.append("purchase_price", formData.purchase_price || "");
    payload.append("current_stock", formData.current_stock || "");
    payload.append("unit", formData.unit);
    payload.append("weight", formData.weight);
    payload.append("discount", formData.discount);
    payload.append("discount_type", formData.discount_type);
    payload.append("discount_start_date", formData.discount_start_date);
    payload.append("discount_end_date", formData.discount_end_date);
    payload.append("tax", formData.tax);
    payload.append("tax_type", formData.tax_type);
    payload.append("shipping_type", formData.shipping_type);
    payload.append("shipping_cost", formData.shipping_cost);
    payload.append("cash_on_delivery", formData.cash_on_delivery);
    payload.append("refundable", formData.refundable);
    payload.append("published", formData.published);
    payload.append("featured", formData.featured);
    payload.append("seller_featured", formData.seller_featured);
    payload.append("todays_deal", formData.todays_deal);
    payload.append("variant_product", formData.variant_product);
    payload.append("approved", formData.approved);
    payload.append("stock_visibility_state", formData.stock_visibility_state);
    payload.append("slug", formData.slug);
    payload.append("barcode", formData.barcode);

    try {
      const res = await createProduct(payload).unwrap();
      toast.success("পণ্য তৈরি হয়েছে!");
      // If product id is returned, set it for attribute tab
      if (res?.data?.id) {
        setCreatedProductId(res.data.id);
        setActiveTab("productAttribute");
      } else {
        navigate("/admin-panel/products");
      }
    } catch (err) {
      toast.error(err?.data?.message || "পণ্য তৈরি ব্যর্থ!");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin-panel/products")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">নতুন পণ্য তৈরি</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={creating}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          পণ্য তৈরি করুন
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                activeTab === tab.id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {idx + 1}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tab: Basic Info */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>পণ্যের নাম *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="পণ্যের নাম লিখুন" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>ক্যাটাগরি *</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClass} required>
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>ব্র্যান্ড</label>
                <select name="brand_id" value={formData.brand_id} onChange={handleChange} className={inputClass}>
                  <option value="">ব্র্যান্ড নির্বাচন করুন</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>ভেন্ডর</label>
                <select name="vendor_id" value={formData.vendor_id} onChange={handleChange} className={inputClass}>
                  <option value="">ভেন্ডর নির্বাচন করুন</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name || v.shop_name || v.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>স্লাগ</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="product-slug" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>বারকোড</label>
                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="বারকোড" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ট্যাগ</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="কমা দিয়ে আলাদা করুন" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>বিবরণ</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="পণ্যের বিবরণ লিখুন..." className={inputClass} />
              </div>
            </div>
          )}

          {/* Tab: Media */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                <label className={labelClass}>থাম্বনেইল ছবি</label>
                {formData.thumbnail_img ? (
                  <div className="flex items-center gap-4">
                    <img src={`${imgBaseUrl}/${formData.thumbnailPreview}`} alt="thumbnail" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => openMedia("thumbnail")} className="text-xs text-blue-600 hover:underline">পরিবর্তন</button>
                      <button type="button" onClick={() => setFormData((p) => ({ ...p, thumbnail_img: null, thumbnailPreview: null }))} className="text-xs text-red-500 hover:underline">মুছুন</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => openMedia("thumbnail")} className="flex items-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition w-full justify-center text-sm">
                    <ImagePlus className="w-5 h-5" />
                    থাম্বনেইল নির্বাচন করুন
                  </button>
                )}
              </div>

              {/* Photos */}
              <div>
                <label className={labelClass}>প্রোডাক্ট ফটো</label>
                {formData.photos ? (
                  <div className="flex items-center gap-4">
                    <img src={`${imgBaseUrl}/${formData.photosPreview}`} alt="photos" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => openMedia("photos")} className="text-xs text-blue-600 hover:underline">পরিবর্তন</button>
                      <button type="button" onClick={() => setFormData((p) => ({ ...p, photos: null, photosPreview: null }))} className="text-xs text-red-500 hover:underline">মুছুন</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => openMedia("photos")} className="flex items-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition w-full justify-center text-sm">
                    <ImagePlus className="w-5 h-5" />
                    প্রোডাক্ট ফটো নির্বাচন করুন
                  </button>
                )}
              </div>

              {/* Video Link */}
              <div>
                <label className={labelClass}>ভিডিও লিংক</label>
                <input type="url" name="video_link" value={formData.video_link} onChange={handleChange} placeholder="https://youtube.com/..." className={inputClass} />
              </div>
            </div>
          )}

          {/* Tab: Pricing & Stock */}
          {activeTab === "pricing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>বিক্রয় মূল্য (৳) *</label>
                <input type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} placeholder="0" className={inputClass} required />
              </div>
             
              <div>
                <label className={labelClass}>ক্রয় মূল্য (৳)</label>
                <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
               <div>
                <label className={labelClass}>সর্বাধিক পুনঃবিক্রয় মূল্য (৳) *</label>
                <input type="number" name="max_resell_price" value={formData.max_resell_price} onChange={handleChange} placeholder="0" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>বর্তমান স্টক</label>
                <input type="number" name="current_stock" value={formData.current_stock} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ইউনিট</label>
                <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="যেমন: pcs, kg" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ওজন (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
              <div className="lg:col-span-3">
                <hr className="my-2" />
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">ডিসকাউন্ট</p>
              </div>
              <div>
                <label className={labelClass}>ডিসকাউন্ট</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ডিসকাউন্ট ধরন</label>
                <select name="discount_type" value={formData.discount_type} onChange={handleChange} className={inputClass}>
                  <option value="">নির্বাচন করুন</option>
                  <option value="flat">Flat (৳)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>শুরুর তারিখ</label>
                <input type="date" name="discount_start_date" value={formData.discount_start_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>শেষের তারিখ</label>
                <input type="date" name="discount_end_date" value={formData.discount_end_date} onChange={handleChange} className={inputClass} />
              </div>
              <div className="lg:col-span-3">
                <hr className="my-2" />
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">ট্যাক্স</p>
              </div>
              <div>
                <label className={labelClass}>ট্যাক্স</label>
                <input type="number" name="tax" value={formData.tax} onChange={handleChange} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ট্যাক্স ধরন</label>
                <select name="tax_type" value={formData.tax_type} onChange={handleChange} className={inputClass}>
                  <option value="">নির্বাচন করুন</option>
                  <option value="flat">Flat (৳)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab: Shipping & Settings */}
          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>শিপিং ধরন</label>
                  <select name="shipping_type" value={formData.shipping_type} onChange={handleChange} className={inputClass}>
                    <option value="">নির্বাচন করুন</option>
                    <option value="free">ফ্রি</option>
                    <option value="flat_rate">ফ্ল্যাট রেট</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>শিপিং চার্জ (৳)</label>
                  <input type="number" name="shipping_cost" value={formData.shipping_cost} onChange={handleChange} placeholder="0" className={inputClass} />
                </div>
              </div>

              {/* Toggle Settings */}
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-4">সেটিংস</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "cash_on_delivery", label: "ক্যাশ অন ডেলিভারি" },
                    { name: "refundable", label: "রিফান্ডযোগ্য" },
                    { name: "published", label: "পাবলিশড" },
                    { name: "featured", label: "ফিচার্ড" },
                    { name: "seller_featured", label: "সেলার ফিচার্ড" },
                    { name: "todays_deal", label: "আজকের ডিল" },
                    { name: "variant_product", label: "ভ্যারিয়েন্ট পণ্য" },
                    { name: "stock_visibility_state", label: "স্টক দৃশ্যমান" },
                  ].map((item) => (
                    <label key={item.name} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name] === 1}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Product Attribute */}
          {activeTab === "productAttribute" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold mb-2">Product Attribute</h2>
              <FormikForm
                initialValues={prodAttrInitial}
                validationSchema={prodAttrSchema}
                onSubmit={handleProdAttrSubmit}
              >
                <FormikDropdown
                  name="attribute_id"
                  label="Attribute"
                  options={attributeOptions}
                  onChange={(val, form) => {
                    // Ensure val is a number
                    const numVal = typeof val === "string" ? Number(val) : val;
                    setSelectedAttrId(numVal);
                    form.setFieldValue("attribute_id", numVal);
                    form.setFieldValue("attribute_value_id", "");
                    // Debug log
                    console.log("Selected attribute id (onChange):", numVal, typeof numVal);
                  }}
                />
                <FormikDropdown
                  name="attribute_value_id"
                  label={loadingAttrDetails ? "Loading..." : "Attribute Value"}
                  options={attributeValueOptions}
                  disabled={selectedAttrId == null || loadingAttrDetails}
                />
                {/* Debug info for attribute values */}
                {selectedAttrId != null && !loadingAttrDetails && attributeValueOptions.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">No attribute values found for this attribute.</div>
                )}
                {/* Debug info for attribute values */}
                {selectedAttrId && !loadingAttrDetails && attributeValueOptions.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">No attribute values found for this attribute.</div>
                )}
                <FormikInput name="stock" label="Stock" type="number" required />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={creatingProdAttr}
                >
                  {creatingProdAttr ? "Adding..." : "Add Attribute"}
                </button>
              </FormikForm>

              {/* List of product attributes */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Attribute List</h3>
                {prodAttrList?.data?.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {prodAttrList.data.map((item) => (
                      <li key={item.id}>
                        Attribute: {item.attribute?.name} | Value: {item.attribute_value?.value} | Stock: {item.stock}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No attributes added yet.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={goPrev}
            disabled={currentTabIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            পূর্ববর্তী
          </button>
          {currentTabIndex < tabs.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              পরবর্তী
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              পণ্য তৈরি করুন
            </button>
          )}
        </div>
      </div>

      {/* Media Picker */}
      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};

export default AdminProductCreate;
