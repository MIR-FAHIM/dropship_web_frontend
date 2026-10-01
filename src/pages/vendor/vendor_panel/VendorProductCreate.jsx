import React, { useState } from "react";
import {
  ArrowLeft, ArrowRight, Loader2, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../../redux/features/product";
import { useListCategoriesQuery } from "../../../redux/features/category";
import { useListBrandsQuery } from "../../../redux/features/brand";
import { getFromLocalstorage } from "../../../utils/localstorage.utils";
import { useGetAttributesQuery, useGetAttributeDetailsQuery } from "../../../redux/features/attribute";
import { useCreateProductAttributeMutation, useListProductAttributesQuery } from "../../../redux/features/productAttribute";
import * as Yup from "yup";
import { toast } from "sonner";
import MediaPickerModal from "../../../components/shared/MediaPickerModal";
import {  useGetVendorIdQuery} from "../../../redux/features/vendor_api";
import BasicInfoTab from "./product/product_create/BasicInfoTab";
import MediaTab from "./product/product_create/MediaTab";
import PricingTab from "./product/product_create/PricingTab";
import ShippingTab from "./product/product_create/ShippingTab";
import ProductAttributeTab from "./product/product_create/ProductAttributeTab";



const tabs = [
  { id: "basic", label: "মৌলিক তথ্য" },
  { id: "media", label: "ছবি ও মিডিয়া" },
  { id: "pricing", label: "মূল্য ও স্টক" },
  { id: "shipping", label: "শিপিং ও সেটিংস" },

];

const initialForm = {
  name: "",
  category_id: "",
  brand_id: "",
  tags: "",
  description: "",
 // slug: "",
  sku: "",
  barcode: "",
  thumbnail_img: null,
  thumbnailPreview: null,
  photos: null,
  photosPreview: null,
  video_link: "",
  unit_price: "",
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
  shipping_type: "",
  shipping_cost: "",
  cash_on_delivery: 1,
  refundable: 0,
  published: 1,
  featured: 0,
  seller_featured: 0,
  todays_deal: 0,
  variant_product: 0,
  approved: 1,
  stock_visibility_state: 1,
};

const VendorProductCreate = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(initialForm);
  const [mediaTarget, setMediaTarget] = useState(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);
  const [selectedAttrId, setSelectedAttrId] = useState(null);
  const { data: attrData } = useGetAttributesQuery();
  const [createProductAttribute, { isLoading: creatingProdAttr }] = useCreateProductAttributeMutation();
  const { data: prodAttrList, refetch: refetchProdAttr } = useListProductAttributesQuery(createdProductId, { skip: !createdProductId });
  const attributeOptions = (attrData?.data || []).map((a) => ({ value: a.id, label: a.name }));
  const { data: selectedAttrDetails, isLoading: loadingAttrDetails } = useGetAttributeDetailsQuery(selectedAttrId, { skip: selectedAttrId == null });
  const valuesArr = selectedAttrDetails?.data?.values || selectedAttrDetails?.data?.attribute_values || [];
  const attributeValueOptions = Array.isArray(valuesArr)
    ? valuesArr.map((v) => ({ value: v.id, label: v.value }))
    : [];
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

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const { data: catData } = useListCategoriesQuery(1);
  const { data: brandData } = useListBrandsQuery(1);
  const userId = getFromLocalstorage("userId");
  const { data: vendorIdData } = useGetVendorIdQuery(userId, { skip: !userId });

  const categories = catData?.data?.data || [];
  const brands = brandData?.data?.data || [];

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

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("পণ্যের নাম দিন");
    if (!formData.category_id) return toast.error("ক্যাটাগরি নির্বাচন করুন");
    if (!formData.unit_price) return toast.error("বিক্রয় মূল্য দিন");

        const vendorId = vendorIdData?.data?.vendor_id;
    const payload = new FormData();

    payload.append("name", formData.name);
    payload.append("added_by", userId || 1);
    payload.append("user_id", userId || 1);
    payload.append("vendor_id", vendorId || 1);
    payload.append("category_id", formData.category_id);
    if (formData.brand_id) payload.append("brand_id", formData.brand_id);
    if (formData.photos) payload.append("photos", formData.photos);
    if (formData.thumbnail_img) payload.append("thumbnail_img", formData.thumbnail_img);
    payload.append("video_link", formData.video_link);
    payload.append("tags", formData.tags);
    payload.append("description", formData.description);
    payload.append("unit_price", formData.unit_price);
    payload.append("purchase_price", formData.purchase_price || "");
    payload.append("current_stock", formData.current_stock || "2");
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
   // payload.append("slug", formData.slug);
    payload.append("sku", formData.sku);
    payload.append("barcode", formData.barcode);

    try {
      const res = await createProduct(payload).unwrap();
      toast.success("পণ্য তৈরি হয়েছে!");
      if (res?.data?.id) {
        setCreatedProductId(res.data.id);
        setActiveTab("productAttribute");
      } else {
        navigate("/vendor-panel/products");
      }
    } catch (err) {
      toast.error(err?.data?.message || "পণ্য তৈরি ব্যর্থ!");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/vendor-panel/products")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">নতুন পণ্য তৈরি</h1>
        </div>
        {/* <button
          onClick={handleSubmit}
          disabled={creating}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          পণ্য তৈরি করুন
        </button> */}
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
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {idx + 1}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "basic" && (
            <BasicInfoTab
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              categories={categories}
              brands={brands}
              inputClass={inputClass}
              labelClass={labelClass}
            />
          )}

          {activeTab === "media" && (
            <MediaTab
              formData={formData}
              setFormData={setFormData}
              openMedia={openMedia}
              handleChange={handleChange}
              inputClass={inputClass}
              labelClass={labelClass}
            />
          )}

          {activeTab === "pricing" && (
            <PricingTab
              formData={formData}
              handleChange={handleChange}
              inputClass={inputClass}
              labelClass={labelClass}
            />
          )}

          {activeTab === "productAttribute" && (
            <ProductAttributeTab
              prodAttrInitial={prodAttrInitial}
              prodAttrSchema={prodAttrSchema}
              handleProdAttrSubmit={handleProdAttrSubmit}
              attributeOptions={attributeOptions}
              attributeValueOptions={attributeValueOptions}
              selectedAttrId={selectedAttrId}
              setSelectedAttrId={setSelectedAttrId}
              loadingAttrDetails={loadingAttrDetails}
              creatingProdAttr={creatingProdAttr}
              prodAttrList={prodAttrList}
            />
          )}

          {activeTab === "shipping" && (
            <ShippingTab
              formData={formData}
              handleChange={handleChange}
            />
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              পরবর্তী
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
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
        useUserUploads
        userId={userId}
      />
    </div>
  );
};

export default VendorProductCreate;
