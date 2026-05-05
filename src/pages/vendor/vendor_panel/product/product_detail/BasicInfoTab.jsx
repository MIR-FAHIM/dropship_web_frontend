import React from "react";
import { InfoRow } from "./shared";

const BasicInfoTab = ({ product }) => (
  <div>
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

export default BasicInfoTab;
