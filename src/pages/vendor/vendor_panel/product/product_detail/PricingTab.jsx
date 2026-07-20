import React from "react";
import { InfoRow } from "./shared";

const PricingTab = ({ product }) => (
  <div>
    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">মূল্য</p>
    <InfoRow label="Vendor Price" value={`৳${product.unit_price}`} />
    <InfoRow label="ক্রয় মূল্য" value={`৳${product.purchase_price || 0}`} />

    <div className="mt-6">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">স্টক</p>
      <InfoRow label="বর্তমান স্টক" value={product.current_stock ?? 0} />
      <InfoRow label="ইউনিট" value={product.unit} />
      <InfoRow label="ওজন" value={product.weight ? `${product.weight} kg` : null} />
    </div>

    <div className="mt-6">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">ডিসকাউন্ট</p>
      <InfoRow label="ডিসকাউন্ট" value={product.discount ? `${product.discount} (${product.discount_type || ""})` : null} />
      <InfoRow label="শুরুর তারিখ" value={product.discount_start_date ? new Date(product.discount_start_date).toLocaleDateString("bn-BD") : null} />
      <InfoRow label="শেষের তারিখ" value={product.discount_end_date ? new Date(product.discount_end_date).toLocaleDateString("bn-BD") : null} />
    </div>

    <div className="mt-6">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">ট্যাক্স</p>
      <InfoRow label="ট্যাক্স" value={product.tax ? `${product.tax} (${product.tax_type || ""})` : null} />
    </div>
  </div>
);

export default PricingTab;
