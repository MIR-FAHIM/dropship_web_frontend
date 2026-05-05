import React from "react";
import { InfoRow, Badge } from "./shared";

const ShippingTab = ({ product }) => (
  <div>
    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">শিপিং</p>
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

    <div className="mt-6">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">সেটিংস</p>
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
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">সময়কাল</p>
      <InfoRow label="তৈরির তারিখ" value={new Date(product.created_at).toLocaleString("bn-BD")} />
      <InfoRow label="সর্বশেষ আপডেট" value={new Date(product.updated_at).toLocaleString("bn-BD")} />
    </div>
  </div>
);

export default ShippingTab;
