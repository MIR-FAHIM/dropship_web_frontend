import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Package, Search, Eye } from "lucide-react";
import { useGetVendorProductsQuery } from "../../../redux/features/vendor_api";
import { imgBaseUrl } from "../../../../config";

const StoreProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useGetVendorProductsQuery({
    vendorId: id,
    page,
  });

  const products = data?.data?.data || [];
  const pagination = data?.data || {};

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const values = [product.name, product.sku, product.barcode, product.category?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return values.includes(q);
    });
  }, [products, search]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 space-y-3">
        <Package className="w-12 h-12 text-red-300 mx-auto" />
        <p className="text-sm text-red-500">স্টোরের পণ্য লোড করা যায়নি।</p>
        <button onClick={refetch} className="text-sm text-red-600 underline">
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Store Products</h1>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্য খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-xl bg-white">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {search ? "কোনো পণ্য পাওয়া যায়নি।" : "এই স্টোরে এখনো কোনো পণ্য নেই।"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="h-32 bg-gray-100">
                {product.primary_image?.file_name ? (
                  <img
                    src={`${imgBaseUrl}/${product.primary_image.file_name}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                <p className="text-xs text-gray-500">SKU: {product.sku || "—"}</p>
                <p className="text-sm font-bold text-gray-800">৳{product.unit_price || 0}</p>
                <button
                  onClick={() => navigate(`/app/productdetails/${product.id}`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.last_page > 1 ? (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {pagination.current_page || page} / {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={(pagination.current_page || page) <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(pagination.last_page || prev, prev + 1))}
              disabled={(pagination.current_page || page) >= (pagination.last_page || 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StoreProducts;
