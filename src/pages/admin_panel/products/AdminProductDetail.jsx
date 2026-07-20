import React, { useState } from "react";
import {
  ArrowLeft, Package, Loader2, Tag, Truck, Image as ImageIcon, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProductDetailsQuery, useApproveProductMutation } from "../../../redux/features/product";
import Switch from "@mui/material/Switch";
import { imgBaseUrl } from "../../../../config";
import { Badge } from "./product_detail/shared";
import BasicInfoTab from "./product_detail/BasicInfoTab";
import MediaTab from "./product_detail/MediaTab";
import PricingTab from "./product_detail/PricingTab";
import ShippingTab from "./product_detail/ShippingTab";
import AttributesTab from "./product_detail/AttributesTab";
import { getAdminBasePrice } from "../../../utils/pricing.utils";

const tabs = [
  { id: "basic", label: "মৌলিক তথ্য", icon: Package },
  { id: "media", label: "ছবি ও মিডিয়া", icon: ImageIcon },
  { id: "pricing", label: "মূল্য ও স্টক", icon: DollarSign },
  { id: "shipping", label: "শিপিং ও সেটিংস", icon: Truck },
  { id: "attributes", label: "Attributes", icon: Tag },
];

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [approveProduct, { isLoading: approving }] = useApproveProductMutation();
  const [approvalChecked, setApprovalChecked] = useState(false);

  const { data, isLoading, isError } = useGetProductDetailsQuery(id);
  const product = data?.data;

  React.useEffect(() => {
    if (product) {
      setApprovalChecked(!!product.approved);
    }
  }, [product]);

  const handleApprovalChange = async (e) => {
    const checked = e.target.checked;
    setApprovalChecked(checked);
    try {
      await approveProduct({ id, approved: checked ? 1 : 0 }).unwrap();
      toast.success(checked ? "Product approved" : "Approval removed");
    } catch {
      toast.error("Approval update failed");
      setApprovalChecked(!checked); // revert
    }
  };

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
          <div className="flex items-center ml-2">
            <span className="text-xs mr-1">Approve</span>
            <Switch
              checked={approvalChecked}
              onChange={handleApprovalChange}
              color="success"
              disabled={approving}
              inputProps={{ "aria-label": "Approve Product" }}
            />
          </div>
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
            <p className="text-xs text-gray-500 mb-1">Vendor Price</p>
            <p className="text-lg font-bold text-gray-800">৳{product.unit_price}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Admin/Base Price</p>
            <p className="text-lg font-bold text-gray-800">৳{getAdminBasePrice(product)}</p>
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
          {activeTab === "basic" && <BasicInfoTab product={product} productId={id} />}
          {activeTab === "media" && <MediaTab product={product} productId={id} />}
          {activeTab === "pricing" && <PricingTab product={product} productId={id} />}
          {activeTab === "shipping" && <ShippingTab product={product} productId={id} />}
          {activeTab === "attributes" && <AttributesTab productId={id} />}
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetail;
