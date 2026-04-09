import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Loader2,
  Store,
  Eye,
  Tag,
  Search,
} from "lucide-react";
import { useGetVendorProductsQuery } from "../../../redux/features/vendor_api";
import { imgBaseUrl } from "../../../../config";

const AdminVendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } = useGetVendorProductsQuery({
    vendorId: id,
    page,
  });

  const products = data?.data?.data || [];
  const pagination = data?.data || {};
  const vendor = products[0]?.vendor || null;

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.brand?.name?.toLowerCase().includes(q)
    );
  });

  const formatCurrency = (amount) =>
    `৳${Number(amount || 0).toLocaleString("bn-BD")}`;

  const getImageUrl = (product) => {
    if (product.primary_image?.file_name) {
      return `${imgBaseUrl}/${product.primary_image.file_name}`;
    }
    return null;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin-panel/vendors")}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {vendor?.name || `ভেন্ডর #${id}`}
            </h1>
            {vendor && (
              <p className="text-xs text-gray-500 mt-0.5">
                {vendor.email} &middot; {vendor.phone}
              </p>
            )}
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Vendor Info Card */}
      {vendor && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Store className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{vendor.name}</p>
                <p className="text-xs text-gray-500">{vendor.user_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-600 flex-wrap">
              {vendor.phone && (
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  📞 {vendor.phone}
                </span>
              )}
              {vendor.email && (
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  ✉️ {vendor.email}
                </span>
              )}
              {vendor.address && (
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  📍 {vendor.address}
                </span>
              )}
            </div>
            <div className="ml-auto flex items-center">
              <span className="text-sm font-medium text-gray-500">
                মোট পণ্য:{" "}
                <span className="text-gray-800 font-bold">
                  {pagination.total || products.length}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-4 h-4" />
            পণ্য তালিকা
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-red-300 mx-auto mb-3" />
            <p className="text-red-500 text-sm font-medium">
              পণ্য লোড করতে সমস্যা হয়েছে।
            </p>
            <button
              onClick={refetch}
              className="mt-3 text-sm text-red-600 underline hover:text-red-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {searchQuery ? "কোনো পণ্য পাওয়া যায়নি।" : "এই ভেন্ডরের কোনো পণ্য নেই।"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-semibold">পণ্য</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      ক্যাটাগরি
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">ব্র্যান্ড</th>
                    <th className="text-right py-3 px-4 font-semibold">মূল্য</th>
                    <th className="text-right py-3 px-4 font-semibold">ক্রয় মূল্য</th>
                    <th className="text-center py-3 px-4 font-semibold">স্টক</th>
                    <th className="text-center py-3 px-4 font-semibold">
                      স্ট্যাটাস
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => {
                    const imgUrl = getImageUrl(product);
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 line-clamp-1">
                                {product.name}
                              </p>
                              {product.barcode && (
                                <p className="text-xs text-gray-400">
                                  {product.barcode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {product.category?.name || "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {product.brand?.name || "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800">
                          {formatCurrency(product.unit_price)}
                          {product.discount > 0 && (
                            <span className="block text-xs text-green-600">
                              -{product.discount_type === "percent"
                                ? `${product.discount}%`
                                : formatCurrency(product.discount)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatCurrency(product.purchase_price)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              product.current_stock > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.current_stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {product.approved ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                অনুমোদিত
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                অপেক্ষমান
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              navigate(`/admin-panel/products/${product.id}`)
                            }
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            দেখুন
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((product) => {
                const imgUrl = getImageUrl(product);
                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400 m-auto mt-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm line-clamp-2">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {product.category?.name && (
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {product.category.name}
                            </span>
                          )}
                          {product.brand?.name && (
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Tag className="w-3 h-3" />
                              {product.brand.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-gray-800">
                          {formatCurrency(product.unit_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ক্রয়: {formatCurrency(product.purchase_price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.current_stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          স্টক: {product.current_stock}
                        </span>
                        {product.approved ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            অনুমোদিত
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            অপেক্ষমান
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          navigate(`/admin-panel/products/${product.id}`)
                        }
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        দেখুন
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <p>
            মোট {pagination.total} টি পণ্যের মধ্যে {pagination.from}–
            {pagination.to} দেখানো হচ্ছে
          </p>
          <div className="flex gap-1">
            {pagination.links?.map((link, i) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => {
                  if (link.url) {
                    const pageNum = new URL(link.url).searchParams.get("page");
                    setPage(Number(pageNum));
                  }
                }}
                className={`px-3 py-1 rounded text-sm border transition ${
                  link.active
                    ? "bg-red-600 text-white border-red-600"
                    : link.url
                    ? "border-gray-300 hover:bg-gray-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorDetails;
