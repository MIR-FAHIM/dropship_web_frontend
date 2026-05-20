import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Loader2, Eye, Tag, Search } from "lucide-react";
import { useGetVendorProductsQuery } from "../../../../redux/features/vendor_api";
import { imgBaseUrl } from "../../../../../config";

const formatCurrency = (amount) =>
  `$${Number(amount || 0).toLocaleString("en-US")}`;

const getImageUrl = (product) => {
  if (product.primary_image?.file_name) {
    return `${imgBaseUrl}/${product.primary_image.file_name}`;
  }
  return null;
};

const Products = ({ vendorId }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } = useGetVendorProductsQuery({
    vendorId,
    page,
  });

  const products = data?.data?.data || [];
  const pagination = data?.data || {};

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

  return (
    <div className="space-y-4">
      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
          />
        </div>
        <span className="text-sm text-gray-500">
          Total:{" "}
          <span className="font-bold text-gray-800">
            {pagination.total || products.length}
          </span>
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-2">
            <Package className="w-14 h-14 text-red-300 mx-auto" />
            <p className="text-red-500 text-sm">Failed to load products.</p>
            <button onClick={refetch} className="text-sm text-red-600 underline">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchQuery ? "No products found." : "This vendor has no products."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Brand</th>
                    <th className="text-right py-3 px-4 font-semibold">Price</th>
                    <th className="text-right py-3 px-4 font-semibold">Purchase Price</th>
                    <th className="text-center py-3 px-4 font-semibold">Stock</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => {
                    const imgUrl = getImageUrl(product);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {imgUrl ? (
                                <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                              {product.barcode && (
                                <p className="text-xs text-gray-400">{product.barcode}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{product.category?.name || "—"}</td>
                        <td className="py-3 px-4 text-gray-600">{product.brand?.name || "—"}</td>
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
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            product.current_stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {product.current_stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {product.approved ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => navigate(`/admin-panel/products/${product.id}`)}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((product) => {
                const imgUrl = getImageUrl(product);
                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {imgUrl ? (
                          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400 m-auto mt-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</p>
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
                      <p className="font-bold text-gray-800">{formatCurrency(product.unit_price)}</p>
                      <button
                        onClick={() => navigate(`/admin-panel/products/${product.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Page {pagination.current_page} / {pagination.last_page}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={page === pagination.last_page}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
