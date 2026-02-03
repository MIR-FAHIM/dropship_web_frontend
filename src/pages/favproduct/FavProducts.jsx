import React from "react";
import { useGetFavProductsQuery } from "../../redux/features/product";
import ProductCard from "../product/product_card_component";

const FavProducts = () => {
  const { data, isLoading, isError, error } = useGetFavProductsQuery(localStorage.getItem("userId"));

  const items = data?.items ?? data?.data ?? [];
  const count = data?.count ?? items.length;

  const handleDownloadImage = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "product-image";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Handle the loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden shadow-md bg-white animate-pulse"
              >
                <div className="h-32 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle the error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error?.message || "Failed to load favorite products."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Favorite Products</h2>
            <p className="text-sm text-gray-500">{count} items</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600">
            No favorite products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <ProductCard
                key={item?.product_id ?? item?.id}
                product={item?.product}
                onClick={() => null}
                onDownload={handleDownloadImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavProducts;
