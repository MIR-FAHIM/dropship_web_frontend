import React, { useState } from "react";
import {
  ArrowLeft, Package, Loader2, Tag, Truck, Settings, Image as ImageIcon,
  User, Calendar, BarChart3, Weight, DollarSign,
} from "lucide-react";
import { useGetAttributesQuery, useGetAttributeDetailsQuery } from "../../../redux/features/attribute";
import { useCreateProductAttributeMutation, useListByProductAttributesQuery } from "../../../redux/features/productAttribute";
import FormikForm from "../../../components/formik/FormikForm";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import FormikInput from "../../../components/formik/FormikInput";
import * as Yup from "yup";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProductDetailsQuery, useAddProductImageMutation } from "../../../redux/features/product";
import MediaPickerModal from "../../../components/shared/MediaPickerModal";
import { imgBaseUrl } from "../../../../config";

const tabs = [
  { id: "basic", label: "মৌলিক তথ্য", icon: Package },
  { id: "media", label: "ছবি ও মিডিয়া", icon: ImageIcon },
  { id: "pricing", label: "মূল্য ও স্টক", icon: DollarSign },
  { id: "shipping", label: "শিপিং ও সেটিংস", icon: Truck },
  { id: "attributes", label: "Attributes", icon: Tag },
];

const Badge = ({ active, trueLabel = "হ্যাঁ", falseLabel = "না" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
  >
    {active ? trueLabel : falseLabel}
  </span>
);

const InfoRow = ({ label, value, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 sm:w-48 shrink-0 font-medium">{label}</span>
    <span className="text-sm text-gray-800">{children || value || "—"}</span>
  </div>
);

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  // Gallery image assignment state
  const [mediaOpen, setMediaOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [addProductImage] = useAddProductImageMutation();
  // Handle image selection from media picker
  const handleGalleryImageSelect = async (file) => {
    if (!file?.id) return;
    setAssigning(true);
    try {
      await addProductImage({ id, image: file.id }).unwrap();
      toast.success("Image assigned to gallery!");
    } catch (err) {
      toast.error("Image assignment failed");
    } finally {
      setAssigning(false);
      setMediaOpen(false);
    }
  };


  // Attribute tab state/hooks
  const [selectedAttrId, setSelectedAttrId] = useState("");
  const { data: attrData } = useGetAttributesQuery();
  const { data: prodAttrList, refetch: refetchProdAttr } = useListByProductAttributesQuery('3');
  const { data: selectedAttrDetails, isLoading: loadingAttrDetails } = useGetAttributeDetailsQuery(
    selectedAttrId ? Number(selectedAttrId) : undefined,
    { skip: selectedAttrId === "" }
  );
  const [createProductAttribute, { isLoading: creatingProdAttr }] = useCreateProductAttributeMutation();

  const attributeOptions = (attrData?.data || []).map((a) => ({
    value: String(a.id),
    label: a.name,
  }));

  const valuesArr = selectedAttrDetails?.data?.values || selectedAttrDetails?.data?.attribute_values || [];
  const attributeValueOptions = Array.isArray(valuesArr)
    ? valuesArr.map((v) => ({ value: String(v.id), label: v.value }))
    : [];

  const prodAttrInitial = { attribute_id: "", attribute_value_id: "", stock: "" };
  const prodAttrSchema = Yup.object({
    attribute_id: Yup.string().required("Required"),
    attribute_value_id: Yup.string().required("Required"),
    stock: Yup.number().required("Required"),
  });

  const handleProdAttrSubmit = async (values, { resetForm }) => {
    const payload = {
      product_id: id,
      attribute_id: Number(values.attribute_id),
      attribute_value_id: Number(values.attribute_value_id),
      stock: values.stock,
    };
    await createProductAttribute(payload).unwrap();
    toast.success("Product attribute added");
    resetForm();
    setSelectedAttrId("");
    refetchProdAttr();
  };

  const { data, isLoading, isError } = useGetProductDetailsQuery(id);
  const product = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-32">
        <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm font-medium">পণ্যটি পাওয়া যায়নি।</p>
        <button
          onClick={() => navigate("/admin-panel/products")}
          className="mt-4 text-sm text-red-600 hover:underline"
        >
          পণ্য তালিকায় ফিরুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin-panel/products")}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-800 truncate">{product.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">ID: {product.id} • তৈরি: {new Date(product.created_at).toLocaleDateString("bn-BD")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge active={product.published} trueLabel="পাবলিশড" falseLabel="ড্রাফট" />
          <Badge active={product.approved} trueLabel="অনুমোদিত" falseLabel="অপেক্ষমান" />
        </div>
      </div>

      {/* Thumbnail + Quick Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-5">
        {product.primary_image?.file_name ? (
          <img
            src={`${imgBaseUrl}/${product.primary_image.file_name}`}
            alt={product.name}
            className="w-32 h-32 rounded-xl object-cover border border-gray-200 shrink-0"
          />
        ) : (
          <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">বিক্রয় মূল্য</p>
            <p className="text-lg font-bold text-gray-800">৳{product.unit_price}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">ক্রয় মূল্য</p>
            <p className="text-lg font-bold text-gray-800">৳{product.purchase_price || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">স্টক</p>
            <p className={`text-lg font-bold ${product.current_stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.current_stock ?? 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">বিক্রি</p>
            <p className="text-lg font-bold text-gray-800">{product.num_of_sale ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Tab: Attributes */}
          {activeTab === "attributes" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold mb-2">Product Attributes</h2>
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
                    const strVal = val ? String(val) : "";
                    setSelectedAttrId(strVal);
                    form.setFieldValue("attribute_id", strVal);
                    form.setFieldValue("attribute_value_id", "");
                  }}
                />
                <FormikDropdown
                  name="attribute_value_id"
                  label={loadingAttrDetails ? "Loading..." : "Attribute Value"}
                  options={attributeValueOptions}
                  disabled={!selectedAttrId || loadingAttrDetails}
                />
                {selectedAttrId && !loadingAttrDetails && attributeValueOptions.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    No attribute values found for this attribute.
                  </div>
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
                        Attribute: {item.attribute?.name} | Value: {item.value?.value} | Stock: {item.stock}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No attributes added yet.</div>
                )}
              </div>
            </div>
          )}
          {/* Tab: Basic Info */}
          {activeTab === "basic" && (
            <div>
              <InfoRow label="পণ্যের নাম" value={product.name} />
              <InfoRow label="স্লাগ" value={product.slug} />
              <InfoRow label="বারকোড" value={product.barcode} />
              <InfoRow label="ক্যাটাগরি" value={product.category?.name} />
              <InfoRow label="সাব-ক্যাটাগরি" value={product.sub_category?.name} />
              <InfoRow label="ব্র্যান্ড" value={product.brand?.name} />
              <InfoRow label="ভেন্ডর">
                {product.vendor ? (
                  <span>
                    {product.vendor.name}{" "}
                    <span className="text-gray-400 text-xs">({product.vendor.email})</span>
                  </span>
                ) : "—"}
              </InfoRow>
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
          )}

          {/* Tab: Media */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Primary Image */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">থাম্বনেইল</h3>
                {product.primary_image?.file_name ? (
                  <img
                    src={`${imgBaseUrl}/${product.primary_image.file_name}`}
                    alt="thumbnail"
                    className="w-40 h-40 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Gallery */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">গ্যালারি ছবি</h3>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline border px-2 py-1 rounded disabled:opacity-50"
                    onClick={() => setMediaOpen(true)}
                    disabled={assigning}
                  >
                    {assigning ? "Assigning..." : "ছবি যোগ করুন"}
                  </button>
                </div>
                <MediaPickerModal
                  open={mediaOpen}
                  onClose={() => setMediaOpen(false)}
                  onSelect={handleGalleryImageSelect}
                />
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {product.images.map((img, i) => (
                      <img
                        key={img.image.id || i}
                        src={`${imgBaseUrl}/${img.image.file_name}`}
                        alt={`photo-${i}`}
                        className="w-full aspect-square rounded-lg object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">কোনো গ্যালারি ছবি নেই।</p>
                )}
              </div>

              {/* Video */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">ভিডিও লিংক</h3>
                {product.video_link ? (
                  <a
                    href={product.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {product.video_link}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">কোনো ভিডিও লিংক নেই।</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Pricing & Stock */}
          {activeTab === "pricing" && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">মূল্য</p>
              <InfoRow label="বিক্রয় মূল্য" value={`৳${product.unit_price}`} />
              <InfoRow label="ক্রয় মূল্য" value={`৳${product.purchase_price || 0}`} />

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
          )}

          {/* Tab: Shipping & Settings */}
          {activeTab === "shipping" && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">শিপিং</p>
              <InfoRow label="শিপিং ধরন" value={product.shipping_type === "free" ? "ফ্রি" : product.shipping_type === "flat_rate" ? "ফ্ল্যাট রেট" : product.shipping_type} />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetail;
